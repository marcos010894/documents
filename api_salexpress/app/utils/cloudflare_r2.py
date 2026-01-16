from app.core.config import settings
import uuid
from typing import Optional, BinaryIO

import boto3
from botocore.exceptions import ClientError

R2_ENDPOINT = settings.r2_endpoint
R2_BUCKET = settings.r2_bucket
R2_ACCESS_KEY = settings.r2_access_key
R2_SECRET_KEY = settings.r2_secret_key


def _client():
    if not (R2_ACCESS_KEY and R2_SECRET_KEY):
        raise RuntimeError("Credenciais R2 não configuradas (R2_ACCESS_KEY / R2_SECRET_KEY)")
    return boto3.client(
        "s3",
        endpoint_url=R2_ENDPOINT,
        aws_access_key_id=R2_ACCESS_KEY,
        aws_secret_access_key=R2_SECRET_KEY,
        region_name="auto",
    )


def build_public_url(key: str) -> str:
    return f"{R2_ENDPOINT}/{R2_BUCKET}/{key}".replace("//", "/").replace("https:/", "https://")


def upload_image(file_obj: BinaryIO, original_filename: str, folder: Optional[str] = None, content_type: Optional[str] = None):
    ext = ''
    if '.' in original_filename:
        ext = '.' + original_filename.rsplit('.', 1)[1].lower()
    key = f"{uuid.uuid4().hex}{ext}"
    if folder:
        key = f"{folder.strip().strip('/')}/{key}"
    ct = content_type or 'application/octet-stream'
    client = _client()
    try:
        client.upload_fileobj(
            Fileobj=file_obj,
            Bucket=R2_BUCKET,
            Key=key,
            ExtraArgs={"ContentType": ct}
        )
        return {"success": True, "key": key, "url": build_public_url(key)}
    except ClientError as e:
        return {"success": False, "error": str(e)}


def delete_image(key: str):
    client = _client()
    try:
        client.delete_object(Bucket=R2_BUCKET, Key=key)
        return {"success": True, "deleted": key}
    except ClientError as e:
        return {"success": False, "error": str(e)}


# Função para gerar link temporário autorizado (presigned URL)
def generate_presigned_url(key: str, expires_in: int = 3600) -> Optional[str]:
    client = _client()
    try:
        url = client.generate_presigned_url(
            'get_object',
            Params={'Bucket': R2_BUCKET, 'Key': key},
            ExpiresIn=expires_in
        )
        return url
    except ClientError:
        return None

def generate_presigned_upload_url(key: str, content_type: str, expires_in: int = 3600) -> Optional[str]:
    client = _client()
    try:
        url = client.generate_presigned_url(
            'put_object',
            Params={'Bucket': R2_BUCKET, 'Key': key, 'ContentType': content_type},
            ExpiresIn=expires_in
        )
        return url
    except ClientError:
        return None

