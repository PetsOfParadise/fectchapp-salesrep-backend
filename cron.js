

// import cron from 'node-schedule'
import cron from 'node-cron'
import smsConfig from './config/sms.config'
import NotificationService from './utils/notificationsService'
import CronModel from './utilsModel/cronModel'
import S3upload from './config/s3.upload'

import _ from 'lodash'
import path from 'path'


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
var min1 = 18
var hour = 14

// "*/10 * 2 * *"

// how to  use date time in cron example
// cron.schedule(` ${min1} ${hour} ${current_day} ${current_month} *`, async function () {
//     console.log(`hour ${current_hour} and min ${currentMin}`)
console.log("cron connected")

cron.schedule(` ${min1} ${hour} ${date} ${month} *`, async function () {

    try {
        console.log("hi I Am Cron")

        //ledger updated automatically 
        var fileData = {}
        fileData.file_path = path.resolve(__dirname, `../../www/html/ledger.xml`)
        fileData.fileName = 'europet_files/ledger.xml';
        fileData.type = 'europet_uploads'
        var s3PdfUpload = await s3upload.S3_upload_ledger(fileData)
        console.log("s3PdfUpload", s3PdfUpload)

        var localTime = new Date().toLocaleString(undefined, { timeZone: 'Asia/Kolkata' });


        var paymentModel = await cronModel.cronCollectedPaymentListModel()
        console.log("paymentModel", paymentModel)

        var arr = [];
        var threeDays = [];
        var sevenDays = [];
        var dueDay = [];
        var overdue = [];
        var keys = []
        if (paymentModel.data.length > 0) {
            arr = paymentModel.data.map(data => {
                keys.push(data.ownerId)
                var today = new Date();
                var dd = String(today.getDate()).padStart(2, '0');
                var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
                var yyyy = today.getFullYear();
                today = dd + '/' + mm + '/' + yyyy;
                var date1Arr = data.dueDate.toString().split("/");
                var date2Arr = today.toString().split("/")
                var date1 = new Date(+date1Arr[2], date1Arr[1] - 1, +date1Arr[0]);
                var date2 = new Date(+date2Arr[2], date2Arr[1] - 1, +date2Arr[0]);
                var Difference_In_Time = date1.getTime() - date2.getTime();
                var daysLeft = Difference_In_Time / (1000 * 3600 * 24);
                data.daysLeft = daysLeft;
                if (daysLeft <= 7 && daysLeft > 0) {
                    data.status = 'thisweek'
                } else if (daysLeft > 7) {
                    data.status = 'others'
                } else {
                    data.status = 'overdue'
                }

                if (daysLeft == 3) {
                    threeDays.push(data)
                } else if (daysLeft == 7) {
                    sevenDays.push(data)
                } else if (daysLeft == 1) {
                    dueDay.push(data)
                } else if (daysLeft < 0) {
                    var Due = daysLeft * -1
                    console.log("Due", Due)
                    if (Due % 3 == 0) {
                        overdue.push(data)
                    }
                }


                return data;
            })

        }
        console.log("arr", overdue)


        if (threeDays.length > 0) {
            function groupBy(objectArray, property) {
                return objectArray.reduce((acc, obj) => {
                    const key = obj[property];
                    if (!acc[key]) {
                        acc[key] = [];
                    }
                    // Add object to list for given key's value
                    acc[key].push(obj);
                    return acc;
                }, {});
            }
            const groupedPeople = groupBy(threeDays, 'ownerId');

            console.log("threeDays groupedPeople", groupedPeople)

            for (const key in groupedPeople) {
                console.log(`${key}: ${groupedPeople[key]}`);

                // let orderid = 10049
                let dueDays = 3;
                let val = groupedPeople[key]
                let length = groupedPeople[key].length

                let balanceAmount = 0;
                for (let i = 0; i < length; i++) {
                    balanceAmount = balanceAmount + val[i].balanceAmount
                }
                balanceAmount = balanceAmount.toFixed(1)

                var smsDeatils = {}
                smsDeatils.mobile_number = val[0].mobileNumber
                // smsDeatils.mobile_number = 7010942259
                smsDeatils.message = `Fetch: The payment of Rs ${balanceAmount} amount is due in ${dueDays} days. Please make the payment before the due date. If already paid please ignore.`
                // smsDeatils.message = `Fetch: Your Order with ID ${orderid} has been Delivered`

                console.log("smsDeatils", smsDeatils)
                var SendSms = await smsConfig.textLocalSendSms(smsDeatils)
                console.log("SendSms", SendSms)
                let notificationObj = {}
                notificationObj.orderStatus = 'Reminder'
                notificationObj.notifyType = 'REMINDER'
                notificationObj.balanceAmount = balanceAmount
                notificationObj.deviceToken = val[0].deviceToken
                notificationObj.body = `The payment of Rs ${balanceAmount} amount is due in ${dueDays} days. Please make the payment before the due date. If already paid please ignore.`
                console.log("notificationObj", notificationObj)
                var notifiaction = await notificationService.remindePushNotification(notificationObj, () => { })


                var updateNotifications = {}
                updateNotifications.ownerId = val[0].ownerId
                updateNotifications.managerId = val[0].ownerId
                updateNotifications.salesRepId = null
                updateNotifications.type = 'REMINDER'
                // updateNotifications.notifyType = JSON.stringify(['US', 'AD'])
                updateNotifications.notifyType = JSON.stringify(['US'])
                updateNotifications.notifyDate = new Date(localTime)
                updateNotifications.activityId = 0
                updateNotifications.activeStatus = 1
                updateNotifications.color = "#ffc09f"
                updateNotifications.notificationMsg = `<p style="font-size: 14px;">The payment of Rs <b>${balanceAmount}</b> amount is due in <b>${dueDays}</b> days. Please make the payment before the due date. If already paid, please ignore.</p>`
                cronModel.saveNotificationsModel(updateNotifications, () => { })


            }
            // Fetch: The payment of Rs. xxxx on the Order ID xxxx is due in xxxx days. Please make the payment before the due date.


        }
        if (sevenDays.length > 0) {
            function groupBy(objectArray, property) {
                return objectArray.reduce((acc, obj) => {
                    const key = obj[property];
                    if (!acc[key]) {
                        acc[key] = [];
                    }
                    // Add object to list for given key's value
                    acc[key].push(obj);
                    return acc;
                }, {});
            }
            const groupedPeople = groupBy(sevenDays, 'ownerId');

            console.log("sevenDays groupedPeople", groupedPeople)
            for (const key in groupedPeople) {
                console.log(`${key}: ${groupedPeople[key]}`);

                // let orderid = 10049/
                let dueDays = 7;
                let val = groupedPeople[key]
                let length = groupedPeople[key].length

                let balanceAmount = 0;
                for (let i = 0; i < length; i++) {
                    balanceAmount = balanceAmount + val[i].balanceAmount
                }
                balanceAmount = balanceAmount.toFixed(1)

                var smsDeatils = {}
                smsDeatils.mobile_number = val[0].mobileNumber
                // smsDeatils.mobile_number = 7010942259
                smsDeatils.message = `Fetch: The payment of Rs ${balanceAmount} amount is due in ${dueDays} days. Please make the payment before the due date. If already paid please ignore.`

                // smsDeatils.message = `Fetch: Your Order with ID ${orderid} has been Delivered`

                console.log("smsDeatils", smsDeatils)
                var SendSms = await smsConfig.textLocalSendSms(smsDeatils)
                console.log("SendSms", SendSms)
                let notificationObj = {}
                notificationObj.orderStatus = 'Reminder'
                notificationObj.notifyType = 'REMINDER'
                notificationObj.balanceAmount = balanceAmount
                notificationObj.deviceToken = val[0].deviceToken
                notificationObj.body = `The payment of Rs ${balanceAmount} amount is due in ${dueDays} days. Please make the payment before the due date. If already paid please ignore.`
                console.log("notificationObj", notificationObj)
                var notifiaction = await notificationService.remindePushNotification(notificationObj, () => { })



                var updateNotifications = {}
                updateNotifications.ownerId = val[0].ownerId
                updateNotifications.managerId = val[0].ownerId
                updateNotifications.salesRepId = null
                updateNotifications.type = 'REMINDER'
                // updateNotifications.notifyType = JSON.stringify(['US', 'AD'])
                updateNotifications.notifyType = JSON.stringify(['US'])
                updateNotifications.notifyDate = new Date(localTime)
                updateNotifications.activityId = 0
                updateNotifications.activeStatus = 1
                updateNotifications.color = "#ffc09f"
                updateNotifications.notificationMsg = `<p style="font-size: 14px;">The payment of Rs <b>${balanceAmount}</b> amount is due in <b>${dueDays}</b> days. Please make the payment before the due date. If already paid, please ignore.</p>`
                cronModel.saveNotificationsModel(updateNotifications, () => { })



            }

        }
        if (dueDay.length > 0) {
            function groupBy(objectArray, property) {
                return objectArray.reduce((acc, obj) => {
                    const key = obj[property];
                    if (!acc[key]) {
                        acc[key] = [];
                    }
                    // Add object to list for given key's value
                    acc[key].push(obj);
                    return acc;
                }, {});
            }
            const groupedPeople = groupBy(dueDay, 'ownerId');

            console.log("dueDay groupedPeople", groupedPeople)
            for (const key in groupedPeople) {
                console.log(`${key}: ${groupedPeople[key]}`);

                // let orderid = 10049
                let dueDays = 1;
                let val = groupedPeople[key]
                let length = groupedPeople[key].length

                let balanceAmount = 0;
                for (let i = 0; i < length; i++) {
                    balanceAmount = balanceAmount + val[i].balanceAmount
                }
                balanceAmount = balanceAmount.toFixed(1)

                var smsDeatils = {}
                smsDeatils.mobile_number = val[0].mobileNumber
                // smsDeatils.mobile_number = 7010942259
                smsDeatils.message = `Fetch: The payment of Rs ${balanceAmount} amount is due in ${dueDays} days. Please make the payment before the due date. If already paid please ignore.`
                // smsDeatils.message = `Fetch: Your Order with ID ${orderid} has been Delivered`

                console.log("smsDeatils", smsDeatils)
                var SendSms = await smsConfig.textLocalSendSms(smsDeatils)
                console.log("SendSms", SendSms)
                let notificationObj = {}
                notificationObj.orderStatus = 'Reminder'
                notificationObj.notifyType = 'REMINDER'
                notificationObj.balanceAmount = balanceAmount
                notificationObj.deviceToken = val[0].deviceToken
                notificationObj.body = `The payment of Rs ${balanceAmount} amount is due in ${dueDays} days. Please make the payment before the due date. If already paid please ignore.`
                console.log("notificationObj", notificationObj)
                var notifiaction = await notificationService.remindePushNotification(notificationObj, () => { })


                var updateNotifications = {}
                updateNotifications.ownerId = val[0].ownerId
                updateNotifications.managerId = val[0].ownerId
                updateNotifications.salesRepId = null
                updateNotifications.type = 'REMINDER'
                // updateNotifications.notifyType = JSON.stringify(['US', 'AD'])
                updateNotifications.notifyType = JSON.stringify(['US'])
                updateNotifications.notifyDate = new Date(localTime)
                updateNotifications.activityId = 0
                updateNotifications.activeStatus = 1
                updateNotifications.color = "#ffc09f"
                updateNotifications.notificationMsg = `<p style="font-size: 14px;">The payment of Rs <b>${balanceAmount}</b> amount is due in <b>${dueDays}</b> days. Please make the payment before the due date. If already paid, please ignore.</p>`
                cronModel.saveNotificationsModel(updateNotifications, () => { })










            }
        }
        if (overdue.length > 0) {
            function groupBy(objectArray, property) {
                return objectArray.reduce((acc, obj) => {
                    const key = obj[property];
                    if (!acc[key]) {
                        acc[key] = [];
                    }
                    // Add object to list for given key's value
                    acc[key].push(obj);
                    return acc;
                }, {});
            }
            const groupedPeople = groupBy(overdue, 'ownerId');

            console.log("dueDay groupedPeople", groupedPeople)
            for (const key in groupedPeople) {
                console.log(`${key}: ${groupedPeople[key]}`);
                console.log("overdue", overdue)
                let orderid = 10049
                let val = groupedPeople[key]
                let length = groupedPeople[key].length

                let balanceAmount = 0;
                for (let i = 0; i < length; i++) {
                    balanceAmount = balanceAmount + val[i].balanceAmount
                }
                balanceAmount = balanceAmount.toFixed(1)

                var smsDeatils = {}
                smsDeatils.mobile_number = val[0].mobileNumber
                //// smsDeatils.mobile_number = 7010942259
                //// smsDeatils.message = `Fetch: The payment of Rs. ${balanceAmount} on the Order ID ${orderid} is overdue. Please make the payment today.`
                // smsDeatils.message = `Fetch: The payment of Rs ${balanceAmount} amount is overdue. Please make the payment immediately. If already paid please ignore`
                 smsDeatils.message = `199915`
                 smsDeatils.variables_values=`${balanceAmount}`

                let due = val[0].daysLeft * -1
                console.log("smsDeatils", smsDeatils)
                var SendSms = await smsConfig.textLocalSendSms(smsDeatils)
                console.log("SendSms", SendSms)
                let notificationObj = {}
                notificationObj.orderStatus = 'Reminder'
                notificationObj.notifyType = 'REMINDER'
                notificationObj.balanceAmount = balanceAmount
                notificationObj.deviceToken = val[0].deviceToken
                notificationObj.body = `The payment of Rs ${balanceAmount} amount is overdue. Please make the payment immediately. If already paid please ignore`
                console.log("notificationObj", notificationObj)
                var notifiaction = await notificationService.remindePushNotification(notificationObj, () => { })



                var updateNotifications = {}
                updateNotifications.ownerId = val[0].ownerId
                updateNotifications.managerId = val[0].ownerId
                updateNotifications.salesRepId = null
                updateNotifications.type = 'REMINDER'
                // updateNotifications.notifyType = JSON.stringify(['US', 'AD'])
                updateNotifications.notifyType = JSON.stringify(['US'])
                updateNotifications.notifyDate = new Date(localTime)
                updateNotifications.activityId = 0
                updateNotifications.activeStatus = 1
                updateNotifications.color = "#ffc09f"
                updateNotifications.notificationMsg = `<p style="font-size: 14px;">The payment of Rs <b>${balanceAmount}</b> amount is overdue. Please make the payment immediately. If already paid, please ignore.</p>`
                cronModel.saveNotificationsModel(updateNotifications, () => { })

            }
        }







    } catch (e) {
        console.log(e)
    }

}, {
    scheduled: true,
    timezone: "Asia/Kolkata"
});





























// }
