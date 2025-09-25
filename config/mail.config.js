
import nodemailer from 'nodemailer'
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.COMMON_MAIL,
    pass: process.env.COMMON_MAIL_PASSWORD
  }
})


export default { transporter };



