from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.services.ai_service import ai_service
from app.services.rag_service import rag_service

# 尝试导入增强 RAG 服务
try:
    from app.services.enhanced_rag_service import enhanced_rag_service
    ENHANCED_RAG_AVAILABLE = enhanced_rag_service is not None
except ImportError:
    ENHANCED_RAG_AVAILABLE = False
    enhanced_rag_service = None


class RAGQuery(BaseModel):
    question: str
    top_k: int = Field(default=3, ge=1, le=10)
    use_llm: bool = Field(default=True, description="是否使用 LLM 生成增强回答")
    use_enhanced: bool = Field(default=True, description="是否使用增强 RAG（向量检索）")


class ProductInsightRequest(BaseModel):
    product: Dict[str, Any]


class ChatMessage(BaseModel):
    role: str = Field(..., description="消息角色: user, assistant, system")
    content: str = Field(..., description="消息内容")


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    context: Optional[Dict[str, Any]] = Field(default=None, description="上下文信息")


class IndexRequest(BaseModel):
    source: str = Field(default="database", description="数据源: database, file, url")
    rebuild: bool = Field(default=False, description="是否重建索引")


router = APIRouter()


@router.post("/rag/query", summary="RAG 知识库问答")
def rag_query(payload: RAGQuery) -> Dict[str, Any]:
    """
    基于知识库的智能问答

    支持两种模式：
    1. 增强模式（推荐）：使用向量检索 + OpenAI GPT
    2. 基础模式：关键词匹配

    示例：
    ```
    POST /api/v1/ai/rag/query
    {
        "question": "如何设置最低库存预警？",
        "top_k": 3,
        "use_llm": true,
        "use_enhanced": true
    }
    ```
    """
    if not payload.question.strip():
        raise HTTPException(status_code=400, detail="问题不能为空")

    # 选择 RAG 服务
    if payload.use_enhanced and ENHANCED_RAG_AVAILABLE:
        result = enhanced_rag_service.query(
            question=payload.question,
            top_k=payload.top_k,
            use_llm=payload.use_llm
        )
        result["mode"] = "enhanced"
    else:
        result = rag_service.query(payload.question, top_k=payload.top_k)
        result["mode"] = "basic"

    return result


@router.post("/insights", summary="产品洞察分析")
def generate_insights(request: ProductInsightRequest) -> Dict[str, Any]:
    """
    生成产品洞察和建议

    分析产品数据，提供：
    - 定价建议
    - 库存管理建议
    - 销售策略建议

    示例：
    ```
    POST /api/v1/ai/insights
    {
        "product": {
            "id": 123,
            "name": "康明斯机油滤芯",
            "price": 89.99,
            "inventory": 15
        }
    }
    ```
    """
    insight = ai_service.generate_product_insights(request.product)
    return {"insight": insight}


@router.post("/chat", summary="AI 聊天对话")
def chat(request: ChatRequest) -> Dict[str, Any]:
    """
    与 AI 助手对话

    支持多轮对话，可提供上下文信息

    示例：
    ```
    POST /api/v1/ai/chat
    {
        "messages": [
            {"role": "user", "content": "帮我分析一下本月销售趋势"}
        ],
        "context": {"user_id": 1, "role": "manager"}
    }
    ```
    """
    # 转换消息格式
    messages = [{"role": msg.role, "content": msg.content} for msg in request.messages]

    # 调用 AI 服务
    reply = ai_service.chat_with_user(messages)

    return {
        "reply": reply,
        "context": request.context
    }


@router.post("/rag/index", summary="索引知识库")
def index_knowledge_base(request: IndexRequest) -> Dict[str, Any]:
    """
    索引知识库到向量数据库

    支持从多种数据源索引：
    - database: 从数据库读取
    - file: 从文件读取（默认）
    - url: 从 URL 获取

    示例：
    ```
    POST /api/v1/ai/rag/index
    {
        "source": "file",
        "rebuild": false
    }
    ```
    """
    if not ENHANCED_RAG_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="增强 RAG 服务不可用，请确保已安装 ChromaDB 并配置 OpenAI API Key"
        )

    if request.source != "file":
        raise HTTPException(
            status_code=400,
            detail=f"暂不支持数据源: {request.source}，目前仅支持 'file'"
        )

    # 索引知识库
    result = enhanced_rag_service.index_knowledge_base()

    return result


@router.get("/status", summary="AI 服务状态")
def get_ai_status() -> Dict[str, Any]:
    """
    获取 AI 服务状态

    返回：
    - OpenAI API 可用性
    - RAG 服务模式
    - 知识库文档数量
    """
    status = {
        "openai_configured": ai_service.client is not None,
        "rag_mode": "enhanced" if ENHANCED_RAG_AVAILABLE else "basic",
        "enhanced_rag_available": ENHANCED_RAG_AVAILABLE
    }

    # 获取增强 RAG 统计信息
    if ENHANCED_RAG_AVAILABLE:
        status["rag_stats"] = enhanced_rag_service.get_statistics()

    return status
