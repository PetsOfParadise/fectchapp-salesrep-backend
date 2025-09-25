'use strict';

import knex from './../../../config/db.config'

class UserManagerModel {
 constructor(){


    this.saveUserDeatils = function (data) {
        var response = {}
        return new Promise(function (resolve) {
          knex.db('users')
            .insert(data)
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
      this.managerListModel = function (id) {
        var response = {}
        return new Promise(function (resolve) {
          knex.db('users')
            .select('id', 'name', 'mobileNumber', 'email', 'userType', 'activeStatus', 'shopName', 'shopAddress', 'city', 'state', 'pincode', 'latitude', 'longitude', 'isPriceVisible')
            .where({ ownerId: id, userType: 'MANAGER', activeStatus: 1 })
            .orderBy('id', 'desc')
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
      this.updateManagerActiveStatus = function (id) {
        var response = {}
        return new Promise(function (resolve) {
          knex.db('users')
            .where('id', id)
            .update('activeStatus', 0)
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
      this.updateMangerPasswordModel = function (data) {
        var response = {}
        return new Promise(function (resolve) {
          knex.db('users')
            .where('id', data.userId)
            .update('password', data.password)
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
    
      this.editCheckManager = function (data) {
        var response = {}
        return new Promise(function (resolve) {
            knex.db.raw("select * from users where ( email=? OR  mobileNumber=? ) AND id != ? AND activeStatus = ?", [data.email, data.mobileNumber, data.id, 1])
            .then((result) => {
              response.error = false
              response.data = result[0]
            })
            .catch((error) => {
              response.error = true
            })
            .finally(() => {
              resolve(response)
            })
        })
      }
    
      this.updateManagerProfile = function (data) {
        var response = {}
        return new Promise(function (resolve) {
          knex.db('users')
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


      this.mobileOrEmailExists = function (data) {
        var response = {}
        return new Promise(function (resolve) {
          knex.db('users')
            .orWhere({ email: data.email, activeStatus: 1 })
            .orWhere({ mobileNumber: data.mobileNumber, activeStatus: 1 })
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

      this.profileModel = function (id) {
        var response = {}
        return new Promise(function (resolve) {
          knex.db('users')
            .select('id', 'name', 'customerID', 'mobileNumber', 'email', 'userType',
              'ownerId', 'outletId', 'userDiscountId', 'isProfileCompleted', 'activeStatus',
              'isProfileCompleted', 'shopName', 'shopAddress', 'pincode', 'city', 'state', 'users.cashOnCarry',
              'longitude', 'latitude', 'bonusPoint', 'creditLimit','creditFixedtLimit', 'creditPeriod', 'paymentTypeIds',
              'gst', 'isOfferApply', 'activeStatus', 'isPriceVisible', 'salesRepIds', 'managerCart', 'rating','userCatalogId')
            .where('id', id)
            .then((result) => {
              response.error = false
              response.data = result
            })
            .catch((error) => {
              console.log("profileModel error",error)
              response.error = true
            })
            .finally(() => {
              resolve(response)
            })
        })
      }



      
 }
}








export default UserManagerModel;