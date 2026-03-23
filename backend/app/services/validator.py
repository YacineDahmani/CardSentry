from datetime import datetime


def sanitize_number(number: str) -> str:
	return "".join(ch for ch in number if ch.isdigit())


BRAND_LENGTHS: dict[str, set[int]] = {
	"visa": {13, 16, 19},
	"mastercard": {16},
	"amex": {15},
	"discover": {16, 19},
	"jcb": {16, 17, 18, 19},
	"diners_club": {14},
	"maestro": set(range(12, 20)),
}


def _prefix_in_range(number: str, length: int, start: int, end: int) -> bool:
	if len(number) < length or not number[:length].isdigit():
		return False
	value = int(number[:length])
	return start <= value <= end


def detect_brand(number: str) -> str:
	if number.startswith("4"):
		return "visa"
	if number[:2] in {"34", "37"}:
		return "amex"
	if number[:2] in {"51", "52", "53", "54", "55"} or _prefix_in_range(number, 4, 2221, 2720):
		return "mastercard"
	if number.startswith("6011") or number.startswith("65") or _prefix_in_range(number, 3, 644, 649):
		return "discover"
	if _prefix_in_range(number, 4, 3528, 3589):
		return "jcb"
	if number[:2] in {"36", "38", "39"} or _prefix_in_range(number, 3, 300, 305):
		return "diners_club"
	if number.startswith("50") or _prefix_in_range(number, 2, 56, 69):
		return "maestro"
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


def is_valid_brand_length(number: str, brand: str) -> bool:
	if not number.isdigit():
		return False
	if brand == "unknown":
		return 12 <= len(number) <= 19
	allowed_lengths = BRAND_LENGTHS.get(brand)
	if not allowed_lengths:
		return False
	return len(number) in allowed_lengths


def is_valid_expiry(exp_month: int, exp_year: int) -> bool:
	now = datetime.now()
	if not 1 <= exp_month <= 12:
		return False
	if exp_year < now.year:
		return False
	if exp_year == now.year and exp_month < now.month:
		return False
	return True


def is_valid_cvv(cvv: str, brand: str) -> bool:
	if not cvv.isdigit():
		return False
	if brand == "amex":
		return len(cvv) == 4
	return len(cvv) == 3


def validate_card(number: str, exp_month: int, exp_year: int, cvv: str) -> dict:
	clean_number = sanitize_number(number)
	brand = detect_brand(clean_number)
	valid_length = is_valid_brand_length(clean_number, brand)
	return {
		"number": clean_number,
		"exp_month": exp_month,
		"exp_year": exp_year,
		"cvv": cvv,
		"brand": brand,
		"valid_luhn": valid_length and is_valid_luhn(clean_number),
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
		if not is_valid_brand_length(result.get("number", ""), local_brand):
			issues.append("Card number length is invalid for detected brand")
		else:
			issues.append("Card fails Luhn checksum")

	if not result.get("valid_exp", False):
		issues.append("Card expiry date is invalid")

	if not result.get("valid_cvv", False):
		issues.append("CVV format is invalid for detected brand")

	if issues:
		return False, "mismatch", issues

	return True, "ok", []

