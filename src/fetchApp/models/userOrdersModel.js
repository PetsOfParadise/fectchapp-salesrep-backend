'use strict';

import knex from './../../../config/db.config'

class UserOrdersModel {
    constructor() {

        this.getMyorderList = function (id) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('orders')
                    .select('orders.id', 'bookingId', 'cartUserId', 'orders.cashDiscountAmount', 'orderItemsPdf',
                        'orders.ownerId', 'orders.salesRepID', 'users.outletId', 'users.paymentTypeIds',
                        'orders.outletId as OrderOutletId', 'outlet.outletName as OrderOutletName', 'orderStatus',
                        'invoiceUpdate', 'invoiceNumber', knex.db.raw('DATE_FORMAT(invoiceDate, "%d/%m/%Y") AS invoiceDate'),
                        knex.db.raw('DATE_FORMAT(orderDate, "%d/%m/%Y") AS orderDate'), 'isReceiptUpdate', 'receiptFile',
                        'downloadBill', 'paymentTypes.type as paymentTypes', 'balanceDue', 'referralDiscount', 'balanceAmount',
                        knex.db.raw('SUM(totalAmount + totalGST - referralDiscount - orders.cashDiscountAmount - orders.additionalDiscountAmount - orders.specialDiscountAmount) as totalAmount'))
                    .innerJoin('paymentTypes', 'orders.paymentId', '=', 'paymentTypes.id')
                    .innerJoin('users', 'orders.cartUserId', '=', 'users.id')
                    .innerJoin('outlet', 'outlet.id', '=', 'orders.outletId')
                    .whereNot('orderStatus', 'PENDING')
                    .andWhere(id)
                    .groupBy('orders.id')
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

        this.getUserOrderItemsList = function (orderId) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('orderItems')
                    .select('orderItems.id', 'productId', 'orderId', 'productName', 'isDeleted',
                        'orderItems.freeQuantity',
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


        this.getUserOrderItemsListForViewOrderModel = function (bookingId) {
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
                    .andWhere('orderItems.bookingOrderId', bookingId)
                    .andWhere('isDeleted', 0)
                    .then((result) => {
                        // console.log("result",result)
                        response.error = false
                        response.data = result
                    })
                    .catch((error) => {
                        console.log("err", error)
                        response.error = true
                    })
                    .finally(() => {
                        resolve(response)
                    })
            })
        }







        this.checkFreeQuantity = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('orderItems')
                    .where({ orderId: data.orderId, productId: data.productId })
                    .where('supplyPrice', '=', 0)
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

