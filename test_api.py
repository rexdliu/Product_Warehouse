#!/usr/bin/env python3
"""
API 测试脚本
用于测试后端 API 功能和 JWT 认证
"""

import requests
import json
from datetime import datetime

# 配置
BASE_URL = "http://127.0.0.1:8001"
API_URL = f"{BASE_URL}/api/v1"

def print_section(title):
    """打印分节标题"""
    print("\n" + "="*60)
    print(f"  {title}")
    print("="*60)

def test_health_check():
    """测试健康检查端点"""
    print_section("1. 健康检查测试")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        print(f"状态码: {response.status_code}")
        print(f"响应: {response.json()}")
        return True
    except Exception as e:
        print(f"❌ 健康检查失败: {e}")
        return False

def test_register():
    """测试用户注册"""
    print_section("2. 用户注册测试")

    # 生成唯一的测试用户
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    test_user = {
        "username": f"testuser_{timestamp}",
        "email": f"test_{timestamp}@example.com",
        "phone": f"1{timestamp[-10:]}",
        "password": "Test123456!",
        "full_name": "Test User"
    }

    try:
        response = requests.post(
            f"{API_URL}/auth/register",
            json=test_user,
            timeout=10
        )
        print(f"状态码: {response.status_code}")
        print(f"响应: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")

        if response.status_code == 200:
            print("✅ 用户注册成功")
            return test_user
        else:
            print(f"⚠️  注册失败: {response.json()}")
            return None
    except Exception as e:
        print(f"❌ 注册请求失败: {e}")
        return None

def test_login(username, password):
    """测试用户登录"""
    print_section("3. 用户登录测试 (JWT认证)")

    try:
        # OAuth2 密码流使用 form data，不是 JSON
        response = requests.post(
            f"{API_URL}/auth/login",
            data={
                "username": username,
                "password": password
            },
            timeout=10
        )
        print(f"状态码: {response.status_code}")
        print(f"响应: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")

        if response.status_code == 200:
            token = response.json().get("access_token")
            print(f"✅ 登录成功，获得JWT令牌")
            print(f"令牌前50字符: {token[:50]}...")
            return token
        else:
            print(f"❌ 登录失败")
            return None
    except Exception as e:
        print(f"❌ 登录请求失败: {e}")
        return None

def test_get_current_user(token):
    """测试获取当前用户信息（需要JWT认证）"""
    print_section("4. 获取当前用户信息测试 (需要JWT)")

    try:
        headers = {
            "Authorization": f"Bearer {token}"
        }
        response = requests.get(
            f"{API_URL}/users/me",
            headers=headers,
            timeout=10
        )
        print(f"状态码: {response.status_code}")
        print(f"响应: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")

        if response.status_code == 200:
            print("✅ 成功获取用户信息 (JWT认证有效)")
            return True
        else:
            print("❌ 获取用户信息失败")
            return False
    except Exception as e:
        print(f"❌ 请求失败: {e}")
        return False

def test_get_user_settings(token):
    """测试获取用户设置"""
    print_section("5. 获取用户设置测试")

    try:
        headers = {
            "Authorization": f"Bearer {token}"
        }
        response = requests.get(
            f"{API_URL}/users/settings",
            headers=headers,
            timeout=10
        )
        print(f"状态码: {response.status_code}")
        print(f"响应: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")

        if response.status_code == 200:
            print("✅ 成功获取用户设置")
            return True
        else:
            print("❌ 获取用户设置失败")
            return False
    except Exception as e:
        print(f"❌ 请求失败: {e}")
        return False

def test_products_list(token):
    """测试获取产品列表"""
    print_section("6. 获取产品列表测试")

    try:
        headers = {
            "Authorization": f"Bearer {token}"
        }
        response = requests.get(
            f"{API_URL}/products/",
            headers=headers,
            timeout=10
        )
        print(f"状态码: {response.status_code}")

        if response.status_code == 200:
            products = response.json()
            print(f"✅ 成功获取产品列表，共 {len(products)} 个产品")
            if products:
                print(f"第一个产品: {json.dumps(products[0], indent=2, ensure_ascii=False)}")
            return True
        else:
            print(f"响应: {response.json()}")
            print("❌ 获取产品列表失败")
            return False
    except Exception as e:
        print(f"❌ 请求失败: {e}")
        return False

