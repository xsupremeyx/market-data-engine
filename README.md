# Market Data Engine

A realtime multi-timeframe forex market data engine built with Node.js using the TwelveData API and a TradingView-style visualization layer.

---

# Overview

This project ingests realtime forex market data, aggregates higher timeframe candles from 1-minute source candles, stores rolling historical datasets, and renders TradingView-style candlestick charts in the browser.

The engine currently supports:

- Historical candle loading
- Realtime candle polling
- Incremental multi-timeframe aggregation
- UTC-aligned candle generation
- Rolling memory retention
- JSON persistence
- Interactive chart visualization

---

# Core Features

## Historical Market Loading

The engine fetches historical 1-minute candles from TwelveData and loads them into memory during startup.

Capabilities:
- Fetches thousands of historical candles
- Normalizes raw provider responses
- Builds higher timeframe candles automatically
- Maintains UTC-aligned timestamps

---

## Realtime Polling Engine

The system continuously polls TwelveData for newly closed 1-minute candles.

Features:
- Duplicate candle protection
- Safe polling cycle
- Incremental updates only
- Automatic higher timeframe updates

---

## Multi-Timeframe Aggregation

Higher timeframe candles are generated internally from 1-minute candles.

Supported timeframes:

- 1m
- 5m
- 15m
- 1h
- 4h
- 1d

Aggregation logic:

- Open → first candle open
- High → highest high
- Low → lowest low
- Close → latest close
- Volume → summed volume

---

## UTC Timeframe Alignment

All candles are aligned using strict UTC bucket boundaries.

Examples:

```text
12:59 → 12:55 bucket (5m)
13:00 → 13:00 bucket (5m)
```

This ensures compatibility with:
- TradingView
- professional charting systems
- exchange-style aggregation

---

## TradingView-Style Chart Frontend

The frontend uses `lightweight-charts` for interactive candlestick rendering.

Current capabilities:

- Timeframe selector
- Live chart refresh
- OHLC hover data
- UTC timestamp display
- Responsive resizing
- Dark trading interface

---

# System Architecture

```text
TwelveData API
       ↓
Historical Loader
       ↓
1m Market Store
       ↓
Aggregation Engine
       ↓
Multi-Timeframe Candles
       ↓
Realtime Polling
       ↓
Incremental Updates
       ↓
JSON Persistence
       ↓
Chart Frontend
```

---

# Technologies Used

## Backend
- Node.js
- Axios
- Express
- Denque
- dotenv

## Frontend
- lightweight-charts

## Data Provider
- TwelveData Forex API

---

# Project Structure

```text
project/
│
├── src/
│   ├── services/
│   │   └── twelvedata.service.js
│   │
│   ├── storage/
│   │   └── candleStore.js
│   │
│   ├── utils/
│   │   ├── aggregateCandles.js
│   │   ├── alignTimestamp.js
│   │   ├── enforceLimit.js
│   │   ├── normalizeTwelveDataCandle.js
│   │   ├── saveMarketData.js
│   │   └── updateTimeframe.js
│   │
│   └── index.js
│
├── public/
│   └── index.html
│
├── data/
│   ├── 1m.json
│   ├── 5m.json
│   ├── 15m.json
│   ├── 1h.json
│   ├── 4h.json
│   └── 1d.json
│
├── .env
├── chart-server.js
└── package.json
```

---

# Important Utility Functions

## fetchCandles()

Purpose:
- Fetches candles from TwelveData REST API.

Used for:
- historical loading
- realtime polling

---

## normalizeTwelveDataCandle()

Purpose:
- Converts raw provider data into internal OHLC structure.

---

## alignTimestamp()

Purpose:
- Aligns timestamps to timeframe boundaries.

Critical for:
- correct aggregation
- TradingView-compatible candle generation

---

## aggregateCandles()

Purpose:
- Generates higher timeframe candles from 1m candles.

Used during:
- historical initialization

---

## updateTimeframe()

Purpose:
- Incrementally updates higher timeframe candles during live polling.

Benefits:
- avoids rebuilding full history
- efficient realtime updates

---

## enforceLimit()

Purpose:
- Prevents unbounded memory growth.

Behavior:
- removes oldest candles once limits are exceeded

---

## saveMarketData()

Purpose:
- Persists candle data into JSON files.

Generated files:
- 1m.json
- 5m.json
- 15m.json
- 1h.json
- 4h.json
- 1d.json

Used for:
- debugging
- validation
- frontend rendering

---

# Rolling In-Memory Storage

The engine uses `Denque` for efficient rolling candle storage.

Benefits:
- fast append/remove operations
- bounded memory usage
- efficient realtime performance

---

# Forex Volume Notes

Forex data from TwelveData does not provide centralized exchange volume.

Current behavior:

```js
volume = 0
```

This is expected for spot forex feeds and does not affect:
- OHLC accuracy
- timeframe aggregation
- market structure analysis

---

# Running The Project

## 1. Install Dependencies

```bash
npm install
```

---

## 2. Configure Environment Variables

Create:

```text
.env
```

Add:

```env
API_KEY=YOUR_TWELVEDATA_API_KEY
```

---

# Starting The Backend Engine

Open the FIRST terminal:

```bash
node --watch src/index.js
```

This process handles:
- historical loading
- realtime polling
- aggregation
- JSON persistence

---

# Starting The Chart Server

Open a SECOND terminal:

```bash
node --watch chart-server.js
```

This process serves:
- frontend chart
- candle JSON endpoints
- live visualization

---

# Opening The Frontend

Visit:

```text
http://localhost:3000
```

---

# Current Engine Capabilities

The system currently supports:

✅ Historical forex loading  
✅ Realtime polling  
✅ Multi-timeframe aggregation  
✅ Incremental candle updates  
✅ UTC-aligned candles  
✅ Rolling memory retention  
✅ JSON persistence  
✅ TradingView-style charts  
✅ Timeframe switching  
✅ OHLC hover inspection  
✅ Live frontend refresh  
✅ Duplicate candle protection  

---

# Example Runtime Output

```text
[LIVE] 2026-05-28T13:00:00.000Z Close: 159.37324

1m candles: 3002
5m candles: 602
```

This confirms:
- realtime ingestion
- correct aggregation
- proper timeframe rollover

---

# Validation

The engine has been manually validated against:
- TradingView
- TwelveData
- UTC timeframe boundaries

Confirmed correct:
- candle alignment
- aggregation logic
- timeframe rollover
- realtime updates
- frontend rendering

---

# Future Improvements

Potential future additions:

- WebSocket frontend updates
- Multi-symbol support
- BOS / CHOCH detection
- Fair Value Gap detection
- Liquidity sweep detection
- Supply / demand zones
- Replay engine
- Strategy backtesting
- Database persistence
- Alerting system

---

# Final Result

This project now functions as a realtime forex market data engine capable of:

- ingesting live forex candles
- generating higher timeframe candles
- storing rolling historical data
- rendering TradingView-style charts
- validating aggregation visually against TradingView

while maintaining:
- clean architecture
- bounded memory usage
- incremental updates
- UTC-correct candle generation
