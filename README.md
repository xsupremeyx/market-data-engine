# Market Data Engine

A realtime multi-timeframe crypto market data engine built with Node.js using Binance REST + WebSocket APIs.

---

# Features Implemented

## Historical Candle Loading
- Fetches historical 1-minute candles from Binance REST API
- Supports pagination using `startTime`
- Loads large datasets incrementally
- Handles API limits safely

---

## OHLCV Normalization
Raw Binance candles are transformed into normalized candle objects:

```js
{
    time,
    open,
    high,
    low,
    close,
    volume
}
```

---

## UTC Timeframe Alignment
Candles are aligned correctly to:
- 5m boundaries
- 15m boundaries
- 1h boundaries
- 4h boundaries
- 1d boundaries

This ensures compatibility with:
- TradingView
- exchange charts
- institutional charting systems

---

# Architecture

```text
Binance REST API
        ↓
Historical Loader
        ↓
1m Market Store
        ↓
Aggregation Engine
        ↓
Multi-Timeframe Market Data
        ↓
Realtime WebSocket Updates
        ↓
Incremental Aggregation
```

---

# Project Structure

```text
src/
│
├── services/
│   ├── binance.service.js
│   └── binance.websocket.js
│
├── storage/
│   └── candleStore.js
│
├── utils/
│   ├── aggregateCandles.js
│   ├── alignTimestamp.js
│   ├── updateTimeframe.js
│   └── enforceLimit.js
│
└── index.js
```

---

# Functions Explained

# `fetchCandles()`

File:
```text
services/binance.service.js
```

Purpose:
- Fetches historical candles from Binance REST API.

Uses:
- Axios
- `/api/v3/klines`

Parameters:
- symbol
- interval
- limit
- startTime

Returns:
- Raw Binance candle data

---

# `alignTimestamp()`

File:
```text
utils/alignTimestamp.js
```

Purpose:
- Aligns timestamps to timeframe boundaries.

Example:
```text
19:07 → 19:05 for 5m
19:14 → 19:00 for 15m
```

Why Important:
- Prevents incorrect candle grouping
- Ensures exchange-compatible aggregation

---

# `aggregateCandles()`

File:
```text
utils/aggregateCandles.js
```

Purpose:
- Converts 1m candles into higher timeframe candles.

Example:
- 1m → 5m
- 1m → 15m
- 1m → 1h

Logic:
- Open = first candle open
- High = highest high
- Low = lowest low
- Close = latest close
- Volume = summed volume

Used During:
- Historical startup aggregation

---

# `updateTimeframe()`

File:
```text
utils/updateTimeframe.js
```

Purpose:
- Incrementally updates live higher timeframe candles.

This avoids:
- rebuilding entire history
- expensive recomputation

Behavior:
- Creates new bucket on timeframe boundary
- Updates existing bucket otherwise

Example:
```text
19:03 updates current 5m candle
19:05 creates new 5m candle
```

Used During:
- Realtime websocket updates

---

# `enforceLimit()`

File:
```text
utils/enforceLimit.js
```

Purpose:
- Keeps deque sizes bounded
- Prevents memory overflow

Behavior:
- Removes oldest candles when max size exceeded

Example:
```text
100001 candles → oldest candle removed
```

---

# `startBinanceWebSocket()`

File:
```text
services/binance.websocket.js
```

Purpose:
- Connects to Binance live websocket stream

Stream Used:
```text
btcusdt@kline_1m
```

Receives:
- Live OHLCV updates
- Closed candle events

Important Field:
```js
kline.x
```

Meaning:
- true = candle closed
- false = candle still forming

---

# Market Data Store

File:
```text
storage/candleStore.js
```

Uses:
- Denque

Purpose:
- Efficient rolling candle storage
- Bounded memory usage

Structure:

```js
marketData = {
    "1m",
    "5m",
    "15m",
    "1h",
    "4h",
    "1d"
}
```

---

# Realtime Engine Flow

```text
Historical Load
        ↓
Aggregate Higher TFs
        ↓
Connect WebSocket
        ↓
Receive Closed 1m Candle
        ↓
Store Candle
        ↓
Incrementally Update:
5m
15m
1h
4h
1d
```

---

# Technologies Used

- Node.js
- Axios
- WebSocket (`ws`)
- Denque
- Binance REST API
- Binance WebSocket API

---

# Major Concepts Achieved

## Historical Pagination
Efficiently loads large historical datasets.

---

## Multi-Timeframe Aggregation
Builds higher timeframes from 1m source candles.

---

## Incremental Aggregation
Updates only affected candles in realtime.

---

## Rolling Retention
Prevents unbounded memory growth.

---

## Realtime Streaming
Consumes live Binance websocket market data.

---

## Time-Aware Candle Alignment
Maintains exchange-correct timeframe boundaries.

---

# Current Engine Capabilities

✅ Historical market loading  
✅ Realtime websocket updates  
✅ Multi-timeframe aggregation  
✅ Incremental candle updates  
✅ Bounded memory storage  
✅ Duplicate candle protection  
✅ UTC-aligned candle generation  
✅ Realtime higher timeframe updates  

---

# Next Planned Features

- Demand/Supply Zone Detection
- TradingView-style frontend
- Persistence layer
- Multi-symbol support
- Backtesting engine
- Indicator system
- Zone ranking engine

---

# Example Output

```text
[LIVE] 2026-05-27T19:10:00.000Z Close: 74972.41

1m candles: 3008
5m candles: 603
```

This shows:
- live candle ingestion
- realtime aggregation
- correct timeframe boundary creation

---

# Scalability Notes

Current architecture can scale toward:
- Crypto
- Forex
- Stocks
- Commodities
- Indices

with:
- multiple symbols
- realtime streaming
- higher timeframe generation

---

# Author Notes

This project was built as a learning-focused market infrastructure engine emphasizing:
- correct architecture
- realtime processing
- scalable data flow
- professional aggregation concepts
