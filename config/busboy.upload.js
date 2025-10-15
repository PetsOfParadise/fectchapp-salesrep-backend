
const busboy = require('busboy');


function busUpload(req) {
    try {
        return new Promise((resolve, reject) => {
            const bb = busboy({ headers: req.headers });
            var buffers = []

            bb.on('file', (name, file, info) => {
                const { filename, encoding, mimeType } = info;
                console.log(
                    `File [${name}]: filename: %j, encoding: %j, mimeType: %j`,
                    filename,
                    encoding,
                    mimeType
                );
                file.on('data', (data) => {
                    buffers.push(data);
                    console.log(`File [${name}] got ${data.length} bytes`);
                }).on('close', () => {
                    console.log(`File [${name}] done`);
                });
            });

            bb.on('close', () => {
                resolve(Buffer.concat(buffers))
            });
            req.pipe(bb);
        })
    } catch (error) {
        console.log(error)
    }
}






module.exports.upload = async (req, res, next) => {
    try {
        var data = await busUpload(req);
        req.body.BufferData = data
        return next()
   
    } catch (error) {
        console.log(error)
        var errorResponse = {}
        errorResponse.error = true
        errorResponse.message = "oops2"
        return res.send(errorResponse)
    }
}