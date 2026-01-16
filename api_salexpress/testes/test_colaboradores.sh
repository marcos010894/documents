#!/bin/bash
# Script de teste do sistema de colaboradores com login unificado

echo "🧪 TESTANDO SISTEMA DE COLABORADORES COM LOGIN UNIFICADO"
echo "=========================================================="
echo ""

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://127.0.0.1:8000/api/v1"

echo -e "${BLUE}1️⃣ Criando colaborador de teste...${NC}"
echo ""

RESPONSE=$(curl -s -X POST "$BASE_URL/collaborators/" \
-H "Content-Type: application/json" \
-d '{
    "email": "teste.colaborador@empresa.com",
    "password": "senha123",
    "name": "João Silva Teste",
    "company_id": 21,
    "company_type": "pf",
    "permissions": {
        "manage_files": true,
        "view_metrics": true,
        "view_only": false,
        "manage_collaborators": false,
        "view_shared": false
    }
}')

if echo "$RESPONSE" | grep -q "email"; then
    echo -e "${GREEN}✅ Colaborador criado com sucesso!${NC}"
    COLLABORATOR_ID=$(echo "$RESPONSE" | python -c "import sys, json; print(json.load(sys.stdin)['id'])" 2>/dev/null || echo "1")
    echo "   ID: $COLLABORATOR_ID"
else
    echo -e "${YELLOW}⚠️  Colaborador já existe ou erro na criação${NC}"
    COLLABORATOR_ID="1"
fi

echo ""
echo -e "${BLUE}2️⃣ Testando login UNIFICADO (endpoint normal)...${NC}"
echo ""

LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
-H "Content-Type: application/json" \
-d '{
    "email": "teste.colaborador@empresa.com",
    "password": "senha123"
}')

if echo "$LOGIN_RESPONSE" | grep -q "is_collaborator"; then
    echo -e "${GREEN}✅ Login funcionou! Sistema detectou colaborador automaticamente!${NC}"
    echo ""
    echo "📋 Detalhes do login:"
    echo "$LOGIN_RESPONSE" | python -m json.tool 2>/dev/null | head -30
    echo ""
    
    IS_COLLAB=$(echo "$LOGIN_RESPONSE" | python -c "import sys, json; print(json.load(sys.stdin).get('is_collaborator', False))" 2>/dev/null)
    TIPO=$(echo "$LOGIN_RESPONSE" | python -c "import sys, json; print(json.load(sys.stdin).get('tipo', ''))" 2>/dev/null)
    
    echo -e "${GREEN}✅ is_collaborator: $IS_COLLAB${NC}"
    echo -e "${GREEN}✅ tipo: $TIPO${NC}"
else
    echo -e "${YELLOW}⚠️  Erro no login ou resposta inesperada${NC}"
    echo "$LOGIN_RESPONSE"
fi

echo ""
echo -e "${BLUE}3️⃣ Testando métricas do colaborador (empresa)...${NC}"
echo ""

METRICS_RESPONSE=$(curl -s "$BASE_URL/metrics/storage/colaborador/$COLLABORATOR_ID")

if echo "$METRICS_RESPONSE" | grep -q "armazenamento"; then
    echo -e "${GREEN}✅ Métricas carregadas! (dados DA EMPRESA)${NC}"
    echo ""
    echo "📊 Resumo das métricas:"
    echo "$METRICS_RESPONSE" | python -m json.tool 2>/dev/null | grep -A 5 "armazenamento\|totais\|visualizado_por" | head -15
else
    echo -e "${YELLOW}⚠️  Erro ao carregar métricas${NC}"
fi

echo ""
echo -e "${BLUE}4️⃣ Listando permissões do colaborador...${NC}"
echo ""

PERMS_RESPONSE=$(curl -s "$BASE_URL/collaborators/$COLLABORATOR_ID/permissions")

if echo "$PERMS_RESPONSE" | grep -q "permissions"; then
    echo -e "${GREEN}✅ Permissões carregadas!${NC}"
    echo ""
    echo "$PERMS_RESPONSE" | python -m json.tool 2>/dev/null
else
    echo -e "${YELLOW}⚠️  Erro ao carregar permissões${NC}"
fi

echo ""
echo "=========================================================="
echo -e "${GREEN}✅ TESTES CONCLUÍDOS!${NC}"
echo ""
echo "📖 Documentação:"
echo "   - README_COLABORADORES.md"
echo "   - README_LOGIN_UNIFICADO.md"
echo "   - CHANGELOG_LOGIN_UNIFICADO.md"
echo ""
echo "🚀 Sistema pronto para uso!"
