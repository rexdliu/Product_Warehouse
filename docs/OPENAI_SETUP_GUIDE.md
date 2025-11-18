# OpenAI 集成配置指南

## 🚀 快速开始（5分钟）

### 1️⃣ 获取 OpenAI API Key

1. 访问 [OpenAI Platform](https://platform.openai.com/)
2. 注册/登录账号
3. 进入 [API Keys](https://platform.openai.com/api-keys)
4. 点击 "Create new secret key"
5. 复制生成的 API Key（格式：`sk-proj-...`）

### 2️⃣ 配置环境变量

在 `.env` 文件中添加：

```env
# OpenAI API 配置
OPENAI_API_KEY=sk-proj-your_api_key_here
RAG_ENABLED=true

# AI 模型配置（可选）
AI_MODEL=gpt-3.5-turbo
EMBEDDING_MODEL=text-embedding-3-small
```

### 3️⃣ 测试 AI 功能

启动后端：
```bash
cd src/Backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

测试 API：
```bash
# 检查 AI 服务状态
curl http://localhost:8001/api/v1/ai/status

# 测试 RAG 问答
curl -X POST http://localhost:8001/api/v1/ai/rag/query \
  -H "Content-Type: application/json" \
  -d '{
    "question": "如何管理库存？",
    "use_enhanced": true,
    "use_llm": true
  }'
```

---

## 📊 功能概览

### 已实现功能

#### 1. **基础 RAG 问答** ✅
- 关键词匹配检索
- 无需 OpenAI API
- 基于本地知识库

#### 2. **增强 RAG 问答** 🚀
- 向量相似度检索（ChromaDB）
- OpenAI Embeddings
- GPT 增强回答
- 更准确的语义理解

#### 3. **产品洞察分析** ✅
- 自动分析产品数据
- 生成定价建议
- 库存管理建议
- 销售策略建议

#### 4. **AI 聊天助手** ✅
- 多轮对话
- 上下文理解
- 仓库管理专业知识

---

## 🔧 详细配置

### 环境变量说明

```env
# ===========================================
# OpenAI API 配置
# ===========================================

# OpenAI API Key（必填）
# 获取地址：https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-proj-...

# 是否启用 RAG 功能（可选，默认 false）
RAG_ENABLED=true

# ===========================================
# AI 模型配置（可选）
# ===========================================

# 聊天模型（默认：gpt-3.5-turbo）
# 可选值：
# - gpt-3.5-turbo  (推荐，性价比高)
# - gpt-4          (更强大，成本高)
# - gpt-4-turbo    (平衡性能和成本)
AI_MODEL=gpt-3.5-turbo

# Embedding 模型（默认：text-embedding-3-small）
# 可选值：
# - text-embedding-3-small  (推荐，性价比高)
# - text-embedding-3-large  (更高质量)
# - text-embedding-ada-002  (旧版本)
EMBEDDING_MODEL=text-embedding-3-small

# ===========================================
# ChromaDB 配置（可选）
# ===========================================

# ChromaDB 数据存储路径（默认：src/Backend/app/data/chroma）
CHROMA_PERSIST_DIR=./data/chroma

# ChromaDB 服务器模式（可选）
# CHROMA_HOST=localhost
# CHROMA_PORT=8000
```

---

## 💰 成本估算

### OpenAI API 定价（2025年）

| 模型 | 输入价格 | 输出价格 | 备注 |
|------|---------|---------|------|
| **gpt-3.5-turbo** | $0.0005/1K tokens | $0.0015/1K tokens | ⭐ 推荐日常使用 |
| **gpt-4** | $0.03/1K tokens | $0.06/1K tokens | 复杂分析 |
| **gpt-4-turbo** | $0.01/1K tokens | $0.03/1K tokens | 平衡选择 |
| **text-embedding-3-small** | $0.00002/1K tokens | - | ⭐ 推荐 |
| **text-embedding-3-large** | $0.00013/1K tokens | - | 高质量 |

### 月成本估算

**场景 1：小型团队（10 用户）**
- 每天 100 次 RAG 查询
- 每天 50 次聊天对话

```
计算：
Embeddings: 100 × 30 × 100 tokens × $0.00002 = $0.60/月
GPT-3.5: 150 × 30 × 500 tokens × $0.001 = $22.50/月
总计: ~$23/月
```

**场景 2：中型团队（50 用户）**
- 每天 500 次查询

```
总计: ~$115/月
```

### 优化建议

1. **使用缓存** - 减少 80% 重复查询成本
2. **限制 Token 数量** - 设置 `max_tokens` 参数
3. **优先使用 gpt-3.5-turbo** - 成本仅为 gpt-4 的 1/20
4. **批量处理** - 批量生成 embeddings

---

## 🔐 安全最佳实践

### 1. 保护 API Key

❌ **错误做法：**
```python
# 不要硬编码在代码中
openai.api_key = "sk-proj-abcd1234"

# 不要提交到 Git
```

✅ **正确做法：**
```python
# 使用环境变量
from app.core.config import settings
openai.api_key = settings.OPENAI_API_KEY
```

```.gitignore
# 添加到 .gitignore
.env
.env.local
.env.production
```

### 2. 数据脱敏

```python
def sanitize_data(product_data: Dict) -> Dict:
    """移除敏感信息"""
    return {
        "name": product_data.get("name"),
        "category": product_data.get("category"),
        # 不包含：用户信息、供应商数据、成本等
    }
```

### 3. 速率限制

```python
# 限制每用户每天查询次数
MAX_QUERIES_PER_DAY = 100

# 使用 Redis 记录查询次数
async def check_rate_limit(user_id: int) -> bool:
    key = f"ai_queries:{user_id}:{date.today()}"
    count = await redis.incr(key)
    await redis.expire(key, 86400)  # 24小时过期
    return count <= MAX_QUERIES_PER_DAY
```

---

## 📖 API 使用示例

### 1. RAG 问答（基础模式）

```bash
curl -X POST http://localhost:8001/api/v1/ai/rag/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "question": "如何设置最低库存预警？",
    "use_enhanced": false
  }'
