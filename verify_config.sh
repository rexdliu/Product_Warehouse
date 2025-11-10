#!/bin/bash

# =========================================
# WarehouseAI 部署前配置验证脚本
# =========================================
# 用途：在ECS服务器上验证部署环境配置
# 使用：bash verify_config.sh

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印函数
print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE} $1${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

print_check() {
    echo -e "${YELLOW}[检查]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# 检查计数
CHECKS_PASSED=0
CHECKS_FAILED=0
CHECKS_WARNING=0

check_passed() {
    print_success "$1"
    ((CHECKS_PASSED++))
}

check_failed() {
    print_error "$1"
    ((CHECKS_FAILED++))
}

check_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
    ((CHECKS_WARNING++))
}

# =========================================
# 检查1: 系统环境
# =========================================
print_header "1. 系统环境检查"

# 检查操作系统
print_check "检查操作系统..."
if [ -f /etc/os-release ]; then
    . /etc/os-release
    print_success "操作系统: $PRETTY_NAME"
else
    check_warning "无法确定操作系统版本"
fi

# 检查系统资源
print_check "检查系统资源..."
TOTAL_MEM=$(free -m | awk '/^Mem:/{print $2}')
CPU_CORES=$(nproc)
print_info "CPU核心数: $CPU_CORES"
print_info "总内存: ${TOTAL_MEM}MB"

if [ $TOTAL_MEM -ge 4000 ]; then
    check_passed "内存充足 (${TOTAL_MEM}MB >= 4GB)"
elif [ $TOTAL_MEM -ge 2000 ]; then
    check_warning "内存偏低 (${TOTAL_MEM}MB), 建议4GB以上"
else
    check_failed "内存不足 (${TOTAL_MEM}MB < 2GB)"
fi

# =========================================
# 检查2: 必要软件
# =========================================
print_header "2. 必要软件检查"

# 检查Git
print_check "检查Git..."
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version | awk '{print $3}')
    check_passed "Git已安装: $GIT_VERSION"
else
    check_failed "Git未安装，请运行: sudo apt install git (Ubuntu) 或 sudo yum install git (CentOS)"
fi

# 检查Python
print_check "检查Python..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version | awk '{print $2}')
    check_passed "Python已安装: $PYTHON_VERSION"

    # 检查Python版本
    PYTHON_MAJOR=$(echo $PYTHON_VERSION | cut -d. -f1)
    PYTHON_MINOR=$(echo $PYTHON_VERSION | cut -d. -f2)
    if [ $PYTHON_MAJOR -ge 3 ] && [ $PYTHON_MINOR -ge 8 ]; then
        check_passed "Python版本满足要求 (>= 3.8)"
    else
        check_warning "Python版本偏低 ($PYTHON_VERSION), 建议3.8+"
    fi
else
    check_failed "Python3未安装，请运行: sudo apt install python3 python3-pip python3-venv"
fi

# 检查pip
print_check "检查pip..."
if command -v pip3 &> /dev/null || command -v pip &> /dev/null; then
    check_passed "pip已安装"
else
    check_failed "pip未安装，请运行: sudo apt install python3-pip"
fi

# 检查Node.js
print_check "检查Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version | sed 's/v//')
    check_passed "Node.js已安装: $NODE_VERSION"

    # 检查Node版本
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d. -f1)
    if [ $NODE_MAJOR -ge 18 ]; then
        check_passed "Node.js版本满足要求 (>= 18)"
    else
        check_warning "Node.js版本偏低 ($NODE_VERSION), 建议18+"
    fi
else
    check_failed "Node.js未安装，请参考QUICK_DEPLOY.md安装Node.js 18+"
fi

# 检查npm
print_check "检查npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    check_passed "npm已安装: $NPM_VERSION"
else
    check_failed "npm未安装"
fi

# 检查screen
print_check "检查screen..."
if command -v screen &> /dev/null; then
    check_passed "screen已安装"
else
    check_warning "screen未安装，建议安装: sudo apt install screen"
fi

# =========================================
# 检查3: 网络配置
# =========================================
print_header "3. 网络配置检查"

# 获取公网IP
print_check "获取ECS公网IP..."
PUBLIC_IP=$(curl -s ifconfig.me || curl -s icanhazip.com || echo "unknown")
if [ "$PUBLIC_IP" != "unknown" ]; then
    check_passed "公网IP: $PUBLIC_IP"
    print_info "请确保RDS白名单包含此IP！"
