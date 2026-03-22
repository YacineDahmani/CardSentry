import os
from typing import Any

import httpx

from app.database import get_cached_bin, set_cached_bin


HANDYAPI_URL = "https://data.handyapi.com/bin"
HANDYAPI_KEY = os.getenv("HANDYAPI_SECRET_KEY", "")


def _format_bin_payload(data: dict[str, Any]) -> dict[str, Any]:
	"""Map HandyAPI response fields to our internal format."""
	country_obj = data.get("Country") or {}
	return {
		"scheme": (data.get("Scheme") or "").lower() or None,
		"brand": (data.get("Scheme") or "").lower() or None,
		"type": (data.get("Type") or "").lower() or None,
		"country": country_obj.get("Name"),
		"bank": data.get("Issuer"),
		"tier": data.get("CardTier"),
		"luhn": data.get("Luhn"),
		"raw": data,
	}


async def lookup_bin(bin_number: str) -> dict[str, Any] | None:
	if len(bin_number) < 6 or not bin_number.isdigit():
		return None

	cached = get_cached_bin(bin_number)
	if cached is not None:
		return cached

	url = f"{HANDYAPI_URL}/{bin_number}"
	headers = {"x-api-key": HANDYAPI_KEY}

	try:
		async with httpx.AsyncClient(timeout=8.0) as client:
			response = await client.get(url, headers=headers)
	except httpx.HTTPError:
		return None

	if response.status_code != 200:
		return None

	payload = response.json()

	if payload.get("Status") != "SUCCESS":
		return None

	data = _format_bin_payload(payload)
	set_cached_bin(bin_number, data)
	return data
