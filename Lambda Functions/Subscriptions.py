import boto3
import json
import datetime
from boto3.dynamodb.conditions import Key

def lambda_handler(event, context):
    print(" Incoming event:", json.dumps(event, default=str))


    try:
        if isinstance(event.get("body"), str):
            body = json.loads(event["body"])
        elif isinstance(event.get("body"), dict):
            body = event["body"]
        else:
            body = event
    except Exception as e:
        print("Failed to parse body:", str(e))
        body = event

    print(" Parsed body:", json.dumps(body))

    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "*"
    }

    action = body.get("action") or body.get("type")
    user_email = body.get("user_email")
    song_title = body.get("song_title")
    artist = body.get("artist")
    album = body.get("album")
    image_url = body.get("image_url")
    song_key = f"{song_title}#{artist}" if song_title and artist else None

    dynamodb = boto3.resource("dynamodb")
    table = dynamodb.Table("subscriptions")

    if action == "subscribe":
        if not (user_email and song_title and artist):
            return _error("Missing user_email, song_title, or artist", headers)

        try:
            table.put_item(Item={
                "user_email": user_email,
                "song_title": song_title,
                "artist": artist,
                "album": album if album else "",
                "image_url": image_url if image_url else "",
                "song_key": song_key
            })

            return _success("Subscribed successfully", headers)



        except Exception as e:
            return _error(str(e), headers)


    elif action == "unsubscribe":
        if not (user_email and song_title):
            return _error("Missing user_email or song_title", headers)

        try:
            table.delete_item(Key={"user_email": user_email, "song_title": song_title})
            return _success("Unsubscribed successfully", headers)

        except Exception as e:
            return _error(str(e), headers)


    elif action == "get_subscriptions":
        if not user_email:
            return _error("Missing user_email", headers)

        try:
            response = table.query(
                KeyConditionExpression=Key("user_email").eq(user_email)
            )
            return _data({"subscriptions": response.get("Items", [])}, headers)

        except Exception as e:
            return _error(str(e), headers)


    elif action == "get_subscribers":
        if not song_key:
            return _error("Missing song_title or artist", headers)

        try:
            response = table.query(
                IndexName="SongKeyIndex",
                KeyConditionExpression=Key("song_key").eq(song_key)
            )
            return _data({"subscribers": response.get("Items", [])}, headers)

        except Exception as e:
            return _error(str(e), headers)


    else:
        return _error("Invalid action", headers)


def _success(message, headers):
    return {
        "statusCode": 200,
        "headers": headers,
        "body": json.dumps({"status": "success", "message": message})
    }

def _data(payload, headers):
    return {
        "statusCode": 200,
        "headers": headers,
        "body": json.dumps({"status": "success", **payload})
    }

def _error(message, headers=None):
    return {
        "statusCode": 400,
        "headers": headers or {},
        "body": json.dumps({"status": "error", "message": message})
    }
