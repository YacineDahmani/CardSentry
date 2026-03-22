from typing import Any, Literal

from pydantic import BaseModel, Field


CardBrand = Literal["visa", "mastercard", "amex", "discover", "unknown"]
CardType = Literal["credit", "debit"]
GenerateBrand = Literal["visa", "mastercard", "amex", "discover"]


class CardInput(BaseModel):
	number: str = Field(min_length=12, max_length=25)
	exp_month: int = Field(ge=1, le=12)
	exp_year: int = Field(ge=2000, le=2100)
	cvv: str = Field(min_length=3, max_length=4)


class ValidateRequest(BaseModel):
	cards: list[CardInput] = Field(min_length=1, max_length=500)


class GenerateRequest(BaseModel):
	count: int = Field(default=1, ge=1, le=50)
	brand: GenerateBrand = "visa"
	type: CardType = "credit"


class BinInfo(BaseModel):
	scheme: str | None = None
	brand: str | None = None
	type: str | None = None
	country: str | None = None
	bank: str | None = None
	raw: dict[str, Any] | None = None


class ValidationResult(BaseModel):
	number: str
	brand: CardBrand
	valid_luhn: bool
	valid_exp: bool
	valid_cvv: bool
	bin: BinInfo | None = None


class GeneratedCard(BaseModel):
	number: str
	exp_month: int
	exp_year: int
	cvv: str
	brand: GenerateBrand
	type: CardType

