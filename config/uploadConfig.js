require('dotenv').config()

import multer from 'multer'
import STRINGS from '../strings.json'


class UploadConfigService {

    constructor() {

        this.file_upload = (request, response, next) => {
            try {
                // require('../../html/dev')
                var storage = multer.diskStorage({
                    destination: function (req, file, callback) {
                        callback(null, './uploads', file.mimetype);
                    },
                    filename: function (req, file, callback) {
                        var timestamp = (new Date).getTime().toString()
                        console.log("file", file)
                        var type = file.mimetype.split("/")
                        console.log("file type 1 ", type)
                        if (type[1].includes("spreadsheetml")) {
                            return callback(null, timestamp + '.' + type[1]);
                        } else {
                            return callback(true, null);
                        }
                    }
                });
                var upload = multer({
                    storage: storage,
                    limits: { fileSize: 2000000 }
                })
                    .any();

                return upload(request, response, function (err, data) {
                    var message = {}
                    if (err) {
                        console.log("err", err)
                        message.error = 'true'
                        response.statusCode = STRINGS.errorStatusCode
                        message.message = 'Invalid File.'
                        return response.send(message)
                    } else {
                        if (request.files[0] == undefined) {
                            message.error = 'true'
                            response.statusCode = STRINGS.errorStatusCode
                            message.message = 'Invalid File.'
                            return response.send(message)
                        }
                        // request.body.file_path = process.env.FILE_UPLOAD_URL + '/' + request.files[0].path
                        request.body.file_path = request.files[0].path

                        console.log(" request.body.file_path", request.body.file_path)
                        return next()
                    }
                });
            } catch (e) {
                console.log(e)
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
                return response.send(response)

            }
        }

    }
}

export default UploadConfigService;


