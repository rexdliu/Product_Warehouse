"""
对象存储抽象层

该模块提供统一的存储接口，支持多种存储后端：
1. LocalStorageBackend - 本地文件系统存储（开发/测试）
2. MinIOStorageBackend - MinIO 对象存储（生产推荐）
3. OSSStorageBackend - 阿里云 OSS（可选）
4. S3StorageBackend - AWS S3（可选）
"""

from abc import ABC, abstractmethod
from typing import BinaryIO, Optional
from pathlib import Path
import uuid
import io


class StorageBackend(ABC):
    """存储后端抽象接口"""

    @abstractmethod
    async def upload(
        self,
        file: BinaryIO,
        filename: str,
        content_type: str,
        folder: str = ""
    ) -> str:
        """
        上传文件

        Args:
            file: 文件对象
            filename: 文件名
            content_type: MIME类型
            folder: 文件夹路径（如 "avatars", "products"）

        Returns:
            文件的访问URL
        """
        pass

    @abstractmethod
    async def delete(self, file_url: str) -> bool:
        """删除文件"""
        pass

    @abstractmethod
    async def exists(self, file_url: str) -> bool:
        """检查文件是否存在"""
        pass


class LocalStorageBackend(StorageBackend):
    """本地文件系统存储（当前实现）"""

    def __init__(self, base_path: Path, base_url: str = "/static"):
        self.base_path = base_path
        self.base_url = base_url

    async def upload(
        self,
        file: BinaryIO,
        filename: str,
        content_type: str,
        folder: str = ""
    ) -> str:
        # 确保目录存在
        upload_dir = self.base_path / folder
        upload_dir.mkdir(parents=True, exist_ok=True)

        # 保存文件
        file_path = upload_dir / filename
        with open(file_path, "wb") as f:
            content = file.read()
            file.seek(0)  # 重置文件指针
            f.write(content)

        # 返回URL
        return f"{self.base_url}/{folder}/{filename}"

    async def delete(self, file_url: str) -> bool:
        if not file_url.startswith(self.base_url):
            return False

        # 提取文件路径
        relative_path = file_url[len(self.base_url):].lstrip("/")
        file_path = self.base_path / relative_path

        if file_path.exists():
            file_path.unlink()
            return True
        return False

    async def exists(self, file_url: str) -> bool:
        if not file_url.startswith(self.base_url):
            return False

        relative_path = file_url[len(self.base_url):].lstrip("/")
        file_path = self.base_path / relative_path
        return file_path.exists()


