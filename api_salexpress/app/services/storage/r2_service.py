from typing import BinaryIO, Optional
from app.utils.cloudflare_r2 import upload_image, delete_image

# Camada de serviço para encapsular regras adicionais futuramente

def store_image(file_obj: BinaryIO, original_filename: str, folder: Optional[str] = None, content_type: Optional[str] = None):
    return upload_image(file_obj=file_obj, original_filename=original_filename, folder=folder, content_type=content_type)


def remove_image(key: str):
    return delete_image(key)

def get_presigned_upload_url(key: str, content_type: str):
    from app.utils.cloudflare_r2 import generate_presigned_upload_url
    return generate_presigned_upload_url(key, content_type)
