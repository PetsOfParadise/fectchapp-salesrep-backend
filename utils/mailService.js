

import fs from 'fs'
import handlebars from 'handlebars'
import mailConfig from '../config/mail.config'

require('dotenv').config();

class MailService {
    constructor() {

        this.welcomeMail = async function (emailId, callback) {
            readHTMLFile(process.env.EMAIL_TEMPLATE, async function (err, html) {
                var template = handlebars.compile(html)
                var replacements = {}
                var htmlToSend = template(replacements)
                var mailOptions = {
                    from: process.env.COMMON_MAIL,
                    to: emailId,
                    subject: 'Welcome to Europet',
                    html: htmlToSend
                }
                const info = await mailConfig.sendMail(mailOptions)
                console.log(info)
            })
        }


        this.passwordIntimationMail = async function (emailId, password, callback) {
            var mailOptions = {
                from: process.env.COMMON_MAIL,
                to: emailId,
                subject: 'Welcome to Europet',
                text: 'Your Europet Login Password is' + password
            }
            const info = await mailConfig.sendMail(mailOptions)
            console.log(info)

        }

        this.readHTMLFile = function (path, callback) {
            fs.readFile(path, { encoding: 'utf-8' }, function (err, html) {
                if (err) {
                    callback(err)
                } else {
                    callback(null, html)
                }
            })
        }

    }
}

export default MailService