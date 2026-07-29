from sqlalchemy import create_engine, text

# Neon PostgreSQL Connection String
DATABASE_URL = "postgresql://neondb_owner:npg_VJtX25dKCIzc@ep-withered-mud-ax4d54jf-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require"

try:
    # Create connection
    engine = create_engine(DATABASE_URL)

    with engine.connect() as conn:
        # Test query
        result = conn.execute(text("SELECT version();"))

        print("=" * 50)
        print("Connected Successfully to Neon PostgreSQL")
        print("=" * 50)
        print(result.fetchone()[0])
        print("=" * 50)

except Exception as e:
    print("=" * 50)
    print(" Connection Failed!")
    print("=" * 50)
    print(e)