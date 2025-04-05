import boto3
from flask import Blueprint, render_template, request, redirect, url_for, session, flash

# AWS Configuration
AWS_REGION = "us-east-1"
DYNAMODB_TABLE = "UserLogins"

# Initialize AWS DynamoDB resource and table
dynamodb = boto3.resource("dynamodb", region_name=AWS_REGION)
login_table = dynamodb.Table(DYNAMODB_TABLE)

# Define Blueprint for login-related routes
login_bp = Blueprint('login', __name__)

@login_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')

        try:
            # Attempt to get user record by email
            response = login_table.get_item(Key={'email': email})
            user = response.get('Item')
        except Exception as e:
            flash("There was an error connecting to the login system.", "error")
            return render_template("login.html")

        if not user or user.get('password') != password:
            flash("Email or password is invalid.", "error")
            return render_template("login.html")

        # Set session values
        session['user_email'] = user.get('email')
        session['user_name'] = user.get('username')
        return redirect(url_for('main.home'))

    # GET request - show login page
    return render_template("login.html")

@login_bp.route('/logout')
def logout():
    # Clear session
    session.pop('user_email', None)
    session.pop('user_name', None)
    flash("You have been logged out.", "info")
    return redirect(url_for('login.login'))
