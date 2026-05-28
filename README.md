# Updated Market Data Engine README

This README documents the current state of the realtime forex market data engine.

Core stack:
- Node.js
- TwelveData API
- Express
- lightweight-charts
- Denque

Features implemented:
- Historical forex candle loading
- Realtime polling
- Multi-timeframe aggregation
- UTC candle alignment
- Incremental candle updates
- JSON persistence
- TradingView-style frontend chart
- Hover OHLC info
- Timeframe switching
- Rolling memory limits

Run engine:
node --watch src/index.js

Run chart:
node --watch chart-server.js

Open:
http://localhost:3000

Architecture:
TwelveData -> Polling -> Aggregation -> Storage -> Frontend

Supported timeframes:
1m
5m
15m
1h
4h
1d

Major utilities:
- aggregateCandles()
- updateTimeframe()
- alignTimestamp()
- enforceLimit()
- saveMarketData()

Data storage:
- data/1m.json
- data/5m.json
- data/15m.json
- data/1h.json
- data/4h.json
- data/1d.json

Realtime flow:
1. Poll latest 1m candle
2. Prevent duplicates
3. Store candle
4. Update higher timeframes
5. Save JSON
6. Frontend refreshes automatically

Validation:
- Compared against TradingView
- Correct UTC alignment confirmed
- Correct 5m/15m bucket rollover confirmed

Forex note:
TwelveData forex feed does not provide volume.
Volume remains 0 by design.
