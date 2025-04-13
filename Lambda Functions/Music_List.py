import boto3
import json
from boto3.dynamodb.conditions import Key, Attr

def lambda_handler(event, context):
    print("Incoming event:", json.dumps(event, default=str))

    try:
        if isinstance(event.get('body'), str):
            body = json.loads(event['body'])
        elif isinstance(event.get('body'), dict):
            body = event['body']
        else:
            body = event
    except Exception as e:
        print("Failed to parse body:", str(e))
        body = event

    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "*"
    }

    action = body.get("action") or body.get("type")
    title = body.get("title")
    artist = body.get("artist")
    album = body.get("album")
    year = body.get("year")
    image_url = body.get("image_url")

    dynamodb = boto3.resource("dynamodb")
    table = dynamodb.Table("music")

    ###  Query Music (all or filtered with SCAN)
    if action == "query_music" or action == "getAll":
        try:
            filter_expression = []
            expression_values = {}
            expression_names = {}

            if title:
                filter_expression.append("#t = :t")
                expression_names["#t"] = "title"
                expression_values[":t"] = title

            if artist:
                filter_expression.append("#a = :a")
                expression_names["#a"] = "artist"
                expression_values[":a"] = artist

            if album:
                filter_expression.append("#alb = :alb")
                expression_names["#alb"] = "album"
                expression_values[":alb"] = album

            if year:
                filter_expression.append("#y = :y")
                expression_names["#y"] = "year"
                expression_values[":y"] = int(year)

            if filter_expression:
                response = table.scan(
                    FilterExpression=" AND ".join(filter_expression),
                    ExpressionAttributeNames=expression_names,
                    ExpressionAttributeValues=expression_values
                )
            else:
                response = table.scan()

            return {
                "statusCode": 200,
                "headers": headers,
                "body": json.dumps({"status": "success", "items": response.get("Items", [])}, default=str)
            }

        except Exception as e:
            return {
                "statusCode": 500,
                "headers": headers,
                "body": json.dumps({"status": "error", "message": str(e)}, default=str)
            }

    ### Query Music by Album (GSI)
    elif action == "query_by_album":
        if not album:
            return {
                "statusCode": 400,
                "headers": headers,
                "body": json.dumps({"status": "error", "message": "Missing album name"})
            }

        try:
            response = table.query(
                IndexName="AlbumIndex",
                KeyConditionExpression=Key("album").eq(album)
            )

            return {
                "statusCode": 200,
                "headers": headers,
                "body": json.dumps({"status": "success", "items": response.get("Items", [])}, default=str)
            }

        except Exception as e:
            return {
                "statusCode": 500,
                "headers": headers,
                "body": json.dumps({"status": "error", "message": str(e)}, default=str)
            }

    ###  Get One Music Item
    elif action == "get_music":
        if not title or not artist:
            return {
                "statusCode": 400,
                "headers": headers,
                "body": json.dumps({"status": "error", "message": "Missing title or artist"})
            }

        try:
            response = table.get_item(Key={"title": title, "artist": artist})
            item = response.get("Item")

            if item:
                return {
                    "statusCode": 200,
                    "headers": headers,
                    "body": json.dumps({"status": "success", "item": item}, default=str)
                }
            else:
                return {
                    "statusCode": 404,
                    "headers": headers,
                    "body": json.dumps({"status": "error", "message": "Music not found"})
                }

        except Exception as e:
            return {
                "statusCode": 500,
                "headers": headers,
                "body": json.dumps({"status": "error", "message": str(e)}, default=str)
            }


    else:
        return {
            "statusCode": 400,
            "headers": headers,
            "body": json.dumps({"status": "error", "message": "Invalid action"})
        }