else
    check_warning "无法获取公网IP，请手动确认"
fi

# 检查8001端口是否被占用
print_check "检查8001端口..."
if command -v netstat &> /dev/null; then
    if netstat -tuln | grep -q ":8001 "; then
        check_warning "端口8001已被占用"
        netstat -tuln | grep ":8001 "
    else
        check_passed "端口8001可用"
    fi
elif command -v ss &> /dev/null; then
    if ss -tuln | grep -q ":8001 "; then
        check_warning "端口8001已被占用"
        ss -tuln | grep ":8001 "
    else
        check_passed "端口8001可用"
    fi
else
    check_warning "无法检查端口状态（netstat/ss未安装）"
fi

# 检查防火墙
print_check "检查防火墙状态..."
if command -v ufw &> /dev/null; then
    UFW_STATUS=$(sudo ufw status | head -1)
    if echo "$UFW_STATUS" | grep -q "inactive"; then
        check_passed "UFW防火墙已关闭（适合测试）"
    else
        check_warning "UFW防火墙已启用，请确保8001端口已开放"
        print_info "运行: sudo ufw allow 8001/tcp"
    fi
fi

# 测试域名解析
print_check "测试域名解析 (www.rexp.top)..."
if command -v dig &> /dev/null; then
    DOMAIN_IP=$(dig +short www.rexp.top | tail -1)
    if [ -n "$DOMAIN_IP" ]; then
        check_passed "域名解析成功: www.rexp.top -> $DOMAIN_IP"
        if [ "$DOMAIN_IP" = "$PUBLIC_IP" ]; then
            check_passed "域名解析到当前服务器IP"
        else
            check_warning "域名解析IP ($DOMAIN_IP) 与当前服务器IP ($PUBLIC_IP) 不匹配"
        fi
    else
        check_warning "域名解析失败或未配置"
    fi
elif command -v nslookup &> /dev/null; then
    DOMAIN_IP=$(nslookup www.rexp.top | grep "Address" | tail -1 | awk '{print $2}')
    if [ -n "$DOMAIN_IP" ]; then
        check_passed "域名解析成功: www.rexp.top -> $DOMAIN_IP"
    else
        check_warning "域名解析失败或未配置"
    fi
else
    check_warning "dig/nslookup未安装，无法测试域名解析"
fi

# =========================================
# 检查4: 项目文件
# =========================================
print_header "4. 项目文件检查"

# 检查项目目录
print_check "检查项目目录..."
if [ -d "Product_Warehouse" ]; then
    cd Product_Warehouse
    check_passed "项目目录存在"
elif [ -f "deploy.sh" ]; then
    check_passed "当前在项目目录中"
else
    check_failed "未找到项目目录，请先克隆: git clone https://github.com/rexdliu/Product_Warehouse.git"
    exit 1
fi

