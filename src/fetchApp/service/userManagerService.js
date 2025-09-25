
import async from 'async'

import STRINGS from '../../../strings.json'
import Utils from '../../../utils/utils'
import UserManagerModel from '../models/userManagerModel'
require('dotenv').config();

const userManagerModel = new UserManagerModel
const utils = new Utils()




class UserManagerService {
    constructor() {




        this.createManager = async (request, callback) => {
            try {
                var response = {}
                var object = { mobileNumber: request.mobileNumber, email: request.email }
                if (request.email === '') {
                    var object = { mobileNumber: request.mobileNumber, email: null }
                }
                var checkUser = userManagerModel.mobileOrEmailExists(object)
                if (checkUser.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                } else {
                    if (checkUser.data.length === 0) {
                        request.password = '123456'
                        var generatePassword = utils.hashPassword(request.password)
                        var saveUserObject = {}
                        saveUserObject.name = request.name
                        saveUserObject.mobileNumber = request.mobileNumber
                        saveUserObject.customerID = utils.generateOTP()
                        saveUserObject.email = request.email
                        saveUserObject.userType = 'MANAGER'
                        saveUserObject.password = generatePassword.hashPassword
                        saveUserObject.ownerId = request.auth.id
                        saveUserObject.shopName = request.shopName
                        saveUserObject.shopAddress = request.shopAddress
                        saveUserObject.city = request.city
                        saveUserObject.isProfileCompleted = 1
                        saveUserObject.state = request.state
                        saveUserObject.pincode = request.pincode
                        saveUserObject.latitude = request.latitude
                        saveUserObject.longitude = request.longitude
                        saveUserObject.userCatalogId = request.auth.catalogId
                        saveUserObject.userDiscountId = request.auth.discountId
                        saveUserObject.paymentTypeIds = JSON.stringify([])
                        saveUserObject.salesRepId = request.auth.salesRepId
                        saveUserObject.outletId = request.auth.outletId
                        saveUserObject.creditPeriod = request.auth.creditPeriod

                        var save = userManagerModel.saveUserDeatils(saveUserObject)
                        if (save.error) {
                            response.error = true
                            response.statusCode = STRINGS.successStatusCode
                            response.message = STRINGS.commanErrorString
                        } else {
                            response.error = false
                            response.statusCode = STRINGS.successStatusCode
                            response.message = STRINGS.managerAddSuccessString
                        }
                    } else {
                        response.error = true
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.mobileOrEmailErrorString
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




        this.editManager = async (request, callback) => {
            try {
                var response = {}
                if (request.email === '') {
                    var object = { email: null, mobileNumber: request.mobileNumber, id: request.managerId }
                } else {
                    var object = { email: request.email, mobileNumber: request.mobileNumber, id: request.managerId }
                }
                var checkManager = userManagerModel.editCheckManager(object)
                if (checkManager.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                } else {
                    if (checkManager.data.length === 0) {
                        var saveUserObject = {}
                        saveUserObject.name = request.name
                        saveUserObject.mobileNumber = request.mobileNumber
                        saveUserObject.email = request.email
                        saveUserObject.shopName = request.shopName
                        saveUserObject.shopAddress = request.shopAddress
                        saveUserObject.city = request.city
                        saveUserObject.state = request.state
                        saveUserObject.pincode = request.pincode
                        saveUserObject.latitude = request.latitude
                        saveUserObject.longitude = request.longitude
                        saveUserObject.id = request.managerId

                        var update = userManagerModel.updateManagerProfile(saveUserObject)

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
                        response.message = STRINGS.mobileOrEmailErrorString
                    }
                }
            } catch (e) {
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
            }
            callback(response)
        }

        this.getManagerList = async (request, callback) => {
            try {
                var response = {}
                var userId = request.auth.id
                var managerResponse =await userManagerModel.managerListModel(userId)
                var profile =await userManagerModel.profileModel(request.auth.id)
                console.log("profile",profile)
                if (managerResponse.error || profile.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                } else {
                    var Owneraddress = {}
                    Owneraddress.id = profile.data[0].id
                    Owneraddress.name = profile.data[0].name
                    Owneraddress.mobileNumber = profile.data[0].mobileNumber
                    Owneraddress.email = profile.data[0].email
                    Owneraddress.shopName = profile.data[0].shopName
                    Owneraddress.shopAddress = profile.data[0].shopAddress
                    Owneraddress.pincode = profile.data[0].pincode
                    Owneraddress.city = profile.data[0].city
                    Owneraddress.state = profile.data[0].state
                    Owneraddress.longitude = profile.data[0].longitude
                    Owneraddress.latitude = profile.data[0].latitude

                    response.error = false
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.SuccessString
                    response.owneraddress = Owneraddress
                    response.managerList = managerResponse.data
                }
            } catch (e) {
                console.log("error",e)
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
            }
            callback(response)
        }

        this.managerActiveStatus = async (request, callback) => {
            try {
                var response = {}
                var managerResponse =await userManagerModel.updateManagerActiveStatus(request.userId)
                if (managerResponse.error) {
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

        this.updateMangerPassword = async (request, callback) => {
            try {
                var response = {}
                var generatePassword =await utils.hashPassword(request.password)
                request.password = generatePassword.hashPassword
                var managerResponse =await userManagerModel.updateMangerPasswordModel(request)
                if (managerResponse.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                } else {
                    response.error = false
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.passwordUpdateString
                }
            } catch (e) {
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
            }
            callback(response)
        }

        this.updateManagerVisibleStatus = async (request, callback) => {
            try {
                var response = {}
                var object = { id: request.managerId, isPriceVisible: request.status }
                var updateStatus =await userManagerModel.updateManagerProfile(object)
                if (updateStatus.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                } else {
                    response.error = false
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.SuccessString
                    response.isPriceVisible = request.isPriceVisible
                }
            } catch (e) {
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
            }
            callback(response)
        }








    }
}



export default UserManagerService;
