'use strict';

import knex from '../../../config/db.config'

class SalesRepHomeModel {
 constructor(){

  this.salesRepHomeProfile = function (id) {
    var response = {}
    return new Promise(function (resolve) {
      knex.db('salesRep')
        .select('id', 'repID', 'name', 'email', 'mobile', 'userType', 'totalAmount',
          'totalOrders', 'totalPayments', 'totalAmountCollected')
        .where('id', id)
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

  this.salesRepCurrentMonthOrders = function (req) {
    var response = {}
    var id = req.auth.id;
    var month = req.month;
    var year = req.year == undefined ? new Date().getFullYear() : req.year;

    return new Promise(function (resolve, reject) {
      knex.db('orders')
        .where('salesRepID', id)
        // .where('paidAmount', '!=', 0)
        .whereIn('orders.orderStatus', ['ACCEPTED', 'PACKAGED', 'SHIPPED', 'DELIVERED', 'PAID'])
        .whereRaw('Month(orderDate) = ?', [month])
        // .whereRaw('YEAR(packageDate) = ?', [knex.db.raw('YEAR(now())')])
        .whereRaw('YEAR(orderDate) = ?', [year])
        // .count('id as orders')
        .then((result) => {
          response.error = false
          response.data = result
          resolve(response)
        })
        .catch((error) => {
          console.log("salesRepCurrentMonthOrders", error)
          reject(error)
        })
    })
  }

  this.salesrepPrmiaryShopCurrentMonthOrders = function (req) {
    var response = {}
    var id = req.auth.id;
    var month = req.month;
    var year = req.year == undefined ? new Date().getFullYear() : req.year;

    return new Promise(function (resolve, reject) {
        knex.db('orders')
            .where('orders.orderBy', 'USER')
            .whereIn('orders.orderStatus', ['ACCEPTED', 'PACKAGED', 'SHIPPED', 'DELIVERED', 'PAID'])
            .whereRaw('Month(orderDate) = ?', [month])
            // .whereRaw('YEAR(packageDate) = ?', [server.db.raw('YEAR(now())')])
            .whereRaw('YEAR(orderDate) = ?', [year])
            .andWhere('orders.orderPrimarySalesRepId', id)
            // .innerJoin('users', 'orders.ownerId', '=', 'users.id')
            .then((result) => {
                response.error = false
                response.data = result
                resolve(response)
            })
            .catch((error) => {
                console.log("salesRepCurrentMonthOrders", error)
                reject(error)
            })
    })
}













  this.salesRepCurrentMonthOrdersTotal = function (req) {
    var response = {}
    if (req.salesRepID) {
      var id = req.salesRepID;
    } else {
      var id = req.auth.id;
    }
    var month = req.month;
    var year = req.year == undefined ? new Date().getFullYear() : req.year;

    return new Promise(function (resolve, reject) {
      knex.db('orders')
        .select(knex.db.raw('COALESCE(SUM(totalAmount + totalGST - referralDiscount - additionalDiscountAmount - specialDiscountAmount ),0) as total'))
        .where('salesRepID', id)
        .whereIn('orders.orderStatus', ['PACKAGED', 'SHIPPED', 'DELIVERED', 'PAID'])
        // .whereRaw('Month(packageDate) = ?', [month])
        .whereRaw('YEAR(packageDate) = ?', [year])
        // .sum('paidAmount as total')
        .modify(function (queryBuilder) {
          if (month) {
            queryBuilder.whereRaw('Month(packageDate) = ?', [month])
          } else {
            queryBuilder.whereRaw('Month(packageDate) = ?', [knex.db.raw('Month(now())')])
          }
        })
        .then((result) => {
          response.error = false
          response.data = result
          resolve(response)
        })
        .catch((error) => {
          console.log("salesRepCurrentMonthOrdersTotal0", error)
          reject(error)
        })
    })
  }



  this.salesRepPrimaryShopCurrentMonthOrdersTotal = function (req) {
    var response = {}
    var id = req.auth.id;
    var month = req.month;
    var year = req.year == undefined ? new Date().getFullYear() : req.year;

    return new Promise(function (resolve, reject) {
        knex.db('orders')
            .select(knex.db.raw('COALESCE(SUM(totalAmount + totalGST - referralDiscount - orders.cashDiscountAmount - orders.additionalDiscountAmount - orders.specialDiscountAmount),0) as total'))
            .where('orders.orderBy', 'USER')
            .whereIn('orders.orderStatus', ['PACKAGED', 'SHIPPED', 'DELIVERED', 'PAID'])
            .whereRaw('YEAR(packageDate) = ?', [year])
            .andWhere('orders.orderPrimarySalesRepId', id)
            .first()
            // .innerJoin('users', 'orders.ownerId', '=', 'users.id')
            .modify(function (queryBuilder) {
                if (month) {
                    queryBuilder.whereRaw('Month(packageDate) = ?', [month])
                } else {
                    queryBuilder.whereRaw('Month(packageDate) = ?', [knex.db.raw('Month(now())')])
                }
            })
            .then((result) => {
                response.error = false
                response.data = result
                resolve(response)
            })
            .catch((error) => {
                console.log("salesRepCurrentMonthOrdersTotal0", error)
                reject(error)
            })
    })
}









  this.salesRepCurrentMonthNoOFOrders = function (req) {
    var response = {}
    var id = req.auth.id;
    var month = req.month;
    var year = req.year == undefined ? new Date().getFullYear() : req.year;
    return new Promise(function (resolve, reject) {
      knex.db('orderPaymentDetails')
        .innerJoin('orders', 'orderPaymentDetails.orderId', '=', 'orders.id')
        .where('salesRepID', id)
        .where('orders.paidAmount', '!=', 0)
        .whereRaw('Month(orderPaymentDetails.paidDate) = ?', [month])
        // .whereRaw('YEAR(paidDate) = ?', [knex.db.raw('YEAR(now())')])
        .whereRaw('YEAR(orderPaymentDetails.paidDate) = ?', [year])

        .groupBy('orderPaymentDetails.id')
        .then((result) => {
          response.error = false
          response.data = result.length
          resolve(response)
        })
        .catch((error) => {
          console.log("salesRepCurrentMonthNoOFOrders", error)
          reject(error)
        })
    })
  }




  this.salesRepPrimaryShopCurrentMonthNoOFOrders = function (req) {
    var response = {}
    var id = req.auth.id;

    var month = req.month;
    var year = req.year == undefined ? new Date().getFullYear() : req.year;
    return new Promise(function (resolve, reject) {
        knex.db('orderPaymentDetails')
            .innerJoin('orders', 'orderPaymentDetails.orderId', '=', 'orders.id')
            .where('orders.orderBy', 'USER')
            .where('orders.paidAmount', '!=', 0)
            .whereRaw('Month(orderPaymentDetails.paidDate) = ?', [month])
            // .whereRaw('YEAR(paidDate) = ?', [server.db.raw('YEAR(now())')])
            .whereRaw('YEAR(orderPaymentDetails.paidDate) = ?', [year])
            .andWhere('orders.orderPrimarySalesRepId', id)
            // .innerJoin('users', 'orders.ownerId', '=', 'users.id')
            .then((result) => {
                response.error = false
                response.data = result.length
                resolve(response)
            })
            .catch((error) => {
                console.log("salesRepCurrentMonthNoOFOrders", error)
                reject(error)
            })
    })
}


this.salesRepPrimaryShopCurrentMonthPaymentCollected = function (req) {
  var response = {}

  var id = req.auth.id;

  var month = req.month;
  var year = req.year == undefined ? new Date().getFullYear() : req.year;
  return new Promise(function (resolve, reject) {
      knex.db('orderPaymentDetails')
          .innerJoin('orders', 'orderPaymentDetails.orderId', '=', 'orders.id')
          .where('orders.orderBy', 'USER')
          .where('orders.paidAmount', '!=', 0)
          // .whereRaw('YEAR(paidDate) = ?', [server.db.raw('YEAR(now())')])
          .whereRaw('YEAR(orderPaymentDetails.paidDate) = ?', [year])
          .andWhere('orders.orderPrimarySalesRepId', id)
          // .innerJoin('users', 'orders.ownerId', '=', 'users.id')
          // .groupBy('orderPaymentDetails.orderId')
          .sum('orderPaymentDetails.paidAmount as total')
          .modify(function (queryBuilder) {
              if (req.month) {
                  queryBuilder.whereRaw('Month(orderPaymentDetails.paidDate) = ?', [month])
              } else {
                  queryBuilder.whereRaw('Month(orderPaymentDetails.paidDate) = ?', [knex.db.raw('Month(now())')])
              }
          })
          .then((result) => {
              response.error = false
              response.data = result
              resolve(response)
          })
          .catch((error) => {
              console.log("salesRepCurrentMonthPaymentCollected", error)
              reject(error)
          })
  })
}










  this.salesRepCurrentMonthPaymentCollected = function (req) {
    var response = {}
    if (req.salesRepID) {
      var id = req.salesRepID;
    } else {
      var id = req.auth.id;
    }
    var month = req.month;
    var year = req.year == undefined ? new Date().getFullYear() : req.year;
    return new Promise(function (resolve, reject) {
      knex.db('orderPaymentDetails')
        .innerJoin('orders', 'orderPaymentDetails.orderId', '=', 'orders.id')
        .where('salesRepID', id)
        .where('orders.paidAmount', '!=', 0)
        // .whereRaw('YEAR(paidDate) = ?', [knex.db.raw('YEAR(now())')])
        .whereRaw('YEAR(orderPaymentDetails.paidDate) = ?', [year])
        // .groupBy('orderPaymentDetails.orderId')
        .sum('orderPaymentDetails.paidAmount as total')
        .modify(function (queryBuilder) {
          if (req.month) {
            queryBuilder.whereRaw('Month(orderPaymentDetails.paidDate) = ?', [month])
          } else {
            queryBuilder.whereRaw('Month(orderPaymentDetails.paidDate) = ?', [knex.db.raw('Month(now())')])
          }
        })
        .then((result) => {
          response.error = false
          response.data = result
          resolve(response)
        })
        .catch((error) => {
          console.log("salesRepCurrentMonthPaymentCollected", error)
          reject(error)
        })
    })
  }

  this.homeTopOrderProducts = function (data) {
    var response = {}
    let salesRepId = data.auth.id
    var month = data.month == undefined ? new Date().getMonth() + 1 : data.month;
    var year = data.year == undefined ? new Date().getFullYear() : data.year;
    return new Promise(function (resolve, reject) {
      knex.db('orderItems')
        .select('productId', 'productName', 'users.salesRepIds', 'productCode', knex.db.raw('COUNT(orderId) as orders'))
        .innerJoin('products', 'orderItems.productId', '=', 'products.id')
        .innerJoin('users', 'orderItems.cartShopId', '=', 'users.id')
        .innerJoin('orders', 'orderItems.orderId', '=', 'orders.id')
        .where({
          'users.outletId': data.auth.outletId,
          // 'users.salesRepIds': data.auth.id
        })
        .whereIn('orders.orderStatus', ['PACKAGED', 'SHIPPED', 'PAID', 'DELIVERED'])
        .whereRaw(`JSON_CONTAINS(users.salesRepIds,'${salesRepId}')`)
        .where('orderCost', '!=', 0)
        .groupBy('orderItems.productId')
        .sum('orderItems.quantity as totalQuantity')
        .orderBy('totalQuantity', 'desc')
        .distinct('products.id', 'productCode')
        .limit(data.limit)
        .modify(function (queryBuilder) {
          if (data.type === 'MONTH') {
            // queryBuilder.whereRaw('Month(orderItems.createdAt) = ?', [knex.db.raw('MONTH(now())')])
            queryBuilder.whereRaw('Month(orderItems.createdAt) = ?', [month])
            queryBuilder.whereRaw('YEAR(orderItems.createdAt) = ?', [year])

          } else {
            queryBuilder.whereRaw('week(orderItems.createdAt) = ?', [knex.db.raw('week(now())')])
            queryBuilder.whereRaw('YEAR(orderItems.createdAt) = ?', [year])
          }
        })
        .then((result) => {
          console.log(result)
          response.error = false
          response.data = result
          resolve(response)
        })
        .catch((error) => {
          console.log("homeTopOrderProducts", error)
          reject(error)
        })
    })
  }

  this.salesRepNotificationListDao = function (data) {
    var response = {}
    return new Promise(function (resolve) {
      var type = ['SR']
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
        .select('notifications.id', 'users.name as name', 'users.userType',
         'salesRep.name as salesRepName', 'orders.bookingId as orderId','notifications.notificationMsg',
         'notifications.color',
          'complaintId', 'notifications.orderId as ordId', 'notifications.type', 
          'paymentTypes.type as paymentType', 'amount', 'cartCount',
           'complaintTypes.complaintText as complaintReason', 'productName', 
           'adminNotifications.description', 'title',
           knex.db.raw('DATE_FORMAT(dueDate, "%d/%m/%Y") AS dueDate'), 'daysLeft', 
           knex.db.raw('DATE_FORMAT(notifyDate, "%d-%m-%Y") as notifyDate'),
           knex.db.raw('TIME_FORMAT(notifyDate, "%H:%i") AS time')
            )
        .leftJoin('orders', 'notifications.orderId', '=', 'orders.id')
        .leftJoin('paymentTypes', 'notifications.payTypeID', '=', 'paymentTypes.id')
        .leftJoin('complaintTypes', 'notifications.complaintReasonId', '=', 'complaintTypes.id')
        .leftJoin('salesRep', 'notifications.salesRepId', '=', 'salesRep.id')
        .leftJoin('adminNotifications', 'notifications.notifyId', '=', 'adminNotifications.id')
        .leftJoin('products', 'notifications.productId', '=', 'products.id')
        .leftJoin('users', 'notifications.managerId', '=', 'users.id')
        .where('notifications.salesRepId', data.auth.id)
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

  this.salesRepNotificationCountDao = function (data) {
    var response = {}
    return new Promise(function (resolve, reject) {
      var type = ['SR']
      var striingData = JSON.stringify(type)
      knex.db('notifications')
        .where({
          salesRepId: data.auth.id,
          salesRepSeen: 0
        })
        .whereRaw('JSON_CONTAINS(notifyType, ? )', [striingData])
        .count('id as count')
        .modify(function (queryBuilder) {
          // if(data.auth.userType === 'MANAGER'){
          //   queryBuilder.where('notifications.type', '!=', 'ADDCART')
          //   queryBuilder.where('notifications.type', '!=', 'MANAGER_PAY_PROCESSING')
          //   queryBuilder.where('notifications.type', '!=', 'ADMIN_NOTIFY_OWNER')
          // }
          // if(data.auth.userType === 'OWNER'){
          //   queryBuilder.where('notifications.type', '!=', 'ADMIN_NOTIFY_MANAGER')
          // }
        })
        .then((result) => {
          response.error = false
          response.data = result
          resolve(response)
        })
        .catch((error) => {
          console.log("salesRepNotificationCountDao", error)

          reject(error)
        })
    })
  }



      
 }
}








export default SalesRepHomeModel;