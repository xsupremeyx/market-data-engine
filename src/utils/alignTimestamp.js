function alignTimestamp(timestamp, timeframeMinutes){

    const timeframeMs =
        timeframeMinutes * 60 * 1000;

    return Math.floor(timestamp / timeframeMs) * timeframeMs;
}

module.exports = {
    alignTimestamp,
};