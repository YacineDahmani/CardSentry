import random
from datetime import datetime


BRAND_PREFIXES = {
	"visa": ["4"],
	"mastercard": ["51", "52", "53", "54", "55"],
	"amex": ["34", "37"],
	"discover": ["6011", "65"],
}

BRAND_LENGTH = {
	"visa": 16,
	"mastercard": 16,
	"amex": 15,
	"discover": 16,
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


def _generate_expiry() -> tuple[int, int]:
	now = datetime.utcnow()
	year = random.randint(now.year, now.year + 6)
	month = random.randint(1, 12)
	if year == now.year and month < now.month:
		month = now.month
	return month, year


def _generate_cvv(brand: str) -> str:
	length = 4 if brand == "amex" else 3
	return "".join(str(random.randint(0, 9)) for _ in range(length))


def generate_cards(count: int, brand: str, card_type: str) -> list[dict]:
	cards: list[dict] = []
	for _ in range(count):
		exp_month, exp_year = _generate_expiry()
		cards.append(
			{
				"number": _generate_number(brand),
				"exp_month": exp_month,
				"exp_year": exp_year,
				"cvv": _generate_cvv(brand),
				"brand": brand,
				"type": card_type,
			}
		)
	return cards

