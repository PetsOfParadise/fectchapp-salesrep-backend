import http from "http";
import app from './config/express'
import cronjob from './cron'

require('dotenv').config();


const server = http.createServer(app)
  .listen(process.env.NODE_PORT, function () {
    // cronjob.start();

    var host = server.address().address
    var port = server.address().port
    console.log('Europet server listening at http://%s:%s', host, port)
  });

