# CryptoStream — Real-Time Cryptocurrency Dashboard

A production-grade, real-time cryptocurrency tracking dashboard built with React, Zustand, and WebSockets. Tracks live prices from the Binance WebSocket API with initial market data from CoinGecko.

---

## Features

- **Live Price Updates** — WebSocket connection to Binance streams with automatic reconnect (exponential backoff)
- **100 Cryptocurrencies** — Top 100 by market cap via CoinGecko API
- **Sparkline Charts** — 7-day SVG sparklines per coin in the main list
- **Detail Modal** — Full price chart (1D/7D/30D/90D) with stats on click
- **Portfolio Tracker** — Add holdings with quantity + purchase price; calculates total value and P&L
- **Price Alerts** — Set above/below price targets; visual notifications when triggered
- **Search / Filter** — Real-time filter by name or symbol
- **Dark / Light Theme** — Toggle with persistent preference
- **Data Persistence** — Portfolio and alerts stored in `localStorage`
- **Fully Dockerized** — Single `docker-compose up` to build and run

---

## Quick Start

### With Docker (Recommended)

```bash
# Clone the repository
git clone <repo-url>
cd crypto-dashboard

# Copy env file (defaults already set)
cp .env.example .env

# Build and start
docker-compose up --build

# App is available at:
open http://localhost:8080
```

### Local Development

Requires Node.js 18+.


```bash
# Install dependencies
npm install --legacy-peer-deps

# Start dev server
npm start
# Available at http://localhost:3000
```

---

## Environment Variables

See `.env.example`:

| Variable | Default | Description |
|---|---|---|
| `REACT_APP_BINANCE_WS_URL` | `wss://stream.binance.com:9443/ws` | Binance WebSocket endpoint |
| `REACT_APP_COINGECKO_API_URL` | `https://api.coingecko.com/api/v3` | CoinGecko REST API base URL |

---

## Architecture

```
src/
├── App.js                    # Root component, data bootstrap, WS init
├── index.js                  # React entry point
├── index.css                 # Global styles, CSS variables (light/dark)
│
├── store/
│   └── useCryptoStore.js     # Zustand global store
│
├── hooks/
│   └── useWebSocket.js       # WS lifecycle hook with retry logic
│
├── services/
│   └── coinGeckoService.js   # REST API calls
│
├── utils/
│   └── formatters.js         # Number/currency formatters
│
├── components/
│   ├── Header.jsx             # Navigation, theme switcher, WS status
│   ├── SearchBar.jsx          # Filtered search input
│   ├── CryptoTableRow.jsx     # Single row (memoized, with flash animation)
│   ├── Sparkline.jsx          # SVG sparkline chart
│   ├── PriceChart.jsx         # Recharts area chart (detail view)
│   ├── CoinDetailModal.jsx    # Coin detail overlay
│   ├── PortfolioModal.jsx     # Add holding form
│   ├── AlertManager.jsx       # Set price alert form
│   └── AlertNotifications.jsx # Triggered alert toasts
│
└── pages/
    ├── Dashboard.jsx          # Main crypto list view
    ├── Portfolio.jsx          # Portfolio holdings view
    └── Alerts.jsx             # Active alerts view
```

---

## LocalStorage Schema

### Portfolio (`cryptoPortfolio`)

```json
[
  {
    "id": "bitcoin",
    "quantity": 0.5,
    "purchasePrice": 45000
  }
]
```

### Alerts (`cryptoAlerts`)

```json
[
  {
    "id": "ethereum",
    "targetPrice": 3000,
    "condition": "above"
  }
]
```

---

## Test IDs Reference

| Element | data-testid |
|---|---|
| Crypto row | `crypto-row-BTCUSDT` |
| Live price | `price-BTCUSDT` |
| 24h change | `price-change-24h-BTCUSDT` |
| Sparkline | `sparkline-BTCUSDT` |
| Search input | `search-input` |
| Theme switcher | `theme-switcher` |
| Portfolio item | `portfolio-item-bitcoin` |
| Portfolio total value | `portfolio-total-value` |
| Portfolio P/L | `portfolio-pl` |
| Price chart | `price-chart` |
| Alert notification | `alert-notification-bitcoin` |

### WebSocket State

```javascript
// Access in browser console:
window.getWebSocketState() // → "OPEN" | "CONNECTING" | "CLOSING" | "CLOSED"
```

---

## Docker Health Check

The app serves a `/health` endpoint via Nginx returning `200 OK`. The `docker-compose.yml` health check polls this every 30 seconds.

```bash
# Verify health
curl http://localhost:8080/health
# → OK
```

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 |
| State | Zustand 4 |
| Charts | Recharts 2 |
| Fonts | Syne + Space Mono |
| Styling | CSS-in-JS (inline) + CSS variables |
| Data (REST) | CoinGecko Public API |
| Data (WS) | Binance WebSocket Streams |
| Server | Nginx (Alpine) |
| Container | Docker + Docker Compose |
