const express = require('express');
const bodyparser = require('body-parser');
const app = express();
const router = express.Router();
app.use(bodyparser.json());
const CommonFunctions = require("./Helpers/CommonFunctions");


//SQL connection
const database = require("./Helpers/database");

/* GET home page. */
router.get('/', function (req, res) {

    res.render('registration');
});

//Registration
router.post('/', function (req, res) {
    // validation HERE
    req.checkBody('fullname', 'Fullname field cannot be empty').notEmpty();
    const valErrs = req.validationErrors();
    if (valErrs) {
        global.globalMessage = valErrs[0].msg;
        return res.render('registration');
    }

    let data = req.body;
    database.db.query('SELECT * FROM users WHERE Email =?', [data.email], (err, rows, fields) => {
        if (rows.length > 0) {
            global.globalMessage = 'User already exist with ' + data.email;
            return res.render('registration');
        } else {

            var sql = "SET @UserId = ?;SET @FullName = ?;SET @Email = ?;SET @Mobile = ?;SET @Password = ?; \
                        CALL AddUpdateUsers(0,@FullName,@Email,@Mobile,@Password);";
            database.db.query(sql, [0, data.fullname, data.email, data.mobile, data.password], (err, rows, fields) => {
                if (!err) {
                    database.db.query('SELECT * FROM users WHERE Email =? and Password =?', [data.email, data.password], (err, rows, fields) => {
                        CommonFunctions.AddUserWalletLogs(rows[0].UserId, 10000, 0, 'Amount credited by admin for new registration', true, function (response) {
                            global.globalMessage = "Registration done successfully";
                            return res.redirect('login');
                        });
                    });
                }
                else {
                    global.globalMessage = "Something went wrong! Please try after some time";
                    return res.render('registration');
                }
            });
        }
    });

});

module.exports = router;
