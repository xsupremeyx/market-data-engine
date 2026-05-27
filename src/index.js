const { fetchCandles } = require('./services/binance.service');
const { candles1m } = require('./storage/candleStore');

async function main(){
    console.log('Fetching candles...');

    const rawCandles = await fetchCandles('BTCUSDT', '1m', 10);
    const formattedCandles = rawCandles.map((candle) => ({
        time: candle[0],
        open: Number(candle[1]),
        high: Number(candle[2]),
        low: Number(candle[3]),
        close: Number(candle[4]),
        volume: Number(candle[5]),
    }));

    candles1m.push(...formattedCandles);
    console.log('Candles stored in memory:', candles1m);
    console.log(new Date(candles1m[0].time));
}

main();