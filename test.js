const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

async function main() {
    try {
        const response =
            await axios.get(
                "https://api.twelvedata.com/time_series",
                {
                    params: {

                        symbol: "USD/JPY",

                        interval: "1min",

                        outputsize: 10,
                        timezone: "UTC",
                        apikey: process.env.API_KEY,
                    },
                }
            );
        console.log(response.data.meta);
        console.log(response.data);
    } catch (error) {
        console.error(error.response?.data || error.message);
    }
}
main();