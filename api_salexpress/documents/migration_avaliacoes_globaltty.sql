-- Migration: Criar tabela de avaliações da Salexpress
-- Data: 2025-11-19

-- 1. Criar nova tabela avaliacoes_Salexpress
CREATE TABLE IF NOT EXISTS avaliacoes_Salexpress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    avaliacao_id INT NOT NULL,
    nome_avaliador VARCHAR(200) NOT NULL,
    email_avaliador VARCHAR(200) NULL,
    nota_busca_fornecedor FLOAT NOT NULL COMMENT 'Como você avalia a experiência de buscar um fornecedor pela plataforma Salexpress?',
    comentario_experiencia TEXT NULL COMMENT 'Comentário sobre a experiência na plataforma',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ip_avaliador VARCHAR(45) NULL,
    
    INDEX ix_avaliacoes_Salexpress_avaliacao_id (avaliacao_id),
    FOREIGN KEY (avaliacao_id) REFERENCES avaliacoes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Remover colunas antigas da tabela avaliacoes (se existirem)
ALTER TABLE avaliacoes 
DROP COLUMN IF EXISTS nota_Salexpress,
DROP COLUMN IF EXISTS comentario_Salexpress;

-- Verificar estrutura
DESCRIBE avaliacoes_Salexpress;
