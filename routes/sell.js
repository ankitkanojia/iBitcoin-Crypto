const express = require('express');
const bodyparser = require('body-parser');
const app = express();
const cookieParser = require('cookie-parser');
app.use(cookieParser());
const router = express.Router();
app.use(bodyparser.json());
const CommonFunctions = require("./Helpers/CommonFunctions");
const database = require("./Helpers/database");

/* GET home page. */
router.get('/', function (req, res) {
    if (global.globalUserId == null || global.globalUserId == "") {
        res.redirect('401');
    } else {

        res.render('sell');
    }
});

router.post('/', function (req, res) {
    let data = req.body;
    var bitcoin = data.Amount / data.priceUsd;

    if (global.globalUserId == null || global.globalUserId == "") {
        res.redirect('401');
    }

    CommonFunctions.GetCurrentWalletBalance(globalUserId, function (response) {
        if (response >= data.Amount) {
            database.db.query('insert into orders (StatusMasterId, PriceUsd, PriceInr, PriceGbp, IsBuy, Amount, ExecutionPrice, BitcoinQuntity, Symbol, UserId, UpdatedDate)\n'
                + 'VALUES (' +
                '\'2\', ' +
                '\'' + data.priceUsd + '\', ' +
                '\'' + data.priceInr + '\', ' +
                '\'' + data.priceGbp + '\', ' +
                '\'sell\', ' +
                '\'' + data.Amount + '\', ' +
                '\'' + data.priceUsd + '\', ' +
                '\'' + bitcoin + '\', ' +
                '\'' + data.Symbol + '\', ' +
                '\'' + globalUserId + '\', ' +
                '\'null\')\n', function (err, rows) {

                if (!err) {
                    CommonFunctions.AddUserWalletLogs(globalUserId, data.Amount, rows.insertId, 'Amount debited for sell Order [' + rows.insertId + ']', false, function (response) {
                        global.globalMessage ="Your order place successfully";
                        return res.render('sell');
                    });
                } else {
                    global.globalMessage ="Something went wrong! Please try after some time";
                    return res.render('sell');
                }
            });
        } else {
            global.globalMessage ="Warning! Insufficient balance in your account";
            return res.render('sell');
        }
    });

});


module.exports = router;