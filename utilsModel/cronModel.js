'use strict';

import knex from '../config/db.config'

class CronModel {
    constructor() {





        this.cronCollectedPaymentListModel = function (data, value) {
            var response = {}
            return new Promise(function (resolve) {

                var k = knex.db('orders')
                    .select('orders.id', 'bookingId', 'orders.orderStatus',
                        'orders.ownerId', 'paymentTypes.type', 'au.shopName', 'au.mobileNumber', 'au.deviceToken',
                        'ow.creditPeriod',
                        //  knex.db.raw('DATE_FORMAT(orderDate + INTERVAL ow.creditPeriod DAY, "%d/%m/%Y") as dueDate, DATE_FORMAT(orderDate, "%d/%m/%Y") AS orderDate'),
                        knex.db.raw('DATE_FORMAT(shippedDate + INTERVAL ow.creditPeriod DAY, "%d/%m/%Y") as dueDate, DATE_FORMAT(shippedDate, "%d/%m/%Y") AS shippedDate'),
                        knex.db.raw('SUM(totalAmount + totalGST - referralDiscount - orders.cashDiscountAmount - orders.additionalDiscountAmount - orders.specialDiscountAmount) as totalAmount'), 'paidAmount', 'balanceAmount')
                    .innerJoin('paymentTypes', 'orders.paymentId', '=', 'paymentTypes.id')
                    .leftJoin('users as au', 'orders.cartUserId', '=', 'au.id')
                    .leftJoin('users as ow', 'orders.ownerId', '=', 'ow.id')
                    // .where('orders.salesRepID', data.auth.id)
                    // .where('orders.balanceAmount', '=', '0')
                    .groupBy('orders.id')
                    .modify(function (queryBuilder) {
                        // queryBuilder.whereIn('orders.orderStatus', ['PACKAGED', 'SHIPPED', 'DELIVERED', 'PAID'])
                        queryBuilder.whereIn('orders.orderStatus', ['SHIPPED', 'DELIVERED', 'PAID'])
                        queryBuilder.where('orders.balanceAmount', '!=', 0)
                    });
                //  console.log("query***",k.toString())
                k.then((result) => {
                    response.error = false
                    response.data = result
                })
                    .catch((error) => {
                        console.log("errror in catalogSortingDao 2915", error)
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









    }
}








export default CronModel;