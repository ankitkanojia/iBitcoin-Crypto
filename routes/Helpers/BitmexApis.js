const express = require('express');
const bodyparser = require('body-parser');
const request = require("request");
const app = express();
const router = express.Router();
app.use(bodyparser.json());
let date = require('date-and-time');


//SQL connection
const database = require("./database");


function SetLiveTradeData(symbol) {
    //Rule: Save bitmexdata with 3 Second interval
    database.db.query('select * from  livetradedata order by CreatedDate desc limit 1', (err, rows, fields) => {
        if (!err) {
            if (rows.length > 0) {
                let lastDate = rows[0].CreatedDate;
                // noinspection JSUnresolvedFunction
                if (date.addSeconds(lastDate, 3) <= Date.now()) {
                    request.get("https://www.bitmex.com/api/v1/trade?symbol=" + symbol + "&count=1&reverse=true", (error, response, body) => {
                        if (!error) {
                            const jsonData = JSON.parse(body);
                            if (jsonData.length > 0) {
                                database.db.query('INSERT INTO livetradedata (symbol, side, size, price, tickDirection, trdMatchID, grossValue, homeNotional, foreignNotional)\n'
                                    + 'VALUES (' +
                                    '\'' + jsonData[0].symbol + '\', ' +
                                    '\'' + jsonData[0].side + '\', ' +
                                    '\'' + jsonData[0].size + '\', ' +
                                    '\'' + jsonData[0].price + '\', ' +
                                    '\'' + jsonData[0].tickDirection + '\', ' +
                                    '\'' + jsonData[0].trdMatchID + '\', ' +
                                    '\'' + jsonData[0].grossValue + '\', ' +
                                    '\'' + jsonData[0].homeNotional + '\', ' +
                                    '\'' + jsonData[0].foreignNotional + '\')\n', function (err, result) {

                                    if (!error) {
                                        return true;
                                    }
                                });
                            }
                        }
                    });
                }
            }
        }
    });
}

function GetLiveTradeData(symbol, callback) {

    let response = [];

    database.db.query('select  * from  livetradedata where symbol = \'' + symbol + '\' order by  TradeId desc limit  1', (err, rows, fields) => {
        response.push(rows[0]);
        database.db.query('select  * from  forexratedata order by ForexRateId desc limit  7', (err, rows, fields) => {
            response.push(rows);
            return callback(response);
        });
    });
}

module.exports = {
    SetLiveTradeData: SetLiveTradeData,
    GetLiveTradeData: GetLiveTradeData
};


