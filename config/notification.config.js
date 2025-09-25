import FCM from 'fcm-node'
require('dotenv').config()


var fcm = new FCM(process.env.FCM_SERVER_KEY)
// console.log("fcm FCM_SERVER_KEY 3",fcm)
class NotificationConfig {
    constructor() {

        this.sendFcm = async function (messageData) {
            fcm.send(messageData, function (err, response) {
                if (err) {
                    console.log(err)
                    console.log('Something has gone wrong!')
                } else {
                    console.log('Successfully sent with response: ', response)
                }
            })
        }


    }
}


export default NotificationConfig;




// module.exports.remindePushNotification = async (data) => {

//     data.viewBy = 'REMAINDER'
//     var notifyMessage = {
//         to: data.deviceToken,
//         collapse_key: data.notifyType,
//         notification: {
//             title: 'PAYMENT REMAINDER',
//             body: data.body,
//             notifyType: data.notifyType,
//             content_available: true
//         },
//         data: {
//             title: 'PAYMENT REMAINDER',
//             body: data.body,
//             notifyType: data.notifyType,
//             payload: data
//         }
//     }
//     sendFcm(notifyMessage, function (notifyResponse) { })
// }


