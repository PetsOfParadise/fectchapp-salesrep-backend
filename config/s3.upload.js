require('dotenv').config()
import STRINGS from '../strings.json'
import multer from 'multer'
import fs, { write } from 'fs'
import S3 from 'aws-sdk/clients/s3'
import util from 'util'
import aws from 'aws-sdk'
// import multerS3 from 'multerS3'
import random from 'random-string-generator'
require('dotenv').config();

let region = process.env.region
let accessKeyId = process.env.accessKeyId
let secretAccessKey = process.env.secretAccessKey
let bucketName = process.env.bucketName
let temp_files_bucketName = process.env.PDF_bUCKETNAME


const unlinkFile = util.promisify(fs.unlink)
// const s3 = new S3({
//     region,
//     accessKeyId,
//     secretAccessKey,
//     signatureVersion: 'v4',
// })

// Configure AWS S3 client
// const s3 = new S3({
//   region: process.env.region,
//     accessKeyId: process.env.accessKeyId,
//     secretAccessKey: process.env.secretAccessKey,
//      signatureVersion: 'v4',
  
// });
 const s3 = new S3({
    accessKeyId: process.env.accessKeyId,
    secretAccessKey: process.env.secretAccessKey,
    region: process.env.region
});




class UploadS3 {
    constructor() {


        function toKey(maybe) {
            if (!maybe) throw new Error('Missing key/url');

            // s3://bucket/folder/file -> folder/file
            if (/^s3:\/\//i.test(maybe)) {
                return maybe.replace(/^s3:\/\/[^/]+\//i, '');
            }

            // https://bucket.s3.region.amazonaws.com/folder/file?x=1 -> folder/file
            // or https://cdn.example.com/folder/file -> folder/file
            try {
                const u = new URL(maybe);
                if (u.protocol === 'http:' || u.protocol === 'https:') {
                    return decodeURIComponent(u.pathname.replace(/^\/+/, ''));
                }
            } catch (_) {
                // not a URL, continue
            }

            // Plain key or /leading/slash -> strip leading slashes
            return maybe.replace(/^\/+/, '');
        }


        this.S3_upload = async (data) => {
            return new Promise((resolve, reject) => {
                try {
                    var response = {}
                    var timestamp = (new Date).getTime().toString()
                    let rand = random('alphanumeric');

                    console.log("S3_upload",temp_files_bucketName);
                    console.log("file path", data.file_path);
                    console.log("file fileName", data.fileName);


                    const fileStream = fs.createReadStream(data.file_path);
                    // fileStream.on('data', function (chunk) {
                    //     console.log("to_chunk",chunk.toString());
                    // });
                    // const uploadParams = {
                    //     Bucket: data.type == 'temp_files' ? temp_files_bucketName : bucketName,
                    //     Body: fileStream,
                    //     Key: `${rand}${timestamp}.xlsx`
                    // }
                    const uploadParams = {
                        Bucket: data.type == 'temp_files' ? temp_files_bucketName : bucketName,
                        Body: fileStream,
                        Key: data.fileName
                    }

                    // return s3.putObject(uploadParams).promise()
                    // var putObjectPromise = s3.putObject(uploadParams).promise();

                    // putObjectPromise.then(function(data) {
                    //     console.log('Success',data);
                    //   }).catch(function(err) {
                    //     console.log(err);
                    //   });
                    var filePath = data.file_path
                    s3.upload(uploadParams, async (err, data) => {
                        if (err) {
                            console.log(`error in S3 upload`)
                            console.log(err)
                            await unlinkFile(filePath)
                            response.error = true
                            response.statusCode = STRINGS.errorStatusCode
                            response.message = STRINGS.commanErrorString
                            resolve(response)
                        } else {
                            await unlinkFile(filePath)
                            response.error = false
                            response.statusCode = STRINGS.successStatusCode
                            response.message = STRINGS.SuccessString
                            response.data = data.Location
                            console.log(`File uploaded successfully at ${data.key}`)
                            resolve(response)

                            // var params = {
                            //     Bucket: bucketName,
                            //     Key: data.key
                            // };

                            // var file = s3.getObject(params).createReadStream();
                            // var buffers = [];
                            // var workbook;
                            // file.on('data', function (data) {
                            //     buffers.push(data);
                            // });

                            // file.on('end', function () {
                            //     var buffer = Buffer.concat(buffers);
                            //     // var workbook = XLSX.parse(buffer);
                            //     workbook = XLSX.read(buffer, { type: 'buffer' });
                            //     response.workbook = workbook
                            //     resolve(response)
                            // });




                            // console.log(`File uploaded successfully at ${data.Location}`)


                        }
                    });

                    // console.log("s3_file", request.body.S3_file.key)

                } catch (e) {
                    console.log(e)
                    response.error = true
                    response.statusCode = STRINGS.errorStatusCode
                    response.message = STRINGS.oopsErrorMessage
                    resolve(response)
                }
            })
        }



        this.S3_getObjectOld = async (data) => {
            return new Promise(async (resolve, reject) => {
                console.log("s3 request data", data)
                const params = {
                    Bucket: bucketName,
                    Key: data.url
                }
                const response = {}
                try {
                    await s3.headObject(params).promise();
                    const result = s3.getSignedUrl('getObject', params);
                    response.error = false
                    response.result = result
                    // console.log("result", result)
                    return resolve(response)
                    // Do stuff with signedUrl
                } catch (error) {
                    if (error.name === 'NotFound') { // Note with v3 AWS-SDK use error.code
                        // Handle no object on cloud here...
                        response.error = true
                        console.log("S3 error not found", error)
                        return resolve(response)
                    } else {
                        response.error = true
                        console.log("S3 error", error)
                        return resolve(response)
                        // Handle other errors here....
                    }
                }
            })
        }

        this.S3_getObject = async (data) => {
            const response = {};
            try {
                const key = toKey(data.key || data.url);     // accept either field
                if (!key) throw new Error('S3 Key resolved empty');

                const params = {
                    Bucket: bucketName,
                    Key: key,
                    Expires: 60, // seconds (optional)
                };

                // You don't need a HEAD call to presign
                const signed = s3.getSignedUrl('getObject', params);

                response.error = false;
                response.result = signed;
                return response;
            } catch (error) {
                console.error('S3 presign error', {
                    code: error.code,
                    message: error.message,
                    requestId: error.requestId,
                    statusCode: error.statusCode,
                });
                return { error: true, message: error.message || 'Presign failed' };
            }
        };


        var timestamp = (new Date).getTime().toString()
        let rand = random('alphanumeric');

        // const upload = multer({
        //     storage: multerS3({
        //         s3: s3,
        //         bucket: bucketName,
        //         acl: 'public-read',
        //         metadata: function (req, file, cb) {
        //             cb(null, { fieldName: file.fieldname });
        //         },
        //         key: function (req, file, cb) {
        //             cb(null, `${rand}${timestamp}.xlsx`);
        //         }
        //     })
        // }).single('excel')


        this.S3_uploadMulter = async (req, res, next) => {
            return new Promise((resolve, reject) => {
                try {

                    var response = {}

                    return upload(req, res, function (err, data) {
                        var message = {}
                        if (err) {
                            console.log("err", err)
                            message.error = 'true'
                            response.statusCode = STRINGS.errorStatusCode
                            message.message = 'Invalid File.'
                            return response.send(message)
                        } else {
                            // if (req.files[0] == undefined) {
                            //     message.error = 'true'
                            //     response.statusCode = STRINGS.errorStatusCode
                            //     message.message = 'Invalid File.'
                            //     return response.send(message)
                            // }
                            // request.body.file_path = process.env.FILE_UPLOAD_URL + '/' + request.files[0].path
                            // req.body.file_path = req.files[0].path

                            console.log(" request.body.file_path", req.file)
                            return next()
                        }

                    });

                    // console.log("s3_file", request.body.S3_file.key)

                } catch (e) {
                    console.log(e)
                    response.error = true
                    response.statusCode = STRINGS.errorStatusCode
                    response.message = STRINGS.oopsErrorMessage
                    resolve(response)
                }
            })
        }

        this.S3_upload_ledger = async (data) => {
            return new Promise((resolve, reject) => {
                try {
                    var response = {}

                    console.log("S3_upload",);
                    console.log("file path", data.file_path);
                    console.log("file fileName", data.fileName);


                    const fileStream = fs.createReadStream(data.file_path);
                    // fileStream.on('data', function (chunk) {
                    //     console.log("to_chunk",chunk.toString());
                    // });
                    // const uploadParams = {
                    //     Bucket: data.type == 'temp_files' ? temp_files_bucketName : bucketName,
                    //     Body: fileStream,
                    //     Key: `${rand}${timestamp}.xlsx`
                    // }
                    const uploadParams = {
                        Bucket: data.type == 'temp_files' ? temp_files_bucketName : bucketName,
                        Body: fileStream,
                        Key: data.fileName
                    }

                    // return s3.putObject(uploadParams).promise()
                    // var putObjectPromise = s3.putObject(uploadParams).promise();

                    // putObjectPromise.then(function(data) {
                    //     console.log('Success',data);
                    //   }).catch(function(err) {
                    //     console.log(err);
                    //   });
                    s3.upload(uploadParams, async (err, data) => {
                        if (err) {
                            console.log(`error in S3 upload`)
                            console.log(err)
                            response.error = true
                            response.statusCode = STRINGS.errorStatusCode
                            response.message = STRINGS.commanErrorString
                            resolve(response)
                        } else {
                            response.error = false
                            response.statusCode = STRINGS.successStatusCode
                            response.message = STRINGS.SuccessString
                            response.data = data.Location
                            console.log(`File uploaded successfully at ${data.key}`)
                            resolve(response)
                        }
                    });

                    // console.log("s3_file", request.body.S3_file.key)

                } catch (e) {
                    console.log(e)
                    response.error = true
                    response.statusCode = STRINGS.errorStatusCode
                    response.message = STRINGS.oopsErrorMessage
                    resolve(response)
                }
            })
        }


        this.S3_deleteOneFile = async (data) => {
            return new Promise((resolve, reject) => {
                try {
                    var response = {}


                    const params = {
                        Bucket: bucketName,
                        Key: data.fileName
                    }


                    s3.deleteObject(params, async (err, data) => {
                        if (err) {
                            console.log(`error in S3 upload`)
                            console.log(err)
                            response.error = true
                            response.statusCode = STRINGS.errorStatusCode
                            response.message = STRINGS.commanErrorString
                            resolve(response)
                        } else {
                            response.error = false
                            response.statusCode = STRINGS.successStatusCode
                            response.message = STRINGS.SuccessString
                            console.log(`Object deleted successfully: ${data}`);
                            resolve(response)
                        }
                    });


                } catch (e) {
                    console.log(e)
                    response.error = true
                    response.statusCode = STRINGS.errorStatusCode
                    response.message = STRINGS.oopsErrorMessage
                    resolve(response)
                }
            })
        }









    }
}




export default UploadS3;




// aws.config.update({
//     secretAccessKey: secretAccessKey,
//     accessKeyId: accessKeyId,
//     region: region
// });
// const s3 = new aws.S3();
















