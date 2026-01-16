from sqlalchemy import create_engine, inspect
from app.models.avaliacao_Salexpress import AvaliacaoSalexpress

print("🔄 Criando tabela avaliacoes_Salexpress...")

engine = create_engine('mysql+mysqlconnector://u580641237_doc:!Salexpress2024@193.203.175.123/u580641237_doc')

# Criar tabela
AvaliacaoSalexpress.__table__.create(engine, checkfirst=True)

# Verificar
inspector = inspect(engine)
if 'avaliacoes_Salexpress' in inspector.get_table_names():
    print("✅ Tabela criada com sucesso!")
    columns = inspector.get_columns('avaliacoes_Salexpress')
    for col in columns:
        print(f"  - {col['name']}: {col['type']}")
else:
    print("❌ Tabela não foi criada")
