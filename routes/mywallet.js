const express = require('express');
const bodyparser = require('body-parser');
const database = require("./Helpers/database");
const app = express();
const router = express.Router();
app.use(bodyparser.json());

/* GET home page. */
router.get('/', function (req, res) {

    if (global.globalUserId == null || global.globalUserId == "") {
        res.redirect('401');
    } else {
        database.db.query("select * from  wallet where UserId =? order by CreatedDate desc", [globalUserId], function (err, result) {
            res.render('mywallet',{result:result});
        });
    }
});

module.exports = router;
