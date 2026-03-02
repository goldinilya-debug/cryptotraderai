# CryptoTraderAI — AI-Powered Crypto Trading Signals

Modern web application for AI-generated cryptocurrency trading signals with Wyckoff analysis, Smart Money Concepts (SMC), and ICT Kill Zones.

## 🚀 Tech Stack

- **Frontend:** Next.js 14 + React + TypeScript + Tailwind CSS
- **Backend:** Python FastAPI
- **AI:** OpenAI GPT-4 for signal generation
- **Database:** Supabase (PostgreSQL)
- **Charts:** Lightweight Charts by TradingView
- **Deployment:** Vercel (frontend) + Railway (backend)

## 📁 Project Structure

```
cryptotraderai/
├── frontend/                 # Next.js application
│   ├── app/                  # App router
│   │   ├── page.tsx          # Dashboard
│   │   ├── signals/page.tsx  # Signals list
│   │   ├── analysis/page.tsx # Market analysis
│   │   └── api/              # API routes
│   ├── components/           # React components
│   ├── lib/                  # Utilities
│   └── public/               # Static assets
├── backend/                  # FastAPI application
│   ├── app/
│   │   ├── main.py          # Entry point
│   │   ├── routers/         # API endpoints
│   │   ├── services/        # Business logic
│   │   └── models/          # Data models
│   └── requirements.txt
├── ai-prompts/              # AI generation prompts
└── docs/                    # Documentation
```

## 🛠 Quick Start

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## 📝 Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

### Backend (.env)
```
OPENAI_API_KEY=your_openai_key
BINANCE_API_KEY=your_binance_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

## 📊 Features

- AI-generated trading signals (LONG/SHORT)
- Wyckoff phase detection
- ICT Kill Zone timing
- Smart Money Concepts (SMC) analysis
- Real-time price charts
- Signal performance tracking
- Risk management dashboard

## 📝 License

MIT
