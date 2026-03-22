from datetime import datetime


def sanitize_number(number: str) -> str:
	return "".join(ch for ch in number if ch.isdigit())


def detect_brand(number: str) -> str:
	if number.startswith("4"):
		return "visa"
	if number[:2] in {"34", "37"}:
		return "amex"
	if number[:2] in {"51", "52", "53", "54", "55"}:
		return "mastercard"
	if number.startswith("6011") or number.startswith("65"):
		return "discover"
	return "unknown"


def is_valid_luhn(number: str) -> bool:
	if not number or not number.isdigit():
		return False
	total = 0
	parity = len(number) % 2
	for idx, digit_char in enumerate(number):
		digit = int(digit_char)
		if idx % 2 == parity:
			digit *= 2
			if digit > 9:
				digit -= 9
		total += digit
	return total % 10 == 0


def is_valid_expiry(exp_month: int, exp_year: int) -> bool:
	now = datetime.utcnow()
	if exp_year < now.year:
		return False
	if exp_year == now.year and exp_month < now.month:
		return False
	return 1 <= exp_month <= 12


def is_valid_cvv(cvv: str, brand: str) -> bool:
	if not cvv.isdigit():
		return False
	if brand == "amex":
		return len(cvv) == 4
	return len(cvv) == 3


def validate_card(number: str, exp_month: int, exp_year: int, cvv: str) -> dict:
	clean_number = sanitize_number(number)
	brand = detect_brand(clean_number)
	return {
		"number": clean_number,
		"brand": brand,
		"valid_luhn": is_valid_luhn(clean_number),
		"valid_exp": is_valid_expiry(exp_month, exp_year),
		"valid_cvv": is_valid_cvv(cvv, brand),
	}

