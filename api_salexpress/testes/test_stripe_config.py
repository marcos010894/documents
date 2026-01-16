"""
Script para testar a configuração do Stripe
"""

import os
import sys
from pathlib import Path

# Adicionar o diretório raiz ao path
sys.path.append(str(Path(__file__).parent))

try:
    from app.core.config import settings
    import stripe
    
    print("🔧 Testando configurações do Stripe...")
    
    # Verificar se as chaves estão carregadas
    print(f"📋 Chave secreta configurada: {'✅ Sim' if settings.stripe_secret_key else '❌ Não'}")
    print(f"📋 Chave pública configurada: {'✅ Sim' if settings.stripe_public_key else '❌ Não'}")
    
    if settings.stripe_secret_key:
        # Configurar Stripe
        stripe.api_key = settings.stripe_secret_key
        
        # Testar conexão com API
        try:
            # Listar alguns produtos para testar a conexão
            products = stripe.Product.list(limit=1)
            print("✅ Conexão com API Stripe: OK")
            print(f"📊 Produtos encontrados: {len(products.data)}")
            
        except stripe.error.AuthenticationError as e:
            print("❌ Erro de autenticação Stripe:")
            print(f"   {str(e)}")
            print("💡 Dica: Verifique se a chave da API está válida e não expirada")
            
        except stripe.error.StripeError as e:
            print(f"❌ Erro da API Stripe: {str(e)}")
            
        except Exception as e:
            print(f"❌ Erro inesperado: {str(e)}")
    
    else:
        print("❌ Chave do Stripe não encontrada!")
        print("💡 Verifique o arquivo .env e certifique-se de que STRIPE_SECRET_KEY está definido")

except ImportError as e:
    print(f"❌ Erro de importação: {str(e)}")
    print("💡 Certifique-se de que o ambiente virtual está ativo")

except Exception as e:
    print(f"❌ Erro inesperado: {str(e)}")

print("\n📝 INSTRUÇÕES PARA CORRIGIR:")
print("1. Acesse o dashboard do Stripe: https://dashboard.stripe.com/")
print("2. Vá em 'Developers' > 'API keys'")
print("3. Gere novas chaves (se necessário)")
print("4. Atualize o arquivo .env com as novas chaves")
print("5. Reinicie o servidor")
