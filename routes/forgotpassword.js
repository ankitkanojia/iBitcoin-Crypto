const express = require('express');
const bodyparser = require('body-parser');
const database = require("./Helpers/database");
const SendGridHelpers = require("./Helpers/SendGridHelpers");
const app = express();
const router = express.Router();
app.use(bodyparser.json());

/* GET home page. */
router.get('/', function (req, res) {
    res.render('forgotpassword');
});

router.post('/', function (req, res) {
    let data = req.body;
    database.db.query('SELECT * FROM users WHERE Email =?', [data.email], (err, rows, fields) => {
        if (!err && rows.length > 0) {

            const replaceArray = ["#website#", "#resetlink#", "#signaturename#", "#signatureimg#", "#linkfacebook#", "#linktwitter#", "#linklinkedin#", "#logolight#", "#logodark#"];
            const replaceArrayValue = ["http://#company#.com/", "http://#company#.com/", "Riowebs", "https://gallery.mailchimp.com/fdcaf86ecc5056741eb5cbc18/_compresseds/da24cf15-10e5-4af3-b8f7-56013fdde0e0.jpg\n",
                "http://#company#.com/", "http://#company#.com/", "http://#company#.com/", "https://gallery.mailchimp.com/fdcaf86ecc5056741eb5cbc18/images/13f425ab-c680-4ae0-88de-7b493d95095f.jpg", "https://gallery.mailchimp.com/fdcaf86ecc5056741eb5cbc18/images/dbe9c57f-5e00-4d9f-9719-5d36a9a02ebc.jpg"];

            SendGridHelpers.SendMailTemplete(1, replaceArray, replaceArrayValue, data.email);

            global.globalMessage = "Please check your inbox! We have sent an email for reset password";
            res.redirect('login');
        } else {
            global.globalMessage = "Email address not found in our system";
            res.render('forgotpassword');
        }
    });
});


module.exports = router;