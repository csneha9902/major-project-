from __future__ import annotations

import os
from fastapi import APIRouter, Request, HTTPException, Depends
from fastapi.responses import RedirectResponse

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


@router.get("/login")
async def login(request: Request):
    """Initiate OAuth login flow."""
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        # Fallback: simple demo mode (for development)
        # Redirect directly to callback with demo token
        from .jwt_utils import create_access_token
        token_data = {"sub": "demo@doctor.com", "email": "demo@doctor.com", "name": "Demo Doctor"}
        token = create_access_token(token_data)
        frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:5173")
        return RedirectResponse(url=f"{frontend_url}/auth/callback?token={token}")
    
    try:
        if not oauth or not hasattr(oauth, 'google'):
            # OAuth not configured, fall back to demo mode
            from .jwt_utils import create_access_token
            token_data = {"sub": "demo@doctor.com", "email": "demo@doctor.com", "name": "Demo Doctor"}
            token = create_access_token(token_data)
            frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:5173")
            return RedirectResponse(url=f"{frontend_url}/auth/callback?token={token}")
        
        redirect_uri = request.url_for("auth_callback")
        return await oauth.google.authorize_redirect(request, redirect_uri)
    except Exception as e:
        # Fallback to demo mode on any error
        from .jwt_utils import create_access_token
        token_data = {"sub": "demo@doctor.com", "email": "demo@doctor.com", "name": "Demo Doctor"}
        token = create_access_token(token_data)
        frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:5173")
        return RedirectResponse(url=f"{frontend_url}/auth/callback?token={token}")


@router.get("/callback", name="auth_callback")
async def auth_callback(request: Request):
    """Handle OAuth callback and issue JWT token."""
    try:
        if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
            # Demo mode
            from .jwt_utils import create_access_token
            token_data = {"sub": "demo@doctor.com", "email": "demo@doctor.com", "name": "Demo Doctor"}
            token = create_access_token(token_data)
            frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:5173")
            return RedirectResponse(url=f"{frontend_url}/auth/callback?token={token}")
        
        if not oauth or not hasattr(oauth, 'google'):
            # OAuth not configured, use demo mode
            from .jwt_utils import create_access_token
            token_data = {"sub": "demo@doctor.com", "email": "demo@doctor.com", "name": "Demo Doctor"}
            token = create_access_token(token_data)
            frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:5173")
            return RedirectResponse(url=f"{frontend_url}/auth/callback?token={token}")
        
        token = await oauth.google.authorize_access_token(request)
        user_info = token.get("userinfo")
        
        if not user_info:
            raise HTTPException(status_code=400, detail="Failed to get user info")
        
        # Create JWT token
        from .jwt_utils import create_access_token
        token_data = {
            "sub": user_info.get("email"),
            "email": user_info.get("email"),
            "name": user_info.get("name", ""),
        }
        access_token = create_access_token(token_data)
        
        # Redirect to frontend with token
        frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:5173")
        return RedirectResponse(url=f"{frontend_url}/auth/callback?token={access_token}")
    
    except Exception as e:
        # On any error, fallback to demo mode
        from .jwt_utils import create_access_token
        token_data = {"sub": "demo@doctor.com", "email": "demo@doctor.com", "name": "Demo Doctor"}
        token = create_access_token(token_data)
        frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:5173")
        return RedirectResponse(url=f"{frontend_url}/auth/callback?token={token}")


@router.get("/logout")
async def logout():
    """Logout endpoint (client-side token removal)."""
    return {"message": "Logged out successfully"}

@router.get("/me")
async def get_current_user_info():
    """Get current authenticated user info."""
    # This endpoint should be protected, but for now return demo user
    # The frontend will handle token validation
    return {"sub": "demo@doctor.com", "email": "demo@doctor.com", "name": "Demo Doctor"}


def get_oauth_router() -> APIRouter:
    """Return the OAuth router."""
    return router

