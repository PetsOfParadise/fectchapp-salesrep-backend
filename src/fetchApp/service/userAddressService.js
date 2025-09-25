
import async from 'async'

import STRINGS from '../../../strings.json'
import Utils from '../../../utils/utils'
import UserAddressModel from '../models/userAddressModel'
require('dotenv').config();

const userAddressModel = new UserAddressModel
const utils = new Utils()





class UserAddressService {
    constructor() {


        this.addAddress = async (request, callback) => {
            try {
                var response = {}
                var addressObject = {}
                addressObject.userId = request.auth.id
                addressObject.address = request.address
                addressObject.shopName = request.shopName
                addressObject.locality = request.locality
                addressObject.pincode = request.pincode

                var save = userAddressModel.saveAddress(addressObject)
                if (save.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                } else {
                    response.error = false
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.addressSuccessString
                }
            } catch (e) {
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
            }
            callback(response)
        }

        this.getUserAddress = async (request, callback) => {
            try {
                var response = {}
                var addressResponse = userAddressModel.getAddressModel(request.auth.id)
                if (addressResponse.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                } else {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.SuccessString
                    response.address = addressResponse.data
                }
            } catch (e) {
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
            }
            callback(response)
        }

        this.editAddress = async (request, callback) => {
            try {
                var response = {}
                var addressObject = {}
                addressObject.address = request.address
                addressObject.city = request.city
                addressObject.state = request.state
                addressObject.pincode = request.pincode
                addressObject.latitude = request.latitude
                addressObject.longitude = request.longitude
                addressObject.id = request.addressId

                var save = userAddressModel.updateAddress(addressObject)
                if (save.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                } else {
                    response.error = false
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.addressUpdateSuccessString
                }
            } catch (e) {
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
            }
            callback(response)
        }

        this.deleteAddress = async (request, callback) => {
            try {
                var response = {}
                var save = userAddressModel.deleteAddressModel(request.addressId)
                if (save.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                } else {
                    response.error = false
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.addressDeleteSuccessString
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



export default UserAddressService;
