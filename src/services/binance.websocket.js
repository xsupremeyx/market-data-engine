const WebSocket = require('ws');

function startBinanceWebSocket(onCandle){

    const ws = new WebSocket(
        'wss://stream.binance.com:9443/ws/btcusdt@kline_1m'
    );

    ws.on('open', () => {

        console.log(
            'Connected to Binance WebSocket'
        );
    });

    ws.on('message', (data) => {

        const parsed = JSON.parse(data);

        const kline = parsed.k;

        const candle = {

            time: kline.t,

            open: Number(kline.o),

            high: Number(kline.h),

            low: Number(kline.l),

            close: Number(kline.c),

            volume: Number(kline.v),

            isClosed: kline.x,
        };

        onCandle(candle);
    });

    ws.on('close', () => {

        console.log(
            'WebSocket connection closed'
        );
    });

    ws.on('error', (error) => {

        console.error(
            'WebSocket error:',
            error.message
        );
    });
}

module.exports = {
    startBinanceWebSocket,
};