const { fetchCandles } = require('./services/binance.service');
const { candles1m } = require('./storage/candleStore');
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
        candles1m.push(...formattedCandles);
        fetchedCandles += formattedCandles.length;
        console.log(`Fetched ${fetchedCandles} candles so far...`);
        const lastCandle = formattedCandles[formattedCandles.length - 1];

        startTime = lastCandle.time + 60*1000;
        await sleep(300);

    }
    console.log(
        `Total candles stored: ${candles1m.length}`
    );

    console.log(
        'First candle:',
        new Date(candles1m[0].time).toISOString()
    );

    console.log(
        'Last candle:',
        new Date(
            candles1m[candles1m.length - 1].time
        ).toISOString()
    );

    const candles15m = aggregateCandles(
        candles1m,
        15
    );

    console.log(
        `15m candles created: ${candles15m.length}`
    );

    console.log(
        'Sample 15m candle:',
        candles15m[0]
    );

    const candle5m = aggregateCandles(candles1m, 5); 
    const candle15m = aggregateCandles(candles1m, 15); 
    const candle60m = aggregateCandles(candles1m, 60); 
    const candle240m = aggregateCandles(candles1m, 240); 
    const candle1440m = aggregateCandles(candles1m, 1440); 
    console.log('5m, 15m, 60m, 240m, 1440m candles aggregated:'); 
    console.log(`5m candles: ${candle5m.length}, 15m candles: ${candle15m.length}, 60m candles: ${candle60m.length}, 240m candles: ${candle240m.length}, 1440m candles: ${candle1440m.length}`); 
    console.log(`first and last of all candles: `); 
    console.log(`1m first: ${new Date(candles1m[0].time).toISOString()}, 1m last: ${new Date(candles1m[candles1m.length - 1].time).toISOString()}`); 
    console.log(`5m first: ${new Date(candle5m[0].time).toISOString()}, 5m last: ${new Date(candle5m[candle5m.length - 1].time).toISOString()}`); 
    console.log(`15m first: ${new Date(candle15m[0].time).toISOString()}, 15m last: ${new Date(candle15m[candle15m.length - 1].time).toISOString()}`); 
    console.log(`60m first: ${new Date(candle60m[0].time).toISOString()}, 60m last: ${new Date(candle60m[candle60m.length - 1].time).toISOString()}`); 
    console.log(`240m first: ${new Date(candle240m[0].time).toISOString()}, 240m last: ${new Date(candle240m[candle240m.length - 1].time).toISOString()}`); 
    console.log(`1440m first: ${new Date(candle1440m[0].time).toISOString()}, 1440m last: ${new Date(candle1440m[candle1440m.length - 1].time).toISOString()}`);
}

loadHistoricalCandles();