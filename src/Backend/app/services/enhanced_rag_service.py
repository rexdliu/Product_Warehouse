"""
增强的 RAG 服务实现

使用 ChromaDB 向量数据库和 OpenAI Embeddings 实现高质量的检索增强生成。
相比简单的关键词匹配，向量检索能够理解语义相似性，提供更准确的结果。
"""

from __future__ import annotations

import hashlib
import json
from pathlib import Path
from typing import List, Dict, Any, Optional
from dataclasses import dataclass

try:
    import chromadb
    from chromadb.config import Settings as ChromaSettings
    CHROMA_AVAILABLE = True
except ImportError:
    CHROMA_AVAILABLE = False

try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

from app.core.config import settings


@dataclass
class Document:
    """文档数据结构"""
    id: str
    title: str
    content: str
    category: str
    metadata: Dict[str, Any] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "title": self.title,
            "content": self.content,
            "category": self.category,
            "metadata": self.metadata or {}
        }


class EnhancedRAGService:
    """
    增强的 RAG 服务

    特性：
    1. 使用 ChromaDB 向量数据库存储文档
    2. 使用 OpenAI Embeddings 生成向量
    3. 支持语义相似度检索
    4. 支持 LLM 增强的回答生成
    """

    def __init__(self):
        self.openai_client: Optional[openai.OpenAI] = None
        self.chroma_client: Optional[chromadb.Client] = None
        self.collection = None

        # 检查依赖
        if not CHROMA_AVAILABLE:
            print("警告: ChromaDB 未安装，使用降级模式")
            return

        if not settings.OPENAI_API_KEY:
            print("警告: OpenAI API Key 未配置，使用降级模式")
            return

        # 初始化 OpenAI
        if OPENAI_AVAILABLE and settings.OPENAI_API_KEY:
            try:
                self.openai_client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
                print("✓ OpenAI 客户端初始化成功")
            except Exception as e:
                print(f"✗ OpenAI 初始化失败: {str(e)}")

        # 初始化 ChromaDB
        if CHROMA_AVAILABLE:
            try:
                # 持久化存储路径
                persist_dir = Path(__file__).parent.parent / "data" / "chroma"
                persist_dir.mkdir(parents=True, exist_ok=True)

                self.chroma_client = chromadb.PersistentClient(
                    path=str(persist_dir)
                )

                # 获取或创建集合
                self.collection = self.chroma_client.get_or_create_collection(
                    name="warehouse_knowledge",
                    metadata={"description": "仓库管理知识库"}
                )
                print(f"✓ ChromaDB 初始化成功，文档数量: {self.collection.count()}")
            except Exception as e:
                print(f"✗ ChromaDB 初始化失败: {str(e)}")

    def _get_embedding(self, text: str) -> Optional[List[float]]:
        """
        使用 OpenAI 生成文本向量

        Args:
            text: 输入文本

        Returns:
            向量数组，失败返回 None
        """
        if not self.openai_client:
            return None

        try:
            response = self.openai_client.embeddings.create(
                model="text-embedding-3-small",  # 性价比最高的模型
                input=text
            )
            return response.data[0].embedding
        except Exception as e:
            print(f"生成 embedding 失败: {str(e)}")
            return None

    def add_documents(self, documents: List[Document]) -> Dict[str, Any]:
        """
        添加文档到向量数据库

        Args:
            documents: 文档列表

        Returns:
            添加结果统计
        """
        if not self.collection or not self.openai_client:
            return {
                "status": "error",
                "message": "RAG 服务未正确初始化",
                "added": 0
            }

        added_count = 0
        failed_count = 0

        for doc in documents:
            try:
                # 生成文档向量
                embedding = self._get_embedding(f"{doc.title} {doc.content}")
                if not embedding:
                    failed_count += 1
                    continue

                # 添加到 ChromaDB
                self.collection.add(
                    ids=[doc.id],
                    embeddings=[embedding],
                    documents=[doc.content],
                    metadatas=[{
                        "title": doc.title,
                        "category": doc.category,
                        **(doc.metadata or {})
                    }]
                )
                added_count += 1

            except Exception as e:
                print(f"添加文档失败 {doc.id}: {str(e)}")
                failed_count += 1

        return {
            "status": "success",
            "added": added_count,
            "failed": failed_count,
            "total": len(documents)
        }

    def index_knowledge_base(self, source_file: Optional[Path] = None) -> Dict[str, Any]:
        """
        索引知识库文件

        Args:
            source_file: 知识库文件路径（JSON 格式）

        Returns:
            索引结果
        """
        if source_file is None:
            source_file = Path(__file__).parent.parent / "data" / "rag" / "warehouse_knowledge.json"

        if not source_file.exists():
            return {
                "status": "error",
                "message": f"知识库文件不存在: {source_file}"
            }

        # 读取知识库
        try:
            with open(source_file, "r", encoding="utf-8") as f:
                raw_data = json.load(f)
        except Exception as e:
            return {
                "status": "error",
                "message": f"读取知识库失败: {str(e)}"
            }

        # 转换为 Document 对象
        documents = []
        for item in raw_data:
            doc = Document(
                id=item.get("id", hashlib.md5(item["content"].encode()).hexdigest()),
                title=item.get("title", ""),
                content=item.get("content", ""),
                category=item.get("category", "general"),
                metadata=item.get("metadata", {})
            )
            documents.append(doc)

        # 添加到向量数据库
        result = self.add_documents(documents)
        result["source"] = str(source_file)
        return result

    def query(
        self,
        question: str,
        top_k: int = 3,
        use_llm: bool = True
    ) -> Dict[str, Any]:
        """
        查询知识库并生成回答

        Args:
            question: 用户问题
            top_k: 返回最相关的 K 个文档
            use_llm: 是否使用 LLM 生成增强回答

        Returns:
            回答结果
        """
        if not self.collection or not self.openai_client:
            return self._fallback_query(question)

        try:
            # 1. 生成问题向量
            question_embedding = self._get_embedding(question)
            if not question_embedding:
                return self._fallback_query(question)

            # 2. 检索相关文档
            results = self.collection.query(
                query_embeddings=[question_embedding],
                n_results=min(top_k, 10)
            )

            if not results["documents"] or not results["documents"][0]:
                return {
                    "answer": "抱歉，没有找到相关信息。请尝试换一种表述方式。",
                    "sources": [],
                    "confidence": 0.0
                }

            # 3. 构建上下文
            context_parts = []
            sources = []

            for i, (doc, metadata, distance) in enumerate(zip(
                results["documents"][0],
                results["metadatas"][0],
                results["distances"][0] if results["distances"] else [0] * len(results["documents"][0])
            )):
                context_parts.append(f"{metadata.get('title', '未命名')}：\n{doc}")
                sources.append({
                    "title": metadata.get("title", "未命名"),
                    "category": metadata.get("category", "general"),
                    "content": doc[:200] + "..." if len(doc) > 200 else doc,
                    "score": float(1 - distance) if distance else 0.0  # 转换距离为相似度分数
                })

            context = "\n\n".join(context_parts)

            # 4. 生成回答
            if use_llm:
                answer = self._generate_llm_answer(question, context)
                confidence = min(sources[0]["score"] if sources else 0.0, 1.0)
            else:
                answer = f"基于知识库检索结果：\n\n{context}"
                confidence = min(sources[0]["score"] if sources else 0.0, 1.0)

            return {
                "answer": answer,
                "sources": sources,
                "confidence": confidence
            }

        except Exception as e:
            print(f"RAG 查询失败: {str(e)}")
            return self._fallback_query(question)

    def _generate_llm_answer(self, question: str, context: str) -> str:
        """
        使用 LLM 生成增强回答

        Args:
            question: 用户问题
            context: 检索到的上下文

        Returns:
            生成的回答
        """
        if not self.openai_client:
            return context

        prompt = f"""你是一个专业的仓库管理助手。基于以下知识库内容回答用户问题。

知识库内容：
{context}

用户问题：{question}

请提供详细、准确、实用的回答。如果知识库中没有完全匹配的信息，请基于相关内容给出建议。
"""

        try:
            response = self.openai_client.chat.completions.create(
                model=getattr(settings, "AI_MODEL", "gpt-3.5-turbo"),
                messages=[
                    {
                        "role": "system",
                        "content": "你是一个专业的仓库管理和供应链专家，擅长提供实用的建议和解决方案。"
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_tokens=500
            )

            return response.choices[0].message.content or "无法生成回答"

        except Exception as e:
            print(f"LLM 生成回答失败: {str(e)}")
            return f"基于知识库检索结果：\n\n{context}"

    def _fallback_query(self, question: str) -> Dict[str, Any]:
        """
        降级查询（关键词匹配）

        当向量检索不可用时使用
        """
        return {
            "answer": "RAG 服务当前不可用，请确保已配置 OpenAI API Key 并安装 ChromaDB。",
            "sources": [],
            "confidence": 0.0,
            "fallback": True
        }

    def get_statistics(self) -> Dict[str, Any]:
        """获取 RAG 服务统计信息"""
        if not self.collection:
            return {
                "status": "unavailable",
                "reason": "ChromaDB 未初始化"
            }

        return {
            "status": "active",
            "document_count": self.collection.count(),
            "collection_name": self.collection.name,
            "openai_enabled": self.openai_client is not None,
            "embedding_model": "text-embedding-3-small"
        }


# 创建全局实例
try:
    enhanced_rag_service = EnhancedRAGService()
except Exception as e:
    print(f"初始化增强 RAG 服务失败: {str(e)}")
    enhanced_rag_service = None
