'use strict';

import knex from './../../../config/db.config'

class SalesRepModel {
  constructor() {

    this.checkSaleRepMobileExists = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('salesRep')
          .select('id', 'name', 'mobile', 'email', 'password', 'userType', 'activeStatus')
          .where('activeStatus', 1)
          .where('mobile', data)
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            console.log(error)
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }

    this.updateSalesRepPassword = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('salesRep')
          .where('mobile', data.mobile)
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

    this.findSaleRep = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('salesRep')
          .select('id', 'repID', 'name', 'mobile', 'email', 'activeStatus')
          .whereIn('id', JSON.parse(data))
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            console.log(error)
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }

    this.verifiedSalesRepId = function (id) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('salesRep')
          .select('id', 'name', 'mobile', 'email', 'outletId', 'password', 'userType', 'activeStatus')
          .where('id', id)
          .then((result) => {
            if (result.length > 0) {
              response.error = false
              response.data = result[0]
            } else {
              response.error = true
            }
          })
          .catch((error) => {
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }

    this.checkOtpModel = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('userOtp')
          .select('id', 'mobile')
          .where('mobile', data)
          .then((result) => {
            if (result.length > 0) {
              response.error = true
            } else {
              response.error = false
            }
          })
          .catch((error) => {
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }


    this.saveOtpModel = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('userOtp')
          .insert(data)
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




    this.updateOtpModel = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('userOtp')
          .where('mobile', data.mobile)
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






    this.checkOtpVerificationModel = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('userOtp')
          .where(data)
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


    this.salesRepActiveStatusModel = function (request) {
      var params = request.body
      var response = {}
      return new Promise(function (resolve) {
        knex.db('salesRep')
          .select('id')
          .where('activeStatus', 1)
          .andWhere('id', params.auth.id)
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            console.log(error)
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }







  }
}








export default SalesRepModel;