const Denque = require('denque');

const marketData = {

    "1m": new Denque(),

    "5m": new Denque(),

    "15m": new Denque(),

    "1h": new Denque(),

    "4h": new Denque(),

    "1d": new Denque(),
};

module.exports = {
    marketData,
};