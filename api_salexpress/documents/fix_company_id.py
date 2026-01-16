#!/usr/bin/env python3
"""
Script para corrigir company_id, company_type, business_id e type_user
Atualiza todos os campos de uma vez para valores específicos
"""

from app.core.db import engine
from sqlalchemy import text
import sys

def fix_all_fields():
    print('🔧 ATUALIZAÇÃO COMPLETA DE CAMPOS\n')
    print('='*60)
    
    # Perguntar os valores desejados
    print('\n📝 Digite os novos valores:')
    new_business_id = input('  business_id (ex: 21): ').strip()
    new_type_user = input('  type_user (ex: pf): ').strip()
    
    if not new_business_id or not new_type_user:
        print('❌ Valores inválidos!')
        return
    
    # Perguntar se quer filtrar por algo específico
    print('\n🎯 Filtrar registros? (deixe vazio para atualizar TODOS)')
    filter_business = input('  Filtrar por business_id atual (vazio = todos): ').strip()
    filter_type = input('  Filtrar por type_user atual (vazio = todos): ').strip()
    
    with engine.connect() as conn:
        # 1. Construir query de contagem
        where_clauses = []
        params = {}
        
        if filter_business:
            where_clauses.append('business_id = :filter_bid')
            params['filter_bid'] = filter_business
        
        if filter_type:
            where_clauses.append('type_user = :filter_type')
            params['filter_type'] = filter_type
        
        where_sql = ' AND '.join(where_clauses) if where_clauses else '1=1'
        
        # Contar registros
        count_sql = f'SELECT COUNT(*) FROM storage_nodes WHERE {where_sql}'
        result = conn.execute(text(count_sql), params)
        total = result.scalar()
        
        print(f'\n📊 Total de registros que serão atualizados: {total}')
        
        if total == 0:
            print('⚠️  Nenhum registro encontrado com esses filtros!')
            return
        
        # 2. Mostrar exemplos ANTES
        print('\n📋 Exemplos ANTES da atualização:')
        select_sql = f'''
            SELECT id, name, business_id, type_user, company_id, company_type
            FROM storage_nodes 
            WHERE {where_sql}
            LIMIT 5
        '''
        result = conn.execute(text(select_sql), params)
        
        for row in result:
            print(f'  ID: {row[0]}, name: {row[1][:30]}')
            print(f'      business: {row[2]}/{row[3]}, company: {row[4]}/{row[5]}')
        
        # 3. Confirmar
        print(f'\n⚠️  Vou atualizar {total} registros com os seguintes valores:')
        print(f'   business_id = {new_business_id}')
        print(f'   type_user = {new_type_user}')
        print(f'   company_id = {new_business_id}')
        print(f'   company_type = {new_type_user}')
        
        if where_clauses:
            print(f'\n📌 Filtros aplicados:')
            if filter_business:
                print(f'   - business_id atual = {filter_business}')
            if filter_type:
                print(f'   - type_user atual = {filter_type}')
        else:
            print('\n⚠️⚠️⚠️  ATENÇÃO: Vai atualizar TODOS os registros da tabela! ⚠️⚠️⚠️')
        
        resposta = input('\n❓ Confirma a atualização? (digite SIM em maiúsculas): ')
        
        if resposta != 'SIM':
            print('❌ Operação cancelada!')
            return
        
        # 4. Executar UPDATE
        print('\n⚙️  Atualizando...')
        
        update_params = {
            'new_bid': new_business_id,
            'new_type': new_type_user,
            **params
        }
        
        update_sql = f'''
            UPDATE storage_nodes 
            SET 
                business_id = :new_bid,
                type_user = :new_type,
                company_id = :new_bid,
                company_type = :new_type
            WHERE {where_sql}
        '''
        
        result = conn.execute(text(update_sql), update_params)
        conn.commit()
        
        updated = result.rowcount
        print(f'✅ {updated} registros atualizados com sucesso!')
        
        # 5. Verificar resultado
        print('\n📋 Exemplos DEPOIS da atualização:')
        result = conn.execute(text(select_sql), params)
        
        for row in result:
            print(f'  ID: {row[0]}, name: {row[1][:30]}')
            print(f'      business: {row[2]}/{row[3]}, company: {row[4]}/{row[5]}')
        
        print(f'\n✅ Todos os {updated} registros agora pertencem a:')
        print(f'   business_id/company_id = {new_business_id}')
        print(f'   type_user/company_type = {new_type_user}')

if __name__ == '__main__':
    try:
        fix_all_fields()
        print('\n' + '='*60)
        print('✅ Script concluído!')
    except Exception as e:
        print(f'\n❌ ERRO: {e}')
        import traceback
        traceback.print_exc()
