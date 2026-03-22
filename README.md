# CardSentry

CardSentry is a developer-focused credit card utility for generating and validating test card data. It combines a FastAPI backend, a React/Vite frontend, local SQLite caching, and optional BIN enrichment through a third-party lookup service.

## What It Does

- Validates card data with Luhn, expiry, and CVV checks.
- Enriches validation results with BIN metadata when available.
- Generates Luhn-valid test cards for supported brands.
- Persists generated cards locally so you can inspect recent output.
- Exposes a browser UI with separate validator and generator modules.

## Stack

- Backend: FastAPI, Pydantic, httpx, SlowAPI, SQLite, python-dotenv.
- Frontend: React, Vite, Axios, Tailwind CSS, Heroicons.

## Repository Layout

```text
CardSentry/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── middleware.py
│   │   ├── models.py
│   │   └── services/
│   │       ├── bin_lookup.py
│   │       ├── generator.py
│   │       └── validator.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   ├── main.jsx
│   │   ├── components/
│   │   └── hooks/
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

## Requirements

- Python 3.11+ recommended
- Node.js 18+
- npm

## Setup

### 1. Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

Create a backend environment file at `backend/.env`:

```env
CORS_ORIGINS=*
HANDYAPI_SECRET_KEY=your_optional_bin_lookup_key
```

Start the API:

```bash
uvicorn app.main:app --reload
```

The API runs at `http://localhost:8000` by default.

### 2. Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env` if you want to point the UI at a custom API URL:

```env
VITE_API_URL=http://localhost:8000
```

Start the app:

```bash
npm run dev
```

## How It Works

### Validator

Paste one or more card lines in this format:

```text
number | MM/YY | CVV
```

The validator will:

- sanitize the number
- detect the brand
- check Luhn validity
- validate expiry and CVV formatting
- fetch BIN metadata when a lookup is available
- report external consistency status

### Generator

Choose a brand and card type, then optionally provide:

- BIN prefix
- expiry month and year
- CVV

Supported brands:

- Visa
- Mastercard
- Amex
- Discover

Generated cards are stored in local SQLite history and exposed in the UI for copy/export workflows.

## API Reference

### `GET /health`

Returns the API status.

### `POST /validate`

Validates a batch of cards.

Request:

```json
{
   "cards": [
      {
         "number": "4532110044529901",
         "exp_month": 12,
         "exp_year": 2026,
         "cvv": "993"
      }
   ]
}
```

### `POST /bulk`

Alias for `/validate`.

### `POST /generate`

Generates test cards.

Request fields:

- `count` - 1 to 50
- `brand` - `visa`, `mastercard`, `amex`, or `discover`
- `type` - `credit` or `debit`
- `bin` - optional 6 to 12 digit BIN prefix
- `exp_month` / `exp_year` - optional paired expiry override
- `cvv` - optional brand-appropriate CVV override

### `GET /generate/history?limit=100`

Returns the most recent generated cards from SQLite.

## Behavior Notes

- BIN lookups are cached locally in `cardsentry.db`.
- Validation and generation endpoints are rate-limited.
- If BIN lookup is unavailable, validation still completes and reports partial results.
- The frontend can be pointed at a different backend through `VITE_API_URL`.

## Project Notes

- Validation logic lives in `backend/app/services/validator.py`.
- Generation logic lives in `backend/app/services/generator.py`.
- BIN lookup and caching live in `backend/app/services/bin_lookup.py` and `backend/app/database.py`.
- The UI is split into `ValidatorModule` and `GeneratorModule` in `frontend/src/components/`.

## Disclaimer

CardSentry is intended for development and testing only. Generated card numbers are not real payment cards and cannot be used for actual transactions.
