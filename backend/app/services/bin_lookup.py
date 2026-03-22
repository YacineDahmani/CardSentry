from typing import Any

import httpx

from app.database import get_cached_bin, set_cached_bin


BINLIST_URL = "https://lookup.binlist.net"


def _format_bin_payload(data: dict[str, Any]) -> dict[str, Any]:
	country = data.get("country") or {}
	bank = data.get("bank") or {}
	return {
		"scheme": data.get("scheme"),
		"brand": data.get("brand"),
		"type": data.get("type"),
		"country": country.get("name"),
		"bank": bank.get("name"),
		"raw": data,
	}


async def lookup_bin(bin_number: str) -> dict[str, Any] | None:
	if len(bin_number) < 6 or not bin_number.isdigit():
		return None

	cached = get_cached_bin(bin_number)
	if cached is not None:
		return cached

	url = f"{BINLIST_URL}/{bin_number}"
	headers = {"Accept-Version": "3"}

	try:
		async with httpx.AsyncClient(timeout=8.0) as client:
			response = await client.get(url, headers=headers)
	except httpx.HTTPError:
		return None

	if response.status_code != 200:
		return None

	data = _format_bin_payload(response.json())
	set_cached_bin(bin_number, data)
	return data

