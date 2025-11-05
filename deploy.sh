#!/bin/bash

# =========================================
# WarehouseAI 一键部署脚本（ECS服务器）
# =========================================
# 用途：在ECS服务器上快速部署项目
# 使用：bash deploy.sh

set -e  # 遇到错误立即退出

echo "================================================"
echo "  WarehouseAI 部署脚本"
echo "================================================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 打印函数
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查命令是否存在
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 步骤1：检查必要的软件
print_info "步骤 1/6: 检查必要的软件..."

if ! command_exists python3; then
    print_error "Python3 未安装！请先安装 Python 3.8+"
    exit 1
fi

if ! command_exists node; then
    print_error "Node.js 未安装！请先安装 Node.js 18+"
    exit 1
fi

if ! command_exists npm; then
    print_error "npm 未安装！请先安装 npm"
    exit 1
fi

if ! command_exists git; then
    print_error "git 未安装！请先安装 git"
    exit 1
fi

print_info "✅ 所有必要软件已安装"
python3 --version
node --version
npm --version

# 步骤2：检查环境变量配置
print_info "步骤 2/6: 检查环境变量配置..."

if [ ! -f ".env" ]; then
    print_warning ".env 文件不存在，从模板创建..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_warning "请编辑 .env 文件，配置数据库连接和SECRET_KEY"
        print_warning "运行: nano .env"
        read -p "按 Enter 继续，或 Ctrl+C 退出先配置 .env..."
    else
        print_error ".env.example 不存在！"
        exit 1
    fi
fi

print_info "✅ 环境变量配置文件存在"

# 步骤3：安装Python依赖
print_info "步骤 3/6: 安装Python依赖..."

if [ ! -d ".venv" ]; then
    print_info "创建Python虚拟环境..."
    python3 -m venv .venv
fi

print_info "激活虚拟环境并安装依赖..."
source .venv/bin/activate

if [ -f "requirements.txt" ]; then
    pip install --upgrade pip
    pip install -r requirements.txt
    print_info "✅ Python依赖安装完成"
else
    print_warning "requirements.txt 不存在，跳过Python依赖安装"
fi

# 步骤4：安装前端依赖和构建
print_info "步骤 4/6: 安装前端依赖..."

if [ -f "package.json" ]; then
    npm install
    print_info "✅ 前端依赖安装完成"

    print_info "构建前端..."
    npm run build

    if [ -d "dist" ]; then
        print_info "✅ 前端构建完成"
        ls -lh dist/
    else
        print_error "前端构建失败，dist目录不存在！"
        exit 1
    fi
else
    print_error "package.json 不存在！"
    exit 1
fi

# 步骤5：测试数据库连接
print_info "步骤 5/6: 测试数据库连接..."

# 从.env读取DATABASE_URL
export $(grep -v '^#' .env | xargs)

python3 << 'PYEOF'
import os
import sys

try:
    from sqlalchemy import create_engine

    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("❌ DATABASE_URL 未设置！")
        sys.exit(1)

    engine = create_engine(db_url)
    conn = engine.connect()
    print("✅ 数据库连接成功！")
    conn.close()
except Exception as e:
    print(f"❌ 数据库连接失败: {e}")
    print("\n请检查:")
    print("1. .env 中的 DATABASE_URL 是否正确")
    print("2. RDS 白名单是否包含当前ECS的IP")
    sys.exit(1)
PYEOF

if [ $? -ne 0 ]; then
    print_error "数据库连接测试失败！"
    exit 1
fi

# 步骤6：停止旧服务并启动新服务
print_info "步骤 6/6: 启动服务..."

# 检查是否有旧的screen会话
if screen -list | grep -q "warehouse"; then
    print_warning "检测到旧的warehouse服务，正在停止..."
    screen -X -S warehouse quit || true
    sleep 2
fi

# 启动新服务
print_info "在screen会话中启动服务..."

# 创建启动脚本
cat > /tmp/start_warehouse.sh << 'EOF'
#!/bin/bash
cd ~/Product_Warehouse
source .venv/bin/activate
export PYTHONPATH=src/Backend
export $(grep -v '^#' .env | xargs)
uvicorn app.main:app --host 0.0.0.0 --port 8001 --workers 2
EOF

chmod +x /tmp/start_warehouse.sh

# 在screen中启动
screen -dmS warehouse bash /tmp/start_warehouse.sh

sleep 3

# 检查服务是否启动
if screen -list | grep -q "warehouse"; then
    print_info "✅ 服务已在screen中启动"
else
    print_error "服务启动失败！"
    exit 1
fi

# 测试服务
print_info "测试服务健康状态..."
sleep 2

if curl -f http://localhost:8001/health > /dev/null 2>&1; then
    print_info "✅ 服务健康检查通过！"
else
    print_warning "健康检查失败，请手动检查服务状态"
    print_info "运行: screen -r warehouse 查看日志"
fi

# 显示部署信息
echo ""
echo "================================================"
echo -e "${GREEN}✅ 部署完成！${NC}"
echo "================================================"
echo ""
echo "访问方式："
echo "  • 通过域名: http://你的域名:8001"
echo "  • 通过IP:   http://$(curl -s ifconfig.me):8001"
echo ""
echo "管理命令："
echo "  • 查看日志:   screen -r warehouse"
echo "  • 分离screen: 按 Ctrl+A，然后按 D"
echo "  • 停止服务:   screen -X -S warehouse quit"
echo "  • 重新部署:   bash deploy.sh"
echo ""
echo "注意事项："
echo "  • 确保ECS安全组已开放8001端口"
echo "  • 确保域名已解析到ECS公网IP"
echo "  • 如需查看实时日志: screen -r warehouse"
echo ""
echo "================================================"
