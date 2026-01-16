from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

engine = create_engine("mysql+mysqlconnector://u580641237_doc:Mito010894!!@193.203.175.123/u580641237_doc", pool_pre_ping=True)  # pool_pre_ping evita conexões inativas

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        print(f"Erro na dependência: {e}")
        raise  # Isso permite que FastAPI detecte o erro corretamente
    finally:
        db.close()
