import os
from dotenv import load_dotenv

# Load variables from .env file
load_dotenv()


class Config:
    """
    Configuration class for the India Trend Radar project.
    """

    # News API
    NEWS_API_KEY = os.getenv("NEWS_API_KEY")
    # GNews API
    GNEWS_API_KEY = os.getenv("GNEWS_API_KEY")

    NEWS_RETENTION_DAYS = int(os.getenv("NEWS_RETENTION_DAYS", 30))

    @classmethod
    def validate(cls):
        """
        Validate required environment variables.
        """
        required_vars = {
            "NEWS_API_KEY": cls.NEWS_API_KEY,
            "GNEWS_API_KEY": cls.GNEWS_API_KEY,
        }

        missing = [key for key, value in required_vars.items() if not value]

        if missing:
            raise EnvironmentError(
                f"Missing environment variables: {', '.join(missing)}"
            )

        print("✅ Configuration loaded successfully!")