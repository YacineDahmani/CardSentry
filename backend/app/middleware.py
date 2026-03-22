from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.extension import _rate_limit_exceeded_handler
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address


def configure_cors(app: FastAPI, origins: list[str]) -> None:
	app.add_middleware(
		CORSMiddleware,
		allow_origins=origins,
		allow_credentials=True,
		allow_methods=["*"],
		allow_headers=["*"],
	)


def configure_rate_limiter(app: FastAPI) -> Limiter:
	limiter = Limiter(key_func=get_remote_address)
	app.state.limiter = limiter
	app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
	app.add_middleware(SlowAPIMiddleware)
	return limiter