```

**响应：**
```json
{
  "answer": "以下建议基于知识库检索结果：\n- 库存预警设置：...",
  "sources": [
    {
      "title": "库存管理最佳实践",
      "category": "inventory",
      "content": "..."
    }
  ],
  "mode": "basic"
}
```

### 2. RAG 问答（增强模式）

```bash
curl -X POST http://localhost:8001/api/v1/ai/rag/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "question": "如何优化库存周转率？",
    "top_k": 3,
    "use_enhanced": true,
    "use_llm": true
  }'
```

**响应：**
```json
{
  "answer": "根据仓库管理最佳实践，优化库存周转率可以从以下几个方面入手：\n\n1. ABC分类管理：...\n2. 设置合理的安全库存：...\n3. 建立快速补货机制：...",
  "sources": [
    {
      "title": "库存优化策略",
      "score": 0.92
    }
  ],
  "confidence": 0.85,
  "mode": "enhanced"
}
```

### 3. 产品洞察

```python
import requests

response = requests.post(
    'http://localhost:8001/api/v1/ai/insights',
    headers={'Authorization': 'Bearer YOUR_TOKEN'},
    json={
        "product": {
            "id": 123,
            "name": "康明斯机油滤芯 FF5320",
            "sku": "FF5320",
            "price": 89.99,
            "inventory": 15,
            "sales_last_30d": 45
        }
    }
)

print(response.json())
```

**响应：**
```json
{
  "insight": "基于数据分析：\n1. 定价建议：当前价格合理，建议观察竞品动态\n2. 库存建议：库存偏低，月销量45件，建议补货至60件\n3. 销售策略：热销产品，可考虑套装销售提升客单价"
}
```

### 4. AI 聊天

```python
response = requests.post(
    'http://localhost:8001/api/v1/ai/chat',
    headers={'Authorization': 'Bearer YOUR_TOKEN'},
    json={
        "messages": [
            {"role": "user", "content": "帮我分析一下本月销售趋势"}
        ],
        "context": {
            "user_id": 1,
            "role": "manager"
        }
    }
)
```

### 5. 索引知识库

```bash
curl -X POST http://localhost:8001/api/v1/ai/rag/index \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "source": "file",
    "rebuild": false
  }'
