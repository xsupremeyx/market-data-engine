const dotenv = require('dotenv');
dotenv.config();

const {saveMarketData} = require('./utils/saveMarketData');

const { normalizeTwelveDataCandle } = require('./utils/normalizeTwelveDataCandle');
const { fetchCandles } = require('./services/twelvedata.service');
const { marketData } = require('./storage/candleStore');
const { aggregateCandles } = require('./utils/aggregateCandles');

const { updateTimeframe } = require('./utils/updateTimeframe');
const { enforceLimit } = require('./utils/enforceLimit');

const SYMBOL = 'USD/JPY';
const INTERVAL = '1min';

let isPolling = false;
const timeframeConfig = {
    "5m": 5,
    "15m": 15,
    "1h": 60,
    "4h": 240,
    "1d": 1440,
};

const limits = {
    "1m": 100000,
    "5m": 50000,
    "15m": 25000,
    "1h": 10000,
    "4h": 5000,
    "1d": 2000,
}



async function loadHistoricalCandles() {
    const totalCandlesNeeded = 3000;
    console.log('Fetching historical candles...');
    console.log(`Symbol: ${SYMBOL}`);

    const rawCandles =
        await fetchCandles(
            SYMBOL,
            INTERVAL,
            totalCandlesNeeded
        );

    if (rawCandles.length === 0) {

        console.log('No candles fetched.');

        return;
    }

    const formattedCandles =
        rawCandles
            .reverse()
            .map(normalizeTwelveDataCandle);
    for (const candle of formattedCandles) {
        marketData["1m"].push(candle);
    }
    enforceLimit(
        marketData["1m"],
        limits["1m"]
    );

    console.log(
        `Fetched ${formattedCandles.length} candles`
    );
    const candles1mArray = marketData["1m"].toArray();
    for (const timeframe in timeframeConfig) {
        marketData[timeframe].clear();
        const aggregatedCandles =
            aggregateCandles(
                candles1mArray,
                timeframeConfig[timeframe]
            );

        for (const candle of aggregatedCandles) {
            marketData[timeframe].push(candle);
        }

        enforceLimit(
            marketData[timeframe],
            limits[timeframe]
        );
    }

    console.log('\nMarket Data Summary:\n');

    for (const timeframe in marketData) {

        console.log(
            `${timeframe}: ${marketData[timeframe].length} candles`
        );

        if (marketData[timeframe].length > 0) {

            console.log(
                `First: ${new Date(
                    marketData[timeframe]
                        .peekFront()
                        .time
                ).toISOString()
                }`
            );

            console.log(
                `Last: ${new Date(
                    marketData[timeframe]
                        .peekBack()
                        .time
                ).toISOString()
                }`
            );

            console.log('---');
        }
    }
}


async function pollLatestCandle() {
    const rawCandles =
        await fetchCandles(
            SYMBOL,
            INTERVAL,
            1
        );

    if (rawCandles.length === 0) {
        console.log('No latest candle fetched.');
        return;
    }

    const latestRaw = rawCandles[0];

    const candle = normalizeTwelveDataCandle(latestRaw);

    const last1m = marketData["1m"].peekBack();

    if (last1m && last1m.time === candle.time) {
        console.log('[LIVE] Waiting for next candle...');
        return;
    }

    marketData["1m"].push(candle);

    enforceLimit(
        marketData["1m"],
        limits["1m"]
    );

    for (const timeframe in timeframeConfig) {
        updateTimeframe(
            marketData[timeframe],
            candle,
            timeframeConfig[timeframe]
        );
        enforceLimit(
            marketData[timeframe],
            limits[timeframe]
        );
    }
    console.log(`[LIVE] ${new Date(candle.time).toISOString()} Close: ${candle.close}`);
    console.log(`1m candles: ${marketData["1m"].length}`);
    console.log(`5m candles: ${marketData["5m"].length}`);
    saveMarketData(marketData);
}

function startLivePolling() {
    async function poll() {
        if (isPolling) {
            return;
        }
        isPolling = true;
        try {
            await pollLatestCandle();
        } catch (error) {
            console.error(
                'Polling error:',
                error.message
            );
        } finally {
            isPolling = false;
            scheduleNextPoll();
        }
    }

    function scheduleNextPoll() {
        const now = new Date();
        const delay =
            (60 - now.getSeconds()) * 1000
            - now.getMilliseconds()
            + 2000;
        setTimeout(poll, delay);
    }
    scheduleNextPoll();
}


async function main() {
    await loadHistoricalCandles();
    saveMarketData(marketData);
    console.log(
        `Latest 1m candle: ${new Date(
            marketData["1m"]
                .peekBack()
                .time
        ).toISOString()
        }`
    );
    console.log(
        'Starting live polling...'
    );
    startLivePolling();
}

main();