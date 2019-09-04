const database = require("./database");
const sgMail = require('@sendgrid/mail');
const Utilities = require("./Utilities");

function SendMailTemplete(templetid, replaceArray,replaceArrayValue, email) {
    database.db.query('SELECT * FROM emailtemplete WHERE TempleteId =?', [templetid], (err, rows, fields) => {
        if (!err && rows.length > 0) {
            const htmlBody = Utilities.replaceKeyWithValue(rows[0].HtmlBody, replaceArray, replaceArrayValue);
            sgMail.setApiKey("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");
            const msg = {
                to: email,
                from: rows[0].FromEmail,
                subject: rows[0].Subject,
                html: htmlBody,
            };

            sgMail.send(msg, (error, result) => {
                if (error) {

                    return false;
                }
                else {
                    return true;
                }
            });

        } else {
            return false;
        }
    });

}

module.exports = {
    SendMailTemplete: SendMailTemplete
};
