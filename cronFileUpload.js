

// import cron from 'node-schedule'
import cron from 'node-cron'
import smsConfig from './config/sms.config'
import NotificationService from './utils/notificationsService'
import CronModel from './utilsModel/cronModel'
import S3upload from './config/s3.upload'

import _ from 'lodash'


var notificationService = new NotificationService
var cronModel = new CronModel

var s3upload = new S3upload

require('dotenv').config()

console.log("cron file connected")


// module.exports = () => {







// var rule = new cron.RecurrenceRule()
// rule.second = 1;
// rule.minute = 34
// rule.minute = new cron.Range(0,59,1);
// rule.hour = 14;


var d = new Date();
var min = d.getMinutes() + 1;
var hour = d.getHours();

var month = d.getMonth() + 1;

var date = d.getDate();
// var dateFormat = require('dateformat');


var indiaTime = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Kolkata"
});

// var today = dateFormat(new Date(indiaTime), "yyyy-mm-dd");
// var current_hour = dateFormat(new Date(indiaTime), "HH");
// // var current_min = dateFormat(new Date(indiaTime),"MM") ;
// var currentMin = new Date(indiaTime).getMinutes() + 1

// var current_month = dateFormat(new Date(indiaTime), "m");
// var current_day = dateFormat(new Date(indiaTime), "d");

// console.log("tdy",currentMin,"current hour",current_hour,current_month,current_day,"dt");
var min1 = 20
var hour = 13

// "*/10 * 2 * *"

// how to  use date time in cron example
// cron.schedule(` ${min1} ${hour} ${current_day} ${current_month} *`, async function () {
//     console.log(`hour ${current_hour} and min ${currentMin}`)
console.log("cron file upload connected")





cron.schedule(` ${min1} ${hour} ${date} ${month} *`, async function () {
    try {
        console.log("cron started")
        // require('../../www/html/ledger.xml')
        var fileData = {}
        fileData.file_path = path.resolve(__dirname, `../../www/html/ledger.xml`)
        fileData.fileName = 'europet_files/ledger.xml';
        fileData.type = 'europet_uploads'
        var s3PdfUpload = await s3upload.S3_upload_ledger(fileData)
        console.log("s3PdfUpload", s3PdfUpload)
    } catch (e) {
        console.log(e)
    }

})

























// }
