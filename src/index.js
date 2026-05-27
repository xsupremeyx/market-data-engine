const { fetchCandles } = require('./services/binance.service');
const { candles1m } = require('./storage/candleStore');


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
    let startTime = Date.now() - (totalCandlesNeeded * 60 * 1000);
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
}

loadHistoricalCandles();