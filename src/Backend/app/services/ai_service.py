from typing import List, Dict, Any
import openai
from app.core.config import settings

class AIService:
    def __init__(self):
        if settings.OPENAI_API_KEY:
            self.client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        else:
            self.client = None
    
    def generate_product_insights(self, product_data: Dict[str, Any]) -> str:
        """生成产品洞察"""
        if not self.client:
            return "AI服务未配置"
        
        prompt = f"""
        基于以下产品数据提供洞察：
        产品名称: {product_data.get('name', 'N/A')}
        SKU: {product_data.get('sku', 'N/A')}
        价格: {product_data.get('price', 'N/A')}
        库存数量: {product_data.get('inventory', 'N/A')}
        
        请提供:
        1. 定价建议
        2. 库存管理建议
        3. 销售策略建议
        """
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "你是一个专业的仓库管理顾问。"},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=300
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"生成洞察时出错: {str(e)}"
    
    def chat_with_user(self, messages: List[Dict[str, str]]) -> str:
        """与用户聊天"""
        if not self.client:
            return "AI服务未配置"
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages,
                max_tokens=500
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"聊天时出错: {str(e)}"

# 创建AI服务实例
ai_service = AIService()