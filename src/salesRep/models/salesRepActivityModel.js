'use strict';

import knex from './../../../config/db.config'

class SalesRepActivityModel {
  constructor() {

    this.saveActivityModel = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('salesRepActivity')
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

    this.checkShopDistanceModel = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('users')
          .select('id', 'name', 'customerID', 'latitude', 'longitude', knex.db.raw('ST_Distance_Sphere(point(longitude, latitude), point(' + data.salesRepLongitude + ', ' + data.salesRepLatitude + ')) / 1000 AS distance'))
          .where('id', data.shopId)
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

    this.checkShopNameModel1 = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('users')
          .select('id', 'name', 'customerID', 'mobileNumber')
          .where('id', data.shopId)
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


    this.activityReasonListModel = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('activityReason')
          .select('id', 'reason')
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

    // Activity Tracker
    this.salesRepVisitShopCount = function (data, visit, queryType, date) {
      var id = data.salesRepID ? data.salesRepID : data.auth.id

      if (data.activityTracker) {
        var month = data.month
        var year = data.year
      }

      // console.log("request", data.auth);
      var response = {}
      return new Promise(function (resolve, reject) {
        knex.db('salesRepActivity')
          .select('salesRepActivity.id', 'shopId', 'shopName', 'shopAddress', 'visitDate',
            'longitude', 'latitude', 'salesRepLatitude', 'salesRepLongitude', 'isVisit', 'reason',
            'activityType', knex.db.raw('TIME_FORMAT(visitDate, "%H:%i:%s") AS time'))
          .innerJoin('users', 'salesRepActivity.shopId', '=', 'users.id')
          .innerJoin('activityReason', 'salesRepActivity.visitReasonId', '=', 'activityReason.id')
          .where({ 'salesRepActivity.salesRepId': id, 'activityType': visit })
          .orderBy('salesRepActivity.id', 'desc')
          .modify(function (queryBuilder) {
            if (queryType == 'VIEW') {
              if (data.month && data.year) {
                queryBuilder.whereRaw('Month(visitDate) = ?', [month])
                queryBuilder.whereRaw('YEAR(visitDate) = ?', [year])
              }
              else {
                queryBuilder.whereRaw('Month(visitDate) = ?', [knex.db.raw('MONTH(now())')])
                queryBuilder.whereRaw('YEAR(visitDate) = ?', [knex.db.raw('YEAR(now())')])
              }

            } else {
              if (data.month && data.year) {
                queryBuilder.whereRaw('Month(visitDate) = ?', [month])
                queryBuilder.whereRaw('YEAR(visitDate) = ?', [year])
              }
              else {
                queryBuilder.whereRaw('Month(visitDate) = ?', [knex.db.raw('MONTH(now())')])
                queryBuilder.whereRaw('YEAR(visitDate) = ?', [knex.db.raw('YEAR(now())')])
              }
            }
            // else {
            //   queryBuilder.whereRaw('DATE(visitDate) = ?', [date])
            // }
          })
          .then((result) => {
            response.error = false
            response.data = result
            resolve(response)
          })
          .catch((error) => {
            console.log(error)
            reject(error)
          })
      })
    }

    this.salesRepVisitShopCountModel = function (data, visit, queryType, date) {
      var id = data.salesRepID ? data.salesRepID : data.auth.id

      var month = data.month.length > 0 ? data.month : new Date().getFullYear()
      var year = data.year.length > 0 ? data.year : new Date().getMonth() + 1

      console.log("request", month, year, id);
      var response = {}
      return new Promise(function (resolve, reject) {
        knex.db('salesRepActivity')
          .select('salesRepActivity.id', 'shopId', 'shopName', 'shopAddress', 'visitDate',
            // 'salesRepActivity.createdAt as activityDate',
            'longitude', 'latitude', 'salesRepLatitude', 'salesRepLongitude', 'isVisit', 'reason',
            'activityType', knex.db.raw('TIME_FORMAT(visitDate, "%H:%i:%s") AS time'))
          .innerJoin('users', 'salesRepActivity.shopId', '=', 'users.id')
          .innerJoin('activityReason', 'salesRepActivity.visitReasonId', '=', 'activityReason.id')
          .where({ 'salesRepActivity.salesRepId': id, 'activityType': visit })
          .orderBy('salesRepActivity.id', 'desc')
          .modify(function (queryBuilder) {
            if (queryType == 'VIEW') {
              if (month.length > 0 && year.length > 0) {
                queryBuilder.whereRaw('Month(visitDate) = ?', [month])
                queryBuilder.whereRaw('YEAR(visitDate) = ?', [year])
              }
              else {
                queryBuilder.whereRaw('Month(visitDate) = ?', [knex.db.raw('MONTH(now())')])
                queryBuilder.whereRaw('YEAR(visitDate) = ?', [knex.db.raw('YEAR(now())')])
              }

            } else {
              if (month.length > 0 && year.length > 0) {
                queryBuilder.whereRaw('Month(visitDate) = ?', [month])
                queryBuilder.whereRaw('YEAR(visitDate) = ?', [year])
              }
              else {
                queryBuilder.whereRaw('Month(visitDate) = ?', [knex.db.raw('MONTH(now())')])
                queryBuilder.whereRaw('YEAR(visitDate) = ?', [knex.db.raw('YEAR(now())')])
              }
            }
            // else {
            //   queryBuilder.whereRaw('DATE(visitDate) = ?', [date])
            // }
          })
          .then((result) => {
            response.error = false
            response.data = result
            resolve(response)
          })
          .catch((error) => {
            console.log(error)
            reject(error)
          })
      })
    }






    this.salesRepNoInteractionShopModel = function (data, shopList) {
      var response = {}
      var id = data.salesRepID ? data.salesRepID : data.auth.id
      if (data.activityTracker) {
        var month = data.month
        var year = data.year
      }
      return new Promise(function (resolve, reject) {
        knex.db('salesRepActivity')
          .select('shopId')
          .where('salesRepId', id)
          .whereIn('shopId', shopList)
          .groupBy('shopId')
          .modify(function (queryBuilder) {
            if (data.activityTracker) {
              queryBuilder.whereRaw('Month(visitDate) = ?', [month])
              queryBuilder.whereRaw('YEAR(visitDate) = ?', [year])
            }
            else {
              queryBuilder.whereRaw('Month(visitDate) = ?', [knex.db.raw('MONTH(now())')])
              queryBuilder.whereRaw('YEAR(visitDate) = ?', [knex.db.raw('YEAR(now())')])
            }
          })
          .then((result) => {
            response.error = false
            response.data = result
            resolve(response)
          })
          .catch((error) => {
            reject(error)
          })
      })
    }

    this.salesRepNoInteractionShop = function (data) {
      var response = {}
      return new Promise(function (resolve, reject) {
        knex.db('users')
          .select('id', 'shopName')
          // .leftJoin('salesRepActivity', 'users.id', '=', 'salesRepActivity.shopId')
          .where({ 'users.salesRepId': data.salesRepId, activeStatus: 1 })
          // .where('users.id', '!=', 'salesRepActivity.shopId')
          // .groupBy('users.id')
          // .whereRaw('Month(visitDate) = ?', [(new Date()).getMonth() + 1])
          // .whereRaw('YEAR(visitDate) = ?', [data.year])
          .modify(function (queryBuilder) {
            if (data.shopIds.length > 0) {
              queryBuilder.whereNotIn('id', data.shopIds)
            }
          })
          .then((result) => {
            response.error = false
            response.data = result.length
          })
          .catch((error) => {
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }

    this.salesRepNoOrdersModel = function (data, shopList) {
      var response = {}
      var id = data.salesRepID ? data.salesRepID : data.auth.id
      if (data.activityTracker) {
        var month = data.month
        var year = data.year
      }
      return new Promise(function (resolve, reject) {
        knex.db('orders')
          .select('cartUserId')
          // .where('salesRepID', id)
          .whereIn('orders.orderStatus', ['ACCEPTED', 'PACKAGED', 'SHIPPED', 'DELIVERED', 'PAID'])
          .whereIn('orders.cartUserId', shopList)
          .groupBy('orders.cartUserId')
          .modify(function (queryBuilder) {
            if (data.activityTracker) {
              queryBuilder.whereRaw('Month(orderDate) = ?', [month])
              queryBuilder.whereRaw('YEAR(orderDate) = ?', [year])
            }
            else {
              queryBuilder.whereRaw('Month(orderDate) = ?', [knex.db.raw('MONTH(now())')])
              queryBuilder.whereRaw('YEAR(orderDate) = ?', [knex.db.raw('YEAR(now())')])
            }
          })
          .then((result) => {
            response.error = false
            response.data = result
            resolve(response)
          })
          .catch((error) => {
            reject(error)
          })
      })
    }

    this.noPaymentsModel = function (data, shopList) {
      var response = {}
      var id = data.salesRepID ? data.salesRepID : data.auth.id
      if (data.activityTracker) {
        var month = data.month
        var year = data.year
      }
      return new Promise(function (resolve, reject) {
        knex.db('orderPaymentDetails')
          .select('shopId')
          .innerJoin('orders', 'orderPaymentDetails.orderId', '=', 'orders.id')
          // .where('salesRepID', id)
          .whereIn('orderPaymentDetails.shopId', shopList)
          .groupBy('orderPaymentDetails.shopId')
          .modify(function (queryBuilder) {
            if (data.activityTracker) {
              queryBuilder.whereRaw('Month(orderPaymentDetails.paidDate) = ?', [month])
              queryBuilder.whereRaw('YEAR(orderPaymentDetails.paidDate) = ?', [year])
            }
            else {
              queryBuilder.whereRaw('Month(orderPaymentDetails.paidDate) = ?', [knex.db.raw('MONTH(now())')])
              queryBuilder.whereRaw('YEAR(orderPaymentDetails.paidDate) = ?', [knex.db.raw('YEAR(now())')])
            }
          })
          .then((result) => {
            response.error = false
            response.data = result
            resolve(response)
          })
          .catch((error) => {
            reject(error)
          })
      })
    }

    this.shopNoOrdersListModel = function (data, shopIds) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('orders')
          .select('cartUserId')
          // .where('salesRepID', data.salesRepID)
          .whereIn('orders.orderStatus', ['ACCEPTED', 'PACKAGED', 'SHIPPED', 'DELIVERED', 'PAID'])
          .whereIn('orders.cartUserId', shopIds)
          .whereRaw('Month(orderDate) = ?', [data.month])
          .whereRaw('YEAR(orderDate) = ?', [data.year])
          .groupBy('orders.cartUserId')
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

    this.shopNoPaymentListModel = function (data, shopIds) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('orderPaymentDetails')
          .select('shopId')
          .innerJoin('orders', 'orderPaymentDetails.orderId', '=', 'orders.id')
          // .where('salesRepID', data.salesRepID)
          .whereIn('orderPaymentDetails.shopId', shopIds)
          .whereRaw('Month(orderPaymentDetails.paidDate) = ?', [data.month])
          .whereRaw('YEAR(orderPaymentDetails.paidDate) = ?', [data.year])
          .groupBy('orderPaymentDetails.shopId')
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



    this.shopNoInteractionModel = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('salesRepActivity')
          .select('shopId')
          .where('salesRepId', data.salesRepID)
          .whereRaw('Month(visitDate) = ?', [data.month])
          .whereRaw('YEAR(visitDate) = ?', [data.year])
          .groupBy('shopId')
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

    this.shopInformationListModel = function (data) {
      var response = {}
      // let salesrepId = JSON.stringify(data.salesRepID)

      return new Promise(function (resolve) {
        if (data.listType === 'LIST') {
          var pageNumber = data.pageNumber
          if (pageNumber == '0') {
            pageNumber = '0'
          } else {
            pageNumber = pageNumber - 1
          }
          var pageOffset = parseInt(pageNumber * data.pageCount)
        }
        knex.db('users')
          .select('id', 'shopName', 'shopAddress')
          .where({
            // 'users.salesRepId': data.salesRepID,
            activeStatus: 1
          })
          // .whereRaw('JSON_CONTAINS(users.salesRepIds,?)', salesrepId)
          .where('users.primarySalesRepId', data.salesRepID)
          .orderBy('id', 'desc')
          .modify(function (queryBuilder) {
            if (data.listType === 'LIST') {
              queryBuilder.offset(pageOffset).limit(data.pageCount)
            }
            if (data.shopIds.length > 0) {
              queryBuilder.whereNotIn('id', data.shopIds)
            }
          })
          .then((result) => {
            // console.log(result)
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

    this.remainderListModel = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        if (data.listType === 'LIST') {
          var pageNumber = data.pageNumber
          if (pageNumber == '0') {
            pageNumber = '0'
          } else {
            pageNumber = pageNumber - 1
          }
          var pageOffset = parseInt(pageNumber * data.pageCount)
        }
        knex.db('orders')
          .select('cartUserId', 'shopName', 'shopAddress', 'cartUserId',
            knex.db.raw('SUM(paidAmount) as paid'), knex.db.raw('SUM(balanceAmount) as total'))
          .innerJoin('users', 'orders.cartUserId', '=', 'users.id')
          .where('orders.salesRepID', data.auth.id)
          .whereIn('orders.orderStatus', ['PACKAGED', 'SHIPPED', 'DELIVERED', 'PAID'])
          .where('balanceAmount', '!=', 0)
          .havingRaw('SUM(balanceAmount) != paid')
          .groupBy('cartUserId')
          .modify(function (queryBuilder) {
            if (data.listType === 'LIST') {
              queryBuilder.offset(pageOffset).limit(data.pageCount)
            }
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



    this.primaryRemainderListModel = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        if (data.listType === 'LIST') {
          var pageNumber = data.pageNumber
          if (pageNumber == '0') {
            pageNumber = '0'
          } else {
            pageNumber = pageNumber - 1
          }
          var pageOffset = parseInt(pageNumber * data.pageCount)
        }
        knex.db('orders')
          .select('cartUserId', 'shopName', 'shopAddress', 'cartUserId',
            knex.db.raw('SUM(paidAmount) as paid'), knex.db.raw('SUM(balanceAmount) as total'))
          .innerJoin('users', 'orders.cartUserId', '=', 'users.id')
          // .where('orders.salesRepID', data.auth.id)
          .where('users.primarySalesRepId', data.auth.id)
          .whereIn('orders.orderStatus', ['PACKAGED', 'SHIPPED', 'DELIVERED', 'PAID'])
          .where('balanceAmount', '!=', 0)
          .havingRaw('SUM(balanceAmount) != paid')
          .groupBy('cartUserId')
          .orderBy('users.id', 'desc')
          // .modify(function (queryBuilder) {
          //   if (data.listType === 'LIST') {
          //     queryBuilder.offset(pageOffset).limit(data.pageCount)
          //   }
          // })
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



    this.secondaryRemainderListModel = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        if (data.listType === 'LIST') {
          var pageNumber = data.pageNumber
          if (pageNumber == '0') {
            pageNumber = '0'
          } else {
            pageNumber = pageNumber - 1
          }
          var pageOffset = parseInt(pageNumber * data.pageCount)
        }
        let salesrepId = JSON.stringify(data.auth.id)
        knex.db('orders')
          .select('cartUserId', 'shopName', 'shopAddress', 'cartUserId',
            knex.db.raw('SUM(paidAmount) as paid'), knex.db.raw('SUM(balanceAmount) as total'))
          .innerJoin('users', 'orders.cartUserId', '=', 'users.id')
          // .where('orders.salesRepID', data.auth.id)
          .whereRaw('JSON_CONTAINS(users.secondarySalesRepIds,?)', [salesrepId])

          .whereIn('orders.orderStatus', ['PACKAGED', 'SHIPPED', 'DELIVERED', 'PAID'])
          .where('balanceAmount', '!=', 0)
          // .havingRaw('SUM(balanceAmount) != paid')
          .groupBy('cartUserId')
          .orderBy('users.id', 'desc')
          // .modify(function (queryBuilder) {
          //   if (data.listType === 'LIST') {
          //     queryBuilder.offset(pageOffset).limit(data.pageCount)
          //   }
          // })
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


    this.tertiaryRemainderListModel = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        if (data.listType === 'LIST') {
          var pageNumber = data.pageNumber
          if (pageNumber == '0') {
            pageNumber = '0'
          } else {
            pageNumber = pageNumber - 1
          }
          var pageOffset = parseInt(pageNumber * data.pageCount)
        }
        let salesrepId = JSON.stringify(data.auth.id)
        knex.db('orders')
          .select('cartUserId', 'shopName', 'shopAddress', 'cartUserId',
            knex.db.raw('SUM(paidAmount) as paid'), knex.db.raw('SUM(balanceAmount) as total'))
          .innerJoin('users', 'orders.cartUserId', '=', 'users.id')
          // .where('orders.salesRepID', data.auth.id)
          .whereRaw('JSON_CONTAINS(users.tertiarySalesRepIds,?)', [salesrepId])

          .whereIn('orders.orderStatus', ['PACKAGED', 'SHIPPED', 'DELIVERED', 'PAID'])
          .where('balanceAmount', '!=', 0)
          .havingRaw('SUM(balanceAmount) != paid')
          .groupBy('cartUserId')
          .orderBy('users.id', 'desc')
          // .modify(function (queryBuilder) {
          //   if (data.listType === 'LIST') {
          //     queryBuilder.offset(pageOffset).limit(data.pageCount)
          //   }
          // })
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




    this.checkRemailderOrders = function (userId, id) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('orders')
          .select('orders.id', 'paidAmount', 'shopName', 'totalGST', 'totalAmount',
            knex.db.raw('SUM(balanceAmount) as amount'),
            knex.db.raw('DATE_FORMAT(orders.orderDate + INTERVAL creditPeriod DAY, "%d/%m/%Y") as alterDueDate'),
            knex.db.raw('DATE_FORMAT(shippedDate + INTERVAL creditPeriod DAY, "%d/%m/%Y") as dueDate, DATE_FORMAT(shippedDate, "%d-%m-%Y") AS shippedDate'))
          .innerJoin('users', 'orders.cartUserId', '=', 'users.id')
          .where({
            // 'orders.salesRepID': id,
            'orders.cartUserId': userId
          })
          .whereIn('orders.orderStatus', ['SHIPPED', 'DELIVERED', 'PAID'])
          .where('balanceAmount', '!=', 0)
          // .where('orders.salesRepID', data.auth.id)
          .havingRaw('SUM(balanceAmount) != paidAmount')
          .groupBy('orders.id')
          .orderBy('orders.shippedDate', 'asc')
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

    this.checkRemailderOrders1 = function () {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('orders')
          .select('orders.id', 'paidAmount', 'shopName', 'totalGST', 'totalAmount',
            knex.db.raw('SUM(balanceAmount) as amount'),
            knex.db.raw('DATE_FORMAT(orderDate + INTERVAL creditPeriod DAY, "%m/%d/%Y") as dueDate, DATE_FORMAT(orderDate, "%d-%m-%Y") AS orderDate'))
          .innerJoin('users', 'orders.cartUserId', '=', 'users.id')
          // .where({ 'orders.salesRepID': id, 'orders.cartUserId': userId })
          .whereIn('orders.orderStatus', ['PACKAGED', 'SHIPPED', 'DELIVERED', 'PAID'])
          .where('balanceAmount', '!=', 0)
          // .where('orders.salesRepID', data.auth.id)
          .havingRaw('SUM(balanceAmount) != paidAmount')
          .groupBy('orders.id')
          // .orderBy('orders.id', 'asc')
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

    this.getOutstandingModel = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('orders')
          .select(
            // knex.db.raw('SUM(paidAmount) as paid'),
            knex.db.raw('SUM(balanceAmount) as total'))
          .whereIn('orders.orderStatus', ['PACKAGED', 'SHIPPED', 'DELIVERED', 'PAID'])
          // .innerJoin('users', 'orders.cartUserId', '=', 'users.id')
          // .where('orders.salesRepID', data.auth.id)
          .innerJoin('users', 'orders.cartUserId', '=', 'users.id')
          .where(function () {
            this.where('users.primarySalesRepId', data.auth.id)
              .orWhereRaw('JSON_CONTAINS(users.secondarySalesRepIds, ?)', [JSON.stringify(data.auth.id)])
              .orWhereRaw('JSON_CONTAINS(users.tertiarySalesRepIds, ?)', [JSON.stringify(data.auth.id)]);
          })
          .where('balanceAmount', '!=', 0)
          // .havingRaw('SUM(balanceAmount) != paid')
          // .groupBy('users.id')
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



    this.totalSalesRepOwnersModel = function (id) {
      var response = {}
      let salesrepId = JSON.stringify(id)
      return new Promise(function (resolve) {
        knex.db('users')
          .select('users.id', 'name', 'mobileNumber', 'shopName', 'shopAddress', knex.db.raw('SUM(paidAmount) as paidAmount'))
          .leftJoin('orders', 'users.id', '=', 'orders.cartUserId')
          .where({
            // 'users.salesRepId': id,
            'users.activeStatus': 1
          })
          // .whereRaw('JSON_CONTAINS(users.salesRepIds,?)', salesrepId)
          .where('users.primarySalesRepId', id)
          .groupBy('users.id')
          // .orderBy('paidAmount', 'desc')
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



    this.totalSalesRepOwnersModel1 = function (id) {
      var response = {}
      let salesrepId = JSON.stringify(id)
      return new Promise(function (resolve) {
        knex.db('users')
          // .select('users.id', 'name', 'mobileNumber', 'shopName', 'shopAddress', knex.db.raw('SUM(paidAmount) as paidAmount'))
          .pluck('users.id')
          // .leftJoin('orders', 'users.id', '=', 'orders.cartUserId')
          .where({
            // 'users.salesRepId': id,
            'users.activeStatus': 1
          })
          // .whereRaw('JSON_CONTAINS(users.salesRepIds,?)', salesrepId)
          .where('users.primarySalesRepId', id)
          .groupBy('users.id')
          // .orderBy('paidAmount', 'desc')
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




    this.checkShopModel = function (id) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('users')
          .select('users.id', 'customerID', 'name', 'mobileNumber', 'shopName',)
          .where({
            'users.id': id,
            'users.activeStatus': 1
          })
          .groupBy('users.id')
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



    this.addActivityMessageModel = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('salesRepActivityMessages')
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

    this.shopActivityListModel = function (customerID) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('salesRepActivity')
          .select('salesRepActivity.shopId', 'salesRepActivity.customerID', 'salesRepActivity.activityType',
            'salesRepActivity.visitDate', 'salesRepActivity.visitReasonId', 'salesRepActivity.isVisit',
            'otherReason', 'activityReason.reason', 'salesRepActivity.id', 'salesRepActivity.salesRepId', 'salesRep.name'

          )
          .innerJoin('activityReason', 'salesRepActivity.visitReasonId', '=', 'activityReason.id')
          .innerJoin('salesRep', 'salesRepActivity.salesRepId', '=', 'salesRep.id')
          .where('salesRepActivity.customerID', customerID)
          // .groupBy('salesRepActivity.customerID')
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


    this.shopActivityChatListModel = function (customerID) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('salesRepActivityMessages')
          .select('salesRepActivityMessages.id', 'salesRepActivityMessages.message', 'salesRepActivityMessages.customerID',
            'salesRepActivityMessages.salesRepId', 'salesRepActivityMessages.visitDate', 'salesRepActivityMessages.shopId',
            'salesRep.name', 'salesRepActivityMessages.task', 'salesRepActivityMessages.isCompleted','completedDate as taskCompletedDate',
            'sales_rep.name as completedBySalesRep', 'salesRepActivityMessages.isCompletedBy', 'salesRepActivityMessages.completedDate',
            // knex.db.raw("DATE_FORMAT(salesRepActivityMessages.completedDate, '%Y-%m-%d') as taskCompletedDate")  // Here's the modification

          )
          .leftJoin('salesRep', 'salesRepActivityMessages.salesRepId', '=', 'salesRep.id')
          .leftJoin('salesRep as sales_rep', 'salesRepActivityMessages.isCompletedBy', '=', 'sales_rep.id')
          .where('salesRepActivityMessages.customerID', customerID)
          .groupBy('salesRepActivityMessages.id')
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


    this.shopPendingTaskChatModel = function (customerID) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('salesRepActivityMessages')
          .count('salesRepActivityMessages.id as count')
          .where('salesRepActivityMessages.customerID', customerID)
          .andWhere('salesRepActivityMessages.task',1)
          .andWhere('salesRepActivityMessages.isCompleted',0)
          // .groupBy('salesRepActivityMessages.id')
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




    this.getOneTaskModel = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('salesRepActivityMessages')
         .select("*")
          .where('id', data.id)
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

    this.updateTaskCompleteModel = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('salesRepActivityMessages')
          .update({
            isCompleted: 1,
            isCompletedBy: data.isCompletedBy,
            completedDate: data.completedDate
          })
          .where('id', data.id)
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

    this.getAllSalesRepDetailsModel = function (customerID) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('users')
          .select(
            'users.primarySalesRepId', 'users.secondarySalesRepIds',
            'users.tertiarySalesRepIds','users.shopName'
          )
          .where('users.customerID', '=', customerID)
        
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


    this.getSalesRepDetailsForNotification = function (salesRepID) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('salesRep')
          .select(
           "*"
          )
          .where('salesRep.id', '=', salesRepID)
        .andWhere('salesRep.activeStatus', '=', 1)
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















  }
}








export default SalesRepActivityModel;