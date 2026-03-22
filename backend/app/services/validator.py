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
		"exp_month": exp_month,
		"exp_year": exp_year,
		"cvv": cvv,
		"brand": brand,
		"valid_luhn": is_valid_luhn(clean_number),
		"valid_exp": is_valid_expiry(exp_month, exp_year),
		"valid_cvv": is_valid_cvv(cvv, brand),
	}


def evaluate_external_consistency(result: dict, bin_info: dict | None) -> tuple[bool | None, str | None, list[str]]:
	if bin_info is None:
		return None, "bin_unavailable", ["External BIN data unavailable"]

	issues: list[str] = []
	binary_scheme = (bin_info.get("scheme") or "").lower()
	binary_type = (bin_info.get("type") or "").lower()
	local_brand = (result.get("brand") or "").lower()

	if binary_scheme and local_brand != "unknown" and binary_scheme != local_brand:
		issues.append("BIN scheme does not match detected brand")

	if binary_type and binary_type not in {"credit", "debit", "charge", "prepaid"}:
		issues.append("BIN type is uncommon or unrecognized")

	if not result.get("valid_luhn", False):
		issues.append("Card fails Luhn checksum")

	if not result.get("valid_exp", False):
		issues.append("Card expiry date is invalid")

	if not result.get("valid_cvv", False):
		issues.append("CVV format is invalid for detected brand")

	if issues:
		return False, "mismatch", issues

	return True, "ok", []