class MinIOStorageBackend(StorageBackend):
    """MinIO 对象存储后端"""

    def __init__(
        self,
        endpoint: str,
        access_key: str,
        secret_key: str,
        bucket_name: str,
        secure: bool = False,
        public_url: Optional[str] = None
    ):
        """
        初始化 MinIO 客户端

        Args:
            endpoint: MinIO 服务地址（如 "localhost:9000"）
            access_key: 访问密钥
            secret_key: 密钥
            bucket_name: 存储桶名称
            secure: 是否使用 HTTPS
            public_url: 公开访问URL（如配置了反向代理）
        """
        from minio import Minio

        self.client = Minio(
            endpoint=endpoint,
            access_key=access_key,
            secret_key=secret_key,
            secure=secure
        )
        self.bucket_name = bucket_name
        self.public_url = public_url or f"{'https' if secure else 'http'}://{endpoint}"

        # 确保bucket存在
        self._ensure_bucket_exists()

    def _ensure_bucket_exists(self):
        """确保存储桶存在，不存在则创建"""
        try:
            if not self.client.bucket_exists(self.bucket_name):
                self.client.make_bucket(self.bucket_name)
                # 设置bucket为公开读取
                from minio.commonconfig import ENABLED
                from minio.versioningconfig import VersioningConfig

                # 设置公开访问策略
                policy = {
                    "Version": "2012-10-17",
                    "Statement": [
                        {
                            "Effect": "Allow",
                            "Principal": {"AWS": "*"},
                            "Action": ["s3:GetObject"],
                            "Resource": [f"arn:aws:s3:::{self.bucket_name}/*"]
                        }
                    ]
                }
                import json
                self.client.set_bucket_policy(self.bucket_name, json.dumps(policy))
        except Exception as e:
            print(f"警告: 创建或配置bucket失败: {str(e)}")

    async def upload(
        self,
        file: BinaryIO,
        filename: str,
        content_type: str,
        folder: str = ""
    ) -> str:
        """上传文件到 MinIO"""
        # 构建对象键（路径）
        object_key = f"{folder}/{filename}" if folder else filename

        # 读取文件内容
        file_data = file.read()
        file.seek(0)  # 重置文件指针
        file_size = len(file_data)

        # 上传到 MinIO
        self.client.put_object(
            bucket_name=self.bucket_name,
            object_name=object_key,
            data=io.BytesIO(file_data),
            length=file_size,
            content_type=content_type
        )

        # 返回公开访问URL
        return f"{self.public_url}/{self.bucket_name}/{object_key}"

    async def delete(self, file_url: str) -> bool:
        """从 MinIO 删除文件"""
        try:
            # 从URL提取对象键
            # URL格式: http://localhost:9000/bucket-name/folder/filename
            if self.bucket_name not in file_url:
                return False

            object_key = file_url.split(f"{self.bucket_name}/", 1)[1]
            self.client.remove_object(self.bucket_name, object_key)
            return True
        except Exception as e:
            print(f"删除MinIO对象失败: {str(e)}")
            return False

    async def exists(self, file_url: str) -> bool:
        """检查文件是否存在于 MinIO"""
        try:
            if self.bucket_name not in file_url:
                return False

            object_key = file_url.split(f"{self.bucket_name}/", 1)[1]
            self.client.stat_object(self.bucket_name, object_key)
            return True
        except Exception:
            return False


class OSSStorageBackend(StorageBackend):
    """阿里云 OSS 存储后端（可选）"""

    def __init__(
        self,
        access_key_id: str,
        access_key_secret: str,
        endpoint: str,
        bucket_name: str,
        cdn_domain: Optional[str] = None
    ):
        """
        初始化阿里云OSS客户端

        Args:
            access_key_id: 阿里云访问密钥ID
            access_key_secret: 阿里云访问密钥
            endpoint: OSS节点（如 "oss-cn-hangzhou.aliyuncs.com"）
            bucket_name: 存储桶名称
            cdn_domain: CDN加速域名（可选）
        """
        import oss2
        self.auth = oss2.Auth(access_key_id, access_key_secret)
        self.bucket = oss2.Bucket(self.auth, endpoint, bucket_name)
        self.cdn_domain = cdn_domain or f"https://{bucket_name}.{endpoint}"

    async def upload(
        self,
        file: BinaryIO,
        filename: str,
        content_type: str,
        folder: str = ""
    ) -> str:
        object_key = f"{folder}/{filename}" if folder else filename
        file_data = file.read()
        file.seek(0)

        self.bucket.put_object(
            object_key,
            file_data,
            headers={"Content-Type": content_type}
        )

        return f"{self.cdn_domain}/{object_key}"

    async def delete(self, file_url: str) -> bool:
        try:
            object_key = file_url.split(self.cdn_domain + "/", 1)[1]
            self.bucket.delete_object(object_key)
            return True
        except Exception:
            return False

    async def exists(self, file_url: str) -> bool:
        try:
            object_key = file_url.split(self.cdn_domain + "/", 1)[1]
            return self.bucket.object_exists(object_key)
        except Exception:
            return False


# 全局存储实例（将在 main.py 中初始化）
storage_backend: Optional[StorageBackend] = None


def get_storage() -> StorageBackend:
    """获取当前配置的存储后端"""
    if storage_backend is None:
        raise RuntimeError("存储后端未初始化，请在应用启动时调用 init_storage()")
    return storage_backend


def init_storage(backend: StorageBackend):
    """初始化存储后端（在应用启动时调用）"""
    global storage_backend
    storage_backend = backend