def test_inventory_list(token):
    """测试获取库存列表"""
    print_section("7. 获取库存列表测试")

    try:
        headers = {
            "Authorization": f"Bearer {token}"
        }
        response = requests.get(
            f"{API_URL}/inventory/",
            headers=headers,
            timeout=10
        )
        print(f"状态码: {response.status_code}")

        if response.status_code == 200:
            inventory = response.json()
            print(f"✅ 成功获取库存列表，共 {len(inventory)} 条记录")
            if inventory:
                print(f"第一条库存: {json.dumps(inventory[0], indent=2, ensure_ascii=False)}")
            return True
        else:
            print(f"响应: {response.json()}")
            print("❌ 获取库存列表失败")
            return False
    except Exception as e:
        print(f"❌ 请求失败: {e}")
        return False

def test_unauthorized_access():
    """测试未授权访问（不带JWT令牌）"""
    print_section("8. 未授权访问测试")

    try:
        response = requests.get(
            f"{API_URL}/users/me",
            timeout=10
        )
        print(f"状态码: {response.status_code}")
        print(f"响应: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")

        if response.status_code == 401:
            print("✅ 正确拒绝了未授权访问 (JWT保护正常工作)")
            return True
        else:
            print("⚠️  未授权访问未被正确拒绝")
            return False
    except Exception as e:
        print(f"❌ 请求失败: {e}")
        return False

def main():
    """主测试流程"""
    print("\n" + "🚀 "*30)
    print("  开始API测试")
    print("🚀 "*30)

    results = {
        "健康检查": False,
        "用户注册": False,
        "用户登录": False,
        "获取用户信息": False,
        "获取用户设置": False,
        "获取产品列表": False,
        "获取库存列表": False,
        "未授权访问测试": False
    }

    # 1. 健康检查
    results["健康检查"] = test_health_check()

    if not results["健康检查"]:
        print("\n❌ 后端服务未启动，请先启动后端服务：")
        print("   bash start_backend.sh")
        return

    # 2. 用户注册
    test_user = test_register()
    results["用户注册"] = test_user is not None

    if not test_user:
        print("\n⚠️  注册失败，尝试使用默认测试用户登录...")
        test_user = {
            "username": "admin",
            "password": "admin123"
        }

    # 3. 用户登录
    token = test_login(test_user["username"], test_user["password"])
    results["用户登录"] = token is not None

    if not token:
        print("\n❌ 无法获取JWT令牌，后续测试无法继续")
        print_summary(results)
        return

    # 4. 获取用户信息
    results["获取用户信息"] = test_get_current_user(token)

    # 5. 获取用户设置
    results["获取用户设置"] = test_get_user_settings(token)

    # 6. 获取产品列表
    results["获取产品列表"] = test_products_list(token)

    # 7. 获取库存列表
    results["获取库存列表"] = test_inventory_list(token)

    # 8. 未授权访问测试
    results["未授权访问测试"] = test_unauthorized_access()

    # 打印总结
    print_summary(results)

def print_summary(results):
    """打印测试总结"""
    print_section("测试总结")

    passed = sum(1 for v in results.values() if v)
    total = len(results)

    for test_name, result in results.items():
        status = "✅ 通过" if result else "❌ 失败"
        print(f"{test_name}: {status}")

    print(f"\n总计: {passed}/{total} 测试通过")

    if passed == total:
        print("\n🎉 所有测试通过！")
    else:
        print(f"\n⚠️  {total - passed} 个测试失败")

    # JWT认证状态分析
    print_section("JWT认证系统分析")

    jwt_features = {
        "JWT令牌生成": results.get("用户登录", False),
        "JWT令牌验证": results.get("获取用户信息", False),
        "受保护路由": results.get("获取用户信息", False),
        "未授权访问拒绝": results.get("未授权访问测试", False)
    }

    for feature, status in jwt_features.items():
        status_text = "✅ 已实现" if status else "❌ 未实现"
        print(f"{feature}: {status_text}")

    jwt_passed = sum(1 for v in jwt_features.values() if v)
    if jwt_passed == len(jwt_features):
        print("\n✅ JWT认证系统已完整实现并正常工作")
    else:
        print(f"\n⚠️  JWT认证系统部分功能未实现 ({jwt_passed}/{len(jwt_features)})")

if __name__ == "__main__":
    main()
