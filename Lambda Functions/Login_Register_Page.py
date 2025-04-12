import boto3
import json
from boto3.dynamodb.conditions import Key

def lambda_handler(event, context):
    print("Incoming event:", json.dumps(event))

    
    try:
        if isinstance(event.get('body'), str):
            body = json.loads(event['body'])  
        elif isinstance(event.get('body'), dict):
            body = event['body']
        else:
            body = event 
    except Exception as e:
        print("Error parsing body:", str(e))
        body = event

    print("Parsed body:", json.dumps(body))

    
    action = body.get('action')
    email = body.get('email')
    password = body.get('password')
    user_name = body.get('user_name')

   
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('login')  

    headers = {
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': '*'
    }

    ###  Validate required action
    if not action:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({"status": "error", "message": "Missing or invalid 'action'"})
        }

    ###  LOGIN
    if action == "login":
        if not email or not password:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({"status": "error", "message": "Missing email or password"})
            }

        try:
            response = table.get_item(Key={'email': email})
            user = response.get('Item')

            if not user or user.get('password') != password:
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({"status": "error", "message": "Invalid credentials"})
                }

            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    "status": "success",
                    "user_name": user.get('user_name'),
                    "email": user.get('email')
                })
            }

        except Exception as e:
            return {
                'statusCode': 500,
                'headers': headers,
                'body': json.dumps({"status": "error", "message": str(e)})
            }

    ###  REGISTER
    elif action == "register":
        if not email or not user_name or not password:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({"status": "error", "message": "Missing required fields"})
            }

        try:
            
            existing = table.get_item(Key={'email': email})
            if 'Item' in existing:
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({"status": "error", "message": "User already exists"})
                }

            #  Insert new user
            table.put_item(Item={
                'email': email,
                'user_name': user_name,
                'password': password
            })

            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({"status": "success", "message": "User registered"})
            }

        except Exception as e:
            return {
                'statusCode': 500,
                'headers': headers,
                'body': json.dumps({"status": "error", "message": str(e)})
            }

    ###  GET PROFILE
    elif action == "get_profile":
        if not email:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({"status": "error", "message": "Email is required"})
            }

        try:
            response = table.get_item(Key={'email': email})
            user = response.get('Item')

            if not user:
                return {
                    'statusCode': 404,
                    'headers': headers,
                    'body': json.dumps({"status": "error", "message": "User not found"})
                }

            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    "status": "success",
                    "email": user.get('email'),
                    "user_name": user.get('user_name')
                })
            }

        except Exception as e:
            return {
                'statusCode': 500,
                'headers': headers,
                'body': json.dumps({"status": "error", "message": str(e)})
            }

    ### UserNameIndex
    elif action == "find_by_username":
        if not user_name:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({"status": "error", "message": "Username is required"})
            }

        try:
            response = table.query(
                IndexName='UserNameIndex',
                KeyConditionExpression=Key('user_name').eq(user_name)
            )

            items = response.get('Items', [])
            if not items:
                return {
                    'statusCode': 404,
                    'headers': headers,
                    'body': json.dumps({"status": "error", "message": "User not found"})
                }

            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    "status": "success",
                    "user": items[0]  
                })
            }

        except Exception as e:
            return {
                'statusCode': 500,
                'headers': headers,
                'body': json.dumps({"status": "error", "message": str(e)})
            }


    else:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({"status": "error", "message": "Invalid action"})
        }
