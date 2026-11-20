from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext

from database import (
    create_user,
    get_user_by_email,
    save_login_history
)

router = APIRouter()

# Password hashing
pwd_context = CryptContext(
    schemes=["pbkdf2_sha256"],
    deprecated="auto"
)


# Registration data
class RegisterData(BaseModel):
    full_name: str
    email: EmailStr
    password: str


# Login data
class LoginData(BaseModel):
    email: EmailStr
    password: str


# Register a new account
@router.post("/register")
def register(data: RegisterData):

    if len(data.password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must contain at least 8 characters"
        )

    password_hash = pwd_context.hash(data.password)

    success = create_user(
        data.full_name,
        str(data.email).lower(),
        password_hash
    )

    if not success:
        raise HTTPException(
            status_code=409,
            detail="Email is already registered"
        )

    return {"message": "Account created successfully"}


# Login to an existing account
@router.post("/login")
def login(data: LoginData):

    email = str(data.email).lower()

    user = get_user_by_email(email)

    # Check login credentials
    if not user or not pwd_context.verify(
        data.password, user["password_hash"]
    ):

        save_login_history(email, "Failed")

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    # Save successful login
    save_login_history(email, "Success")

    return {
        "message": "Login successful",
        "user": {
            "id": user["id"],
            "full_name": user["full_name"],
            "email": user["email"]
        }
    }