        this.checkFreeQuantityModel1 = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('orderItems')
                    .where({ orderId: data.orderId, productId: data.productId })
                    .where('supplyPrice', '=', 0)
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
        this.getMyordersModel = function (data, id) {
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
                    .select('orders.id', 'bookingId', 'orderStatus', 'invoiceUpdate',
                        'invoiceNumber', knex.db.raw('DATE_FORMAT(invoiceDate, "%d/%m/%Y") AS invoiceDate'),
                        knex.db.raw('DATE_FORMAT(orderDate, "%d/%m/%Y") AS orderDate'), 'isReceiptUpdate',
                        'orders.outletId as OrderOutletId', 'outlet.outletName as OrderOutletName',
                        'receiptFile', 'downloadBill', 'balanceDue', 'orders.cashDiscountAmount',
                        'referralDiscount', 'paymentTypes.type as paymentTypes',
                        knex.db.raw('SUM(totalAmount + totalGST - referralDiscount - orders.cashDiscountAmount - orders.additionalDiscountAmount - orders.specialDiscountAmount) as totalAmount'))
                    .innerJoin('paymentTypes', 'orders.paymentId', '=', 'paymentTypes.id')
                    .innerJoin('outlet', 'outlet.id', '=', 'orders.outletId')
                    .whereNot('orderStatus', 'PENDING')
                    .andWhere(id)
                    .groupBy('orders.id')
                    .offset(pageOffset).limit(data.pageCount)
                    .orderBy('orders.id', 'desc')
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

        this.saveComplaint = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('complaints')
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

        this.saveComplaint2 = function (data, complaintProducts) {
            var response = {}

            return new Promise(function (resolve, reject) {
                var transac = knex.db.transaction(function (trx) {
                    knex.db('complaints')
                        .insert(data)
                        .transacting(trx)
                        .then((result) => {
                            var complaints = result
                            var saveComplaintItems = knex.db('complaintsOrderItems')
                                .insert(complaintProducts)
                                .transacting(trx)
                            return Promise.all([complaints, saveComplaintItems])
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












        this.issueTypeModel = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('complaintTypes')
                    .select('id', 'complaintText')
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


        this.getAllComplaints = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('complaints')
                    .select('complaints.id', 'complaints.orderId', 'complaintBy', 'shopOwnerId',)
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

        this.complaintListModel = function (query, data) {
            var response = {}
            return new Promise(function (resolve) {
                var pageNumber = data.pageNumber
                if (pageNumber == '0') {
                    pageNumber = '0'
                } else {
                    pageNumber = pageNumber - 1
                }
                var pageOffset = parseInt(pageNumber * data.pageCount)
                knex.db('complaints')
                    .select('complaints.id', 'complaints.orderId', 'orders.bookingId', 'productId', 'productName', 'productImage', 'productCode', 'complaintBy', 'shopOwnerId', 'issueType', 'uploadImage', 'salesRepUploads', knex.db.raw('DATE_FORMAT(complaintDate, "%d/%m/%Y") AS complaintDate'), knex.db.raw('DAYNAME(complaintDate) AS day'), 'reason', 'complaintStatus', 'complaintText')
                    .innerJoin('complaintTypes', 'complaints.issueType', '=', 'complaintTypes.id')
                    .innerJoin('products', 'complaints.productId', '=', 'products.id')
                    .innerJoin('orders', 'complaints.orderId', '=', 'orders.id')
                    .where(query)
                    .offset(pageOffset).limit(data.pageCount)
                    .orderBy('complaints.id', 'desc')
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
        this.getAllOrdersComplaints = function (data) {
            var response = {}
            var limit = 10
            var page = data.page
            var offset = (page - 1) * limit
            console.log(data)
            return new Promise(function (resolve) {
                knex.db('complaints')
                    .select('complaints.id', 'complaints.orderId', 'orders.bookingId', 'productId', 'productName', 'productImage', 'productCode', 'complaintBy', 'shopOwnerId', 'issueType', 'uploadImage', 'salesRepUploads', knex.db.raw('DATE_FORMAT(complaintDate, "%d/%m/%Y") AS complaintDate'), knex.db.raw('DAYNAME(complaintDate) AS day'), 'reason', 'complaintStatus', 'complaintText')
                    .innerJoin('complaintTypes', 'complaints.issueType', '=', 'complaintTypes.id')
                    .innerJoin('products', 'complaints.productId', '=', 'products.id')
                    .innerJoin('orders', 'complaints.orderId', '=', 'orders.id')
                    .where({ 'complaintBy': data.complaintBy })
                    .orderBy('complaints.id', 'desc')
                    .limit(limit).offset(offset)
                    .then((result) => {
                        console.log(result)
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

        this.getAllOrdersComplaintsModel = function (data) {
            var response = {}
            var limit = 10
            var page = data.page
            var offset = (page - 1) * limit
            console.log(data)
            return new Promise(function (resolve) {
                knex.db('complaints')
                    .select('complaints.id', 'complaints.orderId', 'orders.bookingId', 'productId',
                        'productName', 'productImage', 'productCode', 'complaintBy', 'shopOwnerId',
                        'issueType', 'uploadImage', 'salesRepUploads',
                        knex.db.raw('DATE_FORMAT(complaintDate, "%d/%m/%Y") AS complaintDate'),
                        knex.db.raw('DAYNAME(complaintDate) AS day'), 'reason', 'complaintStatus', 'complaintText')
                    .innerJoin('complaintTypes', 'complaints.issueType', '=', 'complaintTypes.id')
                    .innerJoin('orders', 'complaints.orderId', '=', 'orders.id')
                    .where({ 'complaintBy': data.complaintBy })
                    .orderBy('complaints.id', 'desc')
                    .limit(limit).offset(offset)
                    .then((result) => {
                        console.log(result)
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







        this.getAllOrdersComplaintsCount = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('complaints')
                    .select('complaints.id', 'complaints.orderId', 'orders.bookingId', 'productId', 'productName', 'productImage', 'productCode', 'complaintBy', 'shopOwnerId', 'issueType', 'uploadImage', 'salesRepUploads', knex.db.raw('DATE_FORMAT(complaintDate, "%d/%m/%Y") AS complaintDate'), knex.db.raw('DAYNAME(complaintDate) AS day'), 'reason', 'complaintStatus', 'complaintText')
                    .innerJoin('complaintTypes', 'complaints.issueType', '=', 'complaintTypes.id')
                    .innerJoin('products', 'complaints.productId', '=', 'products.id')
                    .innerJoin('orders', 'complaints.orderId', '=', 'orders.id')
                    .where({ 'complaintBy': data.complaintBy })
                    .then((result) => {
                        console.log(result)
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

        this.checkUserComplaint = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('complaints')
                    .where({ orderId: data.orderId, shopOwnerId: data.ownerId })
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

        this.saveEnquiry = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('productEnquiry')
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

        this.updateDeliveryStatusModel = function (orderId) {
            var response = {}
            var localTime = new Date().toLocaleString(undefined, { timeZone: 'Asia/Kolkata' });
            var deliveredDate = new Date(localTime)
            return new Promise(function (resolve) {
                knex.db('orders')
                    .where('id', orderId)
                    .update({
                        orderStatus: 'DELIVERED',
                        deliveredDate: deliveredDate
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

        this.updateComplaintStatus = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('complaints')
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

        this.checkComplaintModel = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('complaints')
                    .where({ orderId: data.orderId, shopOwnerId: data.shopOwnerId, productId: data.productId })
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


        this.checkComplaintModel1 = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('complaints')
                    .where({ orderId: data.orderId, shopOwnerId: data.shopOwnerId })
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




        this.getPyamentByDateModel = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                if (data.type === 'LIST') {
                    var pageNumber = data.pageNumber
                    if (pageNumber == '0') {
                        pageNumber = '0'
                    } else {
                        pageNumber = pageNumber - 1
                    }
                    var pageOffset = parseInt(pageNumber * data.pageCount)
                }
                knex.db('payRequest')
                    .select('ownerId', knex.db.raw('DATE_FORMAT(createdAt, "%d/%m/%Y") AS paidDate'), knex.db.raw('DATE_FORMAT(createdAt, "%Y-%m-%d") AS date'))
                    .where('ownerId', data.auth.ownerId)
                    .andWhere('activeStatus', 1)
                    .groupBy('ownerId', 'paidDate', 'date')
                    .orderBy('date', 'desc')
                    .modify(function (queryBuilder) {
                        if (data.type === 'LIST') {
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

        this.getPayemntDetailsListModel = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('payRequest')
                    .select('payRequest.id', 'requestAmount', 'paymentTypes.type as paymentType', 'chequeNumber', 'chequeImage', 'requestStatus',
                        knex.db.raw('TIME_FORMAT(payRequest.createdAt, "%H:%i:%s") AS time'))
                    .innerJoin('paymentTypes', 'payRequest.payTypeID', '=', 'paymentTypes.id')
                    .where({ 'ownerId': data.ownerId })
                    .andWhere('payRequest.activeStatus', 1)
                    .whereRaw('DATE(payRequest.createdAt) = ?', [data.date])
                    .orderBy('payRequest.id', 'desc')
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

        this.checkUserPayentModel = function (id) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('payRequest')
                    .select('payRequest.id', 'payRequest.ownerId', 'paidBy', 'au.name as ownerName', 'ow.name as managerName', 'requestAmount', 'payTypeID', 'paymentTypes.type as paymentType', 'requestStatus')
                    .innerJoin('paymentTypes', 'payRequest.payTypeID', '=', 'paymentTypes.id')
                    .innerJoin('users as au', 'payRequest.ownerId', '=', 'au.id')
                    .innerJoin('users as ow', 'payRequest.paidBy', '=', 'ow.id')
                    .where({ 'payRequest.id': id })
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


        this.getWalletTransactionListModel = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                var k = knex.db('walletTransaction')
                    .select('id', 'userId', 'amount', 'orderId', 'type as paymentType', 'balanceAmount', 'createdAt', 'updatedAt')
                    .where({
                        'userId': data.userId,
                        'status': 'ACCEPTED'
                    })
                    .whereRaw('DATE(createdAt) BETWEEN ? AND ? ', [data.fromDate, data.toDate])
                    .orderBy('id', 'desc')
                // console.log("Query***",k.toString())
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





        this.findSaleRepModel = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('salesRep')
                    .select('id', 'repID', 'name', 'mobile', 'email', 'activeStatus')
                    .whereIn('id', JSON.parse(data))
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

        this.primarySaleRepModel = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('salesRep')
                    .select('id', 'repID', 'name', 'mobile', 'email', 'activeStatus')
                    .where('id', data)
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

        this.secondarySaleRepModel = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('salesRep')
                    .select('id', 'repID', 'name', 'mobile', 'email', 'activeStatus')
                    .whereIn('id', JSON.parse(data))
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

        this.checkOrderIdModel = function (orderId) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('orders')
                    .select('orders.id', 'bookingId', 'orders.ownerId', 'managerId',
                        'cartUserId', 'orders.salesRepID', 'users.name', 'users.mobileNumber', 'users.shopName',
                        'orders.outletId',
                        'users.primarySalesRepId', 'users.secondarySalesRepIds', 'users.tertiarySalesRepIds',
                        'shopAddress', 'pincode', 'city', 'state', 'orderStatus',
                        'invoiceNumber', knex.db.raw('DATE_FORMAT(orderDate, "%d-%m-%Y") AS orderDate'),
                        'totalAmount', 'totalQuantity', 'offerOty', 'totalAmount', 'totalGST', 'referralDiscount',
                        'paymentId', 'outlet.outletName',
                        'paymentTypes.type as paymentTypes', knex.db.raw('SUM(totalAmount + totalGST - referralDiscount - orders.cashDiscountAmount - orders.additionalDiscountAmount) as finalTotal'),
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
        this.checkOrderIdModel22 = function (orderId) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('orders')
                    .select('orders.id', 'bookingId', 'orders.ownerId', 'managerId',
                        'cartUserId', 'orders.salesRepID', 'users.name', 'users.mobileNumber', 'users.shopName',
                        'orders.outletId',
                        'users.primarySalesRepId', 'users.secondarySalesRepIds', 'users.tertiarySalesRepIds',
                        'shopAddress', 'pincode', 'city', 'state', 'orderStatus',
                        'invoiceNumber', knex.db.raw('DATE_FORMAT(orderDate, "%d-%m-%Y") AS orderDate'),
                        'totalAmount', 'totalQuantity', 'offerOty', 'totalAmount', 'totalGST', 'referralDiscount',
                        'paymentId', 'outlet.outletName',
                        'paymentTypes.type as paymentTypes', knex.db.raw('SUM(totalAmount + totalGST - referralDiscount - orders.cashDiscountAmount - orders.additionalDiscountAmount) as finalTotal'),
                        'balanceAmount', 'balanceDue',
                        '	ordbarCode', 'ordPVCCovers', 'ordgoodsInBulk', 'ordMRPOnLabels', 'users.cashOnCarry', 'orderInstruction',
                        'orders.paymentStatus', 'orders.onlinePaid')
                    .innerJoin('users', 'orders.ownerId', '=', 'users.id')
                    .innerJoin('paymentTypes', 'orders.paymentId', '=', 'paymentTypes.id')
                    .innerJoin('outlet', 'outlet.id', '=', 'users.outletId')
                    .where('orders.bookingId', orderId)
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


        this.savePaidAmountModel = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('payRequest')
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

        this.getComplaintsByIdModel = function (id) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('complaints')
                    .select('complaints.id', 'orderId', 'orders.ownerId', 'orders.cartUserId', 'orders.bookingId', 'orders.salesRepID', 'users.outletId', 'productId', 'productName', 'productCode', 'productImage', 'complaintBy', 'openDate', 'closeDate', 'reopenDate', 'shopOwnerId', 'name', 'shopName', 'shopAddress', 'mobileNumber', knex.db.raw('DATE_FORMAT(complaintDate, "%d/%m/%Y") AS complaintDate'), knex.db.raw('DAYNAME(complaintDate) AS day'), 'issueType', 'complaintText', 'uploadImage', 'reason', 'complaintStatus')
                    .innerJoin('products', 'complaints.productId', '=', 'products.id')
                    .innerJoin('orders', 'complaints.orderId', '=', 'orders.id')
                    .innerJoin('complaintTypes', 'complaints.issueType', '=', 'complaintTypes.id')
                    .innerJoin('users', 'complaints.shopOwnerId', '=', 'users.id')
                    .where('complaints.id', id)
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
                    .select('id', 'name', 'customerID', 'mobileNumber', 'email', 'userType', 'users.primarySalesRepId',
                        'users.secondarySalesRepIds', 'users.tertiarySalesRepIds',
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




        this.updateSearchProductCount = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('searchProductDetails')
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


        this.checkPreviousComplaint = function () {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('complaints')
                    .select('id', 'orderId', 'ticketId')
                    .orderBy('complaints.id', 'desc')
                    .limit(1)
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



        this.getOnesalesRepForNotification = function (id) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('salesRep')
                    .select('id', 'repID', 'name', 'email', 'mobile', 'userType', 'totalAmount',
                        'totalOrders', 'totalPayments', 'totalAmountCollected')
                    .where('id', id)
                    .andWhere('activeStatus', 1)
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

        this.checkProductModel = function (product) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('products')
                    .select('id', 'productName', 'productCode', 'productImage'
                    ).where('activeStatus', 1)
                    .andWhere('id', product)
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
                    .select('id', 'name', 'customerID', 'mobileNumber', 'email', 'userType', 'users.cashDiscount',
                        'ownerId', 'outletId', 'userDiscountId', 'isProfileCompleted', 'activeStatus', 'users.isNonGst',
                        'primarySalesRepId', 'secondarySalesRepIds', 'tertiarySalesRepIds',
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




        this.checkkSalesRepForNotification = function (salesRepIds) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('salesRep')
                    // .select('id', 'repID', 'name', 'email', 'mobile', 'userType', 'totalAmount',
                    //     'totalOrders', 'totalPayments', 'totalAmountCollected')
                    .pluck('id')
                    .whereIn('id', salesRepIds)
                    .andWhere('activeStatus', 1)
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
        
        this.getOnesalesRepForSms = function (id) {
            var response = {}
            return new Promise(function (resolve) {
              knex.db('salesRep')
                .select('id', 'repID', 'name', 'email', 'mobile', 'userType', 'totalAmount',
                  'totalOrders', 'totalPayments', 'totalAmountCollected')
                .where('id', id)
                .andWhere('activeStatus', 1)
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
      



        this.searchOrderProductDao = function (data) {
            var response = {}

            return new Promise(function (resolve, reject) {
                knex.db('orderItems')
                    .select('products.productCode',
                        'products.productName', 'orderItems.fullQuantity as quantity')
                    .innerJoin('products', 'orderItems.productId', '=', 'products.id')
                    .innerJoin('productCatalog', 'products.id', '=', 'productCatalog.productId')
                    .where('orderItems.bookingOrderId', data.bookingId)
                    .groupBy('orderItems.productId')
                    .modify(function (queryBuilder) {
                        if (data.search.length > 0) {
                            queryBuilder.where(knex.db.raw(`(products.productName like '%${data.search}%'
                            or products.productCode like '%${data.search}%'
                            )`))

                        }
                    })
                    .limit(5)
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


        this.viewOneComplaintModel = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('complaints')
                    .select('complaints.id', 'orderId', 'ticketId', 'complaintBy', 'shopOwnerId', 'complaintStatus', 'salesRep.name as salesRepName',
                        'users.shopName', 'users.shopAddress', 'orders.orderDate as orderDate', 'users.name as ShopOwnerName','complaints.complaintFile',
                        'complaints.salesRepId', 'complaintDate', 'reopenDate', 'openDate', 'closeDate')
                    .innerJoin('orders', 'orders.bookingId', '=', 'complaints.orderId')
                    .innerJoin('users', 'users.id', '=', 'complaints.shopOwnerId')
                    .leftJoin('salesRep', 'salesRep.id', '=', 'complaints.salesRepId')
                    .where('complaints.ticketId', data.ticketId)
                    // .groupBy('orderItems.productId')
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

        this.viewOneComplaintOrderItemsModel = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('complaintsOrderItems')
                    .select('complaintsOrderItems.id', 'complaintsOrderItems.orderId',
                        'complaintsOrderItems.productCode', 'complaintsOrderItems.ProductName',
                         'complaintsOrderItems.uploadImage',
                        //  'complaintsOrderItems.salesRepUploads',
                        'complaintsOrderItems.reason', 'complaintsOrderItems.quantity',
                        "complaintTypes.complaintText as complaintIssue"
                        // 'complaintsOrderItems.issueType',
                    )
                    .innerJoin('complaintTypes', 'complaintTypes.id', '=', 'complaintsOrderItems.issueType')
                    .where('complaintsOrderItems.ticketId', data.ticketId)
                    // .groupBy('orderItems.productId')
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


        this.getAllOrdersComplaintsModel = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('complaints')
                    .select('complaints.id', 'orderId', 'ticketId', 'complaintBy', 'shopOwnerId',
                        'complaintStatus', 'salesRep.name as salesRepName',
                        'users.shopName', 'orders.orderDate as orderDate', 'users.name as ShopOwnerName',
                        'complaints.salesRepId', 'complaintDate')
                    .innerJoin('orders', 'orders.bookingId', '=', 'complaints.orderId')
                    .innerJoin('users', 'users.id', '=', 'complaints.shopOwnerId')
                    .leftJoin('salesRep', 'salesRep.id', '=', 'complaints.salesRepId')
                    .where('complaints.shopOwnerId', data.complaintBy)
                    // .groupBy('orderItems.productId')
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


        this.getOrdersComplaintsModel = function (data) {
            var response = {}

            var pageNumber = data.pageNumber
            if (pageNumber == '0') {
                pageNumber = '0'
            } else {
                pageNumber = pageNumber - 1
            }
            var pageOffset = parseInt(pageNumber * 10)

            return new Promise(function (resolve) {
                knex.db('complaints')
                    .select('complaints.id', 'orderId', 'ticketId', 'complaintBy', 'shopOwnerId',
                        'complaintStatus', 'salesRep.name as salesRepName',
                        'users.shopName', 'orders.orderDate as orderDate', 'users.name as ShopOwnerName',
                        'complaints.salesRepId', 'complaintDate')
                    .innerJoin('orders', 'orders.bookingId', '=', 'complaints.orderId')
                    .innerJoin('users', 'users.id', '=', 'complaints.shopOwnerId')
                    .leftJoin('salesRep', 'salesRep.id', '=', 'complaints.salesRepId')
                    .where('complaints.shopOwnerId', data.complaintBy)
                    .orderBy('complaints.id', 'desc')
                    // .groupBy('orderItems.productId')
                    .offset(pageOffset).limit(10)
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




        this.viewOneOrderComplaintModel = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('complaints')
                    .select('complaints.id', 'orderId', 'ticketId', 'complaintBy', 'shopOwnerId', 'complaintStatus', 'salesRep.name as salesRepName',
                        'users.shopName', 'users.shopAddress', 'orders.orderDate as orderDate', 'users.name as ShopOwnerName','complaints.complaintFile',
                        'complaints.salesRepId', 'complaintDate', 'reopenDate', 'openDate', 'closeDate')
                    .innerJoin('orders', 'orders.bookingId', '=', 'complaints.orderId')
                    .innerJoin('users', 'users.id', '=', 'complaints.shopOwnerId')
                    .leftJoin('salesRep', 'salesRep.id', '=', 'complaints.salesRepId')
                    .where('complaints.ticketId', data.ticketId)
                    // .groupBy('orderItems.productId')
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

        this.viewOneComplaintOrderItemsModel1 = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('complaintsOrderItems')
                    .select( 'complaintsOrderItems.orderId',
                        'complaintsOrderItems.productCode', 'complaintsOrderItems.ProductName',
                       'complaintsOrderItems.uploadImage',
                        'complaintsOrderItems.reason', 'complaintsOrderItems.quantity',
                        "complaintTypes.complaintText as complaintIssue",'complaints.complaintBy',
                        'salesRep.name as salesRepName','users.name as ShopOwnerName','complaints.complaintFile'
                        // 'complaintsOrderItems.issueType','complaintsOrderItems.id',
                    )
                    .innerJoin('complaintTypes', 'complaintTypes.id', '=', 'complaintsOrderItems.issueType')
                    .innerJoin('complaints', 'complaints.orderId', '=', 'complaintsOrderItems.orderId')
                    .innerJoin('users', 'users.id', '=', 'complaints.shopOwnerId')
                    .leftJoin('salesRep', 'salesRep.id', '=', 'complaints.salesRepId')
                    .where('complaintsOrderItems.orderId', data.orderId)
                    .groupBy('complaintsOrderItems.id')
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








export default UserOrdersModel;