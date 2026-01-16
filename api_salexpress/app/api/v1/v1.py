from fastapi import APIRouter
from app.api.endpoints import user, chatbot, reports, email, auth, suppliers, inidication, metrics, keywords, photos, subscription, images, contactsSolicitations, busnessSite, storage, storage_nodes, share, status, user_business_link, permission, avaliacao, password_reset, document_notification, storage_quota, collaborators, auth_collab


router = APIRouter()


# Incluindo rotas específicas
router.include_router(user.router, prefix="/users", tags=["users"])
router.include_router(chatbot.router, prefix="/chatBot", tags=["ChatBot"])
router.include_router(reports.router, prefix="/Relatorios", tags=["reports"])
router.include_router(email.router, prefix="/Emails", tags=["emails"])
router.include_router(auth.router, prefix="/auth", tags=["Autenticação"])
router.include_router(suppliers.router, prefix="/Fornecedores", tags=["Fornecedores"])
router.include_router(inidication.router, prefix="/indicacao", tags=["Indicações"])
router.include_router(metrics.router, prefix="/metrics", tags=["Metricas"])
router.include_router(keywords.router, prefix="/keywords", tags=["Palavras Chave"])
router.include_router(photos.router, prefix="/Photos", tags=["Fotos marketPlace"])
router.include_router(subscription.router, prefix="/subscription", tags=["Assinaturas"])
router.include_router(images.router, prefix="/Imagens", tags=["Imagens"])
router.include_router(contactsSolicitations.router, prefix="/contactsSolicitations", tags=["Solicitações de contato"])
router.include_router(busnessSite.router, prefix="/busnessSite", tags=["Informações dos sites por empresa"])
router.include_router(storage.router, prefix="/storage", tags=["Storage R2"])
router.include_router(storage_nodes.router, prefix="/nodes", tags=["Storage Nodes"])
router.include_router(share.router, prefix="/shares", tags=["Compartilhamento"])
router.include_router(status.router, prefix="/status", tags=["Status"])
router.include_router(user_business_link.router, prefix="/user-business-links", tags=["Vínculos Usuário-Empresa"])
router.include_router(permission.router, prefix="/permissions", tags=["Permissões"])
router.include_router(avaliacao.router, prefix="/avaliacoes", tags=["Avaliações"])
router.include_router(password_reset.router, prefix="/auth", tags=["Autenticação"])
router.include_router(document_notification.router, prefix="/notificacoes-documentos", tags=["Notificações de Documentos"])
router.include_router(storage_quota.router, prefix="/storage-quota", tags=["Cálculo de Armazenamento"])
router.include_router(collaborators.router, prefix="/collaborators", tags=["Colaboradores"])
router.include_router(auth_collab.router, prefix="/auth", tags=["Autenticação"]) 
