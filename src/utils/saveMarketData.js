const fs = require('fs');
const path = require('path');

function saveMarketData(marketData){

    const dataDir =
        path.join(__dirname, '../../data');

    if(!fs.existsSync(dataDir)){

        fs.mkdirSync(dataDir);
    }

    for(const timeframe in marketData){

        const candles =
            marketData[timeframe].toArray();

        const filePath =
            path.join(
                dataDir,
                `${timeframe}.json`
            );

        fs.writeFileSync(

            filePath,

            JSON.stringify(
                candles,
                null,
                2
            )
        );
    }

    console.log(
        'Market data saved to /data'
    );
}

module.exports = {
    saveMarketData,
};