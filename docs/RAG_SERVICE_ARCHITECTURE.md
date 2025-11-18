# RAG 服务架构设计文档

## 📋 概述

本文档描述了 Product Warehouse 仓库管理系统的 RAG (Retrieval-Augmented Generation) 服务架构。RAG 服务结合了信息检索和 AI 生成能力，为用户提供智能问答、产品洞察和库存建议。

---

## 🏗️ 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (React/Flutter)            │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ AI Chat UI  │  │ Product Page │  │ Dashboard    │   │
│  └─────────────┘  └──────────────┘  └──────────────┘   │
└────────────┬────────────────┬────────────────┬──────────┘
             │                │                │
             │ HTTP POST      │ HTTP POST      │ HTTP GET
             ▼                ▼                ▼
┌─────────────────────────────────────────────────────────┐
│               FastAPI Backend (Python)                   │
│  ┌──────────────────────────────────────────────────┐   │
│  │          API Layer (/api/v1/ai/*)                │   │
│  │  - POST /ai/rag/query       (RAG 问答)           │   │
│  │  - POST /ai/insights        (产品洞察)            │   │
│  │  - POST /ai/chat            (AI 聊天)            │   │
│  │  - POST /ai/rag/index       (索引知识库)          │   │
│  └─────────────┬────────────────────────────────────┘   │
│                │                                         │
│  ┌─────────────▼────────────────────────────────────┐   │
│  │          Service Layer                           │   │
│  │  ┌──────────────┐         ┌──────────────────┐  │   │
│  │  │ RAGService   │◄────────│ AIService        │  │   │
│  │  │ (Enhanced)   │         │ (OpenAI API)     │  │   │
│  │  └──────┬───────┘         └──────────────────┘  │   │
│  │         │                                        │   │
│  │         ▼                                        │   │
│  │  ┌──────────────┐         ┌──────────────────┐  │   │
│  │  │ ChromaDB     │         │ Knowledge Base   │  │   │
│  │  │ (Vector DB)  │◄────────│ (JSON/Database)  │  │   │
│  │  └──────────────┘         └──────────────────┘  │   │
│  └───────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 🧩 核心组件

### 1. **RAG Service** (`app/services/rag_service.py`)

负责检索相关知识并生成回答。

#### 功能：
- ✅ **基础版本**（已实现）：关键词匹配检索
- 🚀 **增强版本**（推荐）：向量相似度检索（使用 ChromaDB + OpenAI Embeddings）

#### 增强版特性：
```python
class EnhancedRAGService:
    """增强的 RAG 服务，使用向量数据库和 OpenAI Embeddings"""

    def __init__(self):
        self.chroma_client = chromadb.Client()
        self.collection = self.chroma_client.get_or_create_collection("warehouse_knowledge")
        self.openai_client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)

    def add_knowledge(self, documents: List[Dict]):
        """添加文档到向量数据库"""
        # 使用 OpenAI Embeddings 生成向量
        # 存储到 ChromaDB

    def query(self, question: str, top_k: int = 3) -> Dict:
        """检索相关文档并生成回答"""
        # 1. 将问题转换为向量
        # 2. 在 ChromaDB 中检索相似文档
        # 3. 使用 OpenAI GPT 生成回答
        # 4. 返回回答和来源
```

### 2. **AI Service** (`app/services/ai_service.py`)

负责与 OpenAI API 交互。

#### 功能：
- ✅ 产品洞察生成
- ✅ 聊天对话
- 🚀 RAG 增强回答生成

#### 使用场景：
1. **产品洞察**：分析产品数据，提供定价、库存、销售建议
2. **智能问答**：回答用户关于仓库管理的问题
3. **数据分析**：解读销售趋势、库存异常

### 3. **Vector Database - ChromaDB**

存储和检索文档向量。

#### 为什么使用 ChromaDB？
- ✅ 开源免费
- ✅ 易于部署（嵌入式或客户端-服务器模式）
- ✅ 支持持久化存储
- ✅ Python 原生支持
- ✅ 适合中小型项目

#### 数据结构：
```json
{
  "id": "doc_001",
  "embedding": [0.123, -0.456, ...],  // OpenAI embedding vector
  "metadata": {
    "title": "库存管理最佳实践",
    "category": "inventory",
    "source": "knowledge_base"
  },
  "document": "库存管理的核心原则是..."
}
```

### 4. **Knowledge Base**

知识库内容来源：
- 📚 仓库管理最佳实践
- 📚 产品文档和规格
- 📚 历史问答记录
- 📚 行业知识和经验

---

## 🔄 RAG 工作流程

### 查询流程

```
用户提问: "如何优化库存周转率？"
    │
    ▼
┌─────────────────────────────────┐
│ 1. 问题向量化                   │
│    OpenAI Embeddings API        │
│    question_vector = [0.1, ...] │
└─────────────┬───────────────────┘
              ▼
┌─────────────────────────────────┐
│ 2. 向量相似度检索                │
│    ChromaDB.query(vector)       │
│    返回 Top-K 相关文档           │
└─────────────┬───────────────────┘
              ▼
┌─────────────────────────────────┐
│ 3. 构建增强 Prompt              │
│    Context: 检索到的文档         │
│    Question: 用户问题            │
└─────────────┬───────────────────┘
              ▼
┌─────────────────────────────────┐
│ 4. OpenAI GPT 生成回答          │
│    model: gpt-3.5-turbo/gpt-4   │
│    返回自然语言回答              │
└─────────────┬───────────────────┘
              ▼
┌─────────────────────────────────┐
│ 5. 返回结果                     │
│    - answer: AI 生成的回答       │
│    - sources: 引用的文档         │
│    - confidence: 置信度          │
└─────────────────────────────────┘
```

### 索引流程

```
知识库文档 (JSON/Markdown/Database)
    │
    ▼
┌─────────────────────────────────┐
│ 1. 文档预处理                   │
│    - 分块 (chunking)            │
│    - 清理格式                    │
└─────────────┬───────────────────┘
              ▼
┌─────────────────────────────────┐
│ 2. 生成向量                     │
│    OpenAI Embeddings API        │
│    embedding = [0.1, 0.2, ...]  │
└─────────────┬───────────────────┘
              ▼
┌─────────────────────────────────┐
│ 3. 存储到 ChromaDB              │
│    collection.add(              │
│      documents, embeddings,     │
│      metadatas, ids             │
│    )                            │
└─────────────────────────────────┘
```

---

## 🛠️ 技术栈

| 组件 | 技术 | 用途 |
|------|------|------|
| **LLM** | OpenAI GPT-3.5/4 | 生成自然语言回答 |
| **Embeddings** | OpenAI text-embedding-3-small | 文本向量化 |
| **Vector DB** | ChromaDB | 向量存储和检索 |
| **Backend** | FastAPI + Python | API 服务 |
| **Knowledge** | JSON/PostgreSQL | 知识库存储 |
| **Cache** | Redis (可选) | 缓存常见问题 |

---

## 📊 API 端点

### 1. RAG 问答

**POST** `/api/v1/ai/rag/query`

```json
// Request
{
  "question": "如何设置最低库存预警？",
  "top_k": 3,
  "use_llm": true  // 是否使用 LLM 生成回答
}

// Response
{
  "answer": "设置最低库存预警的步骤：\n1. 分析历史销售数据...",
  "sources": [
    {
      "id": "doc_123",
      "title": "库存管理最佳实践",
      "content": "...",
      "score": 0.92
    }
  ],
  "confidence": 0.85
}
```

### 2. 产品洞察

**POST** `/api/v1/ai/insights`

```json
// Request
{
  "product": {
    "id": 123,
    "name": "康明斯发动机机油滤芯",
    "sku": "FF5320",
    "price": 89.99,
    "inventory": 15,
    "sales_last_30d": 45
  }
}

// Response
{
  "insight": "基于数据分析：\n1. 定价建议：当前价格合理...\n2. 库存建议：库存偏低...",
  "recommendations": [
    {
      "type": "restock",
      "priority": "high",
      "message": "建议补货至 60 件"
    }
  ]
}
```

### 3. AI 聊天

**POST** `/api/v1/ai/chat`

```json
// Request
{
  "messages": [
    {"role": "user", "content": "帮我分析一下本月销售趋势"}
  ],
  "context": {
    "user_id": 1,
    "role": "manager"
  }
}

// Response
{
  "reply": "根据您的权限，我查询了本月销售数据...",
  "suggestions": ["查看详细报表", "导出数据"]
}
```

### 4. 索引知识库

**POST** `/api/v1/ai/rag/index`

```json
// Request
{
  "source": "database",  // database, file, url
  "rebuild": false       // 是否重建索引
}

// Response
{
  "status": "success",
  "indexed_documents": 156,
  "total_chunks": 423
}
```

---

## 🚀 实施计划

### 阶段 1：基础 RAG（已完成 ✅）

- ✅ 简单关键词匹配
- ✅ 静态知识库（JSON）
- ✅ 基础 API 端点

### 阶段 2：增强 RAG（推荐）

**任务：**
1. 集成 ChromaDB 向量数据库
2. 使用 OpenAI Embeddings
3. 实现向量相似度检索
4. 添加知识库索引功能
5. 优化 Prompt 工程

**代码示例：**
```python
# 使用 OpenAI Embeddings
def get_embedding(text: str) -> List[float]:
    response = openai_client.embeddings.create(
        model="text-embedding-3-small",
        input=text
    )
    return response.data[0].embedding

# 检索相关文档
def retrieve_documents(question: str, top_k: int = 3):
    question_vector = get_embedding(question)
    results = chroma_collection.query(
        query_embeddings=[question_vector],
        n_results=top_k
    )
    return results

# 生成增强回答
def generate_answer(question: str, context: str) -> str:
    prompt = f"""
    基于以下上下文回答问题：

    上下文：
    {context}

    问题：{question}

    请提供详细、准确的回答。
    """

    response = openai_client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "你是一个专业的仓库管理助手。"},
            {"role": "user", "content": prompt}
        ]
    )
    return response.choices[0].message.content
```

### 阶段 3：智能优化

- 🔧 添加对话历史记录
- 🔧 实现缓存机制（Redis）
- 🔧 支持多语言
- 🔧 添加反馈和评分
- 🔧 自动学习和优化

---

## 💰 成本估算

### OpenAI API 成本

| 模型 | 输入价格 | 输出价格 | 适用场景 |
|------|---------|---------|---------|
| **gpt-3.5-turbo** | $0.0005/1K tokens | $0.0015/1K tokens | 日常问答、快速响应 |
| **gpt-4** | $0.03/1K tokens | $0.06/1K tokens | 复杂分析、高质量回答 |
| **text-embedding-3-small** | $0.00002/1K tokens | - | 文本向量化 |

**月成本估算（假设每天 1000 次查询）：**
- Embeddings: 1000 × 30 × 100 tokens × $0.00002 = **$0.60/月**
- GPT-3.5: 1000 × 30 × 500 tokens × $0.001 = **$15/月**
- **总计：约 $16/月**

### 优化建议：
1. 缓存常见问题（减少 80% 重复查询）
2. 使用 gpt-3.5-turbo 替代 gpt-4（成本降低 95%）
3. 限制每日查询次数
4. 批量处理 embeddings

---

## 🔒 安全和隐私

### 数据安全
- ❌ 不要将用户私密信息发送到 OpenAI
- ✅ 脱敏处理敏感数据
- ✅ 审计日志记录
- ✅ 访问权限控制

### 最佳实践
```python
def sanitize_data(product_data: Dict) -> Dict:
    """移除敏感信息"""
    safe_data = {
        "name": product_data.get("name"),
        "category": product_data.get("category"),
        "price_range": categorize_price(product_data.get("price")),
        # 不包含具体用户信息、供应商数据等
    }
    return safe_data
```

---

## 📈 监控和优化

### 关键指标

1. **响应时间**
   - 目标：< 3 秒
   - 监控：API 响应时间、OpenAI 调用延迟

2. **准确率**
   - 目标：> 85%
   - 监控：用户反馈评分、问题解决率

3. **成本效益**
   - 目标：< $50/月
   - 监控：API 调用次数、token 使用量

4. **缓存命中率**
   - 目标：> 60%
   - 监控：Redis 缓存命中率

---

## 🎯 使用场景

### 1. 仓库管理问答
**问题：** "如何设置安全库存水平？"
**回答：** 基于知识库 + AI 生成专业建议

### 2. 产品智能分析
**场景：** 查看产品详情页
**功能：** 自动生成定价、库存、销售建议

### 3. 异常检测和告警
**场景：** 库存异常低
**功能：** AI 分析原因并提供解决方案

### 4. 销售趋势预测
**场景：** Dashboard 数据分析
**功能：** 基于历史数据预测未来趋势

---

## 📚 知识库内容

### 当前知识库主题
1. 库存管理最佳实践
2. Cummins 产品知识
3. 仓库操作流程
4. 常见问题解答

### 扩展知识库
- 导入历史客服对话记录
- 添加产品使用手册
- 集成行业标准文档
- 用户反馈和经验总结

---

## 🔧 环境配置

### 必需配置
```env
# OpenAI API
OPENAI_API_KEY=sk-...
RAG_ENABLED=true

# ChromaDB（可选，默认嵌入式）
CHROMA_HOST=localhost
CHROMA_PORT=8000

# 模型配置
AI_MODEL=gpt-3.5-turbo
EMBEDDING_MODEL=text-embedding-3-small
```

### 依赖安装
```bash
pip install openai==1.3.6
pip install chromadb==0.4.18
pip install langchain==0.0.340
pip install tiktoken
```

---

## 📖 相关文档

- [OpenAI API 文档](https://platform.openai.com/docs/api-reference)
- [ChromaDB 文档](https://docs.trychroma.com/)
- [RAG 技术原理](https://arxiv.org/abs/2005.11401)
- [Prompt Engineering Guide](https://www.promptingguide.ai/)

---

## 🚦 下一步

1. ✅ **立即可做**：配置 OpenAI API Key，启用基础 AI 功能
2. 🔧 **短期目标**：集成 ChromaDB，实现向量检索
3. 🎯 **中期目标**：优化 Prompt，提升回答质量
4. 🚀 **长期目标**：自动学习，持续优化

---

**文档版本：** v1.0
**最后更新：** 2025-11-18
**维护者：** Product Warehouse Team
