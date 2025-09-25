module.exports = function (server) {
  const FCM = require('fcm-node')
  var fcm = new FCM(process.env.FCM_SERVER_KEY)

  var data = {
    to: `fYXELbsoRC6FH66gECnT2P:APA91bHtjau3nuO9pkjYHvzN2im9fjLHH1OWO_kctm9VEudCn_fueltYTvX7YdVr_LkZTzYBucbIU6be8QydMisghsvLjDi_nKX7dnjbTO8YD6E55dxpVQQB9BbnHRBO-G_yjplxwLjL`,
    collapse_key:"Reminder",
    notification: {
      title: "sample",
      body: "Test"
    },
    data: {
      title: 'SALESREP ACTIVITY',
      body: "message",
    }
  }


  this.sendFcm = async function (messageData) {
    // fcm.send(messageData, function (err, response) {
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
