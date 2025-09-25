'use strict';

import knex from './../../../config/db.config'

class UserProfileModel {
  constructor() {

    this.updateOwnerProfileModel = function (data) {
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

    this.updateUserProfileDetailsModel = function (data) {
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

    this.checkChangeMobileNumber = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('users')
          .where('mobileNumber', data.mobileNumber)
          .where('id', '!=', data.auth.id)
          .where('activeStatus', 1)
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

    this.editCheckEmailExists = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('users')
          .where('email', data.email)
          .where('id', '!=', data.id)
          .where('activeStatus', 1)
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


    this.getCardItems = function (userId, auth) {
      var response = {}
      //   var limit = 10
      // var page = data.page
      //  var page=1;
      //  var offset = (page - 1) * limit
      // console.log(data)
      return new Promise(function (resolve) {
        // knex.db.raw('SELECT cartItems.id, productCatalog.MRP, products.productName, products.productCode, products.productImage, products.productGST, cartItems.productId, cartItems.quantity, subCategory.discount, SUM(productCatalog.MRP * cartItems.quantity) AS totalamt ,SUM(productCatalog.MRP * cartItems.quantity - ( productCatalog.MRP * cartItems.quantity * ( subCategory.discount/100))) AS dicountAmount FROM `cartItems` INNER JOIN products ON cartItems.productId = products.id INNER JOIN subCategory ON products.subcategoryId = subCategory.id WHERE userId=? GROUP BY cartItems.quantity, productCatalog.MRP, cartItems.id', [data])
        knex.db('cartItems')
          .select('cartItems.id', 'cartItems.productId', 'products.productCode', 'cartItems.userId',
            'cartItems.quantity', 'productName', 'productImage', 'productCatalog.MRP', 'MOQ', 'maxQty',
            'productStockCount', 'finishingFast', 'fewStocksLeft', 'productGST', 'productOfferX',
            'products.defaultQuantity',
            'productOfferY', 'attribute', 'options', 'discountValue as discount', 'products.deleteProduct',
            knex.db.raw('SUM( productCatalog.MRP - (productCatalog.MRP * ( discountValue/100))) as supplyPrice'),
            knex.db.raw(`SUM(productCatalog.MRP * cartItems.quantity - ( productCatalog.MRP * cartItems.quantity * ( discountValue/100))) as totalPrice, 
                    SUM((productCatalog.MRP * cartItems.quantity - ( productCatalog.MRP * cartItems.quantity * ( discountValue/100))) * ( products.productGST/100) ) AS gstAmount`)
            , 'attribute', 'options')
          .innerJoin('products', 'cartItems.productId', '=', 'products.id')
          .leftJoin('subCategory', 'products.subcategoryId', '=', 'subCategory.id')
          .innerJoin('disCountDetails', 'products.id', '=', 'disCountDetails.productId')
          .innerJoin('productInventory', 'products.id', '=', 'productInventory.productId')
          .innerJoin('productCatalog', 'products.id', '=', 'productCatalog.productId')

          .where({
            'cartItems.userId': userId,
            'disCountDetails.discountId': auth.discountId,
            'productInventory.outletId': auth.outletId,
            'productCatalog.catalogId': auth.catalogId,
            cartType: 'USER'
          })
          .groupBy('cartItems.id', 'cartItems.productId', 'products.id', 'cartItems.quantity', 'productCatalog.productId')
          .orderBy('cartItems.id', 'desc')
          // .limit(limit).offset(offset)
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

    this.getCardTotalSumValue = function (userId, auth) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db.raw(`SELECT SUM(discountAmount) as finaltotal, SUM(gstAmount) as gsttotal 
                FROM (SELECT cartItems.id, products.productGST, cartItems.productId, cartItems.quantity, 
                  subCategory.discount, SUM(productCatalog.MRP * cartItems.quantity) AS totalamt ,
                  SUM(productCatalog.MRP * cartItems.quantity - ( productCatalog.MRP * cartItems.quantity * ( discountValue/100))) AS discountAmount,
                   SUM((productCatalog.MRP * cartItems.quantity - ( productCatalog.MRP * cartItems.quantity * ( discountValue/100))) * ( products.productGST/100) ) AS gstAmount 
                   FROM cartItems 
                  INNER JOIN products ON cartItems.productId = products.id 
                  INNER JOIN subCategory ON products.subcategoryId = subCategory.id 
                  INNER JOIN disCountDetails ON products.id = disCountDetails.productId 
                  INNER JOIN productCatalog ON cartItems.productId = productCatalog.productId 
                  WHERE userId=? AND disCountDetails.discountId=? AND cartType=? And 
                  productCatalog.catalogId = ?
                  GROUP BY cartItems.quantity,products.id, productCatalog.MRP, cartItems.id) t1`, [userId, auth.discountId, 'USER', auth.catalogId])
          .then((result) => {
            response.error = false
            response.data = result[0]
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

    this.getManagerCartModel = function (id) {
      var response = {}
      return new Promise(function (resolve) {
        // knex.db('cartItems')
        //   .whereIn('userId', id)
        knex.db.raw('SELECT DISTINCT userId as id, name, mobileNumber, email, longitude, latitude, shopName, shopAddress, pincode, city, state, processOrder FROM cartItems INNER JOIN users on cartItems.userId = users.id where userId IN(?) AND cartType=?', [id, 'USER'])
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


    this.getOneUserForLedgerModel = function (data) {
      var response = {}
      return new Promise(function (resolve) {
          knex.db('users')
              .select('id', 'customerID')
              .where('id', data.shopId)
              .then((result) => {
                  response.error = false
                  response.data = result
              })
              .catch((error) => {
                  console.log("error", error)
                  response.error = true
              })
              .finally(() => {
                  resolve(response)
              })
      })
  }


  this.userOldLedgersModel = function (data) {
    var response = {}
    return new Promise(function (resolve) {
        knex.db('userFiles')
            .select('*')
            .where('customerID', data.customerID)
            .then((result) => {
                response.error = false
                response.data = result
            })
            .catch((error) => {
                console.log("error", error)
                response.error = true
            })
            .finally(() => {
                resolve(response)
            })
    })
}


this.getOneUserModel = function (request) {
  var params = request.body
  var response = {}
  return new Promise(function (resolve) {
      knex.db('users')
          .select('*')
          .where('activeStatus', 1)
          .andWhere('id', params.user_id)
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



export default UserProfileModel;



