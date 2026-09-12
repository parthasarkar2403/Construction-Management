import os
from dotenv import load_dotenv

# Load variables from the .env file into the environment
load_dotenv()


class Config:
    # Where the database lives. On Render this comes from an environment
    # variable. Locally, it falls back to a default Postgres URL.
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL",
        "postgresql://postgres:postgres@localhost:5432/construction_erp",
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Secret key used later for the admin login (Step 8+)
    ADMIN_KEY = os.environ.get("ADMIN_KEY", "changeme")
