from functools import lru_cache

from faker import Faker


SUPPORTED_COUNTRIES: dict[str, dict[str, str]] = {
	"US": {"name": "United States", "locale": "en_US"},
	"CA": {"name": "Canada", "locale": "en_CA"},
	"GB": {"name": "United Kingdom", "locale": "en_GB"},
	"AU": {"name": "Australia", "locale": "en_AU"},
	"NZ": {"name": "New Zealand", "locale": "en_NZ"},
	"IE": {"name": "Ireland", "locale": "en_IE"},
	"DE": {"name": "Germany", "locale": "de_DE"},
	"FR": {"name": "France", "locale": "fr_FR"},
	"ES": {"name": "Spain", "locale": "es_ES"},
	"IT": {"name": "Italy", "locale": "it_IT"},
	"NL": {"name": "Netherlands", "locale": "nl_NL"},
	"BE": {"name": "Belgium", "locale": "nl_BE"},
	"AT": {"name": "Austria", "locale": "de_AT"},
	"PT": {"name": "Portugal", "locale": "pt_PT"},
	"PL": {"name": "Poland", "locale": "pl_PL"},
	"CZ": {"name": "Czech Republic", "locale": "cs_CZ"},
	"SE": {"name": "Sweden", "locale": "sv_SE"},
	"NO": {"name": "Norway", "locale": "no_NO"},
	"DK": {"name": "Denmark", "locale": "da_DK"},
	"CH": {"name": "Switzerland", "locale": "de_CH"},
	"BR": {"name": "Brazil", "locale": "pt_BR"},
	"AR": {"name": "Argentina", "locale": "es_AR"},
	"CO": {"name": "Colombia", "locale": "es_CO"},
	"CL": {"name": "Chile", "locale": "es_CL"},
	"PE": {"name": "Peru", "locale": "es_PE"},
	"MX": {"name": "Mexico", "locale": "es_MX"},
	"ZA": {"name": "South Africa", "locale": "en_ZA"},
	"DZ": {"name": "Algeria", "locale": "fr_FR"},
	"MA": {"name": "Morocco", "locale": "fr_FR"},
	"EG": {"name": "Egypt", "locale": "ar_EG"},
	"NG": {"name": "Nigeria", "locale": "en_NG"},
	"KE": {"name": "Kenya", "locale": "en_KE"},
	"IN": {"name": "India", "locale": "en_IN"},
	"JP": {"name": "Japan", "locale": "ja_JP"},
	"CN": {"name": "China", "locale": "zh_CN"},
	"KR": {"name": "South Korea", "locale": "ko_KR"},
	"ID": {"name": "Indonesia", "locale": "id_ID"},
	"TH": {"name": "Thailand", "locale": "th_TH"},
	"VN": {"name": "Vietnam", "locale": "vi_VN"},
	"PH": {"name": "Philippines", "locale": "en_PH"},
	"SG": {"name": "Singapore", "locale": "en_SG"},
	"AE": {"name": "United Arab Emirates", "locale": "en_AE"},
}


@lru_cache(maxsize=32)
def _get_faker(locale: str) -> Faker:
	try:
		return Faker(locale)
	except Exception:
		return Faker("en_US")


def _safe_value(fake: Faker, method_name: str, fallback: str = "") -> str:
	method = getattr(fake, method_name, None)
	if callable(method):
		try:
			value = method()
			return str(value).strip() if value else fallback
		except Exception:
			return fallback
	return fallback


def _build_formatted_address(country_code: str, street: str, city: str, region: str, postal_code: str, country_name: str) -> str:
	country = country_code.upper()
	if country in {"US", "CA", "AU", "NZ", "IN", "ZA"}:
		return f"{street}\n{city}, {region} {postal_code}\n{country_name}".strip()
	if country == "GB":
		return f"{street}\n{city}\n{postal_code}\n{country_name}".strip()
	if country in {
		"DE",
		"FR",
		"ES",
		"IT",
		"NL",
		"BE",
		"AT",
		"PT",
		"PL",
		"CZ",
		"BR",
		"AR",
		"CO",
		"CL",
		"PE",
		"MX",
		"DZ",
		"MA",
		"EG",
	}:
		return f"{street}\n{postal_code} {city}\n{country_name}".strip()
	if country in {"SE", "NO", "DK"}:
		return f"{street}\n{postal_code} {city}\n{country_name}".strip()
	if country == "CH":
		return f"{street}\nCH-{postal_code} {city}\n{country_name}".strip()
	if country in {"SG", "AE", "NG", "KE", "PH"}:
		line_two = f"{city} {postal_code}".strip()
		line_three = region or city
		return f"{street}\n{line_two}\n{line_three}\n{country_name}".strip()
	if country == "JP":
		return f"{postal_code}\n{region}{city}{street}\n{country_name}".strip()
	if country in {"CN", "KR", "ID", "TH", "VN"}:
		line_two = f"{region} {city} {postal_code}".strip()
		return f"{street}\n{line_two}\n{country_name}".strip()
	return f"{street}\n{city} {region} {postal_code}\n{country_name}".strip()


def _build_identity(country_code: str) -> dict:
	code = country_code.upper()
	if code not in SUPPORTED_COUNTRIES:
		raise ValueError(f"Unsupported country '{country_code}'.")

	config = SUPPORTED_COUNTRIES[code]
	fake = _get_faker(config["locale"])

	full_name = _safe_value(fake, "name")
	street = _safe_value(fake, "street_address")
	city = _safe_value(fake, "city")
	postal_code = _safe_value(fake, "postcode")
	region = (
		_safe_value(fake, "state")
		or _safe_value(fake, "administrative_unit")
		or _safe_value(fake, "province")
	)

	formatted_address = _build_formatted_address(
		code,
		street=street,
		city=city,
		region=region,
		postal_code=postal_code,
		country_name=config["name"],
	)

	return {
		"country_code": code,
		"country": config["name"],
		"full_name": full_name,
		"address": {
			"street": street,
			"city": city,
			"region": region,
			"postal_code": postal_code,
			"country": config["name"],
			"formatted": formatted_address,
		},
	}


def list_supported_countries() -> list[dict[str, str]]:
	return [
		{"code": code, "name": data["name"]}
		for code, data in sorted(SUPPORTED_COUNTRIES.items(), key=lambda item: item[1]["name"])
	]


def generate_fake_identity(country_code: str) -> dict:
	if not country_code or not country_code.strip():
		raise ValueError("Country code is required.")
	return _build_identity(country_code.strip().upper())
