'use strict';

import knex from './../../../config/db.config'

class UserPaymentModel {
    constructor() {


        this.getOneOrderDetailsModel = function (data) {
            var response = {}
            console.log("data", data.orderId)
            return new Promise(function (resolve) {
                knex.db('orders')
                    .select('orders.id', 'bookingId', 'cartUserId', 'orders.cashDiscountAmount',
                        'orders.ownerId', 'orders.salesRepID', 'orderStatus',
                        'invoiceUpdate', 'invoiceNumber', knex.db.raw('DATE_FORMAT(invoiceDate, "%d/%m/%Y") AS invoiceDate'),
                        knex.db.raw('DATE_FORMAT(orderDate, "%d/%m/%Y") AS orderDate'), 'isReceiptUpdate', 'receiptFile',
                        'downloadBill', 'balanceDue', 'referralDiscount', 'balanceAmount',
                        knex.db.raw('SUM(totalAmount + totalGST - referralDiscount - orders.cashDiscountAmount - orders.additionalDiscountAmount - orders.specialDiscountAmount) as totalAmount'),
                        'users.customerID', 'users.mobileNumber', 'users.email', 'users.shopName'
                    )
                    .innerJoin('users', 'orders.cartUserId', '=', 'users.id')
                    .where('orders.bookingId', data.orderId)
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


        this.getOnePaymentOrderDetailsModel = function (data) {
            var response = {}
            console.log("data", data.orderId)
            return new Promise(function (resolve) {
                knex.db('payRequest')
                    .select('payRequest.id', 'payRequest.paidBy', 'payRequest.requestAmount', 'payRequest.activeStatus',
                        'users.customerID', 'users.mobileNumber', 'users.email', 'users.shopName'
                    )
                    .innerJoin('users', 'payRequest.ownerId', '=', 'users.id')
                    .where('payRequest.id', data.orderId)
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


        this.insertOnePaymentsDetailsModel = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('paymentHistory')
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

        this.updateOneOrderDetailsModel = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('orders')
                    .update({
                        orderStatus: data.orderStatus,
                        onlinePaid: data.onlinePaid,
                        paymentStatus: data.paymentStatus,
                        // balanceAmount: data.balanceAmount,
                    })
                    .where('bookingId', data.bookingId)
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

        this.clearCartForPaymentModel = function (data) {
            var response = {}

            return new Promise(function (resolve, reject) {
                knex.db('cartItems')
                    .where({
                        'userId': data.userId,
                        'cartType': 'USER'
                    }).del()
                    .then((result) => {
                        response.error = false
                        response.data = result.length
                        resolve(response)
                    })
                    .catch((error) => {
                        console.log("clearCartForPaymentModel", error)
                        reject(error)
                    })
            })
        }


        this.updateOnePaymentOrderDetailsModel = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('payRequest')
                    .update({
                        onlinePaid: data.onlinePaid,
                        paymentStatus: data.paymentStatus,
                        activeStatus: data.activeStatus,
                        requestStatus: data.requestStatus
                    })
                    .where('id', data.id)
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


        this.insertOneUserDropedPaymentsDetailsModel = function (data) {
            var response = {}
            // console.log( "params.auth.userDepotId",params.auth.userDepotId)
            return new Promise(function (resolve, reject) {
                var transac = knex.db.transaction(function (trx) {
                    knex.db('paymentHistory')
                        .select('id')
                        // .select('*')
                        .where('activeStatus', 1)
                        .andWhere('orderId', data.orderId)
                        .transacting(trx)
                        .then((result) => {
                            var userDropoutPayment;
                            if (result.length > 0) {
                                userDropoutPayment = knex.db('paymentHistory')
                                    .update(data)
                                    .where('orderId', data.orderId)
                                    .transacting(trx)

                            } else {
                                userDropoutPayment = knex.db('paymentHistory')
                                    .insert(data)
                                    .transacting(trx)
                            }

                            return Promise.all([result, userDropoutPayment])
                        })
                        .then(trx.commit)
                        .catch(trx.rollback);
                })
                transac.then(function (result) {
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

        this.getOrderItemsModel = function (data) {
            var response = {}

            return new Promise(function (resolve, reject) {
                knex.db('orderItems')
                    .select('orderItems.orderProductId', 'orderItems.quantity', 'orderItems.freeQuantity', 'orders.outletId',
                    'orders.orderItemsPdf')
                    .where({
                        bookingOrderId: data.bookingId
                    })
                    .innerJoin('orders', 'orderItems.bookingOrderId', '=', 'orders.bookingId')
                    .then((result) => {
                        response.error = false
                        response.data = result
                        resolve(response)
                    })
                    .catch((error) => {
                        console.log("clearCartForPaymentModel", error)
                        reject(error)
                    })
            })
        }




        this.AddProductQuantityModel = function (data) {
            var response = {}
            console.log( "params.auth.userDepotId",data)
            return new Promise(function (resolve, reject) {
                var transac = knex.db.transaction(function (trx) {
                    knex.db('productInventory')
                        .select('*')
                        .where('productInventoryCode', data.productCode)
                        .andWhere('outletId', data.outletId)
                        .transacting(trx)
                        .then((result) => {
                            var updateItemQuantity;
                            console.log("result", result)
                            if (result.length > 0) {
                                let quantityInventory = parseInt(result[0].productStockCount) + parseInt(data.quantity)
                                if (result.length > 0) {
                                    updateItemQuantity = knex.db('productInventory')
                                        .update({
                                            productStockCount: quantityInventory
                                        })
                                        .where('productInventoryCode', data.productCode)
                                        .andWhere('outletId', data.outletId)
                                        .transacting(trx)
                                }
                            }


                            return Promise.all([result, updateItemQuantity])
                        })
                        .then(trx.commit)
                        .catch(trx.rollback);
                })
                transac.then(function (result) {
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



        this.getOneOrderDetailForPdf = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('orders')
                    .select('orders.id')
                    .where('bookingId', data.bookingId)
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


        this.profileModel = function (customerID) {
            var response = {}
            return new Promise(function (resolve) {
              knex.db('users')
                .select('id', 'name', 'customerID', 'mobileNumber', 'email', 'userType', 'users.cashDiscount',
                  'ownerId', 'outletId', 'userDiscountId', 'isProfileCompleted', 'activeStatus', 'users.isNonGst',
                  'isProfileCompleted', 'shopName', 'shopAddress', 'pincode', 'city', 'state', 'users.cashOnCarry',
                  'longitude', 'latitude', 'bonusPoint', 'creditLimit', 'creditFixedtLimit', 'creditPeriod', 'paymentTypeIds',
                  'gst', 'isOfferApply', 'activeStatus', 'isPriceVisible',
                  'users.primarySalesRepId' ,'users.secondarySalesRepIds','users.tertiarySalesRepIds',
                   'salesRepIds', 'managerCart', 'rating', 'userCatalogId')
                .where('customerID', customerID)
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


          this.getOnesalesRepForSms = function (id) {
            var response = {}
            return new Promise(function (resolve) {
              knex.db('salesRep')
                .select('id', 'repID', 'name', 'email', 'mobile', 'userType', 'totalAmount',
                  'totalOrders', 'totalPayments', 'totalAmountCollected')
                .where('id', id)
                .andWhere('salesRep.activeStatus', 1)
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


          this.updateOneFailedOrderDetailsModel = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('orders')
                    .update({
                        orderStatus: data.orderStatus,
                        onlinePaid: data.onlinePaid,
                        paymentStatus: data.paymentStatus,
                        balanceAmount: data.balanceAmount,
                        orderItemsPdf:""
                    })
                    .where('bookingId', data.bookingId)
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
                console.log("success", result)
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






    }
}








export default UserPaymentModel;



