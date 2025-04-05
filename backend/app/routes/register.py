import boto3
from flask import Blueprint, render_template, request, redirect, url_for, flash

# AWS Configuration
AWS_REGION = "us-east-1"
DYNAMODB_TABLE = "login"  # Changed to match your memory-stored table "login"

# Initialize AWS Clients
dynamodb = boto3.resource("dynamodb", region_name=AWS_REGION)
login_table = dynamodb.Table(DYNAMODB_TABLE)

# Define Blueprint
register_bp = Blueprint('register', __name__)

@register_bp.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        email = request.form.get('email')
        username = request.form.get('username')
        password = request.form.get('password')

        if not email or not username or not password:
            flash("All fields are required.", "error")
            return render_template("register.html")

        try:
            # Check if email already exists
            response = login_table.get_item(Key={"email": email})
            if "Item" in response:
                flash("The email already exists", "error")
                return render_template("register.html")

            # Insert new user into DynamoDB
            login_table.put_item(
                Item={
                    "email": email,
                    "username": username,
                    "password": password
                }
            )

            flash("Registration successful! Please log in.", "success")
            return redirect(url_for('login.login'))  # 'login' is the Blueprint name

        except Exception as e:
            flash(f"An error occurred: {str(e)}", "error")
            return render_template("register.html")

    return render_template("register.html")
