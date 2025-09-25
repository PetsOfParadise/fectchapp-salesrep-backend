module.exports = function (server) {
  const fs = require('fs')
  var handlebars = require('handlebars')

  this.welcomeMail = async function (emailId, callback) {
    readHTMLFile(process.env.EMAIL_TEMPLATE, async function (err, html) {
      const mailTransport = server.transporter
      var template = handlebars.compile(html)
      var replacements = {}
      var htmlToSend = template(replacements)
      var mailOptions = {
        from: process.env.COMMON_MAIL,
        to: emailId,
        subject: 'Welcome to Europet',
        html: htmlToSend
      }
      const info = await mailTransport.sendMail(mailOptions)
      console.log(info)
    })
  }


  this.passwordIntimationMail = async function (emailId,password, callback) {
      const mailTransport = server.transporter
      var mailOptions = {
        from: process.env.COMMON_MAIL,
        to: emailId,
        subject: 'Welcome to Europet',
        text: 'Your Europet Login Password is'+password
      }
      const info = await mailTransport.sendMail(mailOptions)
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
