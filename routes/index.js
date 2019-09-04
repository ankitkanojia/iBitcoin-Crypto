const express = require('express');
const router = express.Router();
const BitmexApis = require("./Helpers/BitmexApis");
const Utilities = require("./Helpers/Utilities");
const cookieParser = require('cookie-parser');
const app = express();
app.use(cookieParser());
const passport = require("passport");

let date = require('date-and-time');
const CommonFunctions = require("./Helpers/CommonFunctions");

router.get('/', function (req, res, next) {

    let now = new Date();
    let greet;
    let hrs = date.format(now, 'HH');

    if (hrs < 12)
        greet = 'Good Morning, ';
    else if (hrs >= 12 && hrs <= 17)
        greet = 'Good Afternoon, ';
    else if (hrs >= 17 && hrs <= 24)
        greet = 'Good Evening, ';
    else
        greet = 'Welcome, ';

    let fullname = '';
    if (global.globalFullName != null && global.globalFullName != "") {
        fullname = greet + globalFullName + " !";
        global.globalMessage = fullname;
    }

    res.render('index');
});

router.get('/GetTradeData', function (req, res, next) {


    BitmexApis.GetLiveTradeData("XBTUSD", function (response) {
        const jsonTrade = JSON.parse(JSON.stringify(response[0]));
        const jsonRate = JSON.parse(JSON.stringify(response[1]));
        const inrEur = jsonRate[Utilities.findIndexWithAttr(jsonRate, 'currency', 'INR')].rates;
        const usdEur = jsonRate[Utilities.findIndexWithAttr(jsonRate, 'currency', 'USD')].rates;
        const gbpEur = jsonRate[Utilities.findIndexWithAttr(jsonRate, 'currency', 'GBP')].rates;

        res.setHeader('Content-Type', 'application/json');
        res.send({
            price: jsonTrade.price,
            priceInr: jsonTrade.price * (inrEur / usdEur),
            priceGbp: jsonTrade.price * (gbpEur / usdEur),
            tickDirection: jsonTrade.tickDirection,
            grossValue: jsonTrade.grossValue,
            inrRate: inrEur / usdEur,
            gbpRate: gbpEur / usdEur
        });
    });
});

router.get('/logout', function (req, res, next) {

    req.logout();
    req.session.destroy();

    if (global.globalUserId != null) {
        global.globalUserId = "";
    }

    if (global.globalFullName != null) {
        global.globalFullName = "";
    }

    res.redirect('/');
});

router.get('/FetchWalletAmount', function (req, res, next) {

    res.setHeader('Content-Type', 'application/json');

    console.log("userid");
    console.log(global.globalUserId);

    if (global.globalUserId != null) {
        CommonFunctions.GetCurrentWalletBalance(globalUserId, function (response) {
            res.send({status: true, balance: response});
        });
    } else {
        res.send({status: false});
    }
});

module.exports = router;
