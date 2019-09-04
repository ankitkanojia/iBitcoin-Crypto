const express = require('express');
const bodyparser = require('body-parser');
const app = express();
const cookieParser = require('cookie-parser');
app.use(cookieParser());
const router = express.Router();
const multer = require('multer');
const path = require('path');

app.use(bodyparser.json());
const database = require("./Helpers/database");


router.get('/', function (req, res) {
    if (global.globalUserId == null || global.globalUserId == "") {
        res.redirect('401');
    } else {
        database.db.query('SELECT * FROM users WHERE UserId =?', [globalUserId], (err, rows) => {

            res.render('myprofile', {user: rows[0]});
        });
    }
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/profile/')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
});
const upload = multer({storage: storage});

router.post('/', upload.single('avatar'), function (req, res, next) {

    if (global.globalUserId == null || global.globalUserId == "") {
        res.redirect('401');
    } else {

        database.db.query('SELECT * FROM users WHERE UserId =?', [globalUserId], (err, rows) => {
            let data = req.body;
            let filename = '';
            if (req.file != null) {
                global.globalProfile = req.file.filename;
                filename = req.file.filename;
            }
            else
                filename = rows[0].ProfileImg;


            database.db.query('update users set FullName =?,Mobile =?,City =?,Address =?,ProfileImg =? where UserId =?',
                [data.FullName, data.Mobile, data.City, data.Address, filename, globalUserId], (err, rows, fields) => {
                    global.globalMessage = "Profile updated successfully";
                    res.redirect('myprofile');
                });
        });
    }
});
module.exports = router;