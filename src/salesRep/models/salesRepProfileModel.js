'use strict';

import knex from '../../../config/db.config'

class SalesRepProfileModel {
    constructor() {

        this.updateSalesRepProfileModel = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('salesRep')
                    .where('id', data.id)
                    .update(data)
                    .then((result) => {
                        response.error = false
                        response.data = result
                    })
                    .catch((error) => {
                        response.error = true
                    })
                    .finally(() => {
                        resolve(response)
                    })
            })
        }

        this.salesRepProfileModel = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('salesRep')
                    .select('salesRep.id', 'repID', 'name', 'email', 'mobile', 
                        'password', 'salesRep.address', 'city', 'state', 'pincode', 'outlet.verificationKey')
                    .innerJoin('outlet', 'salesRep.outletId', '=', 'outlet.id')
                    .where('salesRep.id', data.auth.id)
                    .then((result) => {
                        response.error = false
                        response.data = result
                    })
                    .catch((error) => {
                        response.error = true
                    })
                    .finally(() => {
                        resolve(response)
                    })
            })
        }

        this.removeSalesRepDeviceToken = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('salesRep')
                    .where('id', data)
                    .update('deviceToken', '')
                    .then((result) => {
                        response.error = false
                        response.data = result
                    })
                    .catch((error) => {
                        response.error = true
                    })
                    .finally(() => {
                        resolve(response)
                    })
            })
        }

        this.updateNotificationModel = function (query, update) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('notifications')
                    .where(query)
                    .update(update)
                    .then((result) => {
                        response.error = false
                        response.data = result
                    })
                    .catch((error) => {
                        response.error = true
                    })
                    .finally(() => {
                        resolve(response)
                    })
            })
        }

    }
}








export default SalesRepProfileModel;