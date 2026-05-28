function normalizeTwelveDataCandle(rawCandle){
    return {
        time: new Date(rawCandle.datetime + ' UTC').getTime(),
        open: Number(rawCandle.open),
        high: Number(rawCandle.high),
        low: Number(rawCandle.low),
        close: Number(rawCandle.close),
        volume: Number(rawCandle.volume || 0),
    };
}

module.exports = {
    normalizeTwelveDataCandle,
};