const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

app.get('/candles/:timeframe', (req, res) => {

    const timeframe =
        req.params.timeframe;

    const filePath =
        path.join(

            __dirname,

            'data',

            `${timeframe}.json`
        );

    const candles =
        JSON.parse(
            fs.readFileSync(filePath)
        );

    const formatted =
        candles.map(candle => ({

            time:
                candle.time / 1000,

            open:
                candle.open,

            high:
                candle.high,

            low:
                candle.low,

            close:
                candle.close,
        }));
    
    res.json(formatted);
});

app.use(express.static('public'));

app.listen(3000, () => {

    console.log(
        'Chart server running on http://localhost:3000'
    );
});