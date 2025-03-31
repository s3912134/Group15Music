import boto3
from botocore.exceptions import NoCredentialsError, PartialCredentialsError
from app.config import Config

class DynamoDB:
    def __init__(self):
        try:
            self.dynamodb = boto3.resource(
                'dynamodb',
                region_name=Config.AWS_REGION
            )
        except (NoCredentialsError, PartialCredentialsError) as e:
            print(f"AWS Credentials Error: {e}")
            self.dynamodb = None

    def get_table(self, table_name):
        if self.dynamodb:
            return self.dynamodb.Table(table_name)
        return None

    def put_item(self, table_name, item):
        table = self.get_table(table_name)
        if table:
            try:
                table.put_item(Item=item)
                return {"message": "Item successfully inserted."}
            except Exception as e:
                return {"error": str(e)}
        return {"error": "Table not found."}

    def get_item(self, table_name, key):
        table = self.get_table(table_name)
        if table:
            try:
                response = table.get_item(Key=key)
                return response.get("Item", None)
            except Exception as e:
                return {"error": str(e)}
        return {"error": "Table not found."}

    def query_items(self, table_name, key_condition_expression, expression_attribute_values):
        table = self.get_table(table_name)
        if table:
            try:
                response = table.query(
                    KeyConditionExpression=key_condition_expression,
                    ExpressionAttributeValues=expression_attribute_values
                )
                return response.get("Items", [])
            except Exception as e:
                return {"error": str(e)}
        return {"error": "Table not found."}

# Initialize DynamoDB instance
db = DynamoDB()
