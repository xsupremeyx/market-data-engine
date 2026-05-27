const { fetchCandles } = require('./services/binance.service');
const { marketData } = require('./storage/candleStore');
const { aggregateCandles } = require('./utils/aggregateCandles');
const { alignTimestamp } = require('./utils/alignTimestamp');   

const { updateTimeframe } = require('./utils/updateTimeframe');
const { startBinanceWebSocket } = require('./services/binance.websocket');
const { enforceLimit } = require('./utils/enforceLimit');

function sleep(ms){
    return new Promise((resolve) =>
        setTimeout(resolve, ms)
    );
}

const limits = {
        "1m": 100000,

        "5m": 50000,

        "15m": 25000,

        "1h": 10000,

        "4h": 5000,

        "1d": 2000,
}

async function loadHistoricalCandles(){
    const symbol = 'BTCUSDT';
    const interval = '1m';
    const totalCandlesNeeded = 3000;
    let fetchedCandles = 0;
    let startTime = alignTimestamp(Date.now() - (totalCandlesNeeded * 60 * 1000),1);

    while(fetchedCandles < totalCandlesNeeded){
        console.log(`Fetching candles from: ${new Date(startTime).toISOString()}`);
        const rawCandles = await fetchCandles(symbol, interval, 1000, startTime);
        if(rawCandles.length === 0){
            console.log('No more candles to fetch.');
            break;
        }
        const formattedCandles = rawCandles.map((candle) => ({
            time: candle[0],
            open: Number(candle[1]),
            high: Number(candle[2]),
            low: Number(candle[3]),
            close: Number(candle[4]),
            volume: Number(candle[5]),
        }));
        for(const candle of formattedCandles){
            marketData["1m"].push(candle);
        }
        enforceLimit(
            marketData["1m"],
            limits["1m"]
        );


        fetchedCandles += formattedCandles.length;
        console.log(`Fetched ${fetchedCandles} candles so far...`);
        const lastCandle = formattedCandles[formattedCandles.length - 1];

        startTime = lastCandle.time + 60*1000;
        await sleep(300);

    }

    marketData['5m'].clear();
    marketData['15m'].clear();
    marketData['1h'].clear();
    marketData['4h'].clear();
    marketData['1d'].clear();

    const candles1mArray = marketData["1m"].toArray();

    for(const candle of aggregateCandles(
        candles1mArray,
        5
    )){
        marketData['5m'].push(candle);
    }

    enforceLimit(
        marketData["5m"],
        limits["5m"]
    );

    for(const candle of aggregateCandles(
        candles1mArray,
        15
    )){
        marketData['15m'].push(candle);
    }

    enforceLimit(
        marketData["15m"],
        limits["15m"]
    );

    for(const candle of aggregateCandles(
        candles1mArray,
        60
    )){
        marketData['1h'].push(candle);
    }

    enforceLimit(
        marketData["1h"],
        limits["1h"]
    );

    for(const candle of aggregateCandles(
        candles1mArray,
        240
    )){
        marketData['4h'].push(candle);
    }

    enforceLimit(
        marketData["4h"],
        limits["4h"]
    );

    for(const candle of aggregateCandles(
        candles1mArray,
        1440
    )){
        marketData['1d'].push(candle);
    }

    enforceLimit(
        marketData["1d"],
        limits["1d"]
    );

    console.log('\nMarket Data Summary:\n');

    for(const timeframe in marketData){

        console.log(
            `${timeframe}: ${marketData[timeframe].length} candles`
        );

        if(marketData[timeframe].length > 0){

            console.log(
                `First: ${
                    new Date(
                        marketData[timeframe]
                            .peekFront()
                            .time
                    ).toISOString()
                }`
            );

            console.log(
                `Last: ${
                    new Date(
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

async function main(){

    await loadHistoricalCandles();

    console.log(
        'Starting live websocket stream...'
    );

    const timeframeConfig = {

            "5m": 5,

            "15m": 15,

            "1h": 60,

            "4h": 240,

            "1d": 1440,
    };

    startBinanceWebSocket((candle) => {

        if(!candle.isClosed){
            return;
        }

        console.log(
            `[LIVE] ${new Date(candle.time).toISOString()} Close: ${candle.close}`
        );

        const last1m = marketData["1m"].peekBack();

        if(
            !last1m ||
            last1m.time !== candle.time
        ){

            marketData["1m"].push(candle);
            enforceLimit(marketData["1m"], limits["1m"]);

            for(const timeframe in timeframeConfig){

                updateTimeframe(

                    marketData[timeframe],

                    candle,

                    timeframeConfig[timeframe]
                );
                enforceLimit(marketData[timeframe],

                    limits[timeframe]
                );
            }
        }

        console.log(
            '1m candles:',
            marketData["1m"].length
        );

        console.log(
            `Closed 1m candle: ${
                candle.close
            }`
        );
        console.log(
            `5m candles: ${
                marketData["5m"].length
            }`
        );

    });
}

main();