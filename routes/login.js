const express = require('express');
const bodyparser = require('body-parser');
const app = express();
const router = express.Router();
app.use(bodyparser.json());


const cookieParser = require('cookie-parser');
app.use(cookieParser());

//SQL connection
const database = require("./Helpers/database");
const passport = require("passport");

/* GET home page. */
router.get('/', function (req, res, next) {


    if (global.globalUserId != null) {
        global.globalUserId = "";
    }
    if (global.globalFullName != null) {
        global.globalFullName = "";
    }

    res.render('login');
});


router.post('/', function (req, res, next) {
    let data = req.body;
    database.db.query('SELECT * FROM users WHERE Email =? and Password =?', [data.email, data.password], (err, rows, fields) => {
        if (!err && rows.length > 0) {
            global.globalUserId = rows[0].UserId;
            global.globalFullName = rows[0].FullName;
            global.globalProfile = rows[0].ProfileImg;
            const UserId = rows[0].UserId;
            req.login(UserId, function (err) {
                return res.redirect('/');
            });
        } else {
            if (!err) {
                global.globalMessage = "Wrong credentials found";
                res.render('login');
            }
            else {
                global.globalMessage = "Request failed due to server down, Please try after some time";
                res.render('login');
            }
        }
    });
});

passport.serializeUser(function (UserId, done) {
    done(null, UserId);
});

passport.deserializeUser(function (UserId, done) {
    done(null, UserId);
});

module.exports = router;