# 检查关键文件
print_check "检查关键文件..."
REQUIRED_FILES=(
    "deploy.sh"
    ".env.production.example"
    "requirements.txt"
    "package.json"
    "src/Backend/app/main.py"
    "src/services/api.ts"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        check_passed "文件存在: $file"
    else
        check_failed "文件缺失: $file"
    fi
done

# 检查.env文件
print_check "检查环境变量配置..."
if [ -f ".env" ]; then
    check_passed ".env文件存在"

    # 检查关键配置
    if grep -q "DATABASE_URL=" .env; then
        check_passed "DATABASE_URL已配置"

        # 检查是否包含正确的数据库地址
        if grep -q "rm-zf80cj27ot21b1f2exo.mysql.kualalumpur.rds.aliyuncs.com" .env; then
            check_passed "数据库地址正确"
        else
            check_warning "数据库地址可能不正确，请检查.env文件"
        fi
    else
        check_failed "DATABASE_URL未配置"
    fi

    if grep -q "SECRET_KEY=" .env; then
        SECRET_KEY=$(grep "SECRET_KEY=" .env | cut -d= -f2 | tr -d '"' | tr -d "'")
        if [ ${#SECRET_KEY} -ge 32 ]; then
            check_passed "SECRET_KEY已配置且长度充足"
        else
            check_failed "SECRET_KEY过短或为默认值，请使用 openssl rand -hex 32 生成"
        fi
    else
        check_failed "SECRET_KEY未配置"
    fi

    if grep -q "BACKEND_CORS_ORIGINS=" .env; then
        check_passed "CORS配置存在"
        if grep -q "www.rexp.top" .env; then
            check_passed "CORS包含域名 www.rexp.top"
        else
            check_warning "CORS配置可能不包含你的域名"
        fi
    else
        check_warning "CORS配置未设置"
    fi
else
    check_failed ".env文件不存在"
    print_info "运行: cp .env.production.example .env"
    print_info "然后编辑: nano .env"
fi

# =========================================
# 检查5: 数据库连接
# =========================================
print_header "5. 数据库连接检查"

if [ -f ".env" ]; then
    print_check "测试数据库连接..."

    # 读取DATABASE_URL
    export $(grep -v '^#' .env | xargs)

    # 使用Python测试连接
    python3 << 'PYEOF'
import sys
import os

try:
    from sqlalchemy import create_engine

    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("❌ DATABASE_URL未设置")
        sys.exit(1)

    print(f"📡 尝试连接: {db_url.split('@')[1] if '@' in db_url else 'database'}")

    engine = create_engine(db_url, connect_args={"connect_timeout": 10})
    conn = engine.connect()
    print("✅ 数据库连接成功！")
    conn.close()
    sys.exit(0)
except ImportError:
    print("⚠️  SQLAlchemy未安装，跳过数据库连接测试")
    print("   提示：运行 pip3 install sqlalchemy pymysql")
    sys.exit(2)
except Exception as e:
    print(f"❌ 数据库连接失败: {e}")
    print("\n请检查:")
    print("1. DATABASE_URL是否正确")
    print("2. RDS白名单是否包含ECS的IP")
    print("3. 网络连通性")
    sys.exit(1)
PYEOF

    DB_TEST_RESULT=$?
    if [ $DB_TEST_RESULT -eq 0 ]; then
        check_passed "数据库连接测试通过"
    elif [ $DB_TEST_RESULT -eq 2 ]; then
        check_warning "数据库连接测试跳过（依赖未安装）"
    else
        check_failed "数据库连接测试失败"
        print_info "请确保:"
        print_info "1. RDS白名单包含ECS IP: $PUBLIC_IP"
        print_info "2. DATABASE_URL配置正确"
        print_info "3. 数据库test_data已创建"
    fi
else
    check_warning "跳过数据库连接测试（.env文件不存在）"
fi

# =========================================
# 检查6: 现有服务
# =========================================
print_header "6. 现有服务检查"

print_check "检查是否有正在运行的服务..."
if command -v screen &> /dev/null; then
    if screen -list | grep -q "warehouse"; then
        check_warning "检测到正在运行的warehouse服务"
        print_info "如需重新部署，请先停止: screen -X -S warehouse quit"
    else
        check_passed "没有正在运行的warehouse服务"
    fi
fi

if command -v netstat &> /dev/null && netstat -tuln | grep -q ":8001 "; then
    check_warning "端口8001已被占用"
    print_info "请检查是否有其他服务占用该端口"
elif command -v ss &> /dev/null && ss -tuln | grep -q ":8001 "; then
    check_warning "端口8001已被占用"
    print_info "请检查是否有其他服务占用该端口"
fi

# =========================================
# 最终报告
# =========================================
print_header "验证报告"

echo -e "检查通过: ${GREEN}${CHECKS_PASSED}${NC}"
echo -e "检查失败: ${RED}${CHECKS_FAILED}${NC}"
echo -e "警告提示: ${YELLOW}${CHECKS_WARNING}${NC}"
echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  ✓ 所有必需检查已通过！${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "${GREEN}你可以开始部署了：${NC}"
    echo -e "  1. 确认.env文件已正确配置: ${BLUE}nano .env${NC}"
    echo -e "  2. 运行部署脚本: ${BLUE}bash deploy.sh${NC}"
    echo ""
    if [ $CHECKS_WARNING -gt 0 ]; then
        echo -e "${YELLOW}注意: 有 ${CHECKS_WARNING} 个警告，请检查上述内容${NC}"
    fi
else
    echo -e "${RED}========================================${NC}"
    echo -e "${RED}  ✗ 有 ${CHECKS_FAILED} 项检查失败${NC}"
    echo -e "${RED}========================================${NC}"
    echo ""
    echo -e "${RED}请先解决上述失败的检查项，然后重新运行此脚本${NC}"
    echo ""
fi

echo "================================================"
echo "验证完成！"
echo "================================================"

exit 0
