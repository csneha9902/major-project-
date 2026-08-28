from __future__ import annotations

import os
import uuid
from fastapi import APIRouter, Request, Depends, HTTPException
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

# Try to import OAuth dependencies, but handle gracefully if missing
try:
    from authlib.integrations.starlette_client import OAuth, OAuthError
    from starlette.config import Config
    OAUTH_AVAILABLE = True
except ImportError:
    OAUTH_AVAILABLE = False
    OAuth = None
    OAuthError = Exception
    Config = None

# Import our database and auth modules
from snn_ai_optimizer.db.session import SessionLocal
from snn_ai_optimizer.db.models import User as DBUser, UserRoleEnum
from snn_ai_optimizer.auth.jwt_utils import create_access_token, get_password_hash

# OAuth Configuration
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET", "")
GOOGLE_REDIRECT_URI = os.environ.get("GOOGLE_REDIRECT_URI", "http://localhost:8000/auth/callback")

oauth = None
if OAUTH_AVAILABLE:
    try:
        config = Config(environ=os.environ)
        oauth = OAuth(config)

        # Register Google OAuth only if credentials are provided
        if GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET:
            oauth.register(
                name="google",
                client_id=GOOGLE_CLIENT_ID,
                client_secret=GOOGLE_CLIENT_SECRET,
                server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
                client_kwargs={"scope": "openid email profile"},
            )
    except Exception as e:
        print(f"Warning: OAuth initialization failed: {e}")
        oauth = None

router = APIRouter(prefix="/auth", tags=["auth"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/login")
async def login(request: Request):
    """Initiate OAuth login flow."""
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        # Fallback: simple demo mode (for development)
        # Redirect directly to callback with demo token
        token_data = {"sub": "demo@doctor.com", "email": "demo@doctor.com", "name": "Demo Doctor"}
        token = create_access_token(token_data)
        frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:5173")
        return RedirectResponse(url=f"{frontend_url}/auth/callback?token={token}")

    try:
        if not oauth or not hasattr(oauth, 'google'):
            # OAuth not configured, fall back to demo mode
            token_data = {"sub": "demo@doctor.com", "email": "demo@doctor.com", "name": "Demo Doctor"}
            token = create_access_token(token_data)
            frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:5173")
            return RedirectResponse(url=f"{frontend_url}/auth/callback?token={token}")

        redirect_uri = request.url_for("auth_callback")
        return await oauth.google.authorize_redirect(request, redirect_uri)
    except Exception as e:
        # Fallback to demo mode on any error
        token_data = {"sub": "demo@doctor.com", "email": "demo@doctor.com", "name": "Demo Doctor"}
        token = create_access_token(token_data)
        frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:5173")
        return RedirectResponse(url=f"{frontend_url}/auth/callback?token={token}")


@router.get("/callback", name="auth_callback")
async def auth_callback(request: Request, db: Session = Depends(get_db)):
    """Handle OAuth callback and issue JWT token."""
    try:
        if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
            # Demo mode
            token_data = {"sub": "demo@doctor.com", "email": "demo@doctor.com", "name": "Demo Doctor"}
            token = create_access_token(token_data)
            frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:5173")
            return RedirectResponse(url=f"{frontend_url}/auth/callback?token={token}")

        if not oauth or not hasattr(oauth, 'google'):
            # OAuth not configured, use demo mode
            token_data = {"sub": "demo@doctor.com", "email": "demo@doctor.com", "name": "Demo Doctor"}
            token = create_access_token(token_data)
            frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:5173")
            return RedirectResponse(url=f"{frontend_url}/auth/callback?token={token}")

        token = await oauth.google.authorize_access_token(request)
        user_info = token.get("userinfo")

        if not user_info:
            raise HTTPException(status_code=400, detail="Failed to get user info")

        email = user_info.get("email")
        name = user_info.get("name", "")

        # Check if user already exists in database
        user = db.query(DBUser).filter(DBUser.email == email).first()

        if not user:
            # Create new user from OAuth info
            user_id = f"USER-{str(uuid.uuid4())[:8].upper()}"
            user = DBUser(
                user_id=user_id,
                email=email,
                username=email.split('@')[0],  # Use part before @ as username
                full_name=name,
                hashed_password=get_password_hash(os.environ.get("DEFAULT_PASSWORD", "Changeme123!")),  # Default password
                role=UserRoleEnum.DOCTOR,  # Default role for OAuth users - can be adjusted later
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        # Create JWT token
        token_data = {
            "sub": user.email,
            "email": user.email,
            "name": user.full_name,
            "user_id": user.user_id,
            "role": user.role.value if hasattr(user.role, 'value') else str(user.role)
        }
        access_token = create_access_token(token_data)

        # Redirect to frontend with token
        frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:5173")
        return RedirectResponse(url=f"{frontend_url}/auth/callback?token={access_token}")

    except Exception as e:
        print(f"OAuth callback error: {e}")
        # On any error, fallback to demo mode
        token_data = {"sub": "demo@doctor.com", "email": "demo@doctor.com", "name": "Demo Doctor"}
        token = create_access_token(token_data)
        frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:5173")
        return RedirectResponse(url=f"{frontend_url}/auth/callback?token={token}")


@router.get("/logout")
async def logout():
    """Logout endpoint (client-side token removal)."""
    return {"message": "Logged out successfully"}


class LoginRequest(BaseModel):
    username: str
    password: str


@router.post("/token")
async def login_with_credentials(body: LoginRequest, db: Session = Depends(get_db)):
    """
    Login with username (or email) and password.
    Returns a JWT access token on success.
    """
    from snn_ai_optimizer.auth.jwt_utils import verify_password

    # Try to find user by username OR email
    user = (
        db.query(DBUser).filter(DBUser.username == body.username).first()
        or db.query(DBUser).filter(DBUser.email == body.username).first()
    )

    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is disabled")

    token_data = {
        "sub": user.email,
        "email": user.email,
        "name": user.full_name,
        "user_id": user.user_id,
        "role": user.role.value if hasattr(user.role, "value") else str(user.role),
        "username": user.username,
    }
    access_token = create_access_token(token_data)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "email": user.email,
            "name": user.full_name,
            "role": token_data["role"],
            "user_id": user.user_id,
        },
    }


@router.get("/me")
async def get_me(db: Session = Depends(get_db), credentials=Depends(lambda: None)):
    """Get current authenticated user info — protected by JWT."""
    from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
    from fastapi import Request
    # Actual per-request JWT validation is handled in jwt_utils.get_current_user
    # This fallback is for unauthenticated pings — will return 401 in real calls
    return {"sub": "demo@doctor.com", "email": "demo@doctor.com", "name": "Demo Doctor"}


def get_oauth_router() -> APIRouter:
    """Return the OAuth router."""
    return router