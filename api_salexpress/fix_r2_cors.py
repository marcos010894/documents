from app.utils.cloudflare_r2 import _client, R2_BUCKET
from botocore.exceptions import ClientError
import sys

def configure_cors():
    print(f"Configurando CORS para o bucket: {R2_BUCKET}...")
    s3 = _client()
    
    cors_configuration = {
        'CORSRules': [{
            'AllowedHeaders': ['*'],
            'AllowedMethods': ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
            'AllowedOrigins': ['*'],  # Em produção, restritir para o domínio do frontend
            'ExposeHeaders': ['ETag'],
            'MaxAgeSeconds': 3600
        }]
    }

    try:
        s3.put_bucket_cors(Bucket=R2_BUCKET, CORSConfiguration=cors_configuration)
        print("✅ Configuração CORS aplicada com sucesso!")
        
        # Verificar
        try:
            current = s3.get_bucket_cors(Bucket=R2_BUCKET)
            print("Configuração atual:", current)
        except:
            print("Não foi possível ler a configuração de volta (pode levar alguns instantes para propagar).")
            
    except ClientError as e:
        print(f"❌ Erro ao configurar CORS: {e}")
        sys.exit(1)

if __name__ == "__main__":
    configure_cors()
