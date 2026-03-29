# PersonaSentry

PersonaSentry is a retro-styled testing suite for payment QA and identity-safe sandbox workflows. It helps engineering and QA teams generate realistic test card data, validate payloads quickly, and simulate profile details for end-to-end checkout testing.



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
PersonaSentry/
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

## Environment Configuration

PersonaSentry uses environment variables for both backend and frontend. You should create `.env` files based on the provided `.env.example` templates in each respective directory.

### Backend Variables (`backend/.env`)

- `CORS_ORIGINS`: A comma-separated list of origins permitted to access the API. Use `*` to allow all (default for development) or `http://localhost:5173` for specific frontend mapping.
- `HANDYAPI_SECRET_KEY`: (Optional) Your [HandyAPI](https://handyapi.com/) secret key for BIN lookup enrichment. If omitted, basic validation still works but BIN details will be unavailable.

### Frontend Variables (`frontend/.env`)

- `VITE_API_URL`: The base URL for the backend API (e.g., `http://localhost:8000`).

## Setup

### 1. Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

Create your environment file:

```bash
cp .env.example .env
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

Create your environment file:

```bash
cp .env.example .env
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

- BIN lookups are cached locally in `personasentry.db`.
- Validation and generation endpoints are rate-limited.
- If BIN lookup is unavailable, validation still completes and reports partial results.
- The frontend can be pointed at a different backend through `VITE_API_URL`.

## Project Notes

- Validation logic lives in `backend/app/services/validator.py`.
- Generation logic lives in `backend/app/services/generator.py`.
- BIN lookup and caching live in `backend/app/services/bin_lookup.py` and `backend/app/database.py`.
- The UI is split into `ValidatorModule` and `GeneratorModule` in `frontend/src/components/`.

## Disclaimer

PersonaSentry is intended for development and testing only. Generated card numbers are not real payment cards and cannot be used for actual transactions.
