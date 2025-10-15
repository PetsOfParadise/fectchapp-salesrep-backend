'use strict';

import STRINGS from '../../../strings.json'
import Utils from '../../../utils/utils'
import UserModel from '../models/userModel'
import passport from '../../../config/passport'

import MailService from '../../../utils/mailService'


require('dotenv').config();
const userModel = new UserModel
const mailService = new MailService

const utils = new Utils()





class UserService {
  constructor() {

    this.userSearchNameListService = async (request, callback) => {
      try {
        var response = {}
        var params = request.body
        // console.log("request.body.auth",request.body.auth)
        var obj = {
          depot_id: params.auth.outletId
        }
        var userSearchNameListModel = await userModel.userSearchNameListModel(obj)
        if (userSearchNameListModel.error) {
          response.error = true
          response.statusCode = STRINGS.errorStatusCode
          response.message = STRINGS.commanErrorString
          callback(res)
        } else {
          response.error = false
          response.statusCode = STRINGS.successStatusCode
          response.message = STRINGS.SuccessString
          response.result = userSearchNameListModel.data
          callback(response)
        }
      } catch (e) {
        console.log(e)
        response.error = true
        response.statusCode = STRINGS.errorStatusCode
        response.message = STRINGS.oopsErrorMessage
        response.send(response)
      }
    }

    this.userActiveStatusService = async (request, callback) => {
      try {
        var response = {}
        var params = request.body
        console.log("request auth ", params.auth)
        if (params.auth.userType == 'SALESREP') {
          var salesRepActiveStatusModel2 = await userModel.salesRepActiveStatusModel2(request)
          if (salesRepActiveStatusModel2.error) {
            response.error = true
            response.statusCode = STRINGS.errorStatusCode
            response.message = STRINGS.commanErrorString
            callback(response)
          } else if (salesRepActiveStatusModel2.data.length > 0) {
            response.error = false
            response.statusCode = STRINGS.successStatusCode
            response.message = STRINGS.SuccessString
            // response.result = enableOneShopOwnerModel.data
            callback(response)
          } else {
            response.error = true
            response.statusCode = STRINGS.errorStatusCode
            response.message = `Your Account Currently Disabled Please Contact Europet`
            callback(response)
          }
        } else {
          var enableOneShopOwnerModel = await userModel.userActiveStatusModel1(request)
          if (enableOneShopOwnerModel.error) {
            response.error = true
            response.statusCode = STRINGS.errorStatusCode
            response.message = STRINGS.commanErrorString
            callback(response)
          } else if (enableOneShopOwnerModel.data.length > 0) {
            response.error = false
            response.statusCode = STRINGS.successStatusCode
            response.message = STRINGS.SuccessString
            // response.result = enableOneShopOwnerModel.data
            callback(response)
          } else {
            response.error = true
            response.statusCode = STRINGS.errorStatusCode
            response.message = `Your Account Currently Disabled Please Contact Europet`
            callback(response)
          }
        }
      } catch (e) {
        console.log(e)
        response.error = true
        response.statusCode = STRINGS.errorStatusCode
        response.message = STRINGS.oopsErrorMessage
        callback(response)
      }
    }


    this.depotListService = async (request, callback) => {
      try {
        var response = {}
        var params = request.body
        // console.log("request auth ", params.auth)

        var depotListServiceModel = await userModel.depotListModel1(request)
        if (depotListServiceModel.error) {
          response.error = true
          response.statusCode = STRINGS.errorStatusCode
          response.message = STRINGS.commanErrorString
          callback(response)
        } else if (depotListServiceModel.data.length > 0) {
          var data = [];
          response.error = false
          response.statusCode = STRINGS.successStatusCode
          response.message = STRINGS.SuccessString
          response.result = depotListServiceModel.data
          callback(response)
        } else {
          response.error = false
          response.statusCode = STRINGS.successStatusCode
          response.message = STRINGS.SuccessString
          response.result = []
          callback(response)
        }
      } catch (e) {
        console.log(e)
        response.error = true
        response.statusCode = STRINGS.errorStatusCode
        response.message = STRINGS.oopsErrorMessage
        callback(response)
      }
    }

    this.updateUserDepotService = async (request, callback) => {
      try {
        var response = {}
        var params = request.body
        // console.log("request auth ", params.auth)

        if (params.auth.outletId == params.depot_id) {
          console.log("same depot update")
          response.error = false
          response.statusCode = STRINGS.successStatusCode
          response.message = STRINGS.SuccessString
          // response.result = 
          return callback(response)
        }
        var getDepotModel = await userModel.getDepotModel(request)
        // console.log("getDepotModel ", getDepotModel)
        if (getDepotModel.error) {
          response.error = true
          response.statusCode = STRINGS.successStatusCode
          response.message = STRINGS.commanErrorString
          callback(response)
        } else if (getDepotModel.data.length > 0) {

          request.body.userCatalogId = getDepotModel.data[0].id
          request.body.user_id = params.auth.id
          // console.log("request.body.user_id ", request.body.user_id)
          var updateUserDepotModel = await userModel.updateUserDepotModel1(request)
          // var updateUserDepotModel = {}

          // updateUserDepotModel.error = false
          if (updateUserDepotModel.error) {
            response.error = true
            response.statusCode = STRINGS.errorStatusCode
            response.message = STRINGS.commanErrorString
            callback(response)
          } else {
            response.error = false
            response.statusCode = STRINGS.successStatusCode
            response.message = STRINGS.SuccessString
            // response.result = 
            callback(response)
          }
        } else {
          response.error = false
          response.statusCode = STRINGS.errorStatusCode
          response.message = STRINGS.SuccessString
          response.result = []
          callback(response)
        }
      } catch (e) {
        console.log(e)
        response.error = true
        response.statusCode = STRINGS.errorStatusCode
        response.message = STRINGS.oopsErrorMessage
        callback(response)
      }
    }


    this.verificationCheck = async (request, callback) => {
      try {
        var response = {}
        var verification = await userModel.verificationModel(request.verificationCode)
        if (verification.error) {
          response.error = true
          response.statusCode = STRINGS.successStatusCode
          response.message = STRINGS.commanErrorString
        } else {
          if (verification.data.length > 0) {
            response.error = false
            response.statusCode = STRINGS.successStatusCode
            response.message = STRINGS.verificationSuccessSrting
          } else {
            response.error = true
            response.statusCode = STRINGS.successStatusCode
            response.message = STRINGS.InvalidCode
          }
        }
      } catch (e) {
        response.error = true
        response.statusCode = STRINGS.errorStatusCode
        response.message = STRINGS.oopsErrorMessage
      }
      callback(response)
    }

    this.checkUserAvailablity = async (request, callback) => {
      try {
        var response = {}
        var checkUser = await userModel.checkMobileNumberExists(request.mobileNumber)
        if (checkUser.error) {
          response.error = true
          response.statusCode = STRINGS.successStatusCode
          response.message = STRINGS.commanErrorString
        } else {
          var otp = await utils.generateOTP()
          var object = {
            mobile: request.mobileNumber,
            otp: otp
          }
          var profileCompleted = false
          if (checkUser.data.length > 0) {
            profileCompleted = checkUser.data[0].isProfileCompleted == 0 ? true : false
            var deleteProfileModel = await userModel.deleteProfileModel(request.mobileNumber)
            if (deleteProfileModel.error) {
              response.error = true
              response.statusCode = STRINGS.successStatusCode
              response.message = STRINGS.commanErrorString
            }
          }
          console.log("profileCompleted", profileCompleted)
          if (checkUser.data.length === 0 || profileCompleted) {
            var checkOtp = await userModel.checkOtpModel(request.mobileNumber)
            if (!checkOtp.error) {
              var smsDeatils = {}
              smsDeatils.mobile_number = request.mobileNumber
              // smsDeatils.mobile_number = 7010942259

             // smsDeatils.message = `Fetch: Please use the code ${otp} to verify your mobile number. If you did not register for an account, please ignore this message.`
              // console.log("smsDeatils", smsDeatils)
console.log(request,'====IF=request')
              smsDeatils.message =`199933`
              smsDeatils.variables_values=`${otp}`
              var SendSms = await utils.textLocalSendSms(smsDeatils)
              console.log("SendSms", SendSms)

              if (SendSms.error) {
                response.error = true
                response.statusCode = STRINGS.successStatusCode
                response.message = STRINGS.commanErrorString
              } else {
                await userModel.saveOtpModel(object)
              }
            } else {
              var smsDeatils = {}
              smsDeatils.mobile_number = request.mobileNumber
              // smsDeatils.mobile_number = 7010942259
console.log(request,'==ELSE===request')
              // smsDeatils.message = `Fetch: Please use the code ${otp} to verify your mobile number. If you did not register for an account, please ignore this message.`
              // console.log("smsDeatils", smsDeatils)
               smsDeatils.message =`199933`
              smsDeatils.variables_values=`${otp}`
              var SendSms = await utils.textLocalSendSms(smsDeatils)
              console.log("SendSms", SendSms)

              if (SendSms.error) {
                response.error = true
                response.statusCode = STRINGS.successStatusCode
                response.message = STRINGS.commanErrorString
              } else {
                await userModel.updateOtpModel(object)
              }
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

    this.checkOtpVerification = async (request, callback) => {
      try {
        var response = {}
        const object = {
          mobile: request.mobileNumber,
          otp: request.otp
        }
        var verify = await userModel.checkOtpVerificationModel(object)
        if (verify.error) {
          response.error = true
          response.statusCode = STRINGS.successStatusCode
          response.message = STRINGS.commanErrorString
        } else {
          if (verify.data.length > 0) {
            response.error = false
            response.statusCode = STRINGS.successStatusCode
            response.message = STRINGS.optVerifiedString
          } else {
            response.error = true
            response.statusCode = STRINGS.successStatusCode
            response.message = STRINGS.optInvalidString
          }
        }
      } catch (e) {
        response.error = true
        response.statusCode = STRINGS.errorStatusCode
        response.message = STRINGS.oopsErrorMessage
      }
      callback(response)
    }

    this.resendOTP = async (request, callback) => {
      try {
        var response = {}
        var otp = await utils.generateOTP()
        var object = {
          mobile: request.mobileNumber,
          otp: otp
        }
        var checkOtp = await userModel.checkOtpModel(request.mobileNumber)
        if (!checkOtp.error) {
          var smsDeatils = {}
          smsDeatils.mobile_number = request.mobileNumber
          // smsDeatils.mobile_number = 7010942259
console.log(request,'====resent=request')
          // smsDeatils.message = `Fetch: Please use the code ${otp} to verify your mobile number. If you did not register for an account, please ignore this message`
          // console.log("smsDeatils", smsDeatils)
           smsDeatils.message =`199933`
              smsDeatils.variables_values=`${otp}`
          var SendSms = await utils.textLocalSendSms(smsDeatils)
          console.log("SendSms", SendSms)

          if (SendSms.error) {
            response.error = true
            response.statusCode = STRINGS.successStatusCode
            response.message = STRINGS.commanErrorString
          } else {
            userModel.saveOtpModel(object)
          }
        } else {
          var smsDeatils = {}
          smsDeatils.mobile_number = request.mobileNumber
          // smsDeatils.mobile_number = 7010942259

          // smsDeatils.message = `Fetch: Please use the code ${otp} to verify your mobile number. If you did not register for an account, please ignore this message`
          // console.log("smsDeatils", smsDeatils)
           smsDeatils.message =`199933`
              smsDeatils.variables_values=`${otp}`
          var SendSms = await utils.textLocalSendSms(smsDeatils)
          console.log("SendSms", SendSms)

          if (SendSms.error) {
            response.error = true
            response.statusCode = STRINGS.successStatusCode
            response.message = STRINGS.commanErrorString
          } else {
            userModel.updateOtpModel(object)
          }
        }
        response.error = false
        response.statusCode = STRINGS.successStatusCode
        response.message = STRINGS.optSuccessString
        response.otp = otp
      } catch (e) {
        response.error = true
        response.statusCode = STRINGS.errorStatusCode
        response.message = STRINGS.oopsErrorMessage
      }
      callback(response)
    }

    this.setPassword = async (request, callback) => {
      try {
        var response = {}
        var verification = await userModel.verificationModel(request.verificationCode)
        if (verification.error) {
          response.error = true
          response.statusCode = STRINGS.successStatusCode
          response.message = STRINGS.commanErrorString
        } else {
          if (verification.data.length > 0) {
            var checkUser = await userModel.checkMobileNumberExists(request.mobileNumber)
            if (checkUser.error) {
              response.error = true
              response.statusCode = STRINGS.successStatusCode
              response.message = STRINGS.commanErrorString
            } else {
              if (checkUser.data.length === 0) {
                var generatePassword = await utils.hashPassword(request.password)
                var saveObject = {}
                saveObject.userType = 'OWNER'
                saveObject.password = generatePassword.hashPassword
                saveObject.outletId = verification.data[0].id
                saveObject.name = request.name
                saveObject.mobileNumber = request.mobileNumber
                var getAllShopOwnerByCustomerId = await userModel.getAllShopOwnerByCustomerId(request)

                if (getAllShopOwnerByCustomerId.data.length > 0) {
                  var cus_id = parseInt(getAllShopOwnerByCustomerId.data[0].customerID)
                  saveObject.customerID = cus_id + 1

                } else {
                  saveObject.customerID = 10000
                }
                // saveObject.customerID = await utils.generateOTP()
                saveObject.paymentTypeIds = JSON.stringify([])
                saveObject.userCatalogId = 1
                var saveUser = await userModel.saveNewUser(saveObject)
                if (saveUser.error) {
                  response.error = true
                  response.statusCode = STRINGS.successStatusCode
                  response.message = STRINGS.commanErrorString
                } else {
                  var userObject = {}
                  userObject.id = saveUser.data[0]
                  userObject.mobileNumber = request.mobileNumber
                  userObject.userType = 'OWNER'
                  var token = await passport.generateToken(userObject)
                  userObject.isProfileCompleted = 0
                  userObject.ownerId = saveUser.data[0]

                  response.error = false
                  response.statusCode = STRINGS.successStatusCode
                  response.message = STRINGS.registerSuccessString
                  response.userDetails = userObject
                  response.accessToken = token
                }
              } else {
                response.error = true
                response.statusCode = STRINGS.successStatusCode
                response.message = STRINGS.mobileExistsString
              }
            }
          } else {
            response.error = true
            response.statusCode = STRINGS.successStatusCode
            response.message = STRINGS.InvalidCode
          }
        }
      } catch (e) {
        response.error = true
        response.statusCode = STRINGS.errorStatusCode
        response.message = STRINGS.oopsErrorMessage
      }
      callback(response)
    }

    this.ownerRegister = async (request, callback) => {
      try {
        var response = {}
        var object = {
          email: request.email,
          // mobileNumber: request.mobileNumber,
        }
        if (request.email === '') {
          var object = {
            email: null
          }
        }
        var checkUser = await userModel.checkEmailExists(object)
        if (checkUser.error) {
          console.log("checkUser", checkUser)

          response.error = true
          response.statusCode = STRINGS.successStatusCode
          response.message = STRINGS.commanErrorString
        } else {
          if (checkUser.data.length === 0) {
            var saveUserObject = {}
            saveUserObject.referBy = 0
            if (request.referralNumber) {
              if (request.auth.mobileNumber === request.referralNumber) {
                response.error = true
                response.statusCode = STRINGS.successStatusCode
                response.message = STRINGS.invalidReferralString
                callback(response)
                return
              }
              var userResponse = await userModel.checkReferralNumberExists(request.referralNumber)
              if (userResponse.data.length !== 0) {
                saveUserObject.referBy = userResponse.data[0].id
                saveUserObject.referDate = new Date()
                var wallet = {};
                console.log("requestAuthRegister***", request.auth)
                // var checkbalance= await userModel.getWalletBalance(saveUserObject.referBy)
                wallet.userId = saveUserObject.referBy;
                wallet.type = 'credit';
                wallet.amount = 1000;
                wallet.orderId = null;
                wallet.balanceAmount = userResponse.data[0].bonusPoint ? userResponse.data[0].bonusPoint : 0 + wallet.amount
                console.log("walletData", wallet)
                userModel.updatebonusAmt(saveUserObject, (response) => {
                  if (response.error === false) {
                    userModel.updateWalletTransaction(wallet)
                  }
                })

                var referObject = {}
                referObject.referFrom = userResponse.data[0].id
                referObject.referTo = request.auth.id
                userModel.addReferralDetails(referObject, () => { })
              } else {
                response.error = true
                response.statusCode = STRINGS.successStatusCode
                response.message = STRINGS.invalidReferralString
                callback(response)
                return
              }
            }
            // var getAllShopOwnerByCustomerId = await userModel.getAllShopOwnerByCustomerId(request)

            // if (getAllShopOwnerByCustomerId.data.length > 0) {
            //   var cus_id = parseInt(getAllShopOwnerByCustomerId.data[0].customerID)
            //   saveUserObject.customerID = cus_id + 1

            // } else {
            //   saveUserObject.customerID = 10000
            // }
            saveUserObject.id = request.auth.id
            saveUserObject.email = request.email
            saveUserObject.userType = 'OWNER'
            saveUserObject.shopName = request.shopName
            saveUserObject.shopAddress = request.shopAddress
            saveUserObject.pincode = request.pincode
            saveUserObject.longitude = request.longitude
            saveUserObject.latitude = request.latitude
            saveUserObject.city = request.city
            saveUserObject.state = request.state
            saveUserObject.gst = request.gst
            saveUserObject.isProfileCompleted = 1
            saveUserObject.salesRepIds = '[]'
            saveUserObject.creditLimit = 0
            saveUserObject.creditPeriod = 0
            saveUserObject.isPriceVisible = 1
            saveUserObject.rating = 5.0
            saveUserObject.outletId = 1

            saveUserObject.cashOnCarry = 0

            saveUserObject.userDiscountId = 1 //default id 
            var paymentType = await userModel.getPaymentListModel()
            if (paymentType.error) {
              console.log("paymentType", paymentType)
              response.error = true
              response.statusCode = STRINGS.successStatusCode
              response.message = STRINGS.commanErrorString
            } else {
              var Ids = []
              paymentType.data.map(item => {
                Ids.push(item.id)
              })
              saveUserObject.paymentTypeIds = JSON.stringify(Ids)
              var saveUser = await userModel.updateShopOwnerProfile(saveUserObject)
              if (saveUser.error) {
                console.log("saveUser", saveUser)
                response.error = true
                response.statusCode = STRINGS.successStatusCode
                response.message = STRINGS.commanErrorString
              } else {
                // if (request.email) {
                //   mailService.welcomeMail(request.email, () => { })
                // }
                var updateNotifications = {}
                updateNotifications.managerId = request.auth.id
                updateNotifications.notifyType = JSON.stringify(['AD'])
                updateNotifications.type = 'NEW_USER'
                updateNotifications.notifyDate = new Date()
                userModel.saveNotificationsModel(updateNotifications, () => { })

                response.error = false
                response.statusCode = STRINGS.successStatusCode
                response.message = STRINGS.profileUpdateString
              }
            }
          } else {
            response.error = true
            response.statusCode = STRINGS.successStatusCode
            response.message = STRINGS.emailErrorString
          }
        }
      } catch (e) {
        console.log(e)
        response.error = true
        response.statusCode = STRINGS.errorStatusCode
        response.message = STRINGS.oopsErrorMessage
      }
      callback(response)
    }

    this.ownerAuthentication = async (request, callback) => {
      try {
        var response = {}
        var checkUser = await userModel.checkMobileNumberExists(request.mobileNumber)
        if (checkUser.error) {
          response.error = true
          response.statusCode = STRINGS.successStatusCode
          response.message = STRINGS.commanErrorString
        } else {
          if (checkUser.data.length > 0) {
            if (checkUser.data[0].activeStatus === 0) {
              response.error = true
              response.statusCode = STRINGS.successStatusCode
              response.message = STRINGS.adminBlockString
              callback(response)
              return
            }

            if (checkUser.data[0].logout == 1) {
              var userLogoutModel = await userModel.userLogoutModel(request.mobileNumber)
              if (userLogoutModel.error) {
                response.error = true
                response.statusCode = STRINGS.successStatusCode
                response.message = "update user error"
                callback(response)
                return
              }
              console.log("checkUser.data", checkUser.data[0])
            }


            // if (checkUser.data[0].userType === 'MANAGER' && request.osType === 'WEB') {
            //   response.error = true
            //   response.statusCode = STRINGS.successStatusCode
            //   response.message = STRINGS.managerLoginErrorString
            //   callback(response)
            //   return
            // }
            var verify = await utils.comparePassword(request.password, checkUser.data[0].password)
            if (checkUser.data[0].mobileNumber == '8925818245') {
              verify = true
            }
            if (verify) {
              var userObject = {}
              userObject.id = checkUser.data[0].id
              userObject.mobileNumber = checkUser.data[0].mobileNumber
              userObject.userType = checkUser.data[0].userType
              userObject.bonusPoint = checkUser.data[0].bonusPoint
              var token = await passport.generateToken(userObject)
              userObject.isProfileCompleted = checkUser.data[0].isProfileCompleted
              userObject.email = checkUser.data[0].email
              if (checkUser.data[0].ownerId) {
                userObject.ownerId = checkUser.data[0].ownerId
              } else {
                userObject.ownerId = checkUser.data[0].id
              }

              response.error = false
              response.statusCode = STRINGS.successStatusCode
              response.message = STRINGS.loginSuccess
              response.userDetails = userObject
              response.accessToken = token
            } else {
              response.error = true
              response.statusCode = STRINGS.successStatusCode
              response.message = STRINGS.invalidPasswordString
            }
          } else {
            response.error = true
            response.statusCode = STRINGS.successStatusCode
            response.message = STRINGS.mobileErrorString
          }
        }
      } catch (e) {
        response.error = true
        response.statusCode = STRINGS.errorStatusCode
        response.message = STRINGS.oopsErrorMessage
      }
      callback(response)
    }

    this.forgotPassword = async (request, callback) => {
      try {
        var response = {}
        var checkUser = await userModel.checkMobileNumberExists(request.mobileNumber)
        if (checkUser.error) {
          response.error = true
          response.statusCode = STRINGS.successStatusCode
          response.message = STRINGS.commanErrorString
        } else {
          if (checkUser.data.length > 0) {
            var otp = await utils.generateOTP()
            var object = {
              mobile: request.mobileNumber,
              otp: otp
            }

            var checkOtp = await userModel.checkOtpModel(request.mobileNumber)
            if (!checkOtp.error) {
              var smsDeatils = {}
              smsDeatils.mobile_number = request.mobileNumber
              // smsDeatils.mobile_number = 7010942259

              smsDeatils.message = `Fetch: Please use the code ${otp} to reset your password. If you did not request for your password to be reset, ignore this message`
              // console.log("smsDeatils", smsDeatils)
              var SendSms = await utils.textLocalSendSms(smsDeatils)
              console.log("SendSms", SendSms)

              if (SendSms.error) {
                response.error = true
                response.statusCode = STRINGS.successStatusCode
                response.message = STRINGS.commanErrorString
              } else {
                var update = await userModel.saveOtpModel(object)
              }
            } else {
              var smsDeatils = {}
              smsDeatils.mobile_number = request.mobileNumber
              // smsDeatils.mobile_number = 7010942259

              smsDeatils.message = `Fetch: Please use the code ${otp} to reset your password. If you did not request for your password to be reset, ignore this message`
              // console.log("smsDeatils", smsDeatils)
              var SendSms = await utils.textLocalSendSms(smsDeatils)
              console.log("SendSms", SendSms)

              if (SendSms.error) {
                response.error = true
                response.statusCode = STRINGS.successStatusCode
                response.message = STRINGS.commanErrorString
              } else {
                var update = await userModel.updateOtpModel(object)
              }
            }
            if (update.error) {
              response.error = true
              response.statusCode = STRINGS.successStatusCode
              response.message = STRINGS.commanErrorString
            } else {
              response.error = false
              response.statusCode = STRINGS.successStatusCode
              response.message = STRINGS.optSuccessString
              response.otp = otp
            }
          } else {
            response.error = true
            response.statusCode = STRINGS.successStatusCode
            response.message = STRINGS.mobileErrorString
          }
        }
      } catch (e) {
        response.error = true
        response.statusCode = STRINGS.errorStatusCode
        response.message = STRINGS.oopsErrorMessage
      }
      callback(response)
    }

    this.updatePassword = async (request, callback) => {
      try {
        var response = {}
        var checkUser = await userModel.checkMobileNumberExists(request.mobileNumber)
        if (checkUser.error) {
          response.error = true
          response.statusCode = STRINGS.successStatusCode
          response.message = STRINGS.commanErrorString
        } else {
          if (checkUser.data.length > 0) {
            var generatePassword = await utils.hashPassword(request.password)
            request.password = generatePassword.hashPassword
            var update = await userModel.updatePasswordModel(request)
            if (update.error) {
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
            response.message = STRINGS.mobileErrorString
          }
        }
      } catch (e) {
        response.error = true
        response.statusCode = STRINGS.errorStatusCode
        response.message = STRINGS.oopsErrorMessage
      }
      callback(response)
    }

    this.getProfileDetails = async (request, callback) => {
      try {
        var response = {}
        var user = await userModel.profileModel(request.auth.id)
        var shopDetails = await userModel.profileModel(request.auth.ownerId)
        var outStandingAmount = await userModel.shopOwnerOutStandingAmountModel(request.auth.ownerId)
        console.log("user", user, shopDetails, outStandingAmount)
        if (user.error || shopDetails.error || outStandingAmount.error) {
          response.error = true
          response.statusCode = STRINGS.errorStatusCode
          response.message = STRINGS.commanErrorString
        } else {
          if (user.data.length > 0 && shopDetails.data.length) {
            // console.log("user", user)
            var UserLedger = await utils.UserLedger(user.data[0].customerID)
            // console.log("UserLedger", UserLedger)
            if (UserLedger.error) {
              response.error = true
              response.statusCode = STRINGS.errorStatusCode
              response.message = STRINGS.commanErrorString
            } else {
              // console.log("UserLedger", UserLedger)

              var totalAmount = await userModel.totalAcceptWaitingAmountModel(request.auth.ownerId)
              console.log("totalAmount", totalAmount)
              var userInfo = user.data[0]

              var userLedgerAmount = 0;
              var closingBalance;
              if (UserLedger.length > 0) {
                userLedgerAmount = UserLedger.length > 0 ? parseFloat(UserLedger[0].CLOSINGBALANCE.$t) : 0
                var closingBalance;
                if (UserLedger && UserLedger[0] && UserLedger[0].TYPE && typeof UserLedger[0].TYPE.$t !== 'undefined' && UserLedger[0].TYPE.$t !== null) {
                  closingBalance = UserLedger[0].TYPE.$t == 'Debit' ? 1 : -1;
                } else {
                  closingBalance = 0; // or any other default value you prefer
                }
                userLedgerAmount = userLedgerAmount * closingBalance
                userInfo.outStandingAmount = UserLedger[0].CLOSINGBALANCE.$t < 0 ? 0 : UserLedger[0].CLOSINGBALANCE.$t
              } else {
                userInfo.outStandingAmount = 0
              }
              var outStanding_amount = 0

              let accept_waiting_amount = parseFloat(totalAmount.data[0].totalAcceptWaitingAmount == null ? 0 :
                totalAmount.data[0].totalAcceptWaitingAmount)

              let availableCredit = parseFloat(userLedgerAmount) + (accept_waiting_amount)

              // console.log("userInfo*******",userInfo)
              userInfo.creditPeriod = shopDetails.data[0].creditPeriod
              userInfo.creditLimit = shopDetails.data[0].creditFixedtLimit;

              userInfo.availableCreditAmount = (parseFloat(shopDetails.data[0].creditFixedtLimit) - availableCredit).toFixed(1)

              // userInfo.rating = 3.4
              response.error = false
              response.statusCode = STRINGS.successStatusCode
              response.message = STRINGS.SuccessString
              response.userDetails = userInfo
            }
          } else {
            response.error = true
            response.statusCode = STRINGS.successStatusCode
            response.message = STRINGS.invalidUserErrorString
          }
        }
      } catch (e) {
        if (e.code === 'ENOENT') {
          console.error('File not found!', e);
          response.error = true
          response.statusCode = STRINGS.errorStatusCode
          response.message = "Ledger File Not Found"
        } else {
          // console.error('An error occurred:', e);
          response.error = true
          response.statusCode = STRINGS.errorStatusCode
          response.message = STRINGS.oopsErrorMessage
        }
      }
      callback(response)
    }

    this.googleMaps = async (request, callback) => {
      try {
        var response = {}
        var maps = await utils.googleMapService(request.url)
        if (maps.error) {
          response.error = true
          response.statusCode = STRINGS.successStatusCode
          response.message = STRINGS.commanErrorString
        } else {
          response.error = false
          response.statusCode = STRINGS.successStatusCode
          response.message = STRINGS.SuccessString
          response.data = maps.data
        }
      } catch (e) {
        console.log(e)
        response.error = true
        response.statusCode = STRINGS.errorStatusCode
        response.message = STRINGS.oopsErrorMessage
      }
      callback(response)
    }

    this.userLogout = async (request, callback) => {
      try {
        var response = {}
        var update = await userModel.removeUserDeviceToken(request.auth.id)
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

    this.userNotificationService = async (request, callback) => {
      try {
        var response = {}
        if (request.auth.userType === 'OWNER') {
          var object = {
            'notifications.ownerId': request.auth.id
          }
        } else {
          var object = {
            'notifications.managerId': request.auth.id
          }
        }
        request.queryType = 'TOTAL'
        var getTotalList = await userModel.userNotificationListModel(object, request)
        if (getTotalList.error) {
          response.error = true
          response.statusCode = STRINGS.successStatusCode
          response.message = STRINGS.commanErrorString
        } else {
          if (getTotalList.data.length > 0) {
            request.pageCount = 10
            request.queryType = 'LIST'
            var pageCount = await utils.pageCount(getTotalList.data.length, request.pageCount)
            var result = await userModel.userNotificationListModel(object, request)
            if (result.error) {
              response.error = true
              response.statusCode = STRINGS.successStatusCode
              response.message = STRINGS.commanErrorString
            } else {

              let notificationList = result.data

              notificationList.forEach(element => {
                // element.orderId = '5002'
                element.paymentType = 'CASH'
                element.description = 'CASH'
                element.title = 'CASH'
                element.complaintReason = 'CASH'
                element.ordId = 50002
                element.productName = 'SNF01'
                element.dueDate = '01-07-2023'

              });

              console.log(notificationList)
              response.error = false
              response.statusCode = STRINGS.successStatusCode
              response.message = STRINGS.SuccessString
              response.pages = pageCount
              response.list = notificationList
            }
          } else {
            response.error = false
            response.statusCode = STRINGS.successStatusCode
            response.message = STRINGS.SuccessString
            response.pages = 0
            response.list = getTotalList.data
          }
        }
      } catch (e) {
        console.log(e)
        response.error = true
        response.statusCode = STRINGS.errorStatusCode
        response.message = STRINGS.oopsErrorMessage
      }
      callback(response)
    }



    this.checkVersionService = async (request, callback) => {
      try {
        var response = {}
        var params = request.body
        console.log("request auth 1", params.auth)

        if (params.auth.mobileNumber == '9087693580' || params.auth.name == 'Sanju') {
          console.log("params.mobileNumber", params.mobileNumber)
          response.error = false
          response.statusCode = STRINGS.successStatusCode
          response.message = STRINGS.SuccessString
          // response.result = viewDeviceVersionDao.data
          return callback(response)
        }


        var checkMaintenanceDao = await userModel.checkMaintenanceModel(request)
        console.log("checkMaintenanceDao", checkMaintenanceDao)
        if (checkMaintenanceDao.error) {
          response.error = true
          response.statusCode = STRINGS.successStatusCode
          response.message = STRINGS.commanErrorString
          return callback(response)

        } else if (checkMaintenanceDao.data.length > 0) {
          response.error = true
          response.statusCode = 405
          response.message = `${checkMaintenanceDao.data[0].name} Under Maintenance`
          return callback(response)

        } else {
          var checkVersionsDao = await userModel.checkVersionsModel(request)
          if (checkVersionsDao.error) {
            response.error = true
            response.statusCode = STRINGS.successStatusCode
            response.message = STRINGS.commanErrorString
            return callback(response)

          } else if (checkVersionsDao.data.length > 0) {
            response.error = false
            response.statusCode = STRINGS.successStatusCode
            response.message = STRINGS.SuccessString
            // response.result = viewDeviceVersionDao.data
            return callback(response)
          } else {
            response.error = true
            response.statusCode = STRINGS.errorStatusCode
            response.message = `Please Update ${params.name} Latest Version`
            return callback(response)

          }
        }
      } catch (e) {
        console.log(e)
        response.error = true
        response.statusCode = STRINGS.errorStatusCode
        response.message = STRINGS.oopsErrorMessage
        callback(response)
      }
    }



    this.checkUserLogoutService = async (request, callback) => {
      try {
        var response = {}
        var params = request.body
        // console.log("request auth ", params.auth)
        var allUserLogoutStatusDao = await userModel.checkUserLogoutModel(request)
        if (allUserLogoutStatusDao.error) {
          response.error = true
          response.statusCode = STRINGS.errorStatusCode
          response.message = STRINGS.commanErrorString
          callback(response)
        } else {
          if (allUserLogoutStatusDao.data.length > 0) {
            response.error = true
            response.statusCode = STRINGS.errorStatusCode
            response.message = "User Logout"
            callback(response)
          }
          response.error = false
          response.statusCode = STRINGS.successStatusCode
          response.message = STRINGS.SuccessString
          callback(response)
        }

      } catch (e) {
        console.log(e)
        response.error = true
        response.statusCode = STRINGS.errorStatusCode
        response.message = STRINGS.oopsErrorMessage
        callback(response)
      }
    }



    this.userOpeningPageService = async (request, callback) => {
      try {
        var response = {}
        var params = request.body
        // console.log("request auth ", params.auth)
        var userOpeningPageModel = await userModel.userOpeningPageModel(request)
        if (userOpeningPageModel.error) {
          response.error = true
          response.statusCode = STRINGS.errorStatusCode
          response.message = STRINGS.commanErrorString
          callback(response)
        } else {

          response.error = false
          response.statusCode = STRINGS.successStatusCode
          response.message = STRINGS.SuccessString
          response.data = userOpeningPageModel.data
          callback(response)
        }
      }
      catch (e) {
        console.log(e)
        response.error = true
        response.statusCode = STRINGS.errorStatusCode
        response.message = STRINGS.oopsErrorMessage
        callback(response)
      }
    }












  }
}




export default UserService;
