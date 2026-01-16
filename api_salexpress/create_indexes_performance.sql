-- =====================================================
-- SCRIPT DE OTIMIZAÇÃO DE PERFORMANCE - Salexpress API
-- Execute este script no PostgreSQL (Neon)
-- =====================================================

-- Índices para tabela storage_nodes
-- ---------------------------------

-- Índice para buscar por business_id (quem criou o arquivo)
CREATE INDEX IF NOT EXISTS idx_storage_nodes_business_id 
ON storage_nodes(business_id);

-- Índice para buscar por parent_id (arquivos dentro de uma pasta)
CREATE INDEX IF NOT EXISTS idx_storage_nodes_parent_id 
ON storage_nodes(parent_id);

-- Índice para buscar por type_user
CREATE INDEX IF NOT EXISTS idx_storage_nodes_type_user 
ON storage_nodes(type_user);

-- Índice para buscar por status
CREATE INDEX IF NOT EXISTS idx_storage_nodes_status 
ON storage_nodes(status);

-- Índice para buscar por type (file/folder)
CREATE INDEX IF NOT EXISTS idx_storage_nodes_type 
ON storage_nodes(type);

-- Índice composto para queries mais comuns (business_id + type_user + deleted_at)
CREATE INDEX IF NOT EXISTS idx_storage_nodes_owner_active 
ON storage_nodes(business_id, type_user, deleted_at);

-- Índice composto para listar filhos de uma pasta
CREATE INDEX IF NOT EXISTS idx_storage_nodes_parent_deleted 
ON storage_nodes(parent_id, deleted_at);

-- Índice para soft delete (lixeira)
-- já existe: deleted_at tem index=True no model


-- Índices para tabela shares
-- --------------------------

-- Índice para buscar por node_id
CREATE INDEX IF NOT EXISTS idx_shares_node_id 
ON shares(node_id);

-- Índice para buscar compartilhamentos com um usuário
CREATE INDEX IF NOT EXISTS idx_shares_shared_with_user 
ON shares(shared_with_user_id);

-- Índice composto para buscar compartilhamentos com usuário + tipo
CREATE INDEX IF NOT EXISTS idx_shares_shared_with_type 
ON shares(shared_with_user_id, type_user_receiver);

-- Índice composto para verificar duplicatas
CREATE INDEX IF NOT EXISTS idx_shares_unique_check 
ON shares(node_id, shared_with_user_id, shared_by_user_id);


-- =====================================================
-- VERIFICAR ÍNDICES CRIADOS
-- =====================================================
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('storage_nodes', 'shares')
ORDER BY tablename, indexname;
