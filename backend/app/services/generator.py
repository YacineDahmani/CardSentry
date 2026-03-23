import random
from datetime import datetime

from app.services.validator import detect_brand


BRAND_PREFIXES = {
	"visa": ["4"],
	"mastercard": ["51", "52", "53", "54", "55"],
	"amex": ["34", "37"],
	"discover": ["6011", "65"],
	"jcb": ["3528", "3530", "3589"],
	"diners_club": ["300", "301", "302", "303", "304", "305", "36", "38", "39"],
	"maestro": ["50", "56", "57", "58", "60", "63", "67"],
}

BRAND_LENGTH = {
	"visa": 16,
	"mastercard": 16,
	"amex": 15,
	"discover": 16,
	"jcb": 16,
	"diners_club": 14,
	"maestro": 16,
}


def _luhn_check_digit(base_number: str) -> str:
	digits = [int(ch) for ch in base_number]
	parity = (len(digits) + 1) % 2
	total = 0
	for idx, digit in enumerate(digits):
		if idx % 2 == parity:
			digit *= 2
			if digit > 9:
				digit -= 9
		total += digit
	check = (10 - (total % 10)) % 10
	return str(check)


def _generate_number(brand: str) -> str:
	prefix = random.choice(BRAND_PREFIXES[brand])
	length = BRAND_LENGTH[brand]
	remaining = length - len(prefix) - 1
	body = "".join(str(random.randint(0, 9)) for _ in range(remaining))
	partial = f"{prefix}{body}"
	return f"{partial}{_luhn_check_digit(partial)}"


def _generate_number_from_prefix(prefix: str, length: int) -> str:
	remaining = length - len(prefix) - 1
	if remaining < 0:
		raise ValueError("BIN/prefix is too long for selected brand length")
	body = "".join(str(random.randint(0, 9)) for _ in range(remaining))
	partial = f"{prefix}{body}"
	return f"{partial}{_luhn_check_digit(partial)}"


def _generate_expiry() -> tuple[int, int]:
	now = datetime.now()
	year = random.randint(now.year, now.year + 6)
	month = random.randint(1, 12)
	if year == now.year and month < now.month:
		month = now.month
	return month, year


def _generate_cvv(brand: str) -> str:
	length = 4 if brand == "amex" else 3
	return "".join(str(random.randint(0, 9)) for _ in range(length))


def _resolve_brand(brand: str, bin_prefix: str | None) -> str:
	if not bin_prefix:
		return brand
	detected = detect_brand(bin_prefix)
	if detected == "unknown":
		return brand
	if detected != brand:
		raise ValueError(f"Provided BIN is not compatible with selected brand '{brand}'")
	return detected


def _resolve_cvv(brand: str, cvv: str | None) -> str:
	if cvv is None or cvv == "":
		return _generate_cvv(brand)
	if not cvv.isdigit():
		raise ValueError("CVV must contain only digits")
	expected = 4 if brand == "amex" else 3
	if len(cvv) != expected:
		raise ValueError(f"CVV length must be {expected} for brand '{brand}'")
	return cvv


def _resolve_expiry(exp_month: int | None, exp_year: int | None) -> tuple[int, int]:
	if exp_month is None and exp_year is None:
		return _generate_expiry()
	if exp_month is None or exp_year is None:
		raise ValueError("exp_month and exp_year must be provided together")
	if not 1 <= exp_month <= 12:
		raise ValueError("exp_month must be between 1 and 12")
	now = datetime.now()
	if exp_year < now.year or (exp_year == now.year and exp_month < now.month):
		raise ValueError("Provided expiry date is in the past")
	return exp_month, exp_year


def generate_cards(
	count: int,
	brand: str,
	card_type: str,
	bin_prefix: str | None = None,
	exp_month: int | None = None,
	exp_year: int | None = None,
	cvv: str | None = None,
) -> list[dict]:
	if bin_prefix is not None:
		if not bin_prefix.isdigit():
			raise ValueError("BIN must contain only digits")
		if len(bin_prefix) < 6 or len(bin_prefix) > 12:
			raise ValueError("BIN length must be between 6 and 12 digits")

	resolved_brand = _resolve_brand(brand, bin_prefix)
	card_length = BRAND_LENGTH[resolved_brand]
	if bin_prefix and len(bin_prefix) >= card_length:
		raise ValueError("BIN length must be shorter than card length")

	cards: list[dict] = []
	for _ in range(count):
		resolved_month, resolved_year = _resolve_expiry(exp_month, exp_year)
		number = (
			_generate_number_from_prefix(bin_prefix, card_length)
			if bin_prefix
			else _generate_number(resolved_brand)
		)
		cards.append(
			{
				"number": number,
				"exp_month": resolved_month,
				"exp_year": resolved_year,
				"cvv": _resolve_cvv(resolved_brand, cvv),
				"brand": resolved_brand,
				"type": card_type,
			}
		)
	return cards

