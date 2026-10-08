import http from "http";
import app from './config/express'
import cronjob from './cron'

require('dotenv').config();


// const server = http.createServer(app)
//   .listen(process.env.NODE_PORT, function () {
//     // cronjob.start();

//     var host = server.address().address
//     var port = server.address().port
//     console.log('Europet server listening at http://%s:%s', host, port)
//   });



// Keep one bad request from taking the whole API down.
//
// Several services call their callback inside the `try` and then AGAIN from the
// `catch`, so Express sends the response twice and throws ERR_HTTP_HEADERS_SENT.
// That throw is asynchronous and unhandled, and on Node 16+ an uncaught
// exception terminates the process - pm2 then restarts it and every in-flight
// request hangs, which is what users saw as "it keeps loading".
//
// This is a safety net, not the fix: the double-callback sites still need
// correcting. Log loudly so these stay visible instead of silently swallowed.
process.on('uncaughtException', function (err) {
  console.error('[uncaughtException]', err && err.stack ? err.stack : err)
})

process.on('unhandledRejection', function (reason) {
  console.error('[unhandledRejection]', reason && reason.stack ? reason.stack : reason)
})

const PORT = process.env.NODE_PORT || 3000;

var server = app.listen(PORT, function () {
  console.log(`Europet server listening at http://localhost:${PORT}`);
});