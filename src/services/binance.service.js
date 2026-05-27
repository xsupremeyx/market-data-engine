const axios = require('axios');

const BASE_URL = 'https://api.binance.com';

async function fetchCandles(symbol, interval, limit = 1000, startTime){
    try{
        const response = await axios.get(
            `${BASE_URL}/api/v3/klines`,
            {
                params: {
                    symbol,
                    interval,
                    limit,
                    startTime,
                },
            }
        );
        return response.data;
    }

    catch(error){
        console.error('Error fetching candles from Binance:', error.message);
        return [];
    }
}

module.exports = {
    fetchCandles,
}