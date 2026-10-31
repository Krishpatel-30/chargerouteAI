import secrets
from datetime import datetime, timezone, timedelta
from typing import Optional
import logging
from urllib.parse import urlparse
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import jwt

from app.core.database import get_db
from app.core.config import settings
from app.core.security import create_access_token, verify_password, get_password_hash
from app.models.user import User
from app.schemas.user import (
    UserCreate,
    UserLogin,
    GoogleAuthRequest,
    Token,
    UserResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    PasswordResetResponse,
)
from app.services.email_service import EmailService

logger = logging.getLogger("chargeroute.auth")

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login", auto_error=False)


async def get_current_user_optional(
    token: Optional[str] = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> Optional[User]:
    if not token:
        return None
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
    except jwt.PyJWTError:
        return None

    stmt = select(User).where(User.id == user_id)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    return user


async def get_current_user(
    current_user: Optional[User] = Depends(get_current_user_optional),
) -> User:
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return current_user


@router.post("/register", response_model=Token)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    email = user_in.email.lower().strip()
    stmt = select(User).where(User.email == email)
    res = await db.execute(stmt)
    existing_user = res.scalar_one_or_none()

    if existing_user:
        # If the password matches, smoothly log the existing user in
        if verify_password(user_in.password, existing_user.hashed_password):
            token = create_access_token(subject=existing_user.id)
            return Token(access_token=token, user=UserResponse.model_validate(existing_user))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists. Please sign in with your password.",
        )

    user = User(
        email=email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name.strip() if user_in.full_name else email.split("@")[0].title(),
        is_active=True,
        is_admin=False,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = create_access_token(subject=user.id)
    return Token(access_token=token, user=UserResponse.model_validate(user))


@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.email == credentials.email.lower().strip())
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()

    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
        )

    token = create_access_token(subject=user.id)
    return Token(access_token=token, user=UserResponse.model_validate(user))


@router.post("/google", response_model=Token)
async def login_with_google(google_data: GoogleAuthRequest, db: AsyncSession = Depends(get_db)):
    email = google_data.email.lower().strip()
    stmt = select(User).where(User.email == email)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()

    if not user:
        # Create user authenticated via Google
        user = User(
            email=email,
            hashed_password=get_password_hash(secrets.token_urlsafe(32)),
            full_name=google_data.full_name or email.split("@")[0].title(),
            is_active=True,
            is_admin=False,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    else:
        if not user.full_name and google_data.full_name:
            user.full_name = google_data.full_name
            await db.commit()
            await db.refresh(user)

    token = create_access_token(subject=user.id)
    return Token(access_token=token, user=UserResponse.model_validate(user))


@router.get("/me", response_model=UserResponse)
async def get_me(user: User = Depends(get_current_user)):
    return UserResponse.model_validate(user)


@router.post("/forgot-password", response_model=PasswordResetResponse)
async def forgot_password(
    http_req: Request,
    request: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    email = request.email.lower().strip()
    stmt = select(User).where(User.email == email)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()

    reset_token = secrets.token_urlsafe(32)
    dev_url = None

    # Dynamically detect client frontend origin so links opened on other devices (mobile, LAN, etc.) route properly
    client_origin = http_req.headers.get("origin") or http_req.headers.get("referer")
    detected_frontend = None
    if client_origin:
        parsed = urlparse(client_origin)
        if parsed.scheme and parsed.netloc:
            detected_frontend = f"{parsed.scheme}://{parsed.netloc}"

    if user:
        user.reset_password_token = reset_token
        user.reset_password_expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
        await db.commit()
        await db.refresh(user)

        email_result = EmailService.send_password_reset_email(
            to_email=user.email,
            reset_token=reset_token,
            user_name=user.full_name,
            frontend_url=detected_frontend,
        )
        dev_url = email_result.get("reset_url")
    else:
        logger.info(f"Password reset requested for non-existing email: {email}")

    return PasswordResetResponse(
        message=f"Password reset instructions have been sent to {email}. Please check your mail inbox or spam folder.",
        reset_url_dev=dev_url,
    )


@router.post("/reset-password", response_model=PasswordResetResponse)
async def reset_password(request: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    token = request.token.strip()
    if not token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or missing reset token."
        )

    if len(request.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long."
        )

    stmt = select(User).where(User.reset_password_token == token)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This password reset link is invalid or has already been used.",
        )

    # Check expiration
    if not user.reset_password_expires_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid password reset request.",
        )

    expires_at = user.reset_password_expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if datetime.now(timezone.utc) > expires_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This password reset link has expired. Please request a new link.",
        )

    # Update password and invalidate token
    user.hashed_password = get_password_hash(request.password)
    user.reset_password_token = None
    user.reset_password_expires_at = None
    await db.commit()

    return PasswordResetResponse(
        message="Your password has been successfully reset! You can now sign in with your new password.",
    )
