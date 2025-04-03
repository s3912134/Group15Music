import boto3
import json
from flask import Flask, render_template, request, redirect, url_for, session, jsonify, flash

# Initialize Flask App
group15_music = Flask(__name__)
group15_music.secret_key = "your_secret_key"

# AWS Configuration
AWS_REGION = "us-east-1"
DYNAMODB_TABLE = "sMusicSubscriptions"
USER_TABLE = "sMusicUsers"  # Separate table for user authentication
S3_BUCKET = "your-music-app-bucket"

# Initialize AWS Clients
dynamodb = boto3.resource("dynamodb", region_name=AWS_REGION)
s3_client = boto3.client("s3", region_name=AWS_REGION)
music_table = dynamodb.Table(DYNAMODB_TABLE)
user_table = dynamodb.Table(USER_TABLE)

###  User Authentication  ###
@group15_music.route('/')
def home():
    if 'user_name' not in session:
        return redirect(url_for('login'))

    return render_template("main.html", user_name=session['user_name'])

@group15_music.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        user_name = request.form['username']
        password = request.form['password']  # Add password authentication

        # Validate user credentials in DynamoDB
        response = user_table.get_item(Key={"user_name": user_name})
        user = response.get("Item")

        if not user or user.get("password") != password:
            flash("Invalid username or password", "error")
            return redirect(url_for('login'))

        session['user_name'] = user_name
        return redirect(url_for('home'))

    return render_template("login.html")

@group15_music.route('/logout')
def logout():
    session.pop('user_name', None)
    return redirect(url_for('login'))

###  Subscription Area  ###
@group15_music.route('/subscriptions')
def get_subscriptions():
    if 'user_name' not in session:
        return jsonify({"error": "User not logged in"}), 401

    user_name = session['user_name']

    try:
        response = music_table.query(
            KeyConditionExpression="user_name = :user",
            ExpressionAttributeValues={":user": user_name}
        )

        music_list = response.get("Items", [])

        # Fetch artist images from S3
        for music in music_list:
            artist = music.get("artist")
            music["artist_image_url"] = get_artist_image_url(artist)

        return jsonify(music_list)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

def get_artist_image_url(artist_name):
    try:
        s3_file_key = f"artists/{artist_name}.jpg"
        url = s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': S3_BUCKET, 'Key': s3_file_key},
            ExpiresIn=3600
        )
        return url
    except Exception as e:
        return "https://your-bucket.s3.amazonaws.com/default-placeholder.jpg"  # Default image

###  Remove Subscription  ###
@group15_music.route('/remove', methods=['POST'])
def remove_music():
    if 'user_name' not in session:
        return jsonify({"error": "User not logged in"}), 401

    user_name = session['user_name']
    data = request.get_json()

    title = data.get("title")
    if not title:
        return jsonify({"error": "Title is required"}), 400

    try:
        music_table.delete_item(Key={"user_name": user_name, "title": title})
        return jsonify({"message": "Music removed successfully!"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

###  Query Music  ###
@group15_music.route('/query', methods=['POST'])
def query_music():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid request format"}), 400

    filter_expressions = []
    expression_values = {}

    if data.get("title"):
        filter_expressions.append("#t = :title")
        expression_values[":title"] = data["title"]

    if data.get("artist"):
        filter_expressions.append("#a = :artist")
        expression_values[":artist"] = data["artist"]

    if data.get("year"):
        filter_expressions.append("#y = :year")
        expression_values[":year"] = int(data["year"])

    if data.get("album"):
        filter_expressions.append("#alb = :album")
        expression_values[":album"] = data["album"]

    if not filter_expressions:
        return jsonify({"error": "Please enter at least one query parameter."}), 400

    filter_expression = " AND ".join(filter_expressions)

    try:
        response = music_table.scan(
            FilterExpression=filter_expression,
            ExpressionAttributeValues=expression_values,
            ExpressionAttributeNames={
                "#t": "title",
                "#a": "artist",
                "#y": "year",
                "#alb": "album"
            }
        )

        results = response.get('Items', [])
        if not results:
            return jsonify({"message": "No result is retrieved. Please query again."})

        # Attach artist images
        for music in results:
            artist = music.get("artist")
            music["artist_image_url"] = get_artist_image_url(artist)

        return jsonify(results)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

###  Subscribe to Music  ###
@group15_music.route('/subscribe', methods=['POST'])
def subscribe_music():
    if 'user_name' not in session:
        return jsonify({"error": "User not logged in"}), 401

    user_name = session['user_name']
    data = request.get_json()

    required_fields = ["title", "artist", "year", "album"]
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        # Insert into DynamoDB
        music_table.put_item(
            Item={
                "user_name": user_name,
                "title": data["title"],
                "artist": data["artist"],
                "year": int(data["year"]),
                "album": data["album"]
            }
        )
        return jsonify({"message": "Music subscribed successfully!"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

###  Run the Flask App  ###
if __name__ == '__main__':
    group15_music.run(debug=True)
