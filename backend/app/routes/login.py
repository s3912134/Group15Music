import boto3
from flask import Blueprint, render_template, request, redirect, url_for, session, flash

# AWS Configuration
AWS_REGION = "us-east-1"
DYNAMODB_TABLE = "UserLogins"

# Initialize AWS Clients
dynamodb = boto3.resource("dynamodb", region_name=AWS_REGION)
login_table = dynamodb.Table(DYNAMODB_TABLE)

# Define Blueprint
login_bp = Blueprint('login', __name__)

@login_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']

        # Query DynamoDB for user credentials
        response = login_table.get_item(Key={"email": email})
        user = response.get("Item")

        if not user or user.get("password") != password:
            flash("Email or password is invalid", "error")
            return render_template("login.html")

        # Store user in session
        session['user_email'] = email
        session['user_name'] = user.get("username")
        return redirect(url_for('main.home'))

    return render_template("login.html")

@login_bp.route('/logout')
def logout():
    session.pop('user_email', None)
    session.pop('user_name', None)
    return redirect(url_for('login.login'))