```

**响应：**
```json
{
  "status": "success",
  "added": 156,
  "failed": 0,
  "total": 156,
  "source": "/path/to/warehouse_knowledge.json"
}
```

---

## 🧪 测试和调试

### 检查 AI 服务状态

```bash
curl http://localhost:8001/api/v1/ai/status
```

**响应示例：**
```json
{
  "openai_configured": true,
  "rag_mode": "enhanced",
  "enhanced_rag_available": true,
  "rag_stats": {
    "status": "active",
    "document_count": 156,
    "collection_name": "warehouse_knowledge",
    "openai_enabled": true,
    "embedding_model": "text-embedding-3-small"
  }
}
```

### Python 测试脚本

创建 `scripts/test_ai.py`：

```python
import requests
import json

API_URL = "http://localhost:8001/api/v1"
TOKEN = "your_test_token"

headers = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}

# 测试 RAG 查询
def test_rag_query():
    response = requests.post(
        f"{API_URL}/ai/rag/query",
        headers=headers,
        json={
            "question": "如何管理库存？",
            "use_enhanced": True,
            "use_llm": True
        }
    )
    print("RAG Query:", json.dumps(response.json(), indent=2, ensure_ascii=False))

# 测试产品洞察
def test_insights():
    response = requests.post(
        f"{API_URL}/ai/insights",
        headers=headers,
        json={
            "product": {
                "name": "测试产品",
                "price": 100,
                "inventory": 10
            }
        }
    )
    print("Insights:", json.dumps(response.json(), indent=2, ensure_ascii=False))

if __name__ == "__main__":
    test_rag_query()
    test_insights()
```

运行测试：
```bash
python scripts/test_ai.py
```

---

## 🛠️ 故障排查

### 问题 1: "OpenAI API Key 未配置"

**错误信息：**
```json
{
  "reply": "AI服务未配置，请配置 OPENAI_API_KEY。"
}
```

**解决方案：**
1. 检查 `.env` 文件是否存在
2. 确认 `OPENAI_API_KEY` 已设置
3. 重启后端服务

### 问题 2: "ChromaDB 未初始化"

**错误信息：**
```
警告: ChromaDB 未安装，使用降级模式
```

**解决方案：**
```bash
pip install chromadb==0.4.18
```

### 问题 3: API 调用失败

**错误信息：**
```
openai.AuthenticationError: Invalid API key
```

**解决方案：**
1. 验证 API Key 是否正确
2. 检查 API Key 是否过期
3. 确认账户余额充足

### 问题 4: 响应速度慢

**优化方案：**
1. 使用缓存（Redis）
2. 减少 `max_tokens` 参数
3. 使用 gpt-3.5-turbo 替代 gpt-4
4. 启用流式响应

---

## 📚 进阶功能

### 1. 流式响应

```python
async def stream_chat(messages):
    stream = openai_client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=messages,
        stream=True
    )

    for chunk in stream:
        if chunk.choices[0].delta.content:
            yield chunk.choices[0].delta.content
```

### 2. Function Calling

```python
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_product_info",
            "description": "获取产品详细信息",
            "parameters": {
                "type": "object",
                "properties": {
                    "product_id": {
                        "type": "integer",
                        "description": "产品ID"
                    }
                },
                "required": ["product_id"]
            }
        }
    }
]

response = openai_client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=messages,
    tools=tools
)
```

### 3. 多语言支持

```python
def translate_query(question: str, target_lang: str = "en") -> str:
    """翻译查询到目标语言"""
    response = openai_client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": f"Translate to {target_lang}"},
            {"role": "user", "content": question}
        ]
    )
    return response.choices[0].message.content
```

---

## 🎯 下一步

1. ✅ **配置 OpenAI API Key**
2. 🧪 **测试基础功能**
3. 📚 **索引知识库**
4. 🚀 **启用增强 RAG**
5. 🎨 **集成到前端/移动端**

---

## 📖 相关文档

- [RAG 服务架构文档](./RAG_SERVICE_ARCHITECTURE.md)
- [Flutter 移动应用指南](./FLUTTER_MOBILE_APP_GUIDE.md)
- [OpenAI 官方文档](https://platform.openai.com/docs)

---

**文档版本：** v1.0
**最后更新：** 2025-11-18
