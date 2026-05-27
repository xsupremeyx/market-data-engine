const { fetchCandles } = require('./services/binance.service');
const { marketData } = require('./storage/candleStore');
const { aggregateCandles } = require('./utils/aggregateCandles');
const { alignTimestamp } = require('./utils/alignTimestamp');   


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

loadHistoricalCandles();