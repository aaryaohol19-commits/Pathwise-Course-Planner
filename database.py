import sqlite3
from pathlib import Path
from datetime import datetime

# Database file location
DB_PATH = Path(__file__).parent / "pathwise.db"


# Connect to database
def get_connection():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


# Initialize database tables
def initialize_db():

    connection = get_connection()

    # Users table
    connection.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Login history table
    connection.execute("""
        CREATE TABLE IF NOT EXISTS login_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL,
            login_time TEXT NOT NULL,
            status TEXT NOT NULL
        )
    """)

    connection.commit()
    connection.close()


# Register a new user
def create_user(full_name, email, password_hash):

    connection = get_connection()

    try:
        connection.execute(
            """
            INSERT INTO users (full_name, email, password_hash)
            VALUES (?, ?, ?)
            """,
            (full_name, email, password_hash)
        )

        connection.commit()
        return True

    except sqlite3.IntegrityError:
        return False

    finally:
        connection.close()


# Find user using email
def get_user_by_email(email):

    connection = get_connection()

    user = connection.execute(
        "SELECT * FROM users WHERE email = ?",
        (email,)
    ).fetchone()

    connection.close()

    return user


# Save login attempt
def save_login_history(email, status):

    connection = get_connection()

    login_time = datetime.now().astimezone().isoformat(
        timespec="seconds"
    )

    connection.execute(
        """
        INSERT INTO login_history (email, login_time, status)
        VALUES (?, ?, ?)
        """,
        (email, login_time, status)
    )

    connection.commit()
    connection.close()


# Get login history
def get_login_history():

    connection = get_connection()

    records = connection.execute(
        """
        SELECT id, email, login_time, status
        FROM login_history
        ORDER BY id DESC
        """
    ).fetchall()

    connection.close()

    return [dict(record) for record in records]