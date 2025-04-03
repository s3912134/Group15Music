import os

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "your_secret_key")
    AWS_REGION = "us-east-1"
    DYNAMODB_TABLE = "sMusicSubscriptions"
    S3_BUCKET = "your-music-app-bucket"

    # DynamoDB Configuration
    DYNAMODB = {
        "region_name": AWS_REGION,
        "table_name": DYNAMODB_TABLE
    }

    # S3 Configuration
    S3 = {
        "bucket_name": S3_BUCKET,
        "region_name": AWS_REGION
    }
