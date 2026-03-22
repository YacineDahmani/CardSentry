import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query, Request

from app.database import get_generation_history, init_db, store_generated_cards
from app.middleware import configure_cors, configure_rate_limiter
from app.models import GenerateRequest, ValidateRequest
from app.services.bin_lookup import lookup_bin
from app.services.generator import generate_cards
from app.services.validator import evaluate_external_consistency, sanitize_number, validate_card


load_dotenv()

app = FastAPI(title="CardSentry API", version="1.0.0")

cors_origins = os.getenv("CORS_ORIGINS", "*")
origins = [origin.strip() for origin in cors_origins.split(",") if origin.strip()]
configure_cors(app, origins or ["*"])
limiter = configure_rate_limiter(app)


@app.on_event("startup")
async def startup_event() -> None:
	init_db()


@app.get("/health")
async def health() -> dict[str, str]:
	return {"status": "ok"}


@app.post("/validate")
@limiter.limit("30/minute")
async def validate(payload: ValidateRequest, request: Request) -> list[dict]:
	results: list[dict] = []
	for card in payload.cards:
		result = validate_card(card.number, card.exp_month, card.exp_year, card.cvv)
		bin_number = sanitize_number(card.number)[:6]
		bin_info = await lookup_bin(bin_number)
		result["bin"] = bin_info
		valid_external, external_status, external_issues = evaluate_external_consistency(result, bin_info)
		result["valid_external"] = valid_external
		result["external_status"] = external_status
		result["external_issues"] = external_issues
		results.append(result)
	return results


@app.post("/bulk")
@limiter.limit("30/minute")
async def bulk_validate(payload: ValidateRequest, request: Request) -> list[dict]:
	return await validate(payload, request)


@app.post("/generate")
@limiter.limit("20/minute")
async def generate(payload: GenerateRequest, request: Request) -> list[dict]:
	try:
		cards = generate_cards(
			payload.count,
			payload.brand,
			payload.type,
			payload.bin,
			payload.exp_month,
			payload.exp_year,
			payload.cvv,
		)
	except ValueError as exc:
		raise HTTPException(status_code=400, detail=str(exc)) from exc
	store_generated_cards(cards)
	return cards


@app.get("/generate/history")
@limiter.limit("30/minute")
async def generation_history(request: Request, limit: int = Query(default=100, ge=1, le=500)) -> list[dict]:
	return get_generation_history(limit)

