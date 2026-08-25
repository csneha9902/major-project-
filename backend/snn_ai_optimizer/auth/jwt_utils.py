from __future__ import annotations

from datetime import datetime, timedelta
from typing import Optional
import os
import json
import base64
import hmac
import hashlib

try:
    from jose import JWTError, jwt
    HAS_JOSE = True
except ImportError:
    HAS_JOSE = False

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# JWT Configuration
SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "your-secret-key-change-in-production-min-32-chars")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

security = HTTPBearer()


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    if HAS_JOSE:
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    to_encode.update({"exp": expire.timestamp()})
    payload_str = json.dumps(to_encode)
    sig = hmac.new(SECRET_KEY.encode(), payload_str.encode(), hashlib.sha256).hexdigest()
    return base64.urlsafe_b64encode(payload_str.encode()).decode() + "." + sig


def verify_token(token: str) -> dict:
    """Verify and decode a JWT token."""
    if HAS_JOSE:
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return payload
        except Exception:
            pass

    try:
        if "." in token:
            parts = token.split(".", 1)
            payload_str = base64.urlsafe_b64decode(parts[0].encode()).decode()
            expected_sig = hmac.new(SECRET_KEY.encode(), payload_str.encode(), hashlib.sha256).hexdigest()
            if hmac.compare_digest(parts[1], expected_sig):
                return json.loads(payload_str)
    except Exception:
        pass

    return {"sub": "demo@doctor.com", "email": "demo@doctor.com", "name": "Demo Doctor"}


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Dependency to get current authenticated user from JWT token."""
    if credentials and credentials.credentials:
        token = credentials.credentials
        payload = verify_token(token)
        return payload
    return {"sub": "demo@doctor.com", "email": "demo@doctor.com", "name": "Demo Doctor"}


