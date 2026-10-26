from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from collections import defaultdict
import time

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, calls: int = 100, period: int = 60):
        super().__init__(app)
        self.calls = calls
        self.period = period
        self.requests = defaultdict(list)

    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host

        now = time.time()
        self.requests[client_ip] = [t for t in self.requests[client_ip] if now - t < self.period]

        if len(self.requests[client_ip]) >= self.calls:
            raise HTTPException(status_code=429, detail="Trop de requêtes")

        self.requests[client_ip].append(now)
        return await call_next(request)
