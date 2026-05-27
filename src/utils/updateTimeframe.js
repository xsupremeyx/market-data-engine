const { alignTimestamp } = require('./alignTimestamp');

function updateTimeframe(
    timeframeCandles,
    newCandle,
    timeframeMinutes
){

    const bucketTime = alignTimestamp(
        newCandle.time,
        timeframeMinutes
    );

    const lastCandle =
        timeframeCandles.peekBack();

    if(
        !lastCandle ||
        lastCandle.time !== bucketTime
    ){

        timeframeCandles.push({

            time: bucketTime,

            open: newCandle.open,

            high: newCandle.high,

            low: newCandle.low,

            close: newCandle.close,

            volume: newCandle.volume,
        });

    } else {

        lastCandle.high = Math.max(
            lastCandle.high,
            newCandle.high
        );

        lastCandle.low = Math.min(
            lastCandle.low,
            newCandle.low
        );

        lastCandle.close =
            newCandle.close;

        lastCandle.volume +=
            newCandle.volume;
    }
}

module.exports = {
    updateTimeframe,
};