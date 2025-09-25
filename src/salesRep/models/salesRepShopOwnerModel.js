'use strict';

import knex from '../../../config/db.config'

class SalesRepShopOwnerModel {
    constructor() {

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
                    .whereRaw('JSON_CONTAINS(users.salesRepIds,?)', salesrepId)
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

        this.getSalesRepOwnersModel = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                var pageNumber = data.pageNumber
                if (pageNumber == '0') {
                    pageNumber = '0'
                } else {
                    pageNumber = pageNumber - 1
                }
                let salesrepId = JSON.stringify(data.auth.id)

                var pageOffset = parseInt(pageNumber * data.pageCount)
                knex.db('users')
                    .select('users.id', 'name', 'mobileNumber', 'userType', 'users.ownerId', 'shopName',
                        'shopAddress', knex.db.raw('SUM(paidAmount) as paidAmount'))
                    .leftJoin('orders', 'users.id', '=', 'orders.cartUserId')
                    .where({
                        // 'users.salesRepId': data.auth.id,
                        'users.activeStatus': 1
                    })
                    .whereRaw('JSON_CONTAINS(users.salesRepIds,?)', salesrepId)
                    .groupBy('users.id')
                    .orderBy('paidAmount', 'desc')
                    .offset(pageOffset).limit(data.pageCount)
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

        this.searchShopNameModel = function (data) {
            var response = {}
            let salesrepId = JSON.stringify(data.auth.id)

            return new Promise(function (resolve) {
                knex.db('users')
                    .select('users.id', 'name', 'mobileNumber', 'shopName', 'shopAddress', 'userType', 'users.ownerId', knex.db.raw('SUM(paidAmount) as paidAmount'))
                    .leftJoin('orders', 'users.id', '=', 'orders.cartUserId')
                    .where({
                        // 'users.salesRepId': data.auth.id,
                        'users.activeStatus': 1
                    })
                    // .whereRaw('JSON_CONTAINS(users.salesRepIds,?)', salesrepId)
                    .where(function () {
                        this.where('users.primarySalesRepId', data.auth.id)
                            .orWhereRaw('JSON_CONTAINS(users.secondarySalesRepIds, ?)', [JSON.stringify(data.auth.id)])
                            .orWhereRaw('JSON_CONTAINS(users.tertiarySalesRepIds, ?)', [JSON.stringify(data.auth.id)]);
                    })
                    .groupBy('users.id')
                    .modify(function (queryBuilder) {
                        if (data.type === 'OWNER') {
                            queryBuilder.whereRaw('( name LIKE  "%' + data.name + '%" OR shopName LIKE  "%' + data.name + '%" )')
                            queryBuilder.orderBy('paidAmount', 'desc')
                        } else {
                            queryBuilder.whereRaw('( shopName LIKE  "%' + data.name + '%" )')
                            queryBuilder.orderBy('users.id', 'desc')
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
        this.profileModel = function (id) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('users')
                    .select('id', 'name', 'customerID', 'mobileNumber', 'email', 'userType', 'minOrderValue',
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
                    .select(knex.db.raw("sum(case when  orderStatus IN ('WAITING', 'ACCEPTED') then totalAmount + totalGST else 0 end) AS totalAcceptWaitingAmount"))
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
        this.ownerOrderByMonthModel = function (data) {
            var response = {}
            return new Promise(function (resolve, reject) {
                knex.db('orders')
                    .select('orders.id', 'shopName', 'bookingId', 'orders.outletId',
                        'outlet.outletName', 'name', 'totalQuantity', 'orders.cashDiscountAmount',
                        knex.db.raw('SUM(totalAmount + totalGST - referralDiscount - orders.cashDiscountAmount - orders.additionalDiscountAmount - orders.specialDiscountAmount) as totalAmount'),
                        'orders.receiptFile', 'orders.downloadBill', 'orders.orderStatus',
                        knex.db.raw('DATE_FORMAT(orderDate, "%d/%m/%Y") AS orderDate'))
                    .innerJoin('users', 'orders.cartUserId', '=', 'users.id')
                    .innerJoin('outlet', 'orders.outletId', '=', 'outlet.id')
                    .where({
                        // 'orders.salesRepID': data.auth.id,
                        'orders.cartUserId': data.shopId
                    })
                    .whereRaw('Month(orderDate) = ?', [data.month])
                    .whereRaw('YEAR(orderDate) = ?', [data.year])
                    .whereNot('orderStatus', 'PENDING')
                    .groupBy('orders.id')
                    .orderBy('orders.id', 'desc')
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

        this.adminownerOrderByMonthModel = function (data) {
            var response = {}
            // var arr=[];
            // console.log("adminownerOrderByMonthModel**", data)
            // arr.push(parseInt(data.startMonth));
            // arr.push(parseInt(data.endMonth));
            return new Promise(function (resolve, reject) {
                if (data.startMonth.length == 0) {
                    data.startMonth = 1
                }
                if (data.endMonth.length == 0) {
                    data.endMonth = 12
                }
                if (data.year.length > 0) {
                    var dat = new Date()
                    data.year = dat.getFullYear()
                    // console.log("data year", data.year)
                }
                // var pageNumber =data.pageNumber\
                var pageNumber = data.pageNumber

                if (pageNumber == '0') {
                    pageNumber = 0
                } else {
                    pageNumber = pageNumber - 1
                }
                var pageOffset = parseInt(pageNumber * 20)
                knex.db('orders')
                    .select('orders.id', 'shopName', 'bookingId', 'orders.orderStatus', 'name', 'totalQuantity',
                        knex.db.raw('SUM(totalAmount + totalGST - referralDiscount - orders.cashDiscountAmount - orders.additionalDiscountAmount - orders.specialDiscountAmount) as totalAmount'),
                        knex.db.raw('DATE_FORMAT(orderDate, "%d/%m/%Y") AS orderDate'))
                    .innerJoin('users', 'orders.cartUserId', '=', 'users.id')
                    .where({
                        'orders.ownerId': data.ownerId
                    })
                    // .whereRaw('Month(orderDate) = ?', 10)
                    .whereRaw('Month(orderDate) BETWEEN ? AND ?', [data.startMonth, data.endMonth])
                    .whereRaw('YEAR(orderDate) = ?', [data.year])
                    .whereNot('orders.orderStatus', 'PENDING')
                    .groupBy('orders.id')
                    .orderBy('orders.id', 'desc')
                    .offset(pageOffset).limit(20)
                    .then((result) => {
                        response.error = false
                        response.data = result
                    })
                    .catch((error) => {
                        // console.log("Eror***", error);
                        response.error = true
                    })
                    .finally(() => {
                        resolve(response)
                    })
            })
        }


        this.getAllOrdersModel = function (data) {
            var response = {}
            // var arr=[];
            // console.log("adminownerOrderByMonthModel**",data)
            // arr.push(parseInt(data.startMonth));
            // arr.push(parseInt(data.endMonth));
            return new Promise(function (resolve, reject) {
                if (data.startMonth.length == 0 || data.endMonth.length == 0) {
                    data.startMonth = 1
                    data.endMonth = 12
                }
                const d = new Date();
                if (data.year.length == 0) {
                    data.year = d.getFullYear();
                }

                knex.db('orders')
                    .select('orders.id', 'shopName', 'bookingId', 'name', 'totalQuantity',
                        knex.db.raw('SUM(totalAmount + totalGST - referralDiscount - orders.cashDiscountAmount - orders.additionalDiscountAmount - orders.specialDiscountAmount) as totalAmount'),
                        knex.db.raw('DATE_FORMAT(orderDate, "%d/%m/%Y") AS orderDate'))
                    .innerJoin('users', 'orders.cartUserId', '=', 'users.id')
                    .where({
                        'orders.ownerId': data.ownerId
                    })
                    // .whereRaw('Month(orderDate) = ?', 10)
                    // .whereRaw('Month(orderDate) BETWEEN ? AND ?', [data.startMonth,data.endMonth])
                    .whereRaw('YEAR(orderDate) = ?', [data.year])
                    .whereNot('orders.orderStatus', 'PENDING')
                    .groupBy('orders.id')
                    .orderBy('orders.id', 'desc')
                    .then((result) => {
                        response.error = false
                        response.data = result
                    })
                    .catch((error) => {
                        console.log("Eror***", error);
                        response.error = true
                    })
                    .finally(() => {
                        resolve(response)
                    })
            })
        }



        this.salesRepOrderCheck = function (id) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('orders')
                    .select('orders.id', 'bookingId', 'name', 'orders.outletId', 'outlet.outletName',
                        'userType', 'users.ownerId', 'shopName', 'orders.cashDiscountAmount', 'users.customerID',
                        'cartUserId as shopId', 'shopAddress', 'orderStatus', 'offerOty', 'invoiceUpdate',
                        'invoiceNumber', knex.db.raw('DATE_FORMAT(invoiceDate, "%d/%m/%Y") AS invoiceDate'),
                        knex.db.raw('DATE_FORMAT(orderDate, "%d/%m/%Y") AS orderDate'), 'isReceiptUpdate',
                        'receiptFile', 'downloadBill', 'paymentTypes.type as paymentTypes', 'balanceDue',
                        'totalQuantity', 'referralDiscount', 'orderItemsPdf',
                        knex.db.raw('SUM(totalAmount + totalGST - referralDiscount - orders.cashDiscountAmount - orders.additionalDiscountAmount - orders.specialDiscountAmount) as totalAmount'))
                    .innerJoin('paymentTypes', 'orders.paymentId', '=', 'paymentTypes.id')
                    .innerJoin('users', 'orders.cartUserId', '=', 'users.id')
                    .innerJoin('outlet', 'orders.outletId', '=', 'outlet.id')
                    .where(id)
                    .whereNot('orders.orderStatus', 'PENDING')
                    .groupBy('orders.id')
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

        this.totalCollectedPaymentModel = function (data, value) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('orders')
                    .select('id', 'bookingId')
                    .where('orders.salesRepID', data.auth.id)
                    .whereNot('orders.orderStatus', 'PENDING')
                    // .where('orders.balanceAmount', '=', 0)
                    .modify(function (queryBuilder) {
                        if (value === 'PAYMENTCOLLECT') {
                            queryBuilder.where('orders.balanceAmount', '=', 0)
                        } else {
                            queryBuilder.whereIn('orders.orderStatus', ['PACKAGED', 'SHIPPED', 'DELIVERED', 'PAID'])
                            queryBuilder.where('orders.balanceAmount', '!=', 0)
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
        this.CollectedPaymentListModel = function (data, value) {
            var response = {}
            return new Promise(function (resolve) {
                var pageNumber = data.pageNumber
                var type = data.type
                var orderBy;
                if (data.sortBy == 1) {
                    orderBy = 'desc'
                } else if (data.sortBy == 2) {
                    orderBy = 'asc'
                }
                if (pageNumber == '0') {
                    pageNumber = '0'
                } else {
                    pageNumber = pageNumber - 1
                }
                var pageOffset = parseInt(pageNumber * data.pageCount)
                var k = knex.db('orders')
                    .select('orders.id', 'bookingId', 'orders.orderStatus',
                        'orders.ownerId', 'paymentTypes.type', 'au.shopName',
                        'ow.creditPeriod', knex.db.raw('DATE_FORMAT(orderDate + INTERVAL ow.creditPeriod DAY, "%d/%m/%Y") as dueDate, DATE_FORMAT(orderDate, "%d/%m/%Y") AS orderDate'),
                        knex.db.raw('SUM(totalAmount + totalGST - referralDiscount - orders.cashDiscountAmount - orders.additionalDiscountAmount - orders.specialDiscountAmount) as totalAmount'), 'paidAmount', 'balanceAmount')
                    .innerJoin('paymentTypes', 'orders.paymentId', '=', 'paymentTypes.id')
                    .leftJoin('users as au', 'orders.cartUserId', '=', 'au.id')
                    .leftJoin('users as ow', 'orders.ownerId', '=', 'ow.id')
                    .where('orders.salesRepID', data.auth.id)
                    // .where('orders.balanceAmount', '=', '0')
                    .whereNot('orders.orderStatus', 'PENDING')
                    .groupBy('orders.id')
                    .offset(pageOffset).limit(data.pageCount)
                    .modify(function (queryBuilder) {
                        if (parseInt(data.sortBy) < 3) {
                            queryBuilder.orderBy('orders.id', orderBy)
                        } else if (parseInt(data.sortBy) == 3) {
                            queryBuilder.orderBy('orders.balanceAmount', 'desc')
                        } else if (parseInt(data.sortBy) == 4) {
                            queryBuilder.orderBy('orders.balanceAmount', 'asc')
                        }
                        if (value === 'PAYMENTCOLLECT') {
                            queryBuilder.where('orders.balanceAmount', '=', 0)
                        } else {
                            queryBuilder.whereIn('orders.orderStatus', ['PACKAGED', 'SHIPPED', 'DELIVERED', 'PAID'])
                            queryBuilder.where('orders.balanceAmount', '!=', 0)
                        }
                    });
                //  console.log("query***",k.toString())
                k.then((result) => {
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

        // OVER ALL ORDERS INFO
        this.getOverAllOrderModel = function (id, data) {
            var response = {}
            return new Promise(function (resolve, reject) {
                knex.db.raw(`SELECT (SELECT COUNT(*) FROM orders WHERE orderStatus='WAITING' AND salesRepID = ?
              AND YEAR(orderDate) = ${data.year}  AND Month(orderDate) = ${data.month} ) AS wating,
               (SELECT COUNT(*) FROM orders WHERE orderStatus='ACCEPTED' AND salesRepID = ?
               AND YEAR(orderDate) = ${data.year} AND Month(orderDate) = ${data.month} ) AS accepted, 
               (SELECT COUNT(*) FROM orders WHERE orderStatus='DELIVERED' AND salesRepID = ?
               AND YEAR(orderDate) = ${data.year} AND Month(orderDate) = ${data.month} ) AS delivery,
                (SELECT COUNT(*) FROM orders WHERE orderStatus='CANCELLED' AND salesRepID = ?
                AND YEAR(orderDate) = ${data.year} AND Month(orderDate) = ${data.month} ) AS cancelled,
                 (SELECT COUNT(*) FROM orders WHERE orderStatus='PAID' AND salesRepID = ?
                 AND YEAR(orderDate) = ${data.year} AND Month(orderDate) = ${data.month} ) AS paid, 
                 (SELECT COUNT(*) FROM orders WHERE orderStatus='PACKAGED' AND salesRepID = ?
                 AND YEAR(orderDate) = ${data.year} AND Month(orderDate) = ${data.month} ) AS packaged,
                  (SELECT COUNT(*) FROM orders WHERE orderStatus='SHIPPED' AND salesRepID = ?
                  AND YEAR(orderDate) = ${data.year} AND Month(orderDate) = ${data.month}) AS shipped`, [id, id, id, id, id, id, id])
                    .then((result) => {
                        response.error = false
                        response.data = result[0]
                        resolve(response)
                    })
                    .catch((error) => {
                        reject(error)
                    })
            })
        }


        this.getOverAllOrderViewOnePrimarySalesRepDao = function (id, data) {
            var response = {}
            // console.log("data",id)
            return new Promise(function (resolve, reject) {
                knex.db.raw(`SELECT (SELECT COUNT(*) FROM orders
                INNER JOIN users ON orders.ownerId = users.id
                WHERE orderStatus='WAITING' AND users.primarySalesRepId = ?
                AND orderBy = 'USER' AND YEAR(orderDate) = ${data.year}  AND Month(orderDate) = ${data.month} ) AS wating,
                    (SELECT COUNT(*) FROM orders
                    INNER JOIN users ON orders.ownerId = users.id
                    WHERE orderStatus='ACCEPTED' AND users.primarySalesRepId = ?
                    AND orderBy = 'USER' AND YEAR(orderDate) = ${data.year} AND Month(orderDate) = ${data.month} ) AS accepted,
                    (SELECT COUNT(*) FROM orders
                    INNER JOIN users ON orders.ownerId = users.id
                    WHERE orderStatus='DELIVERED' AND users.primarySalesRepId = ?
                    AND orderBy = 'USER' AND YEAR(orderDate) = ${data.year} AND Month(orderDate) = ${data.month} ) AS delivery,
                    (SELECT COUNT(*) FROM orders
                    INNER JOIN users ON orders.ownerId = users.id
                    WHERE orderStatus='CANCELLED' AND users.primarySalesRepId = ?
                    AND orderBy = 'USER' AND YEAR(orderDate) = ${data.year} AND Month(orderDate) = ${data.month} ) AS cancelled,
                    (SELECT COUNT(*) FROM orders
                    INNER JOIN users ON orders.ownerId = users.id
                    WHERE orderStatus='PAID' AND users.primarySalesRepId = ?
                    AND orderBy = 'USER' AND YEAR(orderDate) = ${data.year} AND Month(orderDate) = ${data.month} ) AS paid,
                    (SELECT COUNT(*) FROM orders
                    INNER JOIN users ON orders.ownerId = users.id
                    WHERE orderStatus='PACKAGED' AND users.primarySalesRepId = ?
                    AND orderBy = 'USER' AND YEAR(orderDate) = ${data.year} AND Month(orderDate) = ${data.month} ) AS packaged,
                    (SELECT COUNT(*) FROM orders
                    INNER JOIN users ON orders.ownerId = users.id
                    WHERE orderStatus='SHIPPED' AND users.primarySalesRepId = ?
                    AND orderBy = 'USER' AND YEAR(orderDate) = ${data.year} AND Month(orderDate) = ${data.month}) AS shipped`,
                    [id, id, id, id, id, id, id])
                    .then((result) => {
                        response.error = false
                        response.data = result[0]
                        resolve(response)
                    })
                    .catch((error) => {
                        console.log("getOverAllOrderViewOnePrimarySalesRepDao", error)
                        reject(error)
                    })
            })
        }


        this.getOverAllOrderViewOneSecondaryAndTertiarySalesRepDao = function (id, data) {
            var response = {}
            // console.log("data",id)
            return new Promise(function (resolve, reject) {
                knex.db.raw(`
                SELECT 
                    (SELECT COUNT(*) FROM orders
                        INNER JOIN users ON orders.ownerId = users.id
                        WHERE orderStatus='WAITING' AND 
                        (JSON_CONTAINS(users.secondarySalesRepIds, CAST(? AS JSON)) OR JSON_CONTAINS(users.tertiarySalesRepIds, CAST(? AS JSON)))
                        AND orderBy = 'USER' AND YEAR(orderDate) = ${data.year}  AND Month(orderDate) = ${data.month} 
                    ) AS waiting,
                    (SELECT COUNT(*) FROM orders
                        INNER JOIN users ON orders.ownerId = users.id
                        WHERE orderStatus='ACCEPTED' AND 
                        (JSON_CONTAINS(users.secondarySalesRepIds, CAST(? AS JSON)) OR JSON_CONTAINS(users.tertiarySalesRepIds, CAST(? AS JSON)))
                        AND orderBy = 'USER' AND YEAR(orderDate) = ${data.year} AND Month(orderDate) = ${data.month} 
                    ) AS accepted,
                    (SELECT COUNT(*) FROM orders
                        INNER JOIN users ON orders.ownerId = users.id
                        WHERE orderStatus='DELIVERED' AND 
                        (JSON_CONTAINS(users.secondarySalesRepIds, CAST(? AS JSON)) OR JSON_CONTAINS(users.tertiarySalesRepIds, CAST(? AS JSON)))
                        AND orderBy = 'USER' AND YEAR(orderDate) = ${data.year} AND Month(orderDate) = ${data.month} 
                    ) AS delivery,
                    (SELECT COUNT(*) FROM orders
                        INNER JOIN users ON orders.ownerId = users.id
                        WHERE orderStatus='CANCELLED' AND 
                        (JSON_CONTAINS(users.secondarySalesRepIds, CAST(? AS JSON)) OR JSON_CONTAINS(users.tertiarySalesRepIds, CAST(? AS JSON)))
                        AND orderBy = 'USER' AND YEAR(orderDate) = ${data.year} AND Month(orderDate) = ${data.month} 
                    ) AS cancelled,
                    (SELECT COUNT(*) FROM orders
                        INNER JOIN users ON orders.ownerId = users.id
                        WHERE orderStatus='PAID' AND 
                        (JSON_CONTAINS(users.secondarySalesRepIds, CAST(? AS JSON)) OR JSON_CONTAINS(users.tertiarySalesRepIds, CAST(? AS JSON)))
                        AND orderBy = 'USER' AND YEAR(orderDate) = ${data.year} AND Month(orderDate) = ${data.month} 
                    ) AS paid,
                    (SELECT COUNT(*) FROM orders
                        INNER JOIN users ON orders.ownerId = users.id
                        WHERE orderStatus='PACKAGED' AND 
                        (JSON_CONTAINS(users.secondarySalesRepIds, CAST(? AS JSON)) OR JSON_CONTAINS(users.tertiarySalesRepIds, CAST(? AS JSON)))
                        AND orderBy = 'USER' AND YEAR(orderDate) = ${data.year} AND Month(orderDate) = ${data.month} 
                    ) AS packaged,
                    (SELECT COUNT(*) FROM orders
                        INNER JOIN users ON orders.ownerId = users.id
                        WHERE orderStatus='SHIPPED' AND 
                        (JSON_CONTAINS(users.secondarySalesRepIds, CAST(? AS JSON)) OR JSON_CONTAINS(users.tertiarySalesRepIds, CAST(? AS JSON)))
                        AND orderBy = 'USER' AND YEAR(orderDate) = ${data.year} AND Month(orderDate) = ${data.month} 
                    ) AS shipped
            `, [JSON.stringify(id), JSON.stringify(id), JSON.stringify(id), JSON.stringify(id), JSON.stringify(id), JSON.stringify(id),
                JSON.stringify(id), JSON.stringify(id), JSON.stringify(id), JSON.stringify(id), JSON.stringify(id), JSON.stringify(id),
                JSON.stringify(id), JSON.stringify(id)])
                    .then((result) => {
                        response.error = false
                        response.data = result[0]
                        resolve(response)
                    })
                    .catch((error) => {
                        console.log("getOverAllOrderViewOneSecondaryAndTertiarySalesRepDao", error)
                        reject(error)
                    })

            })
        }





        this.viewSalesRepCollectedPaymentListDao = function (data, value) {
            var response = {}
            return new Promise(function (resolve) {
                var type = data.type
                var orderBy;
                if (data.sortBy == 1) {
                    orderBy = 'desc'
                } else if (data.sortBy == 2) {
                    orderBy = 'asc'
                }

                var k = knex.db('orders')
                    .select('orders.id', 'bookingId', 'orders.orderStatus', 'orders.orderBy',
                        'orders.ownerId', 'paymentTypes.type', 'au.shopName',
                        'ow.creditPeriod', knex.db.raw('DATE_FORMAT(orderDate + INTERVAL ow.creditPeriod DAY, "%d/%m/%Y") as dueDate, DATE_FORMAT(orderDate, "%d/%m/%Y") AS orderDate'),
                        knex.db.raw('SUM(totalAmount + totalGST - referralDiscount - orders.cashDiscountAmount - orders.additionalDiscountAmount - orders.specialDiscountAmount) as totalAmount'), 'paidAmount', 'balanceAmount')
                    .innerJoin('paymentTypes', 'orders.paymentId', '=', 'paymentTypes.id')
                    .leftJoin('users as au', 'orders.cartUserId', '=', 'au.id')
                    .leftJoin('users as ow', 'orders.ownerId', '=', 'ow.id')
                    .where('orders.salesRepID', data.salesRepId)
                    .where('orders.orderBy', '=', 'SALESREP')
                    .whereNot('orders.orderStatus', 'PENDING')
                    .groupBy('orders.id')
                    .modify(function (queryBuilder) {
                        if (parseInt(data.sortBy) < 3) {
                            queryBuilder.orderBy('orders.id', orderBy)
                        } else if (parseInt(data.sortBy) == 3) {
                            queryBuilder.orderBy('orders.balanceAmount', 'desc')
                        } else if (parseInt(data.sortBy) == 4) {
                            queryBuilder.orderBy('orders.balanceAmount', 'asc')
                        }
                        if (value === 'PAYMENTCOLLECT') {
                            queryBuilder.where('orders.balanceAmount', '=', 0)
                        } else {
                            queryBuilder.whereIn('orders.orderStatus', ['PACKAGED', 'SHIPPED', 'DELIVERED', 'PAID'])
                            queryBuilder.where('orders.balanceAmount', '!=', 0)
                        }
                    });
                //  console.log("query***",k.toString())
                k.then((result) => {
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

        this.viewSalesRepPrimaryShopsCollectedPaymentListDao = function (data, value) {
            var response = {}
            return new Promise(function (resolve) {
                var type = data.type
                var orderBy;
                if (data.sortBy == 1) {
                    orderBy = 'desc'
                } else if (data.sortBy == 2) {
                    orderBy = 'asc'
                }

                var k = knex.db('orders')
                    .select('orders.id', 'bookingId', 'orders.orderStatus', 'orders.orderBy',
                        'orders.ownerId', 'paymentTypes.type', 'au.shopName',
                        'ow.creditPeriod', 
                        knex.db.raw('DATE_FORMAT(shippedDate + INTERVAL ow.creditPeriod DAY, "%d/%m/%Y") as dueDate, DATE_FORMAT(shippedDate, "%d/%m/%Y") AS orderDate'),
                        knex.db.raw('DATE_FORMAT(orders.orderDate + INTERVAL ow.creditPeriod DAY, "%d/%m/%Y") as alterDueDate'),
                        knex.db.raw('SUM(totalAmount + totalGST - referralDiscount - orders.cashDiscountAmount - orders.additionalDiscountAmount - orders.specialDiscountAmount) as totalAmount'),
                        'paidAmount', 'balanceAmount')
                    .innerJoin('paymentTypes', 'orders.paymentId', '=', 'paymentTypes.id')
                    .leftJoin('users as au', 'orders.cartUserId', '=', 'au.id')
                    .leftJoin('users as ow', 'orders.ownerId', '=', 'ow.id')
                    .where('au.primarySalesRepId', data.salesRepId)
                    // .andWhere('orders.orderBy', '=', 'USER')
                    // .where('orders.balanceAmount', '=', '0')
                    .whereNot('orders.orderStatus', 'PENDING')
                    // .orderBy('orders.id', 'desc')
                    .groupBy('orders.id')
                    .modify(function (queryBuilder) {
                        if (parseInt(data.sortBy) < 3 && value != 'PAYMENTCOLLECT') {
                            queryBuilder.orderBy('orders.id', orderBy)
                        } else if (parseInt(data.sortBy) == 3) {
                            queryBuilder.orderBy('orders.balanceAmount', 'desc')
                        } else if (parseInt(data.sortBy) == 4) {
                            queryBuilder.orderBy('orders.balanceAmount', 'asc')
                        }
                        if (value === 'PAYMENTCOLLECT') {
                            queryBuilder.where('orders.balanceAmount', '=', 0)
                            queryBuilder.orderBy('orders.id', 'asc')
                        } else {
                            queryBuilder.whereIn('orders.orderStatus', ['SHIPPED', 'DELIVERED', 'PAID'])
                            queryBuilder.where('orders.balanceAmount', '!=', 0)
                        }
                    });
                //  console.log("query***",k.toString())
                k.then((result) => {
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

        this.cronCollectedPaymentListModel = function (data, value) {
            var response = {}
            return new Promise(function (resolve) {

                var k = knex.db('orders')
                    .select('orders.id', 'bookingId', 'orders.orderStatus',
                        'orders.ownerId', 'paymentTypes.type', 'au.shopName', 'au.mobileNumber', 'au.deviceToken',
                        'ow.creditPeriod',
                        //  knex.db.raw('DATE_FORMAT(orderDate + INTERVAL ow.creditPeriod DAY, "%d/%m/%Y") as dueDate, DATE_FORMAT(orderDate, "%d/%m/%Y") AS orderDate'),
                        knex.db.raw('DATE_FORMAT(shippedDate + INTERVAL ow.creditPeriod DAY, "%d/%m/%Y") as dueDate, DATE_FORMAT(shippedDate, "%d/%m/%Y") AS shippedDate'),
                        knex.db.raw('DATE_FORMAT(orders.orderDate + INTERVAL ow.creditPeriod DAY, "%d/%m/%Y") as alterDueDate'),
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


        this.viewSalesRepSecondaryShopsCollectedPaymentListDao = function (data, value) {
            var response = {}
            return new Promise(function (resolve) {
                var type = data.type
                var orderBy;
                if (data.sortBy == 1) {
                    orderBy = 'desc'
                } else if (data.sortBy == 2) {
                    orderBy = 'asc'
                }

                var k = knex.db('orders')
                    .select('orders.id', 'bookingId', 'orders.orderStatus', 'orders.orderBy',
                        'orders.ownerId', 'paymentTypes.type', 'au.shopName',
                        'ow.creditPeriod', knex.db.raw('DATE_FORMAT(shippedDate + INTERVAL ow.creditPeriod DAY, "%d/%m/%Y") as dueDate, DATE_FORMAT(shippedDate, "%d/%m/%Y") AS orderDate'),
                        knex.db.raw('DATE_FORMAT(orders.orderDate + INTERVAL ow.creditPeriod DAY, "%d/%m/%Y") as alterDueDate'),
                        knex.db.raw('SUM(totalAmount + totalGST - referralDiscount - orders.cashDiscountAmount - orders.additionalDiscountAmount - orders.specialDiscountAmount) as totalAmount'), 'paidAmount', 'balanceAmount')
                    .innerJoin('paymentTypes', 'orders.paymentId', '=', 'paymentTypes.id')
                    .innerJoin('users as user', 'orders.cartUserId', '=', 'user.id')
                    .leftJoin('users as au', 'orders.cartUserId', '=', 'au.id')
                    .leftJoin('users as ow', 'orders.ownerId', '=', 'ow.id')
                    // .where('orders.orderPrimarySalesRepId', data.salesRepId)
                    .whereRaw('JSON_CONTAINS(user.secondarySalesRepIds,?)', [JSON.stringify(data.salesRepId)])
                    // .andWhere('orders.orderBy', '=', 'USER')
                    // .where('orders.balanceAmount', '=', '0')
                    .whereNot('orders.orderStatus', 'PENDING')
                    // .orderBy('orders.id', 'desc')
                    .groupBy('orders.id')
                    .modify(function (queryBuilder) {
                        if (parseInt(data.sortBy) < 3) {
                            queryBuilder.orderBy('orders.id', orderBy)
                        } else if (parseInt(data.sortBy) == 3) {
                            queryBuilder.orderBy('orders.balanceAmount', 'desc')
                        } else if (parseInt(data.sortBy) == 4) {
                            queryBuilder.orderBy('orders.balanceAmount', 'asc')
                        }
                        if (value === 'PAYMENTCOLLECT') {
                            queryBuilder.where('orders.balanceAmount', '=', 0)
                        } else {
                            queryBuilder.whereIn('orders.orderStatus', ['SHIPPED', 'DELIVERED', 'PAID'])
                            queryBuilder.where('orders.balanceAmount', '!=', 0)
                        }
                    });
                //  console.log("query***",k.toString())
                k.then((result) => {
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


        this.viewSalesRepTertiaryShopsCollectedPaymentListDao = function (data, value) {
            var response = {}
            return new Promise(function (resolve) {
                var type = data.type
                var orderBy;
                if (data.sortBy == 1) {
                    orderBy = 'desc'
                } else if (data.sortBy == 2) {
                    orderBy = 'asc'
                }

                var k = knex.db('orders')
                    .select('orders.id', 'bookingId', 'orders.orderStatus', 'orders.orderBy',
                        'orders.ownerId', 'paymentTypes.type', 'au.shopName',
                        'ow.creditPeriod', knex.db.raw('DATE_FORMAT(shippedDate + INTERVAL ow.creditPeriod DAY, "%d/%m/%Y") as dueDate, DATE_FORMAT(shippedDate, "%d/%m/%Y") AS orderDate'),
                        knex.db.raw('DATE_FORMAT(orders.orderDate + INTERVAL ow.creditPeriod DAY, "%d/%m/%Y") as alterDueDate'),
                        knex.db.raw('SUM(totalAmount + totalGST - referralDiscount - orders.cashDiscountAmount - orders.additionalDiscountAmount - orders.specialDiscountAmount) as totalAmount'), 'paidAmount', 'balanceAmount')
                    .innerJoin('paymentTypes', 'orders.paymentId', '=', 'paymentTypes.id')
                    .innerJoin('users as user', 'orders.cartUserId', '=', 'user.id')
                    .leftJoin('users as au', 'orders.cartUserId', '=', 'au.id')
                    .leftJoin('users as ow', 'orders.ownerId', '=', 'ow.id')
                    // .where('orders.orderPrimarySalesRepId', data.salesRepId)
                    .whereRaw('JSON_CONTAINS(user.tertiarySalesRepIds,?)', [JSON.stringify(data.salesRepId)])
                    // .andWhere('orders.orderBy', '=', 'USER')
                    // .where('orders.balanceAmount', '=', '0')
                    .whereNot('orders.orderStatus', 'PENDING')
                    // .orderBy('orders.id', 'desc')
                    .groupBy('orders.id')
                    .modify(function (queryBuilder) {
                        if (parseInt(data.sortBy) < 3) {
                            queryBuilder.orderBy('orders.id', orderBy)
                        } else if (parseInt(data.sortBy) == 3) {
                            queryBuilder.orderBy('orders.balanceAmount', 'desc')
                        } else if (parseInt(data.sortBy) == 4) {
                            queryBuilder.orderBy('orders.balanceAmount', 'asc')
                        }
                        if (value === 'PAYMENTCOLLECT') {
                            queryBuilder.where('orders.balanceAmount', '=', 0)
                        } else {
                            queryBuilder.whereIn('orders.orderStatus', ['SHIPPED', 'DELIVERED', 'PAID'])
                            queryBuilder.where('orders.balanceAmount', '!=', 0)
                        }
                    });
                //  console.log("query***",k.toString())
                k.then((result) => {
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








        this.totalComplaintCountModel = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                let salesrepId = data.salesRepId
                console.log("salesrepId", salesrepId)
                knex.db('complaints')
                    .select('complaints.id', 'orderId', 'bookingId', 
                         'shopName', 
                        'complaintStatus', knex.db.raw('DATE_FORMAT(complaintDate, "%d/%m/%Y") AS complaintDate'))
                    .innerJoin('orders', 'complaints.orderId', '=', 'orders.id')
                    // .innerJoin('products', 'complaints.productId', '=', 'products.id')
                    .innerJoin('users', 'complaints.complaintBy', '=', 'users.id')
                    // .innerJoin('complaintTypes', 'complaints.issueType', '=', 'complaintTypes.id')
                    // .where('users.salesRepIds', data.auth.id)
                    // .where('users.primarySalesRepId', data.auth.id)
                    .whereIn('complaints.complaintStatus', ['Processing'])
                    .where(function () {
                        this.where('users.primarySalesRepId', salesrepId)
                            .orWhereRaw('JSON_CONTAINS(users.secondarySalesRepIds, ?)', [JSON.stringify(salesrepId)])
                            .orWhereRaw('JSON_CONTAINS(users.tertiarySalesRepIds, ?)', [JSON.stringify(salesrepId)]);
                    })
                    .orderBy('id', 'desc')
                    .then((result) => {
                        response.error = false
                        response.data = result
                    })
                    .catch((error) => {
                        console.log("error line 834", error)
                        response.error = true
                    })
                    .finally(() => {
                        resolve(response)
                    })
            })
        }



        // this.totalComplaintCountModel = (data) => {
        //     var response = {}
        //     return new Promise(function (resolve) {
        //         knex.db('complaints')
        //             .select()
        //             .whereIn('complaints.orderId', data)
        //             .where('complaints.complaintStatus', '=', 'Processing')
        //             .andWhere('complaints.complaintStatus', '!=', 'Resolved')
        //             // .modify(function (queryBuilder) {
        //             //     queryBuilder.whereIn('orders.orderStatus', ['PACKAGED', 'SHIPPED', 'DELIVERED', 'PAID'])
        //             //     queryBuilder.where('orders.balanceAmount', '!=', 0)
        //             // })
        //             .then((result) => {
        //                 // console.log("totalComplaintCountModel**", result, data)
        //                 response.error = false
        //                 response.data = result
        //             })
        //             .catch((error) => {
        //                 response.error = true
        //             })
        //             .finally(() => {
        //                 resolve(response)
        //             })
        //     })
        // }

        this.shopOutStandingAmountModel = function (id) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('orders')
                    // .select(knex.db.raw('SUM(balanceAmount) as amount'))
                    .select(knex.db.raw('COALESCE(SUM(balanceAmount),0) AS amount'))
                    .where('cartUserId', id)
                    .whereIn('orders.orderStatus', ['PACKAGED', 'SHIPPED', 'DELIVERED', 'PAID'])
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



        this.getPrimarySalesRepShopsListForViewOneSalesRepDao = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                // console.log("data",data)
                //   let salesrepId = JSON.stringify(data.salesRepId)
                let salesrepId = data.auth.id

                knex.db('users')
                    .select('users.id', 'name', 'mobileNumber', 'userType', 'users.ownerId', 'shopName', 'city',
                        'users.customerID',
                        'shopAddress', knex.db.raw('SUM(paidAmount) as paidAmount'))
                    .leftJoin('orders', 'users.id', '=', 'orders.cartUserId')
                    .where({
                        'users.primarySalesRepId': salesrepId,
                        'users.activeStatus': 1
                    })
                    // .whereRaw('JSON_CONTAINS(users.salesRepIds,?)', salesrepId)
                    .groupBy('users.id')
                    .orderBy('users.id', 'desc')

                    .then((result) => {
                        // console.log("getSalesRepShopsListDao", result)
                        response.error = false
                        response.data = result
                    })
                    .catch((error) => {
                        console.log("error line 3268", error)
                        response.error = true
                    })
                    .finally(() => {
                        resolve(response)
                    })
            })
        }




        //write a function like getPrimarySalesRepShopsListForViewOneSalesRepDao but secondarySalesRepIds use JSON_CONTAINS in query match salesrepId

        this.getSecondarySalesRepShopsListForViewOneSalesRepDao = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                // console.log("data",data)
                //   let salesrepId = JSON.stringify(data.salesRepId)
                let salesrepId = data.auth.id

                knex.db('users')
                    .select('users.id', 'name', 'mobileNumber', 'userType', 'users.ownerId', 'shopName', 'city',
                        'users.customerID',
                        'shopAddress', knex.db.raw('SUM(paidAmount) as paidAmount'))
                    .leftJoin('orders', 'users.id', '=', 'orders.cartUserId')
                    .where({
                        // 'users.primarySalesRepId': salesrepId,
                        'users.activeStatus': 1
                    })
                    // .whereRaw('JSON_CONTAINS(users.secondarySalesRepIds,?)', salesrepId)
                    // .whereRaw('JSON_CONTAINS(IF(users.secondarySalesRepIds = "", \'[]\', users.secondarySalesRepIds), ?)', [salesrepId])
                    .whereRaw('JSON_CONTAINS(IF(users.secondarySalesRepIds = "", \'[]\', CAST(users.secondarySalesRepIds AS JSON)), CAST(? AS JSON))', [JSON.stringify(salesrepId)])

                    .groupBy('users.id')
                    .orderBy('users.id', 'desc')

                    .then((result) => {
                        // console.log("getSalesRepShopsListDao", result)
                        response.error = false
                        response.data = result
                    })
                    .catch((error) => {
                        console.log("error line 3268", error)
                        response.error = true
                    })
                    .finally(() => {
                        resolve(response)
                    })
            })
        }




        //write a function like getTertiarySalesRepShopsListForViewOneSalesRepDao but tertiarySalesRepIds use JSON_CONTAINS in query match salesrepId
        this.getTertiarySalesRepShopsListForViewOneSalesRepDao = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                // console.log("data",data)
                //   let salesrepId = JSON.stringify(data.salesRepId)
                let salesrepId = data.auth.id
                //write a if else condion below query if salesrepId is not null then use JSON_CONTAINS in query match salesrepId
                //if salesrepId is null then use whereRaw('users.tertiarySalesRepIds IS NOT NULL') so change below query
                knex.db('users')
                    .select('users.id', 'name', 'mobileNumber', 'userType', 'users.ownerId', 'shopName', 'city', 'users.customerID',
                        'shopAddress', knex.db.raw('SUM(paidAmount) as paidAmount'))
                    .leftJoin('orders', 'users.id', '=', 'orders.cartUserId')
                    .where({
                        // 'users.primarySalesRepId': salesrepId,
                        'users.activeStatus': 1
                    })
                    // .whereRaw('JSON_CONTAINS(users.tertiarySalesRepIds,?)', salesrepId)
                    // .whereRaw('JSON_CONTAINS(IFNULL(users.tertiarySalesRepIds, \'NULL\'), ?)', [salesrepId])
                    // .whereRaw('JSON_CONTAINS(IF(users.tertiarySalesRepIds = "", \'[]\', users.tertiarySalesRepIds), ?)', [salesrepId])
                    .whereRaw('JSON_CONTAINS(IF(users.tertiarySalesRepIds = "", \'[]\', CAST(users.tertiarySalesRepIds AS JSON)), CAST(? AS JSON))', [JSON.stringify(salesrepId)])

                    .groupBy('users.id')
                    .orderBy('users.id', 'desc')

                    .then((result) => {
                        // console.log("getSalesRepShopsListDao", result)
                        response.error = false
                        response.data = result
                    })
                    .catch((error) => {
                        console.log("error line 3268", error)
                        response.error = true
                    })
                    .finally(() => {
                        resolve(response)
                    })
            })
        }










        this.getUserOrderItemsList = function (orderId) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('orderItems')
                    .select('orderItems.id', 'productId', 'orderId', 'productName', 'isDeleted',
                        'orderItems.freeQuantity', 'products.specialDiscount', 'products.specialDiscountValue',
                        'productImage', 'productCode', 'productGST', 'orderItems.quantity',
                        'orderItems.price as MRP', 'orderItems.orderCost', 'supplyPrice',
                        'GSTAmount', 'productDiscount', 'productOfferX', 'productOfferY')
                    // .innerJoin('products', 'orderItems.productId', '=', 'products.id')
                    .innerJoin('products', 'orderItems.orderProductId', '=', 'products.productCode')
                    .where('supplyPrice', '!=', 0)
                    .andWhere('orderId', orderId)
                    .andWhere('isDeleted', 0)
                    .then((result) => {
                        // console.log("result",result)
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

        this.cronCollectedPaymentListModel = function (data, value) {
            var response = {}
            return new Promise(function (resolve) {

                var k = knex.db('orders')
                    .select('orders.id', 'bookingId', 'orders.orderStatus',
                        'orders.ownerId', 'paymentTypes.type', 'au.shopName', 'au.mobileNumber', 'au.deviceToken',
                        'ow.creditPeriod', knex.db.raw('DATE_FORMAT(orderDate + INTERVAL ow.creditPeriod DAY, "%d/%m/%Y") as dueDate, DATE_FORMAT(orderDate, "%d/%m/%Y") AS orderDate'),
                        knex.db.raw('SUM(totalAmount + totalGST - referralDiscount - orders.cashDiscountAmount - orders.additionalDiscountAmount - orders.specialDiscountAmount) as totalAmount'), 'paidAmount', 'balanceAmount')
                    .innerJoin('paymentTypes', 'orders.paymentId', '=', 'paymentTypes.id')
                    .leftJoin('users as au', 'orders.cartUserId', '=', 'au.id')
                    .leftJoin('users as ow', 'orders.ownerId', '=', 'ow.id')
                    // .where('orders.salesRepID', data.auth.id)
                    // .where('orders.balanceAmount', '=', '0')
                    .groupBy('orders.id')
                    .modify(function (queryBuilder) {
                        queryBuilder.whereIn('orders.orderStatus', ['PACKAGED', 'SHIPPED', 'DELIVERED', 'PAID'])
                        queryBuilder.where('orders.balanceAmount', '!=', 0)
                    });
                //  console.log("query***",k.toString())
                k.then((result) => {
                    response.error = false
                    response.data = result
                })
                    .catch((error) => {
                        console.log("errror in catalogSortingModel 2915", error)
                        response.error = true
                    })
                    .finally(() => {
                        resolve(response)
                    })
            })
        }


        this.checkOrderIdModel = function (orderId) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('orders')
                    .select('orders.id', 'bookingId', 'orders.ownerId', 'managerId', 'users.bonusPoint',
                        'cartUserId', 'orders.salesRepID', 'users.name', 'users.mobileNumber', 'users.shopName',
                        'orders.outletId',
                        'shopAddress', 'pincode', 'city', 'state', 'orderStatus',
                        'invoiceNumber', knex.db.raw('DATE_FORMAT(orderDate, "%d-%m-%Y") AS orderDate'),
                        'totalAmount', 'totalQuantity', 'offerOty', 'totalAmount', 'totalGST', 'referralDiscount',
                        'paymentId', 'outlet.outletName',
                        'paymentTypes.type as paymentTypes',
                        knex.db.raw('SUM(totalAmount + totalGST - referralDiscount - orders.cashDiscountAmount - orders.additionalDiscountAmount - orders.specialDiscountAmount) as finalTotal'),
                        'balanceAmount', 'balanceDue',
                        '	ordbarCode', 'ordPVCCovers', 'ordgoodsInBulk', 'ordMRPOnLabels', 'users.cashOnCarry', 'orderInstruction',
                        'orders.paymentStatus', 'orders.onlinePaid')
                    .innerJoin('users', 'orders.ownerId', '=', 'users.id')
                    .innerJoin('paymentTypes', 'orders.paymentId', '=', 'paymentTypes.id')
                    .innerJoin('outlet', 'outlet.id', '=', 'users.outletId')
                    .where('orders.id', orderId)
                    .then((result) => {
                        response.error = false
                        response.data = result
                        console.log("result", result)
                    })
                    .catch((error) => {
                        response.error = true
                    })
                    .finally(() => {
                        resolve(response)
                    })
            })
        }

        this.updateOrderPayModel = function (amount, orderId, paid) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db.raw('Update orders set paidAmount = paidAmount + ?, orderStatus=?, balanceAmount=?, balanceDue=?  where id=?', [paid, 'PAID', amount, amount, orderId])
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
        this.getOrderIdsModel = (data) => {
            var response = {}
            let salesrepId = JSON.stringify(data.auth.id)
            return new Promise(function (resolve) {
                knex.db('orders')
                    .select('orders.id', 'orders.bookingId')
                    .innerJoin('users', 'users.id', '=', 'orders.cartUserId')
                    // .whereRaw('JSON_CONTAINS(users.salesRepIds,?)', salesrepId)
                    .where(function () {
                        this.where('users.primarySalesRepId', salesrepId)
                            .orWhereRaw('JSON_CONTAINS(users.secondarySalesRepIds, ?)', [JSON.stringify(salesrepId)])
                            .orWhereRaw('JSON_CONTAINS(users.tertiarySalesRepIds, ?)', [JSON.stringify(salesrepId)]);
                    })
                    .whereNot('orders.orderStatus', 'PENDING')
                    // .where('orders.salesRepID', data.auth.id)
                    // .where('orders.ownerId',data.auth.ownerId)
                    .then((result) => {
                        // console.log("ids**", result, data)
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
        this.totalCollectedPaymentCountModel = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('orders')
                    .select('id', 'bookingId')
                    .where('orders.salesRepID', data.auth.id)
                    // .where('orders.balanceAmount', '=', 0)
                    .modify(function (queryBuilder) {
                        queryBuilder.whereIn('orders.orderStatus', ['PACKAGED', 'SHIPPED', 'DELIVERED', 'PAID'])
                        queryBuilder.where('orders.balanceAmount', '!=', 0)
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

        this.CollectedPaymentListCountModel = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                var k = knex.db('orders')
                    .select('orders.id', 'bookingId', 'orders.orderStatus', 'orders.ownerId',
                        'paymentTypes.type', 'au.shopName', 'ow.creditPeriod',
                        knex.db.raw('DATE_FORMAT(orderDate + INTERVAL ow.creditPeriod DAY, "%d/%m/%Y") as dueDate, DATE_FORMAT(orderDate, "%d/%m/%Y") AS orderDate'),
                        knex.db.raw('SUM(totalAmount + totalGST - referralDiscount) as totalAmount'), 'paidAmount', 'balanceAmount')
                    .innerJoin('paymentTypes', 'orders.paymentId', '=', 'paymentTypes.id')
                    .leftJoin('users as au', 'orders.cartUserId', '=', 'au.id')
                    .leftJoin('users as ow', 'orders.ownerId', '=', 'ow.id')
                    .where('orders.salesRepID', data.auth.id)
                    .whereNot('orders.orderStatus', 'PENDING')
                    // .where('orders.balanceAmount', '=', '0')
                    .groupBy('orders.id')
                    .modify(function (queryBuilder) {
                        queryBuilder.whereIn('orders.orderStatus', ['PACKAGED', 'SHIPPED', 'DELIVERED', 'PAID'])
                        queryBuilder.where('orders.balanceAmount', '!=', 0)
                    });
                //  console.log("query***",k.toString())
                k.then((result) => {
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


        this.getSalesRepUsersListModel = function (data) {
            var response = {}
            let salesrepId = JSON.stringify(data.auth.id)
            console.log("salesrepId",salesrepId)
            // let salesrepId = data.auth.id
            return new Promise(function (resolve) {
                knex.db('users')
                    // .select('users.id', 'name', 'mobileNumber', 'shopName', 'shopAddress', knex.db.raw('SUM(paidAmount) as paidAmount'))
                    .pluck('id')
                    .where({
                        // 'users.salesRepId': id,
                        'users.activeStatus': 1,
                        'users.primarySalesRepId': salesrepId,

                    })
                    // .whereRaw('JSON_CONTAINS(users.salesRepIds,?)', salesrepId)
                    .orWhereRaw('JSON_CONTAINS(users.secondarySalesRepIds, ?)', salesrepId)
                    .orWhereRaw('JSON_CONTAINS(users.tertiarySalesRepIds, ?)', salesrepId)
                    // .orderBy('paidAmount', 'desc')
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






        this.totalAllOrdersModel = function (data, value) {
            var response = {}
            console.log("data.usersList", data.usersList)

            return new Promise(function (resolve) {
                knex.db('orders')
                    .select('orders.id', 'bookingId', 'name', 'orders.outletId', 'outlet.outletName',
                        'mobileNumber', 'shopName', 'shopAddress',
                        knex.db.raw('DATE_FORMAT(orderDate, "%d/%m/%Y") AS orderDate'),
                        knex.db.raw('SUM(totalAmount + totalGST - referralDiscount - orders.cashDiscountAmount - orders.additionalDiscountAmount - orders.specialDiscountAmount) as totalAmount'))
                    .innerJoin('users', 'orders.cartUserId', '=', 'users.id')
                    .innerJoin('outlet', 'orders.outletId', '=', 'outlet.id')
                    .where({
                        // 'orders.salesRepID': data.auth.id,
                        'orders.orderStatus': data.status
                    })
                    .whereRaw('YEAR(orderDate) = ?', [data.year])
                    .whereRaw('Month(orderDate) = ?', [data.month])
                    .whereNot('orders.orderStatus', 'PENDING')
                    .groupBy('orders.id')
                    .modify(function (queryBuilder) {
                        if (value == 'USER') {
                            queryBuilder.where('orderBy', value)
                            queryBuilder.whereIn('cartUserId', data.usersList)
                        } else {
                            queryBuilder.where('orderBy', value)
                            queryBuilder.where('orders.salesRepID', data.auth.id)
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

        this.listOrderStatusModel = function (data, value) {
            var response = {}
            return new Promise(function (resolve) {
                var pageNumber = data.pageNumber
                if (pageNumber == '0') {
                    pageNumber = '0'
                } else {
                    pageNumber = pageNumber - 1
                }
                var pageOffset = parseInt(pageNumber * data.pageCount)
                knex.db('orders')
                    .select('orders.id', 'bookingId', 'orders.outletId', 'outlet.outletName', 'orderStatus', 'name',
                        'mobileNumber', 'shopName', 'shopAddress',
                        knex.db.raw('DATE_FORMAT(orderDate, "%d/%m/%Y") AS orderDate'),
                        knex.db.raw('SUM(totalAmount + totalGST - referralDiscount - orders.cashDiscountAmount - orders.additionalDiscountAmount - orders.specialDiscountAmount) as totalAmount'), 'totalQuantity')
                    .innerJoin('users', 'orders.cartUserId', '=', 'users.id')
                    .innerJoin('outlet', 'orders.outletId', '=', 'outlet.id')
                    .where({
                        // 'orders.salesRepID': data.auth.id,
                        'orders.orderStatus': data.status
                    })
                    .whereRaw('YEAR(orderDate) = ?', [data.year])
                    .whereRaw('Month(orderDate) = ?', [data.month])
                    .groupBy('orders.id')
                    // .offset(pageOffset).limit(data.pageCount)
                    .orderBy('orders.id', 'desc')
                    .modify(function (queryBuilder) {
                        if (value == 'USER') {
                            queryBuilder.where('orderBy', value)
                            queryBuilder.whereIn('cartUserId', data.usersList)
                        } else {
                            queryBuilder.where('orderBy', value)
                            queryBuilder.where('orders.salesRepID', data.auth.id)
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

        this.shopGraphReportModel = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                // var orderStatus = ['PACKAGED', 'SHIPPED', 'DELIVERED', 'PAID']
                // var status = orderStatus.join(",")
                knex.db.raw('SELECT COUNT(*) as orders, COALESCE(SUM(totalAmount + totalGST - referralDiscount - additionalDiscountAmount - specialDiscountAmount),0) AS totalAmount, COALESCE(SUM(orders.paidAmount),0) AS paidAmount FROM `orders` WHERE  MONTH(packageDate) = ? AND YEAR(packageDate) = ? AND ownerId=?', [data.month, data.year, data.ownerId])
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

        this.noOfPaymentModel = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db.raw('SELECT COUNT(*) as payment FROM `orderPaymentDetails` INNER JOIN orders ON orderPaymentDetails.orderId = orders.id  WHERE   ownerId =? AND MONTH(orderPaymentDetails.paidDate) = ? AND YEAR(orderPaymentDetails.paidDate) = ?', [data.ownerId, data.month, data.year])
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

        this.saveAmountCollectedModel = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('salesRepPayment')
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



        this.salesRepDepotListModel1 = function (request, data) {
            var response = {}
            var params = request.body
            // console.log( "params.auth.userDepotId",params.auth.userDepotId)
            return new Promise(function (resolve, reject) {
                var transac = knex.db.transaction(function (trx) {
                    knex.db('outlet')
                        .select('id', 'outletName', 'address', 'subOutletId', 'verificationKey', 'activeStatus', 'createdAt', 'updatedAt')
                        // .select('*')
                        .where('activeStatus', 1)
                        .andWhere('id', data.userDepotId)
                        .transacting(trx)
                        .then((result) => {
                            var depot = result[0]
                            console.log("depot", depot)
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
                    // console.log("resp",resp)

                })
                    .catch((error) => {
                        console.log(error)
                        response.error = true
                    })
                    .finally(() => {
                        // knex.db.destroy();
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



        this.salesRepupdateUserDepotModel1 = function (request, data) {
            var response = {}
            var params = request.body
            console.log("params", params.userCatalogId)
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
                                    // 'cartType': 'USER'
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

        this.setRemindersListModel = function (request) {
            var params = request.body
            var response = {}
            var date = new Date()
            return new Promise(function (resolve) {
                knex.db('reminders')
                    .select('id', 'salesRepId',
                        //  knex.db.raw('DATE_FORMAT(date, "%Y-%m-%d %H:%i:%S") as date'),
                        'date',
                        'title', 'description', 'activeStatus')
                    // .select('*')
                    .where('activeStatus', 1)
                    .andWhere('salesRepId', params.auth.id)
                    .orderBy('date', 'asc')
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



        this.getSalesRepTaskList = function (data) {
            var response = {}
            var params = data.body

            return new Promise(function (resolve) {
                // console.log("data")


                knex.db('salesRepActivityMessages')
                    .select('salesRepActivityMessages.id', 'salesRepActivityMessages.customerID', 'salesRepActivityMessages.shopId',
                        'salesRepActivityMessages.visitDate', 'salesRepActivityMessages.message', 'salesRepActivityMessages.task',
                        'salesRepActivityMessages.isCompleted', 'salesRepActivityMessages.isCompletedBy', 'users.shopName',
                        'salesRepActivityMessages.dueDate', 'salesRepActivityMessages.completedDate'
                    )
                    .innerJoin('users', 'salesRepActivityMessages.customerID', '=', 'users.customerID')
                    .whereIn('salesRepActivityMessages.customerID', params.userList)
                    .whereRaw('Month(salesRepActivityMessages.visitDate) = ?', [knex.db.raw('MONTH(now())')])
                    .where('salesRepActivityMessages.task', '=', 1)
                    .andWhere('salesRepActivityMessages.isCompleted', '=', 0)
                    .orderBy('salesRepActivityMessages.dueDate', 'asc')
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

















        this.setOneReminderModel = function (request) {
            var params = request.body
            var response = {}
            return new Promise(function (resolve) {
                knex.db('reminders')
                    .insert(params.data)
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




        this.getOneShopSalesRepListModel = function (request, data) {
            var response = {}
            var params = request.body
            console.log("params", params.userCatalogId)
            return new Promise(function (resolve, reject) {
                var transac = knex.db.transaction(function (trx) {
                    knex.db('users')
                        .select('id', 'salesRepIds')
                        .where('activeStatus', 1)
                        .andWhere('users.id', params.user_id)
                        .transacting(trx)
                        .then((result) => {
                            var user = result
                            var salesRepList = knex.db('salesRep')
                                .select('id', 'repID', 'name', 'mobile', 'email', 'activeStatus')
                                .whereIn('id', JSON.parse(result[0].salesRepIds))
                                .transacting(trx)
                            return Promise.all([user, salesRepList])
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


        this.salesRepClearAllCartProductsModel = function (request) {
            var response = {}
            var params = request.body
      
            return new Promise(function (resolve, reject) {
              var transac = knex.db.transaction(function (trx) {
                var cartItems = knex.db('cartItems')
                  .where({
                    'salesRepID': params.salesRepId,
                    'cartType': 'SALESREP'
                  }).del()
                  .transacting(trx)
                return Promise.all([cartItems])
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


          this.removeInstructions = function (id) {
            var response = {}
            return new Promise(function (resolve, reject) {
              knex.db('ordersInstructions')
                .where('salesRepID', id)
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



    }
}








export default SalesRepShopOwnerModel;