import requests

def upload_file_to_api(file) -> str:
    files = {
        "file": (file.filename, file.file, file.content_type)
    }

    response = requests.post("https://Salexpress.com/imagesmarketplace/upload.php", files=files)

    if response.status_code != 201:
        raise Exception(f"Erro ao fazer upload: {response.status_code}, {response.text}")

    return response.json()["url"]