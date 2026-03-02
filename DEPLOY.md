# CryptoTraderAI — Complete Project

## 🚀 Deployment Guide

### 1. Domain Setup (Namecheap)

After purchasing `cryptotraderai.app`:

1. Go to Namecheap Dashboard → Domain List → Manage
2. Advanced DNS → Add records:
   - Type: A Record, Host: @, Value: 76.76.21.21 (Vercel)
   - Type: CNAME, Host: www, Value: cname.vercel-dns.com
3. Save changes

### 2. Frontend Deployment (Vercel)

```bash
cd frontend
npm install
npx vercel
# Follow prompts, link to your project
# Set environment variables in Vercel dashboard
```

**Vercel Environment Variables:**
- `NEXT_PUBLIC_API_URL` = https://your-backend-url.railway.app

### 3. Backend Deployment (Railway)

```bash
cd backend
railway login
railway init
railway up
```

**Railway Environment Variables:**
- `OPENAI_API_KEY` = your_openai_key
- `SUPABASE_URL` = your_supabase_url
- `SUPABASE_KEY` = your_supabase_key

### 4. Database Setup (Supabase)

1. Create project at https://supabase.com
2. Run SQL in SQL Editor:

```sql
-- Signals table
CREATE TABLE signals (
    id TEXT PRIMARY KEY,
    pair TEXT NOT NULL,
    direction TEXT NOT NULL,
    entry DECIMAL NOT NULL,
    stop_loss DECIMAL NOT NULL,
    take_profit_1 DECIMAL NOT NULL,
    take_profit_2 DECIMAL,
    confidence INTEGER NOT NULL,
    timeframe TEXT NOT NULL,
    exchange TEXT NOT NULL,
    status TEXT DEFAULT 'ACTIVE',
    wyckoff_phase TEXT,
    kill_zone TEXT,
    analysis TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Performance tracking
CREATE TABLE trades (
    id TEXT PRIMARY KEY,
    signal_id TEXT REFERENCES signals(id),
    entry_price DECIMAL,
    exit_price DECIMAL,
    result TEXT,
    pnl DECIMAL,
    closed_at TIMESTAMP
);
```

### 5. OpenAI Setup

1. Go to https://platform.openai.com
2. Create API key
3. Add to Railway environment variables

## 📁 Project Structure

```
cryptotraderai/
├── frontend/          # Next.js 14 + React + Tailwind
├── backend/           # FastAPI + Python
├── ai-prompts/        # AI generation prompts
├── README.md
├── LICENSE
└── deploy.sh
```

## 🎯 Features Implemented

- ✅ Dashboard with metrics
- ✅ Signal cards with Wyckoff/SMC/Kill Zone
- ✅ Kill Zone status (live timing)
- ✅ AI signal generation (OpenAI GPT-4)
- ✅ Binance API integration
- ✅ FastAPI backend
- ✅ Responsive design
- ✅ Dark theme

## 🛠 Next Steps

1. Buy domain on Namecheap
2. Deploy frontend to Vercel
3. Deploy backend to Railway
4. Set up Supabase database
5. Add OpenAI API key
6. Test signal generation

## 📞 Support

All code is ready. Need help with deployment? Just ask!
