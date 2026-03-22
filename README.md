# CardSentry

CardSentry is a professional credit card utility for developers and testers. It provides validation via the Luhn algorithm, expiry/BIN analysis, and a built-in test card generator.

## Project Structure
```text
cardsentry/
├── backend/
│   ├── app/
│   │   ├── main.py              # Application entry and routing
│   │   ├── models.py            # Data models and validation logic
│   │   ├── services/            # Core business logic
│   │   │   ├── validator.py     # Luhn and card validation
│   │   │   ├── generator.py     # Test card generation
│   │   │   └── bin_lookup.py    # BIN information retrieval
│   │   ├── database.py          # SQLite integration for history/cache
│   │   └── middleware.py        # Security and rate limiting
│   └── requirements.txt         # Backend dependencies
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── hooks/               # Custom React hooks for API interaction
│   │   ├── App.jsx              # Main application orchestrator
│   │   └── index.css            # Global styles and Tailwind configuration
│   ├── tailwind.config.js       # Custom retro theme settings
│   ├── vite.config.js           # Frontend build configuration
│   └── package.json             # Frontend dependencies
└── README.md                    # Project documentation
```

## Tech Stack
### Frontend
- **React.js (Vite)**: For a fast and responsive user experience.
- **Tailwind CSS**: Custom retro-themed styling (CRT/Punch-card aesthetic).
- **Axios**: Promised-based HTTP requests for API communication.
- **React Hook Form**: Simplified form management.
- **Heroicons**: Clean, modern icons for navigation.

### Backend
- **FastAPI**: High-performance, secure asynchronous web framework.
- **SQLite**: Lightweight database for caching and session management.
- **Pydantic**: Robust data validation and settings management.
- **SlowAPI**: Integrated rate limiting to ensure API stability.
- **Faker**: Used for generating realistic-looking test data.

## Features
- **Validation**: Check card numbers against the Luhn algorithm, expiry consistency, and BIN details.
- **Generation**: Generate valid test card numbers (Visa, Mastercard, etc.) for testing environments.
- **Bulk Processing**: Perform validation on multiple card entries simultaneously.
- **Design**: Retro-inspired UI with a professional charcoal, teal, and green color palette.

## Getting Started
1. **Clone the repository**
   ```bash
   git clone https://github.com/YacineDahmani/CardSentry.git
   ```
2. **Setup Backend**
   - Navigate to `backend/`
   - Run `pip install -r requirements.txt`
   - Start with `uvicorn app.main:app --reload`
3. **Setup Frontend**
   - Navigate to `frontend/`
   - Run `npm install`
   - Start with `npm run dev`

## Disclaimer
All generated card numbers are intended solely for development and testing purposes. These are not real credit cards and cannot be used for any actual monetary transactions.
