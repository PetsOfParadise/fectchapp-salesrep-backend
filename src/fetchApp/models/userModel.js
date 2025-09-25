'use strict';

import knex from './../../../config/db.config'

class UserModel {
  constructor() {

    this.userSearchNameListModel = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('searchNames')
          .select('name', 'depot_id', 'outlet.outletName', 'searchNames.activeStatus')
          .innerJoin('outlet', 'outlet.id', '=', 'searchNames.depot_id')
          .where('searchNames.activeStatus', 1)
          .modify(function (queryBuilder) {
            if (data.depot_id.length > 0) {
              queryBuilder.where('searchNames.depot_id', data.depot_id)
            }
          })
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

    this.verifiedUserIdModel = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('users')
          .select('id', 'name', 'customerID', 'mobileNumber', 'shopName', 'minOrderValue',
            'shopAddress', 'pincode', 'city', 'state', 'userType', 'userCatalogId',
            'isEnableDiscount', 'userDiscountId', 'outletId',
            'ownerId', 'salesRepIds', 'creditLimit', 'cashOnCarry', 'creditFixedtLimit',
            'creditPeriod', 'isPriceVisible', 'bonusPoint', 'userDepotId')
          .where({
            id: data.id,
            mobileNumber: data.mobileNumber
            //  activeStatus: 1 
          })
          .then((result) => {
            if (result.length > 0) {
              response.error = false
              response.data = result[0]
            } else {
              response.error = true
            }
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

    this.userActiveStatusModel1 = function (request) {
      var params = request.body
      var response = {}
      return new Promise(function (resolve) {
        knex.db('users')
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

    this.depotListModel1 = function (request) {
      var response = {}
      var params = request.body
      // console.log( "params.auth.userDepotId",params.auth.userDepotId)
      return new Promise(function (resolve, reject) {
        var transac = knex.db.transaction(function (trx) {
          knex.db('outlet')
            .select('id', 'outletName', 'address', 'subOutletId',
              'verificationKey', 'activeStatus', 'createdAt', 'updatedAt')
            // .select('*')
            .where('activeStatus', 1)
            .andWhere('id', params.auth.userDepotId)
            .transacting(trx)
            .then((result) => {
              var depot = result[0]
              // console.log("depot", depot)
              var subDepot = knex.db('outlet')
                .select('id', 'outletName', 'address',
                  'verificationKey', 'activeStatus', 'createdAt', 'updatedAt')
                // .select('*')
                .where('activeStatus', 1)
                .andWhere('id', depot.subOutletId)
                .transacting(trx)

              return Promise.all([depot, subDepot])
            })
            .then(trx.commit)
            .catch(trx.rollback);
        })
        transac.then(function (result) {
          var resp = [];
          var obj = result[0]
          delete obj.subOutletId;
          // delete obj1.subOutletId;
          resp.push(obj)
          if (result[1].length > 0) {
            var obj1 = result[1][0]
            resp.push(obj1);
          }
          // console.log(result[1][0])
          response.error = false
          response.data = resp
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


    this.getDepotModel = function (request) {
      var params = request.body
      var response = {}
      return new Promise(function (resolve) {
        knex.db('outlet')
          .select('catalog.id', 'catalog.catalogName', 'outlet.outletName')
          .innerJoin('catalog', 'outlet.id', '=', 'catalog.outletId')
          .where('outlet.activeStatus', 1)
          .andWhere('outlet.id', request.body.depot_id)
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

    this.updateUserDepotModel1 = function (request) {
      var response = {}
      var params = request.body

      return new Promise(function (resolve, reject) {
        var transac = knex.db.transaction(function (trx) {
          knex.db('users')
            .update({
              outletId: params.depot_id,
              userCatalogId: params.userCatalogId,
            })
            .where('activeStatus', 1)
            .andWhere('users.id', params.user_id)
            .transacting(trx)
            .then((result) => {
              var depot = result
              var cartItems = knex.db('cartItems')
                .where({
                  'userId': params.user_id,
                  'cartType': 'USER'
                }).del()
                .transacting(trx)
              return Promise.all([depot, cartItems])
            })
            .then(trx.commit)
            .catch(trx.rollback);
        })
        transac.then(function (result) {
          console.log("result", result)
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







    this.verificationModel = function (code) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('outlet')
          .select('id', 'verificationKey')
          .where('verificationKey', code)
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

    this.checkMobileNumberExists = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('users')
          .select('id', 'name', 'mobileNumber', 'logout',
            'email', 'password', 'userType', 'isProfileCompleted', 'bonusPoint', 'ownerId', 'activeStatus')
          .where('mobileNumber', data)
          .where('activeStatus', 1)
          // .andWhere('activeStatus', 1)
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

    this.deleteProfileModel = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('users')
          // .select('id', 'name', 'mobileNumber', 'logout',
          //   'email', 'password', 'userType', 'isProfileCompleted', 'bonusPoint', 'ownerId', 'activeStatus')
          .where('mobileNumber', data)
          .where('activeStatus', 1)
          .del()
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

    this.userLogoutModel = function (data) {
      var response = {}

      return new Promise(function (resolve) {
        knex.db('users')
          .where('mobileNumber', data)
          .update({
            logout: 0
          })
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

    this.checkEmailExists = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('users')
          .where('email', data.email)
          .where('activeStatus', 1)
          // .orWhere('mobileNumber', data.mobileNumber)
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

    this.saveNewUser = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('users')
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

    this.updateShopOwnerProfile = function (data) {
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
            console.log(error)
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }

    this.updatePasswordModel = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('users')
          .where('mobileNumber', data.mobileNumber)
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

    this.checkReferralNumberExists = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('users')
          .select('id', 'name', 'mobileNumber', 'email', 'password', 'bonusPoint')
          .where({ mobileNumber: data, userType: 'OWNER' })
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
    this.updatebonusAmt = function (data, callback) {
      var response = {}
      knex.db.raw("Update users set bonusPoint = bonusPoint + 1000, isRefer=1, referDate=? where id=? AND userType='OWNER'", [data.referDate, data.referBy])
        .then((result) => {
          response.error = false
          response.data = result[0]
        })
        .catch((error) => {
          response.error = true
        })
        .finally(() => {
          callback(response)
        })
    }

    this.addReferralDetails = function (data, callback) {
      var response = {}
      knex.db('referralDetails')
        .insert(data)
        .then((result) => {
          response.error = false
          response.data = result[0]
        })
        .catch((error) => {
          response.error = true
        })
        .finally(() => {
          callback(response)
        })
    }

    this.referralAmountModel = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db.raw("Update users set bonusPoint = bonusPoint - ? where id=? AND userType='OWNER'", [data.bonusPoint, data.id])
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

    this.updateCreditValueModel = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db.raw("Update users set creditLimit = creditLimit - ? where id=? AND userType='OWNER'", [data.creditLimit, data.id])
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
            'longitude', 'latitude', 'bonusPoint', 'creditLimit', 'creditFixedtLimit', 'creditPeriod', 'paymentTypeIds',
            'gst', 'isOfferApply', 'activeStatus', 'isPriceVisible', 'salesRepIds', 'managerCart', 'rating', 'userCatalogId')
          .where('id', id)
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            console.log("profileModel error", error)
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }

    this.shopOwnerOutStandingAmountModel = function (id) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('orders')
          .select(knex.db.raw("sum(case when  orderStatus IN ('PACKAGED', 'SHIPPED', 'PAID', 'DELIVERED') then balanceAmount else 0 end) AS outstandingAmount"))
          .where('ownerId', id)
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

    this.totalAcceptWaitingAmountModel = function (id) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('orders')
          .select(knex.db.raw("sum(case when  orderStatus IN ('WAITING', 'ACCEPTED') then totalAmount + totalGST - referralDiscount - orders.cashDiscountAmount - orders.additionalDiscountAmount - orders.specialDiscountAmount else 0 end) AS totalAcceptWaitingAmount"))
          .where('ownerId', id)
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


    this.removeUserDeviceToken = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('users')
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

    this.verifiedUserId = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('users')
          .select('id', 'name', 'customerID', 'mobileNumber', 'shopName', 'latitude', 'longitude', 'minOrderValue',
            'shopAddress', 'pincode', 'city', 'state', 'userType', 'userCatalogId',
            'isEnableDiscount', 'userDiscountId', 'outletId', "creditFixedtLimit",
            'ownerId', 'salesRepIds', 'creditLimit', 'cashOnCarry',
            'creditPeriod', 'isPriceVisible', 'bonusPoint', 'userDepotId')
          .where({
            id: data,
            //  activeStatus: 1 
          })
          .then((result) => {
            console.log("data", data)
            console.log("result", result)
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

    this.verifiedUserIdModel = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('users')
          .select('id', 'name', 'customerID', 'mobileNumber', 'shopName', 'minOrderValue',
            'shopAddress', 'pincode', 'city', 'state', 'userType', 'userCatalogId',
            'isEnableDiscount', 'userDiscountId', 'outletId',
            'ownerId', 'salesRepIds', 'creditLimit', 'cashOnCarry', 'creditFixedtLimit',
            'creditPeriod', 'isPriceVisible', 'bonusPoint', 'userDepotId')
          .where({
            id: data.id,
            mobileNumber: data.mobileNumber
            //  activeStatus: 1 
          })
          .then((result) => {
            if (result.length > 0) {
              response.error = false
              response.data = result[0]
            } else {
              response.error = true
            }
          })
          .catch((error) => {
            console.log("passport fetch user errror")
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }




    this.referralOfferApply = function (id, status) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('users')
          .where('id', id)
          .update('isOfferApply', status)
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

    this.getUserDeviceToken = function (id) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('users')
          .select('id', 'name', 'deviceToken')
          .whereIn('id', id)
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
    this.getUserDeviceTokenForPlaceOrder = function (customerID) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('users')
          .select('id', 'name', 'deviceToken')
          .where('customerID', customerID)
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


    this.salesRepActiveStatusModel2 = function (request) {
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












    this.userNotificationListModel = function (query, data) {
      var response = {}
      return new Promise(function (resolve) {
        var type = ['US']
        var striingData = JSON.stringify(type)
        if (data.queryType === 'LIST') {
          var pageNumber = data.pageNumber
          if (pageNumber == '0') {
            pageNumber = '0'
          } else {
            pageNumber = pageNumber - 1
          }
          var pageOffset = parseInt(pageNumber * data.pageCount)
        }
        knex.db('notifications')
          .select('notifications.id', 'ow.name as name', 'ow.userType', 'act.name as actionBy',
           'salesRep.name as salesRepName', 'orders.bookingId', 'notifications.notificationMsg','notifications.color',
           'notifications.orderId as ordId', 'complaintId', 'notifications.type','orders.id  as orderId',
           'paymentTypes.type as paymentType', 'adminNotifications.description', 
           'title', 'amount', 'cartCount', 'complaintTypes.complaintText as complaintReason', 
           knex.db.raw('DATE_FORMAT(dueDate, "%d/%m/%Y") AS dueDate'), 'daysLeft', 'productName',
            'activityReason.reason as activityReason', knex.db.raw('DATE_FORMAT(notifyDate, "%d-%m-%Y") AS notifyDate'),
             knex.db.raw('TIME_FORMAT(notifyDate, "%H:%i") AS time'))
          .leftJoin('orders', 'notifications.orderId', '=', 'orders.id')
          .leftJoin('paymentTypes', 'notifications.payTypeID', '=', 'paymentTypes.id')
          .leftJoin('complaintTypes', 'notifications.complaintReasonId', '=', 'complaintTypes.id')
          .leftJoin('salesRep', 'notifications.salesRepId', '=', 'salesRep.id')
          .leftJoin('activityReason', 'notifications.activityId', '=', 'activityReason.id')
          .leftJoin('adminNotifications', 'notifications.notifyId', '=', 'adminNotifications.id')
          .leftJoin('products', 'notifications.productId', '=', 'products.id')
          // .leftJoin('users', 'notifications.managerId', '=', 'users.id')
          .leftJoin('users as ow', 'notifications.managerId', '=', 'ow.id')
          .leftJoin('users as act', 'notifications.actionBy', '=', 'act.id')
          .where(query)
          .whereRaw('JSON_CONTAINS(notifyType, ? )', [striingData])
          .orderBy('notifications.id', 'desc')
          .modify(function (queryBuilder) {
            if (data.queryType === 'LIST') {
              queryBuilder.offset(pageOffset).limit(data.pageCount)
            }
            if (data.auth.userType === 'MANAGER') {
              queryBuilder.where('notifications.type', '!=', 'ADDCART')
              queryBuilder.where('notifications.type', '!=', 'MANAGER_PAY_PROCESSING')
              queryBuilder.where('notifications.type', '!=', 'ADMIN_NOTIFY_OWNER')
              queryBuilder.where('notifications.type', '!=', 'MANAGER_ORDER_DELIERED')
            }
            if (data.auth.userType === 'OWNER') {
              queryBuilder.where('notifications.type', '!=', 'ADMIN_NOTIFY_MANAGER')
              queryBuilder.where('notifications.type', '!=', 'ORDER_DELIERED')
            }
          })
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

    this.notificationCountModel = function (data) {
      var response = {}
      return new Promise(function (resolve, reject) {
        if (data.auth.userType === 'OWNER') {
          var query = { ownerId: data.auth.id, ownerSeen: 0 }
        } else {
          var query = { managerId: data.auth.id, managerSeen: 0 }
        }
        var type = ['US']
        var striingData = JSON.stringify(type)
        knex.db('notifications')
          .where(query)
          .whereRaw('JSON_CONTAINS(notifyType, ? )', [striingData])
          .count('id as count')
          .modify(function (queryBuilder) {
            if (data.auth.userType === 'MANAGER') {
              queryBuilder.where('notifications.type', '!=', 'ADDCART')
              queryBuilder.where('notifications.type', '!=', 'MANAGER_PAY_PROCESSING')
              queryBuilder.where('notifications.type', '!=', 'ADMIN_NOTIFY_OWNER')
              queryBuilder.where('notifications.type', '!=', 'MANAGER_ORDER_DELIERED')
            }
            if (data.auth.userType === 'OWNER') {
              queryBuilder.where('notifications.type', '!=', 'ADMIN_NOTIFY_MANAGER')
              queryBuilder.where('notifications.type', '!=', 'ORDER_DELIERED')
            }
          })
          .then((result) => {
            response.error = false
            response.data = result
            resolve(response)
          })
          .catch((error) => {
            console.log("notificationCountModel error")
            reject(error)
          })
      })
    }

    this.updateWalletTransaction = function (data) {
      var response = {}
      knex.db('walletTransaction')
        .insert(data)
        .then((result) => {
          response.error = false
          response.data = result
        })
        .catch((error) => {
          response.error = true
        })
        .finally(() => {
          callback(response)
        })
    }




    this.getAllShopOwnerByCustomerId = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('users')
          .select('id', 'customerID')
          .where({
            activeStatus: 1,
            userType: 'OWNER',
          })
          .orderByRaw('cast(customerID as unsigned) desc')
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



    this.getPaymentListModel = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('paymentTypes')
          .select('id', 'type', 'payDescription', 'id as value')
          .where('activeStatus', 1)
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



    this.saveNotificationsModel = function (data, callback) {
      var response = {}
      knex.db('notifications')
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
          callback(response)
        })
    }


    this.checkMaintenanceModel = function (request) {
      var params = request.body
      var response = {}
      console.log("params", params)
      return new Promise(function (resolve) {
        knex.db('maintenance')
          .select("*")
          .where('activeStatus', 1)
          .andWhere('type', params.type)
          .andWhere('name', params.name)
          .andWhere('status', 1)
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


    this.checkVersionsModel = function (request) {
      var params = request.body
      var response = {}
      return new Promise(function (resolve) {
        knex.db('versions')
          .select("*")
          .where('activeStatus', 1)
          .andWhere('type', params.type)
          .andWhere('version', params.version)
          .andWhere('name', params.name)
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


    this.checkUserLogoutModel = function (request) {
      var params = request.body
      var response = {}
      return new Promise(function (resolve) {
        knex.db('users')
          .select('id')
          .where('logout', 1)
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




    this.userOpeningPageModel = function (request) {
      var params = request.body
      var response = {}
      return new Promise(function (resolve) {
        knex.db('userOpeningPage')
          .select('*')
          .orderBy('id', 'asc')
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








export default UserModel;



