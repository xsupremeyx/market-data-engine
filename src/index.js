const { fetchCandles } = require('./services/binance.service');
const { marketData } = require('./storage/candleStore');
const { aggregateCandles } = require('./utils/aggregateCandles');
const { alignTimestamp } = require('./utils/alignTimestamp');   

const { updateTimeframe } = require('./utils/updateTimeframe');
const { startBinanceWebSocket } = require('./services/binance.websocket');


function sleep(ms){
    return new Promise((resolve) =>
        setTimeout(resolve, ms)
    );
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
        marketData["1m"].push(...formattedCandles);
        fetchedCandles += formattedCandles.length;
        console.log(`Fetched ${fetchedCandles} candles so far...`);
        const lastCandle = formattedCandles[formattedCandles.length - 1];

        startTime = lastCandle.time + 60*1000;
        await sleep(300);

    }

    marketData['5m'] = aggregateCandles(marketData["1m"], 5); 
    marketData['15m'] = aggregateCandles(marketData["1m"], 15); 
    marketData['1h'] = aggregateCandles(marketData["1m"], 60); 
    marketData['4h'] = aggregateCandles(marketData["1m"], 240); 
    marketData['1d'] = aggregateCandles(marketData["1m"], 1440); 
    console.log('\nMarket Data Summary:\n');

    for(const timeframe in marketData){

        console.log(
            `${timeframe}: ${marketData[timeframe].length} candles`
        );

        if(marketData[timeframe].length > 0){

            console.log(
                `First: ${
                    new Date(
                        marketData[timeframe][0].time
                    ).toISOString()
                }`
            );

            console.log(
                `Last: ${
                    new Date(
                        marketData[timeframe][
                            marketData[timeframe].length - 1
                        ].time
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

        const last1m =
            marketData["1m"][
                marketData["1m"].length - 1
            ];

        if(
            !last1m ||
            last1m.time !== candle.time
        ){

            marketData["1m"].push(candle);

            for(const timeframe in timeframeConfig){

                updateTimeframe(

                    marketData[timeframe],

                    candle,

                    timeframeConfig[timeframe]
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