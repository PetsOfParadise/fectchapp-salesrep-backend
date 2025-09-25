
import async from 'async'
import fs from 'fs'
import path from 'path'
import parser from 'xml2json'
import pdf from 'pdf-creator-node'
import util from 'util'

import STRINGS from '../../../strings.json'
import Utils from '../../../utils/utils'
import UserProfileModel from '../models/userProfileModel'
import UploadS3 from '../../../config/s3.upload'

require('dotenv').config();
const unlinkFile = util.promisify(fs.unlink)
const userProfileModel = new UserProfileModel
const uploadS3 = new UploadS3

const utils = new Utils()


class UserProfileService {
    constructor() {




        this.updateOwnerProfile = async (request, callback) => {
            try {
                var response = {}
                var updateProfile = {}
                updateProfile.shopAddress = request.shopAddress
                updateProfile.pincode = request.pincode
                updateProfile.city = request.city
                updateProfile.state = request.state
                updateProfile.longitude = request.longitude
                updateProfile.latitude = request.latitude
                updateProfile.gst = request.gst
                updateProfile.name = request.name
                updateProfile.shopName = request.shopName
                updateProfile.email = request.email
                updateProfile.id = request.auth.id

                var object = { email: request.email, id: request.auth.id }
                if (request.email === '') {
                    var object = { email: null, id: request.auth.id }
                }
                var checkUser = await userProfileModel.editCheckEmailExists(object)
                if (checkUser.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                } else {
                    if (checkUser.data.length === 0) {
                        var update = await userProfileModel.updateOwnerProfileModel(updateProfile)
                        if (update.error) {
                            response.error = true
                            response.statusCode = STRINGS.successStatusCode
                            response.message = STRINGS.commanErrorString
                        } else {
                            response.error = false
                            response.statusCode = STRINGS.successStatusCode
                            response.message = STRINGS.profileUpdateString
                        }
                    } else {
                        response.error = true
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.emailErrorString
                    }
                }
            } catch (e) {
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
            }
            callback(response)
        }

        this.userSettings = async (request, callback) => {
            try {
                var response = {}
                var cart = await myCartInfo(request.auth.id, request.auth)
                if (cart.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                } else {
                    response.error = false
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.SuccessString
                    response.cartDeatils = cart
                }
            } catch (e) {
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
            }
            callback(response)
        }

        this.userChangePassword = async (request, callback) => {
            try {
                var response = {}
                var profileResponse = await userProfileModel.profileModel(request.auth.id)
                if (profileResponse.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                } else {
                    if (profileResponse.data.length > 0) {
                        var verify = await utils.comparePassword(request.oldPassword, profileResponse.data[0].password)
                        if (verify) {
                            var generatePassword = await utils.hashPassword(request.newPassword)
                            var passwordObject = { id: request.auth.id, password: generatePassword.hashPassword }
                            var passwordResponse = await userProfileModel.updateUserProfileDetailsModel(passwordObject)
                            if (passwordResponse.error) {
                                response.error = true
                                response.statusCode = STRINGS.successStatusCode
                                response.message = STRINGS.commanErrorString
                            } else {
                                response.error = false
                                response.statusCode = STRINGS.successStatusCode
                                response.message = STRINGS.passwordUpdateString
                            }
                        } else {
                            response.error = true
                            response.statusCode = STRINGS.successStatusCode
                            response.message = STRINGS.oldPasswordErrorString
                        }
                    } else {
                        response.error = true
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.invalidUserErrorString
                    }
                }
            } catch (e) {
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
            }
            callback(response)
        }

        this.updateDeviceToken = async (request, callback) => {
            try {
                var response = {}
                var object = { id: request.auth.id, deviceToken: request.deviceToken }
                var update = await userProfileModel.updateUserProfileDetailsModel(object)
                if (update.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                } else {
                    response.error = false
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.SuccessString
                }
            } catch (e) {
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
            }
            callback(response)
        }

        this.userChangeMobileNumber = async (request, callback) => {
            try {
                var response = {}
                var checkUser = await userProfileModel.checkChangeMobileNumber(request)
                if (checkUser.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                } else {
                    var otp = await utils.generateOTP()
                    var object = { mobile: request.mobileNumber, otp: otp }
                    if (checkUser.data.length === 0) {
                        var checkOtp = await userProfileModel.checkOtpModel(request.mobileNumber)
                        if (!checkOtp.error) {
                            await userProfileModel.saveOtpModel(object)
                        } else {
                            await userProfileModel.updateOtpModel(object)
                        }
                        response.error = false
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.optSuccessString
                        response.otp = otp
                    } else {
                        response.error = true
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.mobileExistsString
                    }
                }
            } catch (e) {
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
            }
            callback(response)
        }

        this.userUpdateMobileNumber = async (request, callback) => {
            try {
                var response = {}
                var checkUser = await userProfileModel.checkChangeMobileNumber(request)
                if (checkUser.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                } else {
                    if (checkUser.data.length === 0) {
                        var object = { id: request.auth.id, mobileNumber: request.mobileNumber }
                        var update = await userProfileModel.updateUserProfileDetailsModel(object)
                        if (update.error) {
                            response.error = true
                            response.statusCode = STRINGS.successStatusCode
                            response.message = STRINGS.commanErrorString
                        } else {
                            response.error = false
                            response.statusCode = STRINGS.successStatusCode
                            response.message = STRINGS.mobileNumberUpdateString
                        }
                    } else {
                        response.error = true
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.mobileExistsString
                    }
                }
            } catch (e) {
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
            }
            callback(response)
        }

        this.updateOnlineService = async (request, callback) => {
            try {
                var response = {}
                var object = { id: request.auth.id, userOnline: request.status }
                var update = await userProfileModel.updateUserProfileDetailsModel(object)
                if (update.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                } else {
                    response.error = false
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.SuccessString
                }
            } catch (e) {
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
            }
            callback(response)
        }

        this.updateNotificationCount = async (request, callback) => {
            try {
                var response = {}
                if (request.auth.userType === 'OWNER') {
                    var query = { ownerId: request.auth.id }
                    var update = { ownerSeen: 1 }
                } else {
                    var query = { managerId: request.auth.id }
                    var update = { managerSeen: 1 }
                }
                var update = await userProfileModel.updateNotificationModel(query, update)
                if (update.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                } else {
                    response.error = false
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.SuccessString
                }
            } catch (e) {
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
            }
            callback(response)
        }




        var myCartInfo = function (userId, auth) {
            return new Promise(async function (resolve, reject) {
                var response = {}
                var cart = await userProfileModel.getCardItems(userId, auth)
                if (cart.error) {
                    console.log("myCartInfo error")
                    response.error = true
                    reject(response)
                } else {
                    // 1 - ownerCart
                    // 2 - managerCart
                    // 3 - managerCart empty
                    var cartItems = cart.data
                    console.log("cartItems", cartItems)
                    if (cartItems.length > 0) {
                        var cartAmount = await userProfileModel.getCardTotalSumValue(userId, auth)
                        if (cartAmount.error) {
                            console.log("myCartInfo error")
                            response.error = true
                            reject(response)
                        } else {
                            console.log("cartAmount", cartAmount)
                            response.error = false
                            response.isCartValue = 1
                            response.cartCount = cartItems.length
                            response.cartAmount = cartAmount.data[0].finaltotal + cartAmount.data[0].gsttotal
                            resolve(response)
                        }
                    } else {
                        var manager = await userProfileModel.managerListModel(userId)
                        if (manager.error) {
                            console.log("myCartInfo error")
                            response.error = true
                            reject(response)
                        } else {
                            if (manager.data.length > 0) {
                                var Ids = []
                                manager.data.map(item => {
                                    Ids.push(item.id)
                                })
                                var checkManager = await userProfileModel.getManagerCartModel(Ids)
                                if (checkManager.error) {
                                    console.log("myCartInfo error")
                                    response.error = true
                                    reject(response)
                                } else {
                                    if (checkManager.data.length > 0) {
                                        response.error = false
                                        response.isCartValue = 2
                                        response.cartCount = checkManager.data.length
                                        response.cartAmount = 0
                                        resolve(response)
                                    } else {
                                        response.error = false
                                        response.isCartValue = 3
                                        response.cartCount = checkManager.data.length
                                        response.cartAmount = 0
                                        resolve(response)
                                    }
                                }
                            } else {
                                response.error = false
                                response.isCartValue = 3
                                response.cartCount = 0
                                response.cartAmount = 0
                                resolve(response)
                            }
                        }
                    }
                }
            })
        }



        this.userOldLedgersService = async (request, callback) => {
            try {
                var response = {}
                var data = {
                    shopId: request.body.shopId
                }
                var user_files = []

                var userOldLedgersModel = await userProfileModel.getOneUserForLedgerModel(data)
                data.customerID = userOldLedgersModel.data[0].customerID
                var userOldLedgersModel = await userProfileModel.userOldLedgersModel(data)


                if (userOldLedgersModel.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                } else {
                    userOldLedgersModel.data.forEach((val, ind) => {
                        user_files.push(val.fileUrl)
                    });
                    // console.log("user_files", user_files)
                    response.error = false
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.SuccessString
                    response.data = user_files
                }
            } catch (e) {
                console.log(e)
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
            }
            callback(response)
        }


        this.userPaymentLedgerDownloadService = async (request, callback) => {
            try {
                var response = {}
                console.log("ledger1 auth data", request.body.auth)
                var data = request.body
                request.body.user_id = request.body.auth.id
                var findCustomer = await userProfileModel.getOneUserModel(request)
                // console.log("findCustomer", findCustomer)
                if (findCustomer.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                    reject(response)
                } else {
                    var customerID = findCustomer.data[0].customerID
                    var UserLedger = await utils.UserLedger(findCustomer.data[0].customerID)
                    console.log("UserLedger", UserLedger)
                    if (UserLedger.error) {
                        response.error = true
                        response.statusCode = STRINGS.errorStatusCode
                        response.message = "Ledger File Not Found"
                    } else {
                        // console.log("path.resolve(__dirname",path.resolve(__dirname, `../../../../../www/html/${process.env.USER_LEDGER}`))

                        // var rawdata = fs.readFileSync(path.resolve(__dirname, `../../../../../www/html/${process.env.USER_LEDGER}`))


                        // var ledgerData = JSON.parse(parser.toJson(rawdata, {
                        //     reversible: true
                        // }));
                        // var newrawdata = ledgerData['ENVELOPE']['LEDGERS']
                        // // console.log("newrawdata",newrawdata)
                        // if (newrawdata.length > 0) {

                        //     var filterLedger = newrawdata.filter(function (item) {
                        //         // console.log("datas",item)
                        //         return item.LEDGERCODE.$t == customerID
                        //     })
                        //     // console.log("filterLedger", filterLedger)

                        //     // console.log("filterLedger", filterLedger[0].HISTORY[0])

                        var filterLedger = UserLedger

                        if (filterLedger.length > 0) {
                            var ledgerHistory = filterLedger[0].HISTORY
                            ledgerHistory = ledgerHistory == undefined ? [] : ledgerHistory
                            var historyResult = []
                            if (Array.isArray(ledgerHistory)) {
                                historyResult = ledgerHistory
                                // console.log("historyResult",historyResult)
                            } else if (typeof ledgerHistory === 'object') {
                                historyResult.push(ledgerHistory)
                            }
                            // console.log("historyResult first2", historyResult)


                            var resp = []
                            if (historyResult.lenth != 0 &&
                                data.fromDate.length != 0 && data.toDate.length != 0) {
                                // console.log("historyResult", historyResult)
                                historyResult.forEach((val, ind) => {
                                    var date = new Date(val.DATE.$t)
                                    // console.log("date history", date)
                                    var startDate = new Date(data.fromDate);
                                    var toDate = new Date(data.toDate);
                                    // console.log("date startDate", startDate)
                                    // console.log("date toDate", toDate)

                                    if (startDate.getTime() <= date.getTime() && toDate.getTime() >= date.getTime()) {
                                        resp.push(val)
                                    }
                                })
                            } else {
                                resp = historyResult
                            }

                            // console.log("response", resp)

                            var options = {
                                format: "A2",
                                orientation: "portrait",
                                // border: "10mm",
                                // header: {
                                //     height: "45mm",
                                //     // contents: '<div style="text-align: center;"><h1>Europet Products Pvt Ltd</h1></div>'
                                // },
                                // footer: {
                                //     height: "28mm",
                                //     contents: {
                                //         first: 'Cover page',
                                //         // 2: 'Second page', // Any page number is working. 1-based index
                                //         default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
                                //         last: 'Last Page'
                                //     }
                                // }
                            };
                            var ledgers = []
                            resp.forEach((val, ind) => {
                                let obj = {}
                                let ledger_date = val.DATE.$t.length > 0 ? val.DATE.$t.split('-') : val.DATE.$t
                                obj.no = ind + 1
                                obj.date = ledger_date[1] + '-' + ledger_date[2] + '-' + ledger_date[0]
                                obj.particulars = val.PARTICULARS.$t
                                // obj.amount = val.AMOUNT.$t
                                obj.voucherNmber = val.VOUCHERNUMBER.$t
                                obj.credit = val.TYPE.$t == 'Credit' ? val.AMOUNT.$t : null
                                obj.debit = val.TYPE.$t == 'Debit' ? val.AMOUNT.$t : null
                                obj.voucherType = val.VOUCHERTYPE.$t
                                ledgers.push(obj)
                            })
                            // require('../../.././../../www')

                            var html = fs.readFileSync(path.resolve(__dirname, `../../.././../../www/${process.env.PDF_TEMPLATE}`), "utf8");
                            var timestamp = (new Date).getTime().toString()

                            var ledgerObj = {}
                            ledgerObj.openingBalance = filterLedger[0].OPENINGBALANCE.$t
                            ledgerObj.outstandingBalance = filterLedger[0].CLOSINGBALANCE.$t
                            ledgerObj.totalDebit = filterLedger[0].TOTALDEBIT.$t
                            ledgerObj.totalCredit = filterLedger[0].TOTALCREDIT.$t

                            var shopAddress = findCustomer.data[0].shopAddress.length > 0 ? findCustomer.data[0].shopAddress.split(',')
                                : []
                            // console.log("shopAddress", shopAddress)
                            var output = [];
                            for (var ind = 0; ind < shopAddress.length; ind++) {
                                //   console.log("ind", ind)
                                if (shopAddress[ind].length > 11) {
                                    var temp = shopAddress[ind]
                                    output.push(`${temp},`)
                                } else {
                                    var k = shopAddress.length > ind + 1 ? shopAddress[ind] + ',' + shopAddress[ind + 1] : shopAddress[ind]
                                    if (ind != shopAddress.length - 1) {
                                        k = k + ','
                                    }
                                    output.push(k)
                                    ind++;
                                }
                            }

                            var document = {
                                html: html,
                                data: {
                                    ledgers: ledgers,
                                    shopName: findCustomer.data[0].shopName,
                                    shopAddress: output,
                                    ledgerObj: ledgerObj
                                },
                                path: path.resolve(__dirname, `../../../../../www/html/uploads/UserLedger-${timestamp}.pdf`),
                                type: "",
                            };
                            // require('../../../../www/html/uploads')

                            try {
                                var pdf_data = await pdf.create(document, options)
                                console.log("pdfResp", pdf_data)
                                var fileObj = Object.assign("", pdf_data)
                                var file_url = fileObj.filename.replace('/var/www/html/', "");
                                // console.log("file_url", file_url)
                                var fileData = {}
                                fileData.file_path = path.resolve(__dirname, `../../../../../www/html/${file_url}`)
                                fileData.fileName = fileObj.filename.replace('/var/www/html/uploads/', "");
                                fileData.type = 'temp_files'
                                var s3PdfUpload = await uploadS3.S3_upload(fileData)
                                // console.log("s3PdfUpload", s3PdfUpload)
                                response.error = false
                                response.statusCode = STRINGS.successStatusCode
                                response.message = STRINGS.SuccessString
                                response.fileUrl = s3PdfUpload.data
                            } catch (error) {
                                console.log('pdf error', error)
                                response.error = true
                                response.statusCode = STRINGS.errorStatusCode
                                response.message = STRINGS.commanErrorString
                            }
                            // console.log("history",response.history)
                        } else {
                            response.error = true
                            response.statusCode = STRINGS.errorStatusCode
                            response.message = "Ledger Is Empty"
                        }
                        // } else {
                        //     response.error = true
                        //     response.statusCode = STRINGS.errorStatusCode
                        //     response.message = "Ledger Is Empty"
                        // }

                    }
                }
            } catch (e) {
                if (e.code === 'ENOENT') {
                    console.error('File not found!', e);
                    response.error = true
                    response.statusCode = STRINGS.errorStatusCode
                    response.message = "Ledger File Not Found"
                } else {
                    console.error('An error occurred:', e);
                    response.error = true
                    response.statusCode = STRINGS.errorStatusCode
                    response.message = STRINGS.oopsErrorMessage
                }
            }
            callback(response)
        }








    }
}




export default UserProfileService;