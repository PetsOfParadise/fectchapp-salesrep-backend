'use strict';

import knex from './../../../config/db.config'

class UserAdderessModel {
 constructor(){



    this.saveAddress = function (data) {
        var response = {}
        return new Promise(function (resolve) {
          knex.db('address')
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
    
      this.getAddressModel = function (data) {
        var response = {}
        return new Promise(function (resolve) {
          knex.db('address')
            .where({ activeStatus: 1, userId: 1 })
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
    
      this.updateAddress = function (data) {
        var response = {}
        return new Promise(function (resolve) {
          knex.db('address')
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
    
      this.deleteAddressModel = function (data) {
        var response = {}
        return new Promise(function (resolve) {
          knex.db('address')
            .where('id', data)
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
 }
}








export default UserAdderessModel;