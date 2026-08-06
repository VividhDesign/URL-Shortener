# ⚡ SnapLink — URL Shortener

> A fast, production-grade URL shortener with real-time analytics, geo-tracking, Redis caching, and rate limiting.

**Live Demo:** [url-shortener-peach-five.vercel.app](https://url-shortener-peach-five.vercel.app)

---

## ✨ Features

| Feature | Details |
|---|---|
| 🔗 **URL Shortening** | Paste any long URL and get a 6-character base62 short code instantly |
| ♻️ **Deduplication** | Same URL → same short link (no duplicates in the database) |
| ⏳ **Expiry Support** | Set a TTL in days; MongoDB TTL index auto-deletes expired links |
| 📊 **Click Analytics** | Total clicks, first/last click timestamps |
| 🌍 **Geo Tracking** | Country-level tracking via `geoip-lite` from IP address |
| 📱 **Device Breakdown** | Mobile / Tablet / Desktop detection via `ua-parser-js` |
| 🔗 **Referrer Tracking** | Where clicks come from (direct, social, etc.) |
| ⚡ **Redis Caching** | Redirect lookups served from Upstash Redis (cache-aside pattern) |
| 🛡️ **Rate Limiting** | Global: 100 req / 15 min · Shorten endpoint: 10 req / min per IP |

---

## 🏗️ Architecture

```
┌─────────────────────┐         ┌──────────────────────┐
│   React + Vite      │  HTTP   │   Express.js API      │
│   (Vercel)          │ ──────► │   (Render)            │
└─────────────────────┘         └──────────┬───────────┘
                                           │
                          ┌────────────────┼────────────────┐
                          ▼                ▼                ▼
                   ┌────────────┐  ┌────────────┐  ┌────────────┐
                   │  MongoDB   │  │   Redis    │  │ geoip-lite │
                   │  (Atlas)   │  │ (Upstash)  │  │ (bundled)  │
                   └────────────┘  └────────────┘  └────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, React Router v7, Vite 8 |
| **Backend** | Node.js, Express 5 |
| **Database** | MongoDB (Mongoose) |
| **Cache** | Redis via `ioredis` (Upstash) |
| **Geo IP** | `geoip-lite` |
| **User Agent** | `ua-parser-js` |
| **Rate Limiting** | `express-rate-limit` |
| **Hosting** | Frontend → Vercel · Backend → Render |

---

## 📁 Project Structure

```
URL-Shortener/
├── client/                  # React + Vite frontend
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx     # URL shortening form
│   │   │   └── Analytics.jsx# Analytics dashboard
│   │   ├── api.js           # API call helpers
│   │   ├── App.jsx          # Router setup
│   │   ├── main.jsx         # React entry point
│   │   └── index.css        # Global styles
│   ├── vercel.json          # SPA rewrite rule for Vercel
│   └── vite.config.js
│
├── server/                  # Node.js + Express backend
│   ├── config/
│   │   ├── db.js            # MongoDB connection
│   │   └── redis.js         # Redis singleton
│   ├── controllers/
│   │   ├── url.controller.js
│   │   └── analytics.controller.js
│   ├── middleware/
│   │   └── rateLimiter.js   # API + shorten rate limiters
│   ├── models/
│   │   ├── Url.js           # URL document schema
│   │   └── Analytics.js     # Click event schema
│   ├── routes/
│   │   ├── url.routes.js
│   │   └── analytics.routes.js
│   ├── services/
│   │   ├── url.service.js   # Shortening + cache logic
│   │   └── analytics.service.js # Aggregation pipelines
│   ├── utils/
│   │   └── shortCode.js     # Base62 ID generator
│   ├── validators/
│   │   └── url.validator.js
│   └── index.js             # Express app entry point
│
├── .env.example             # Environment variable template
├── .gitignore
└── package.json             # Backend dependencies + scripts
```

---

## 🔌 API Reference

### URL Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/shorten` | Shorten a URL |
| `GET` | `/:code` | Redirect to original URL |
| `GET` | `/api/info/:code` | Get URL metadata (no redirect) |

### Analytics Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/analytics/:code` | Summary (clicks, dates, URLs) |
| `GET` | `/api/analytics/:code/countries` | Top 10 countries |
| `GET` | `/api/analytics/:code/devices` | Device breakdown |
| `GET` | `/api/analytics/:code/referrers` | Top 10 referrers |
| `GET` | `/api/analytics/:code/daily` | Daily clicks (last 30 days) |

**Example — Shorten a URL:**
```bash
curl -X POST https://your-api.onrender.com/api/shorten \
  -H "Content-Type: application/json" \
  -d '{ "longUrl": "https://example.com/very/long/url", "expiresInDays": 7 }'
```

**Response:**
```json
{
  "message": "URL shortened successfully!",
  "shortUrl": "https://your-api.onrender.com/aB3xYz",
  "shortCode": "aB3xYz",
  "longUrl": "https://example.com/very/long/url",
  "expiresAt": "2025-08-14T00:00:00.000Z"
}
```

---

## ⚙️ Prerequisites

- **Node.js** v18+ (`brew install node`)
- **MongoDB** — [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier)
- **Redis** — [Upstash](https://upstash.com/) (free tier, serverless Redis)

---

## 🚀 Running Locally

### 1. Clone the repository

```bash
git clone https://github.com/VividhDesign/URL-Shortener.git
cd URL-Shortener
```

### 2. Configure environment variables

```bash
cp .env.example .env
# Edit .env with your MongoDB Atlas URI, Redis URL, etc.
```

### 3. Install dependencies

```bash
# Backend
npm install

# Frontend
cd client && npm install && cd ..
```

### 4. Start both servers

**Terminal 1 — Backend** (runs on `http://localhost:5000`):
```bash
npm run dev
```

**Terminal 2 — Frontend** (runs on `http://localhost:5173`):
```bash
cd client && npm run dev
```

Open **http://localhost:5173** in your browser. 🎉

---

## 🌐 Deployment

The app is split across two hosting platforms:

### Frontend → Vercel
1. Import the repo into [Vercel](https://vercel.com)
2. Set **Root Directory** to `client`
3. Add environment variable: `VITE_API_BASE=https://your-backend.onrender.com/api`
4. Deploy — the `client/vercel.json` handles SPA routing automatically

### Backend → Render
1. Create a new **Web Service** on [Render](https://render.com)
2. Set **Root Directory** to the repo root
3. **Build Command:** `npm install`
4. **Start Command:** `npm start`
5. Add all environment variables from `.env.example`

---

## 🔒 Rate Limits

| Scope | Limit |
|---|---|
| All `/api/*` routes | 100 requests / 15 minutes / IP |
| `POST /api/shorten` | 10 requests / minute / IP |

---

## 📄 License

ISC © [VividhDesign](https://github.com/VividhDesign)
