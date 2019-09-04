const express = require('express');
const bodyparser = require('body-parser');
const database = require("./Helpers/database");
const app = express();
const router = express.Router();
app.use(bodyparser.json());
const CommonFunctions = require("./Helpers/CommonFunctions");

/* GET home page. */
router.get('/', function (req, res) {

    if (global.globalUserId == null || global.globalUserId == "") {
        res.redirect('401');
    } else {
        database.db.query("select * from orders WHERE UserId =? order by OrderId desc", [globalUserId], function (err, result) {

            res.render('orderbook', {result: result});
        });
    }
});

router.post('/', function (req, res) {
    let data = req.body;

    if (global.globalUserId == null || global.globalUserId == "") {
        res.redirect('401');
    }
    res.locals.UserId = globalUserId;
    database.db.query('SELECT * FROM orders WHERE OrderId =?', [data.hdOrderId], (err, rows) => {

        if (!err && rows.length > 0) {
            var profitLoss = 0;
            var amount = rows[0].Amount;
            var OrderId = rows[0].OrderId;

            if (rows[0].IsBuy == "buy") {
                //Buy Order HERE
                profitLoss = (data.hdUsdPrice - rows[0].PriceUsd) * rows[0].BitcoinQuntity;
            } else {
                //Sell Order HERE
                profitLoss = (rows[0].PriceUsd - data.hdUsdPrice) * rows[0].BitcoinQuntity;
            }

            database.db.query('update orders set StatusMasterId = \'3\', ProfitLoss = \''+profitLoss+'\' where OrderId = \''+data.hdOrderId+'\'',(err, rows) => {
                //Update user wallet
                CommonFunctions.AddUserWalletLogs(globalUserId, (amount + profitLoss), OrderId, 'Amount credited (with Profit loss) for transact Order [' + OrderId + ']', true, function (response) {
                    global.globalMessage = "Order place successfully";
                    return res.redirect('orderbook');
                });
            });
        }
    });

});


module.exports = router;