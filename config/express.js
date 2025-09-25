import express from 'express'
import passport from 'passport'
import bodyParser from 'body-parser'
import helmet from 'helmet'
import schedule from 'schedule'
import nodemailer from 'nodemailer'
import cors from 'cors'

import UserRoutes from '../src/fetchApp/routes/indexRoute'
import salesRepRoutes from '../src/salesRep/routes/indexRoute'




import passportService from './passport'
require('dotenv').config()
const app = express();



//Global Middlewares
app.use(bodyParser.json({ limit: '10mb', extended: true }))
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }))
app.use(passport.initialize())
app.use(cors());
app.use(helmet());

app.use('/', function (request, response, next) {
    request.headers.lang = request.headers.lang || 'default'
    console.log('Method: ' + request.method + ' Route: ' + request.originalUrl + ' Body: ' + JSON.stringify(request.body))
    next()
})

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    // res.header("Access-Control-Allow-Origin","http://127.0.0.1:3000")
    res.header("Access-Control-Allow-Headers", "Orgin, X-Requested-With, Content-Type,Accept,Authorization")
    next()
})

// Add headers before the routes are defined









app.schedule = schedule




app.use('/',UserRoutes)
app.use('/',salesRepRoutes)


// require('./cron')(app)

app.get("/", function (req, res) {
    res.send("Europet Server listening");
});











app.get('/unauthorized', function (req, res) {
    res.send(
        {
            error: true,
            statusCode: 401,
            message: 'unauthorized'
        })
})

export default app;

