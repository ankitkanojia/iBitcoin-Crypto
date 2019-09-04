const express = require('express');
const bodyparser = require('body-parser');
const app = express();
const router = express.Router();
app.use(bodyparser.json());
const CommonFunctions = require("./Helpers/CommonFunctions");
const database = require("./Helpers/database");
const passport = require("passport");

router.get('/', function (req, res) {
    console.log(req.user);
    console.log(req.isAuthenticated());

    if(req.isAuthenticated()){
        res.render('buy');
    }else{
        res.redirect('401');
    }

});

router.post('/', function (req, res) {
    let data = req.body;
    const bitcoin = data.Amount / data.priceUsd;

    if (global.globalUserId == null || global.globalUserId == "") {
        res.redirect('401');
    }

    res.locals.UserId = globalUserId;

    CommonFunctions.GetCurrentWalletBalance(globalUserId, function (response) {
        if (response >= data.Amount) {
            database.db.query('insert into orders (StatusMasterId, PriceUsd, PriceInr, PriceGbp, IsBuy, Amount, ExecutionPrice, BitcoinQuntity, Symbol, UserId, UpdatedDate)\n'
                + 'VALUES (' +
                '\'2\', ' +
                '\'' + data.priceUsd + '\', ' +
                '\'' + data.priceInr + '\', ' +
                '\'' + data.priceGbp + '\', ' +
                '\'buy\', ' +
                '\'' + data.Amount + '\', ' +
                '\'' + data.priceUsd + '\', ' +
                '\'' + bitcoin + '\', ' +
                '\'' + data.Symbol + '\', ' +
                '\'' + globalUserId + '\', ' +
                '\'null\')\n', function (err, rows, fields) {

                if (!err) {
                    CommonFunctions.AddUserWalletLogs(globalUserId, data.Amount, rows.insertId, 'Amount debited for buy Order [' + rows.insertId + ']', false, function (response) {
                        global.globalMessage = "Your order place successfully";
                        return res.render('buy');
                    });
                } else {
                    global.globalMessage = "Something went wrong! Please try after some time";
                    return res.render('buy' );
                }
            });
        } else {
            global.globalMessage = "Warning! Insufficient balance in your account";
            return res.render('buy');
        }
    });
});


module.exports = router;