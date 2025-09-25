

import STRINGS from '../../../strings.json'
import Utils from '../../../utils/utils'
import SalesRepProfileModel from '../models/salesRepProfileModel'
import NotificationsService from '../../../utils/notificationsService'

require('dotenv').config();

const salesRepProfileModel = new SalesRepProfileModel
const notificationsService = new NotificationsService

const utils = new Utils()




class SalesRepProfileService {
    constructor() {



        this.updateSalesRepOnlineService = async (request, callback) => {
            try {
                var response = {}
                var update = { id: request.auth.id, salesRepOnline: request.status }
                var result = await salesRepProfileModel.updateSalesRepProfileModel(update)
                if (result.error) {
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

        this.salesRepProfileDetails = async (request, callback) => {
            try {
                var response = {}
                var result = await salesRepProfileModel.salesRepProfileModel(request)
                if (result.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                } else {
                    response.error = false
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.SuccessString
                    response.profileInfo = result.data[0]
                }
            } catch (e) {
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
            }
            callback(response)
        }

        this.salesRepChangePassword = async (request, callback) => {
            try {
                var response = {}
                var profileResponse = await salesRepProfileModel.salesRepProfileModel(request)
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
                            var passwordResponse = await salesRepProfileModel.updateSalesRepProfileModel(passwordObject)
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

        this.salesRepLogout = async (request, callback) => {
            try {
                var response = {}
                var update = await salesRepProfileModel.removeSalesRepDeviceToken(request.auth.id)
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

        this.salesRepUpdateDeviceToken = async (request, callback) => {
            try {
                var response = {}
                var object = { id: request.auth.id, deviceToken: request.deviceToken }
                var update = await salesRepProfileModel.updateSalesRepProfileModel(object)
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

        this.updateSalesRepNotificationCount = async (request, callback) => {
            try {
                var response = {}
                var query = { salesRepId: request.auth.id }
                var update = { salesRepSeen: 1 }
                var update = await salesRepProfileModel.updateNotificationModel(query, update)
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









    }
}



export default SalesRepProfileService;
