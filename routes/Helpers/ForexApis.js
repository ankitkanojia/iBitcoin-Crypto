const express = require('express');
const bodyparser = require('body-parser');
const request = require("request");
const app = express();
const router = express.Router();
app.use(bodyparser.json());
let date = require('date-and-time');

const database = require("./database");



function SetForexRateData() {
    //Rule: Save forex rate with 1 hour interval
    database.db.query('select * from  forexratedata order by CreatedDate desc limit 1', (err, rows, fields) => {
        if (!err) {
            if (rows.length > 0) {
                let lastDate = rows[0].CreatedDate;
                if (date.addHours(lastDate, 1) <= Date.now()) {
                    request.get("http://data.fixer.io/api/latest?access_key=d0c77f6f7514fdbccdf41de0c10403f7&format=1", (error, response, body) => {
                        if (!error) {
                            const jsonData = JSON.parse(body);

                            const values = [];
                            values.push(["EUR", "INR", jsonData.rates.INR]);
                            values.push(["EUR", "USD", jsonData.rates.USD]);
                            values.push(["EUR", "AUD", jsonData.rates.AUD]);
                            values.push(["EUR", "CAD", jsonData.rates.CAD]);
                            values.push(["EUR", "BRL", jsonData.rates.BRL]);
                            values.push(["EUR", "EUR", jsonData.rates.EUR]);
                            values.push(["EUR", "GBP", jsonData.rates.GBP]);


                            database.db.query('INSERT INTO forexratedata (base, currency, rates) VALUES ?', [values], function (err, result) {

                                if (!err) {
                                    return true;
                                }
                            });
                        }
                    });
                }
            }
        }
    });
}


module.exports = {
    SetForexRateData: SetForexRateData
};


