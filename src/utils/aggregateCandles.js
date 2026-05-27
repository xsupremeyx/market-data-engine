const { alignTimestamp } = require('./alignTimestamp');



function aggregateCandles(candles, timeframeMinutes){

    const buckets = {};

    for(const candle of candles){

        const bucketTime = alignTimestamp(
            candle.time,
            timeframeMinutes
        );

        if(!buckets[bucketTime]){

            buckets[bucketTime] = {

                time: bucketTime,

                open: candle.open,

                high: candle.high,

                low: candle.low,

                close: candle.close,

                volume: candle.volume,
            };

        } else {

            buckets[bucketTime].high = Math.max(
                buckets[bucketTime].high,
                candle.high
            );

            buckets[bucketTime].low = Math.min(
                buckets[bucketTime].low,
                candle.low
            );

            buckets[bucketTime].close =
                candle.close;

            buckets[bucketTime].volume +=
                candle.volume;
        }
    }

    return Object.values(buckets);
}

module.exports = {
    aggregateCandles,
};