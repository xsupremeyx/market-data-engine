const axios = require('axios');

const BASE_URL =
    'https://api.twelvedata.com';

async function fetchCandles(
    symbol,
    interval = '1min',
    outputsize = 5000,
    timezone = 'UTC')
    {
    try{
        const response =
            await axios.get(
                `${BASE_URL}/time_series`,
                {
                    params: {
                        symbol,
                        interval,
                        outputsize,
                        timezone,
                        apikey: process.env.API_KEY,
                    },
                }
            );
        if(
            response.data.status === 'error'
        ){

            console.error(
                'TwelveData Error:',
                response.data.message
            );
            return [];
        }
        return response.data.values || [];
    } catch(error){
        console.error(
            'Error fetching TwelveData candles:',
            error.message
        );
        return [];
    }
}
module.exports = {
    fetchCandles,
};