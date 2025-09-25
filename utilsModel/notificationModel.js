

import knex from '../config/db.config'

class NotificationModel {
  constructor() {

    this.saveAdminNotifications = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('adminNotifications')
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

    this.getAllUserList = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('users')
          .select('id', 'deviceToken', 'userType', 'ownerId')
          .where({ activeStatus: 1, isProfileCompleted: 1 })
          // .where('deviceToken', '!=', '')
          .whereIn('outletId', data.auth.outletIds)
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

    this.getAllSalesRepList = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('salesRep')
          .select('id', 'deviceToken', 'userType')
          .where({ activeStatus: 1 })
          // .where('deviceToken', '!=', '')
          .whereIn('outletId', data.auth.outletIds)
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

    this.adminOutletTokensDao = function (id) {
      var response = {}
      return new Promise(function (resolve) {
        var data = [id]
        var striingData = JSON.stringify(data)
        knex.db('admins')
          .select('id', 'name', 'email', 'deviceToken')
          .whereRaw('JSON_CONTAINS(outletIds, ? )', [striingData])
          .where('deviceToken', '!=', '')
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

    this.getSalesRepToken = function (id) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('salesRep')
          .select('id', 'deviceToken')
          .where({ activeStatus: 1, id: id })
          // .whereIn('outletId', data.auth.outletIds)
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

    this.saveNotificationsDao = function (data, callback) {
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

    this.getSalesRepTokenForPlaceOrder = function (salesRepIds) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('salesRep')
          .select('id', 'deviceToken')
          .where("activeStatus", 1)
          .whereIn('id',salesRepIds)
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            console.log("error",error)
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }












    this.adminNotificationListDao = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        var type = ['AD']
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
          .select('notifications.id', 'ow.name as name', 'ow.userType', 'act.name as actionBy', 'salesRep.name as salesRepName', 'orders.bookingId as orderId', 'notifications.orderId as ordId', 'notifications.type', 'paymentTypes.type as paymentType', 'amount', 'cartCount', 'complaintTypes.complaintText as complaintReason', 'productName', knex.db.raw('DATE_FORMAT(dueDate, "%d/%m/%Y") AS dueDate'), 'daysLeft', 'activityReason.reason as activityReason', knex.db.raw('DATE_FORMAT(notifyDate, "%d-%m-%Y") AS notifyDate'), knex.db.raw('DATE_FORMAT(notifyDate, "%Y-%m-%d") AS dates'), knex.db.raw('TIME_FORMAT(convert_tz(notifyDate,"+00:00","+05:30"), "%r") AS time'), 'notifyDate as createdAt')
          .leftJoin('orders', 'notifications.orderId', '=', 'orders.id')
          .leftJoin('paymentTypes', 'notifications.payTypeID', '=', 'paymentTypes.id')
          .leftJoin('complaintTypes', 'notifications.complaintReasonId', '=', 'complaintTypes.id')
          .leftJoin('salesRep', 'notifications.salesRepId', '=', 'salesRep.id')
          .leftJoin('activityReason', 'notifications.activityId', '=', 'activityReason.id')
          .leftJoin('products', 'notifications.productId', '=', 'products.id')
          // .leftJoin('users', 'notifications.managerId', '=', 'users.id')
          .leftJoin('users as ow', 'notifications.managerId', '=', 'ow.id')
          .leftJoin('users as act', 'notifications.actionBy', '=', 'act.id')
          .whereIn('ow.outletId', data.auth.outletIds)
          // .whereIn('salesRep.outletId', data.auth.outletIds)
          .whereRaw('JSON_CONTAINS(notifyType, ? )', [striingData])
          .orderBy('notifications.id', 'desc')
          .modify(function (queryBuilder) {
            if (data.queryType === 'LIST') {
              queryBuilder.offset(pageOffset).limit(data.pageCount)
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
  }

}








export default NotificationModel;