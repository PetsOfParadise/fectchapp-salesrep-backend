
import async from 'async'
import fs from 'fs'
import path from 'path'
import parser from 'xml2json'
import pdf from 'pdf-creator-node'
// import axios from 'axios'
import util from 'util'

import STRINGS from '../../../strings.json'
import Utils from '../../../utils/utils'
import SalesRepShopOwnerModel from '../models/salesRepShopOwnerModel'
import NotificationsService from '../../../utils/notificationsService'
import UploadS3 from '../../../config/s3.upload'

require('dotenv').config();
const unlinkFile = util.promisify(fs.unlink)

const salesRepShopOwnerModel = new SalesRepShopOwnerModel
const notificationsService = new NotificationsService
const uploadS3 = new UploadS3

const utils = new Utils()




class SalesRepShopOwnerService {
    constructor() {





        // this.shopOwnerListService = async (request, callback) => {
        //     try {
        //         var response = {}
        //         var totalSalesRepOwnerCount = await salesRepShopOwnerModel.totalSalesRepOwnersModel(request.auth.id)
        //         console.log("shopOwner", totalSalesRepOwnerCount.data.length)
        //         if (totalSalesRepOwnerCount.error) {
        //             response.error = true
        //             response.statusCode = STRINGS.successStatusCode
        //             response.message = STRINGS.commanErrorString
        //         } else {
        //             if (totalSalesRepOwnerCount.data.length > 0) {
        //                 request.pageCount = 10
        //                 var pageCount = await utils.pageCount(totalSalesRepOwnerCount.data.length, 10)
        //                 var result = await salesRepShopOwnerModel.getSalesRepOwnersModel(request)
        //                 if (result.error) {
        //                     response.error = true
        //                     response.statusCode = STRINGS.successStatusCode
        //                     response.message = STRINGS.commanErrorString
        //                 } else {
        //                     response.error = false
        //                     response.statusCode = STRINGS.successStatusCode
        //                     response.message = STRINGS.SuccessString
        //                     response.pages = pageCount
        //                     response.shopOwnerList = result.data
        //                 }
        //             } else {
        //                 response.error = false
        //                 response.statusCode = STRINGS.successStatusCode
        //                 response.message = STRINGS.SuccessString
        //                 response.pages = 0
        //                 response.shopOwnerList = []
        //             }
        //         }
        //     } catch (e) {
        //         console.log(e)
        //         response.error = true
        //         response.statusCode = STRINGS.errorStatusCode
        //         response.message = STRINGS.oopsErrorMessage
        //     }
        //     callback(response)
        // }


        this.shopOwnerListService = async (request, callback) => {
            try {
                var response = {}

                var primaryShopsList = await salesRepShopOwnerModel.getPrimarySalesRepShopsListForViewOneSalesRepDao(request)
                var secondaryShopList = await salesRepShopOwnerModel.getSecondarySalesRepShopsListForViewOneSalesRepDao(request)
                var tertiaryShopList = await salesRepShopOwnerModel.getTertiarySalesRepShopsListForViewOneSalesRepDao(request)

                if (primaryShopsList.error || secondaryShopList.error || tertiaryShopList.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                    callback(response)
                } else {

                    var shopsList = []
                    shopsList = shopsList.concat(primaryShopsList.data)
                    shopsList = shopsList.concat(secondaryShopList.data)
                    shopsList = shopsList.concat(tertiaryShopList.data)
                    console.log("shopsList", shopsList)

                    var unique = {};
                    var distinct = [];
                    for (var i in shopsList) {
                        if (typeof (unique[shopsList[i].shopName]) == "undefined") {
                            distinct.push(shopsList[i]);
                        }
                        unique[shopsList[i].shopName] = 0;
                    }
                    shopsList = distinct
                    console.log("shopsList", shopsList)
                    //create a pagination for the shopsList
                    var pageCount = await utils.pageCount(shopsList.length, 10)
                    console.log("pageCount", pageCount)
                    var page = request.pageNumber
                    var limit = 20
                    var start = (page - 1) * limit;
                    var end = page * limit;
                    shopsList = shopsList.slice(start, end);
                    console.log("shopsList", shopsList)
                    console.log("shopsList", shopsList.length)
                    response.error = false
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.SuccessString
                    response.pages = pageCount
                    response.shopOwnerList = shopsList
                    // response.shopListCount = shopsList.length
                    return callback(response)

                }
            } catch (e) {
                console.log(e)
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
            }
            callback(response)
        }







        this.searchShopNameService = async (request, callback) => {
            try {
                var response = {}
                var search = await salesRepShopOwnerModel.searchShopNameModel(request)
                if (search.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                } else {
                    response.error = false
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.SuccessString
                    response.shopOwnerList = search.data
                }
            } catch (e) {
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
            }
            callback(response)
        }


        this.viewShopDetails = async (request, callback) => {
            try {
                var response = {}
                var user = await salesRepShopOwnerModel.profileModel(request.shopId)
                var shopDetails = await salesRepShopOwnerModel.profileModel(request.shopId)
                var outStandingAmount = await salesRepShopOwnerModel.shopOwnerOutStandingAmountModel(request.shopId)
                console.log("user", user, shopDetails, outStandingAmount)
                if (user.error || shopDetails.error || outStandingAmount.error) {
                    response.error = true
                    response.statusCode = STRINGS.errorStatusCode
                    response.message = STRINGS.commanErrorString
                } else {
                    if (user.data.length > 0 && shopDetails.data.length) {
                        // console.log("user", user)
                        var UserLedger = await utils.UserLedger(user.data[0].customerID)
                        console.log("UserLedger", UserLedger)
                        if (UserLedger.error) {
                            response.error = true
                            response.statusCode = STRINGS.errorStatusCode
                            response.message = STRINGS.commanErrorString
                        } else {
                            console.log("UserLedger", UserLedger)

                            var totalAmount = await salesRepShopOwnerModel.totalAcceptWaitingAmountModel(request.shopId)
                            console.log("totalAmount", totalAmount)

                            var userLedgerAmount = 0;
                            if (UserLedger.length > 0) {
                                userLedgerAmount = UserLedger.length > 0 ? parseFloat(UserLedger[0].CLOSINGBALANCE.$t) : 0
                                var closingBalance;
                                if (UserLedger && UserLedger[0] && UserLedger[0].TYPE && typeof UserLedger[0].TYPE.$t !== 'undefined' && UserLedger[0].TYPE.$t !== null) {
                                    closingBalance = UserLedger[0].TYPE.$t == 'Debit' ? 1 : -1;
                                } else {
                                    closingBalance = 0; // or any other default value you prefer
                                }
                                userLedgerAmount = userLedgerAmount * closingBalance
                            }

                            let accept_waiting_amount = parseFloat(totalAmount.data[0].totalAcceptWaitingAmount == null ? 0 :
                                totalAmount.data[0].totalAcceptWaitingAmount)

                            let availableCredit = parseFloat(userLedgerAmount) + (accept_waiting_amount)

                            var userInfo = user.data[0]
                            // console.log("userInfo*******",userInfo)
                            userInfo.creditPeriod = shopDetails.data[0].creditPeriod
                            userInfo.creditLimit = shopDetails.data[0].creditFixedtLimit;
                            userInfo.outStandingAmount = outStandingAmount.data[0].outstandingAmount == null ?
                                null : outStandingAmount.data[0].outstandingAmount.toString()

                            userInfo.outStandingAmount = userLedgerAmount.toString()

                            userInfo.availableCreditAmount = (parseFloat(shopDetails.data[0].creditFixedtLimit) - availableCredit).toFixed(1)

                            // userInfo.rating = 3.4
                            response.error = false
                            response.statusCode = STRINGS.successStatusCode
                            response.message = STRINGS.SuccessString
                            response.userDetails = userInfo
                        }
                    } else {
                        response.error = true
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.invalidUserErrorString
                    }
                }
            } catch (e) {
                if (e.code === 'ENOENT') {
                    console.error('File not found!', e);
                    response.error = true
                    response.statusCode = STRINGS.errorStatusCode
                    response.message = "Ledger File Not Found"
                  } else {
                    // console.error('An error occurred:', e);
                    response.error = true
                    response.statusCode = STRINGS.errorStatusCode
                    response.message = STRINGS.oopsErrorMessage
                  }
            }
            callback(response)
        }

        // ORDER DETAILS

        this.adminshopOrderHistory = async (request, callback) => {
            try {
                var response = {}
                Promise.all([
                    adminsalesRepgetOrderByMonth(request),
                    adminsalesRepOrderGraphReport(request),
                ])
                    .then(result => {
                        response.error = false
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.SuccessString
                        response.TotalOrdersPages = result[0].TotalOrdersPages
                        response.orders = result[0].orders
                        response.graph = result[1].data
                        // response.paymentPages = result[2].paymentPages
                        // response.ledger = result[2]
                        // console.log("ledgerresult", result[2])
                        callback(response)
                    })
                    .catch(error => {
                        console.log(error)
                        response.error = true
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.commanErrorString
                        callback(response)
                    })
            } catch (e) {
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
                callback(response)
            }
        }


        this.adminshopOrderHistory1 = async (request, callback) => {
            try {
                var response = {}
                Promise.all([
                    salesRepShopLedger1(request)
                ])
                    .then(result => {
                        response.error = false
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.SuccessString
                        // response.orders = result[0].orders
                        // response.ordersPages = result[0].ordersPages
                        // response.graph = result[1].data
                        // response.paymentPages = result[0].paymentPages
                        response.ledger = result[0]
                        // console.log("ledgerresult", result[2])
                        callback(response)
                    })
                    .catch(error => {
                        console.log(error)
                        response.error = true
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.commanErrorString
                        callback(response)
                    })
            } catch (e) {
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
                callback(response)
            }
        }



        this.shopOrderHistory = async (request, callback) => {
            try {
                console.log("request.auth", request.auth)
                var response = {}
                Promise.all([
                    salesRepgetOrderByMonth(request),
                ])
                    .then(result => {
                        response.error = false
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.SuccessString
                        response.orders = result[0].orders
                        console.log(result[0])
                        callback(response)
                    })
                    .catch(error => {
                        console.log(error)
                        response.error = true
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.commanErrorString
                        callback(response)
                    })
            } catch (e) {
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
                callback(response)
            }
        }

        this.shopOwnerReportHistoryService = async (request, callback) => {
            try {
                var response = {}
                Promise.all([
                    salesRepOrderGraphReport(request)
                ])
                    .then(result => {
                        response.error = false
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.SuccessString
                        response.graph = result[0].data
                        callback(response)
                    })
                    .catch(error => {
                        console.log(error)
                        response.error = true
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.commanErrorString
                        callback(response)
                    })
            } catch (e) {
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
                callback(response)
            }
        }


        this.shopOwnerPaymentLedgerService = async (request, callback) => {
            try {
                var response = {}
                Promise.all([
                    salesRepShopLedger(request)
                ])
                    .then(result => {
                        response.error = false
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.SuccessString
                        response.ledger = result[0]
                        callback(response)
                    })
                    .catch(error => {
                        console.log(error)
                        response.error = true
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.commanErrorString
                        callback(response)
                    })
            } catch (e) {
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
                callback(response)
            }
        }

        this.shopOwnerPendingPaymentLedgerService = async (request, callback) => {
            try {
                var response = {}
                Promise.all([
                    salesRepShopPendingPaymentLedger(request)
                ])
                    .then(result => {
                        response.error = false
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.SuccessString
                        response.ledger = result[0]
                        callback(response)
                    })
                    .catch(error => {
                        console.log(error)
                        response.error = true
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.commanErrorString
                        callback(response)
                    })
            } catch (e) {
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
                callback(response)
            }
        }


        this.salesRepOrderDetails = async (request, callback) => {
            try {
                var response = {}
                var object = {
                    'orders.id': request.orderId
                }
                var orders = await salesRepShopOwnerModel.salesRepOrderCheck(object)
                console.log("orders", orders)
                // var outStandingAmount = await salesRepShopOwnerModel.shopOutStandingAmountModel(orders.data[0].shopId)
                if (orders.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                    callback(response)
                } else {
                    if (orders.data.length > 0) {
                        var getOrderItems = await salesRepShopOwnerModel.getUserOrderItemsList(request.orderId)
                        if (getOrderItems.error) {
                            response.error = true
                            response.statusCode = STRINGS.successStatusCode
                            response.message = STRINGS.commanErrorString
                            callback(response)
                        } else {
                            var orderItemsList = getOrderItems.data
                            var length = orderItemsList.length
                            var UserLedger = await utils.UserLedger(orders.data[0].customerID)

                            if (UserLedger.error) {
                                console.log("UserLedger error", UserLedger)
                                response.error = true
                                response.statusCode = STRINGS.errorStatusCode
                                response.message = STRINGS.commanErrorString
                            } else {
                                var userLedgerAmount = UserLedger.length > 0 ? parseFloat(UserLedger[0].CLOSINGBALANCE.$t) : 0


                                orderItemsList.forEach(async function (item, index) {
                                    var object = {
                                        orderId: item.orderId,
                                        productId: item.productId,
                                        productCode: item.orderProductId
                                    }
                                    orderItemsList[index].isFree = 0
                                    // var free = await salesRepShopOwnerModel.checkFreeQuantityModel1(object)
                                    // if (free.data.length > 0) {
                                    //   orderItemsList[index].isFree = free.data[0].quantity
                                    // }

                                    orderItemsList[index].specialDiscount = item.specialDiscount
                                    orderItemsList[index].specialDiscountValue = item.specialDiscountValue
                                    let specialDiscountAmount = 0
                                    let specialAmountValue = 0
                                    if (item.specialDiscount == 1) {
                                        specialAmountValue = (item.supplyPrice * item.specialDiscountValue) / 100
                                        specialDiscountAmount = item.supplyPrice - specialAmountValue
                                    }
                                    orderItemsList[index].specialDiscountAmount = specialDiscountAmount.toFixed(2)
                                    orderItemsList[index].specialAmountValue = specialAmountValue.toFixed(2)




                                    orderItemsList[index].isFree = item.freeQuantity
                                    if (--length === 0) {
                                        var orderInfo = orders.data[0]
                                        // orderInfo.outstandingAmount = outStandingAmount.data[0].amount
                                        orderInfo.outstandingAmount = userLedgerAmount
                                        response.error = false
                                        response.statusCode = STRINGS.successStatusCode
                                        response.message = STRINGS.SuccessString
                                        response.orderDetails = orders.data[0]
                                        response.orderItems = orderItemsList
                                        // console.log("orderItemsList", orderItemsList)
                                        // console.log("orderDetails", response.orderDetails)
                                        callback(response)
                                    }


                                })
                            }
                        }
                    } else {
                        response.error = true
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.invalidIDErrorString
                        callback(response)
                    }
                }
            } catch (e) {
                if (e.code === 'ENOENT') {
                    console.error('File not found!', e);
                    response.error = true
                    response.statusCode = STRINGS.errorStatusCode
                    response.message = "Ledger File Not Found"
                  } else {
                    console.error('An error occurred:', e);
                    response.error = true
                    response.statusCode = STRINGS.errorStatusCode
                    response.message = STRINGS.oopsErrorMessage
                  }
                callback(response)
            }
        }

        this.allOrderService = async (request, callback) => {
            try {
                var response = {}

                let usersList = await salesRepShopOwnerModel.getSalesRepUsersListModel(request)
                console.log("usersList", usersList)
                request.usersList = usersList.data
                var myOrders = 'SALESREP'
                var customerOrders = 'USER'
                const date = new Date();
                request.year = request.year == undefined ? date.getFullYear() : request.year
                request.month = request.month == undefined ? date.getMonth() + 1 : request.month

                request.salesRepId = request.auth.id
                Promise.all([
                    salesRepShopOwnerModel.getOverAllOrderModel(request.auth.id, request),
                    orderListStatusService(request, customerOrders),
                    orderListStatusService(request, myOrders),
                    salesRepShopOwnerModel.getOverAllOrderViewOnePrimarySalesRepDao(request.salesRepId, request),
                    salesRepShopOwnerModel.getOverAllOrderViewOneSecondaryAndTertiarySalesRepDao(request.salesRepId, request)
                ])
                    .then(result => {

                        let orderCount = Object.assign({}, result[0].data[0])
                        console.log("result[3]", result[3])
                        console.log('result[4]', result[4])

                        orderCount.accepted = orderCount.accepted + result[3].data[0].accepted + result[4].data[0].accepted
                        //use above exapmple and add cancelled,delivery,packaged,paid,shipped,wating done
                        orderCount.cancelled = orderCount.cancelled + result[3].data[0].cancelled + result[4].data[0].cancelled
                        orderCount.delivery = orderCount.delivery + result[3].data[0].delivery + result[4].data[0].delivery
                        orderCount.packaged = orderCount.packaged + result[3].data[0].packaged + result[4].data[0].packaged
                        orderCount.paid = orderCount.paid + result[3].data[0].paid + result[4].data[0].paid
                        orderCount.shipped = orderCount.shipped + result[3].data[0].shipped + result[4].data[0].shipped
                        orderCount.waiting = orderCount.waiting + result[3].data[0].waiting + result[4].data[0].waiting




                        response.error = false
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.SuccessString
                        response.orderStatusCount = orderCount
                        response.customerOrders = result[1]
                        response.myOrders = result[2]
                        callback(response)
                    })
                    .catch(error => {
                        console.log(error)
                        response.error = true
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.commanErrorString
                        callback(response)
                    })
            } catch (e) {
                console.log("error", e)
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
                callback(response)
            }
        }


        this.paymentCollectedService = async (request, callback) => {
            try {
                var response = {}
                var paymentCollect = 'PAYMENTCOLLECT'

                var collectToPay = 'COLLECTTOPAYMENT'


                // var collectedPaymentService = function (data, value) {
                //     var response = {}
                //     return new Promise(async function (resolve, reject) {
                //         var totalPayment = await salesRepShopOwnerModel.totalCollectedPaymentModel(data, value)
                //         if (totalPayment.error) {
                //             response.error = true
                //             reject(response)
                //         } else {
                //             if (totalPayment.data.length) {
                //                 data.pageCount = 10
                //                 var pageCount = await utils.pageCount(totalPayment.data.length, 10)
                //                 var result = await salesRepShopOwnerModel.CollectedPaymentListModel(data, value)
                //                 if (result.error) {
                //                     response.error = true
                //                     reject(response)
                //                 } else {
                //                     response.pages = pageCount
                //                     response.data = result.data
                //                     resolve(response)
                //                 }
                //             } else {
                //                 response.pages = 0
                //                 response.data = totalPayment.data
                //                 resolve(response)
                //             }
                //         }
                //     })
                // }

                var collectedPaymentService = function (data, value) {
                    var response = {}
                    return new Promise(async function (resolve, reject) {
                        data.salesRepId = data.auth.id
                        // var viewSalesRepCollectedPaymentList = await salesRepShopOwnerModel.viewSalesRepCollectedPaymentListDao(data, value)
                        var viewSalesRepPrimaryShopsCollectedPaymentList = await salesRepShopOwnerModel.viewSalesRepPrimaryShopsCollectedPaymentListDao(data, value)
                        var viewSalesRepSecondaryShopsCollectedPaymentList = await salesRepShopOwnerModel.viewSalesRepSecondaryShopsCollectedPaymentListDao(data, value)
                        var viewSalesRepTertiaryShopsCollectedPaymentList = await salesRepShopOwnerModel.viewSalesRepTertiaryShopsCollectedPaymentListDao(data, value)
                        if (viewSalesRepPrimaryShopsCollectedPaymentList.error ||
                            viewSalesRepTertiaryShopsCollectedPaymentList.error || viewSalesRepSecondaryShopsCollectedPaymentList.error) {
                            response.error = true
                            reject(response)
                        } else {
                            // console.log()

                            // if (value == 'COLLECTTOPAYMENT') {
                            //     console.log("viewSalesRepPrimaryShopsCollectedPaymentList", viewSalesRepPrimaryShopsCollectedPaymentList)
                            //     console.log("viewSalesRepSecondaryShopsCollectedPaymentList", viewSalesRepSecondaryShopsCollectedPaymentList)
                            //     console.log("viewSalesRepTertiaryShopsCollectedPaymentList", viewSalesRepTertiaryShopsCollectedPaymentList)

                            // }



                            var result = []
                            // var salesrepList = viewSalesRepCollectedPaymentList.data
                            var primaryShopsList = viewSalesRepPrimaryShopsCollectedPaymentList.data
                            var secondaryShopsList = viewSalesRepSecondaryShopsCollectedPaymentList.data
                            var tertiaryShopsList = viewSalesRepTertiaryShopsCollectedPaymentList.data
                            //merge salesrepList and primaryShopsList and sort by id in descending order and return
                            result = primaryShopsList
                            result = result.concat(secondaryShopsList)
                            result = result.concat(tertiaryShopsList)
                            //need sum of balanceAmount in result array
                            var sum = 0
                            result.forEach(element => {
                                sum = sum + parseFloat(element.balanceAmount)
                            })
                            console.log("sum balanceAmount", sum)


                            result.sort((a, b) => (a.id > b.id) ? -1 : 1)



                            response.error = false
                            // response.pages = pageCount
                            response.data = result
                            resolve(response)
                        }

                    })
                }





                Promise.all([
                    collectedPaymentService(request, paymentCollect),
                    collectedPaymentService(request, collectToPay)
                ])
                    .then(async result => {
                        console.log("result collectToPay", result[1])
                        response.error = false
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.SuccessString
                        var arr = [];
                        if (result[1].data.length > 0) {

                            arr = result[1].data.map(data => {
                                var today = new Date();
                                var dd = String(today.getDate()).padStart(2, '0');
                                var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
                                var yyyy = today.getFullYear();
                                today = dd + '/' + mm + '/' + yyyy;
                                // var date1Arr = data.dueDate.toString().split("/");
                                var date1Arr = data.dueDate == null ? data.alterDueDate.toString().split("/") : data.dueDate.toString().split("/")
                                var date2Arr = today.toString().split("/")
                                var date1 = new Date(+date1Arr[2], date1Arr[1] - 1, +date1Arr[0]);
                                var date2 = new Date(+date2Arr[2], date2Arr[1] - 1, +date2Arr[0]);
                                var Difference_In_Time = date1.getTime() - date2.getTime();
                                var daysLeft = Difference_In_Time / (1000 * 3600 * 24);
                                data.daysLeft = daysLeft;
                                if (daysLeft <= 7 && daysLeft > 0) {
                                    data.status = 'thisweek'
                                } else if (daysLeft > 7) {
                                    data.status = 'others'
                                } else {
                                    data.status = 'overdue'
                                }
                                return data;
                            })
                            if (request.type == 'overdue') {
                                var finalarr = arr.filter(data => data.status == 'overdue')
                            } else if (request.type == 'thisweek') {
                                var finalarr = arr.filter(data => data.status == 'thisweek')
                            } else if (request.type == 'others') {
                                var finalarr = arr.filter(data => data.status == 'others')
                            } else {
                                var finalarr = arr
                            }
                        } else {
                            var finalarr = arr
                        }


                        //create a pagination for result array and per page count is 10 and use pageNumber to get the data
                        var pageCount = await utils.pageCount(finalarr.length, 10)

                        var itemsPerPage = 10;
                        var pageNumber = request.pageNumber || 1;

                        var startIndex = (pageNumber - 1) * itemsPerPage;
                        var endIndex = startIndex + itemsPerPage;

                        // Get the items for the current page
                        var currentPageItems = finalarr.slice(startIndex, endIndex);

                        var finalObject = {
                            pages: pageCount,
                            // data: finalarr
                            data: currentPageItems
                        }


                        let paymentCollected = result[0].data


                        let pageCountpaymentCollected = await utils.pageCount(paymentCollected.length, 10)


                        // Get the items for the current page
                        var paymentCollectedData = paymentCollected.slice(startIndex, endIndex);

                        var paymentCollectedDataObject = {
                            pages: pageCountpaymentCollected,
                            // data: finalarr
                            data: paymentCollectedData
                        }



                        response.paymentCollected = paymentCollectedDataObject
                        response.paymentToCollect = finalObject
                        callback(response)
                    })
                    .catch(error => {
                        console.log(error)
                        response.error = true
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.commanErrorString
                        callback(response)
                    })
            } catch (e) {
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
                callback(response)
            }
        }


        this.paymentAndComplaintCount = async (request, callback) => {
            try {
                console.log("request", request)
                request.salesRepId = request.auth.id
                var response = {}




                let collectedPaymentCountService = function (data, value) {
                    var response = {}
                    return new Promise(async function (resolve, reject) {
                        data.salesRepId = data.auth.id
                        // var viewSalesRepCollectedPaymentList = await salesRepShopOwnerModel.viewSalesRepCollectedPaymentListDao(data, value)
                        var viewSalesRepPrimaryShopsCollectedPaymentList = await salesRepShopOwnerModel.viewSalesRepPrimaryShopsCollectedPaymentListDao(data, value)
                        var viewSalesRepSecondaryShopsCollectedPaymentList = await salesRepShopOwnerModel.viewSalesRepSecondaryShopsCollectedPaymentListDao(data, value)
                        var viewSalesRepTertiaryShopsCollectedPaymentList = await salesRepShopOwnerModel.viewSalesRepTertiaryShopsCollectedPaymentListDao(data, value)
                        if (viewSalesRepPrimaryShopsCollectedPaymentList.error ||
                            viewSalesRepTertiaryShopsCollectedPaymentList.error || viewSalesRepSecondaryShopsCollectedPaymentList.error) {
                            response.error = true
                            reject(response)
                        } else {

                            // if (value == 'PAYMENTCOLLECT') {
                            //     console.log("viewSalesRepPrimaryShopsCollectedPaymentList", viewSalesRepPrimaryShopsCollectedPaymentList)
                            //     console.log("viewSalesRepCollectedPaymentList", viewSalesRepCollectedPaymentList)
                            //     console.log("viewSalesRepSecondaryShopsCollectedPaymentList", viewSalesRepSecondaryShopsCollectedPaymentList)
                            //     console.log("viewSalesRepTertiaryShopsCollectedPaymentList", viewSalesRepTertiaryShopsCollectedPaymentList)

                            // }



                            var result = []
                            // var salesrepList = viewSalesRepCollectedPaymentList.data
                            var primaryShopsList = viewSalesRepPrimaryShopsCollectedPaymentList.data
                            var secondaryShopsList = viewSalesRepSecondaryShopsCollectedPaymentList.data
                            var tertiaryShopsList = viewSalesRepTertiaryShopsCollectedPaymentList.data
                            //merge salesrepList and primaryShopsList and sort by id in descending order and return
                            result = primaryShopsList
                            result = result.concat(secondaryShopsList)
                            result = result.concat(tertiaryShopsList)

                            //need sum of balanceAmount in result array
                            //     var sum = 0
                            //     result.forEach(element => {
                            //         sum = sum + parseFloat(element.balanceAmount)
                            //     })
                            //    console.log("sum balanceAmount",sum)


                            result.sort((a, b) => (a.id > b.id) ? -1 : 1)

                            // create a pagination for result array and per page count is 10 and use pageNumber to get the data

                            // Get the items for the current page
                            var currentPageItems = result;

                            response.error = false
                            response.data = currentPageItems
                            resolve(response)
                        }

                    })
                }


                // let cronCollectedPaymentListModel = await salesRepShopOwnerModel.cronCollectedPaymentListModel()
                // console.log("cronCollectedPaymentListModel",cronCollectedPaymentListModel)
                Promise.all([
                    totalComplaintCountService(request),
                    collectedPaymentCountService(request)
                ])
                    .then(result => {
                        var arr = [];
                        console.log("result[1].data", result[1].data)
                        arr = result[1].data.map(data => {
                            var today = new Date();
                            var dd = String(today.getDate()).padStart(2, '0');
                            var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
                            var yyyy = today.getFullYear();
                            today = dd + '/' + mm + '/' + yyyy;
                            var date1Arr = data.dueDate == null ? data.alterDueDate.toString().split("/") : data.dueDate.toString().split("/")
                            var date2Arr = today.toString().split("/")
                            var date1 = new Date(+date1Arr[2], date1Arr[1] - 1, +date1Arr[0]);
                            var date2 = new Date(+date2Arr[2], date2Arr[1] - 1, +date2Arr[0]);
                            var Difference_In_Time = date1.getTime() - date2.getTime();
                            var daysLeft = Difference_In_Time / (1000 * 3600 * 24);
                            data.daysLeft = daysLeft;
                            console.log("daysLeft", daysLeft)
                            if (daysLeft <= 7 && daysLeft > 0) {
                                data.status = 'thisweek'
                            } else if (daysLeft > 7) {
                                data.status = 'others'
                            } else {
                                data.status = 'overdue'
                            }
                            return data;
                        })
                        var overdueCount = arr.filter(data => data.status == 'overdue').length
                        var thisweekCount = arr.filter(data => data.status == 'thisweek').length
                        response.error = false
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.SuccessString
                        response.complaintCount = result[0].result.length
                        response.overdueCount = overdueCount
                        response.thisweekCount = thisweekCount
                        callback(response)
                    })
                    .catch(error => {
                        console.log(error)
                        response.error = true
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.commanErrorString
                        callback(response)
                    })
            } catch (e) {
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
                callback(response)
            }
        }

        this.cronCollectedPaymentService = function (data, value) {
            var response = {}
            return new Promise(async function (resolve, reject) {

                var result = await salesRepShopOwnerModel.cronCollectedPaymentListModel(data, value)
                if (result.error) {
                    response.error = true
                    reject(response)
                } else {
                    response.data = result.data
                    resolve(response)
                }
            })
        }

        // Payment Collected
        this.collectPaymentService = async (request, callback) => {
            try {
                var response = {}

                var orders = await salesRepShopOwnerModel.checkOrderIdModel(request.orderId)
                console.log("orders", orders)
                if (orders.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                } else {
                    if (orders.data.length > 0) {
                        var balanceAmount = orders.data[0].balanceAmount
                        if (balanceAmount >= request.amount) {
                            var paymentDetails = {}
                            paymentDetails.orderId = request.orderId
                            paymentDetails.salesRepID = request.auth.id
                            paymentDetails.amount = request.amount
                            paymentDetails.payTypeID = request.payTypeID
                            paymentDetails.paidDate = new Date()
                            paymentDetails.shopID = orders.data[0].cartUserId
                            paymentDetails.chequeNumber = request.chequeNumber
                            paymentDetails.chequeImage = request.chequeImage
                            var save = await salesRepShopOwnerModel.saveAmountCollectedModel(paymentDetails)
                            if (save.error) {
                                response.error = true
                                response.statusCode = STRINGS.successStatusCode
                                response.message = STRINGS.commanErrorString
                            } else {
                                // var paidAmount = balanceAmount - request.amount
                                // var updateOrderPay = await salesRepShopOwnerModel.updateOrderPayModel(paidAmount, request.orderId, request.amount)
                                // if (updateOrderPay.error) {
                                //     response.error = true
                                //     response.statusCode = STRINGS.successStatusCode
                                //     response.message = STRINGS.commanErrorString
                                // } else {
                                var updateNotifications = {}
                                updateNotifications.ownerId = orders.data[0].ownerId
                                updateNotifications.orderId = orders.data[0].id
                                updateNotifications.managerId = orders.data[0].cartUserId
                                updateNotifications.salesRepId = request.auth.id
                                updateNotifications.type = 'SALESREP_PAYMENT'
                                updateNotifications.notifyType = JSON.stringify(['AD'])
                                updateNotifications.notifyDate = new Date()
                                updateNotifications.payTypeID = request.payTypeID
                                updateNotifications.amount = request.amount
                                salesRepShopOwnerModel.saveNotificationsModel(updateNotifications, () => { })

                                response.error = false
                                response.statusCode = STRINGS.successStatusCode
                                response.message = STRINGS.SuccessString
                                // }
                            }
                        } else {
                            response.error = true
                            response.statusCode = STRINGS.successStatusCode
                            response.message = STRINGS.paymentErrorString
                        }
                    } else {
                        response.error = true
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.invalidIDErrorString
                    }
                }
            } catch (e) {
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
            }
            callback(response)
        }


        this.salesRepDepotListService = async (request, callback) => {
            try {
                var response = {}
                var params = request.body
                console.log("request auth ", params.auth)
                var getOneUserModel = await salesRepShopOwnerModel.getOneUserModel(request)

                if (getOneUserModel.error) {
                    response.error = true
                    response.statusCode = STRINGS.errorStatusCode
                    response.message = STRINGS.commanErrorString
                    callback(response)
                }
                var depotListServiceModel = await salesRepShopOwnerModel.salesRepDepotListModel1(request, getOneUserModel.data[0])

                if (depotListServiceModel.error) {
                    response.error = true
                    response.statusCode = STRINGS.errorStatusCode
                    response.message = STRINGS.commanErrorString
                    callback(response)
                } else if (depotListServiceModel.data.length > 0) {
                    var data = [];
                    response.error = false
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.SuccessString
                    response.result = depotListServiceModel.data
                    callback(response)
                } else {
                    response.error = false
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.SuccessString
                    response.result = []
                    callback(response)
                }
            } catch (e) {
                console.log(e)
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
                callback(response)
            }
        }

        this.salesRepUpdateUserDepotService = async (request, callback) => {
            try {
                var response = {}
                var params = request.body
                console.log("request auth ", params.auth)
                var getOneUserModel = await salesRepShopOwnerModel.getOneUserModel(request)
                console.log("request auth ", getOneUserModel)

                if (getOneUserModel.error) {
                    response.error = true
                    response.statusCode = STRINGS.errorStatusCode
                    response.message = STRINGS.commanErrorString
                    callback(response)
                }
                if (getOneUserModel.data[0].outletId == params.depot_id) {
                    console.log("same depot update")
                    response.error = false
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.SuccessString
                    // response.result = 
                    return callback(response)
                }
                var getDepotModel = await salesRepShopOwnerModel.getDepotModel(request)
                // console.log("getDepotModel ", getDepotModel)
                if (getDepotModel.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                    callback(response)
                } else if (getDepotModel.data.length > 0) {
                    //getting catalog id
                    request.body.userCatalogId = getDepotModel.data[0].id

                    // console.log("request.body.user_id ", request.body.user_id)
                    var updateUserDepotModel = await salesRepShopOwnerModel.salesRepupdateUserDepotModel1(request, getOneUserModel.data[0])
                    // var updateUserDepotModel = {}

                    // updateUserDepotModel.error = false
                    if (updateUserDepotModel.error) {
                        response.error = true
                        response.statusCode = STRINGS.errorStatusCode
                        response.message = STRINGS.commanErrorString
                        callback(response)
                    } else {
                        response.error = false
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.SuccessString
                        // response.result = 
                        callback(response)
                    }
                } else {
                    response.error = false
                    response.statusCode = STRINGS.errorStatusCode
                    response.message = STRINGS.SuccessString
                    response.result = []
                    callback(response)
                }
            } catch (e) {
                console.log(e)
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
                callback(response)
            }
        }

        this.setRemindersListService = async (request, callback) => {
            try {
                var response = {}
                var params = request.body
                // console.log("request auth ", params.auth)

                var primaryShopsList = await salesRepShopOwnerModel.getPrimarySalesRepShopsListForViewOneSalesRepDao(request.body)
                var secondaryShopList = await salesRepShopOwnerModel.getSecondarySalesRepShopsListForViewOneSalesRepDao(request.body)
                var tertiaryShopList = await salesRepShopOwnerModel.getTertiarySalesRepShopsListForViewOneSalesRepDao(request.body)

                if (primaryShopsList.error || secondaryShopList.error || tertiaryShopList.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                    callback(response)
                } else {

                    var shopsList = []
                    shopsList = shopsList.concat(primaryShopsList.data)
                    shopsList = shopsList.concat(secondaryShopList.data)
                    shopsList = shopsList.concat(tertiaryShopList.data)
                    console.log("shopsList", shopsList)

                    var unique = {};
                    var distinct = [];
                    for (var i in shopsList) {
                        if (typeof (unique[shopsList[i].shopName]) == "undefined") {
                            distinct.push(shopsList[i]);
                        }
                        unique[shopsList[i].shopName] = 0;
                    }
                    shopsList = distinct
                    // console.log("shopsList", shopsList)

                    let userList = []
                    shopsList.forEach(val => {
                        userList.push(val.customerID)
                    })

                    request.body.userList = userList

                    var setRemindersListModel = await salesRepShopOwnerModel.setRemindersListModel(request)
                    var getSalesRepTaskList = await salesRepShopOwnerModel.getSalesRepTaskList(request)

                    // console.log("setRemindersListModel", setRemindersListModel)
                    if (setRemindersListModel.error || getSalesRepTaskList.error) {
                        response.error = true
                        response.statusCode = STRINGS.errorStatusCode
                        response.message = STRINGS.commanErrorString
                        callback(response)
                    } else {

                        var resp = [];
                        for (let i = 0; i < setRemindersListModel.data.length; i++) {
                            let val = setRemindersListModel.data[i]
                            var date1 = Date.parse(val.date);
                            var date2 = new Date().getTime();
                            val.visitDate = val.date
                            // console.log(date1, date2,new Date(val.date))
                            if (date1 > date2) {
                                resp.push(val)
                            }
                        }
                        let taskList = []

                        getSalesRepTaskList.data.forEach(val => {
                            let obj = {}
                            // obj.id = val.id
                            obj.title = val.shopName
                            obj.description = val.message
                            obj.date = val.dueDate
                            taskList.push(obj)
                        })

                        let result = []
                        result = resp.concat(taskList)
                        result.sort(function (a, b) {
                            return new Date(b.visitDate) - new Date(a.visitDate);
                        });
                        // console.log("taskList", taskList)
                        // console.log("resp", resp)
                        response.error = false
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.SuccessString
                        response.data = result

                        callback(response)
                    }
                }
            } catch (e) {
                console.log(e)
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
                callback(response)
            }
        }


        this.setOneReminderService = async (request, callback) => {
            try {
                var response = {}
                var params = request.body
                console.log("request auth ", params.auth)
                let data = {
                    salesRepId: params.auth.id,
                    date: params.date,
                    title: params.title,
                    description: params.description,
                }
                request.body.data = data
                var setOneReminderModel = await salesRepShopOwnerModel.setOneReminderModel(request)
                if (setOneReminderModel.error) {
                    response.error = true
                    response.statusCode = STRINGS.errorStatusCode
                    response.message = STRINGS.commanErrorString
                    callback(response)
                } else {
                    response.error = false
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.SuccessString
                    callback(response)
                }
            } catch (e) {
                console.log(e)
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
                callback(response)
            }
        }



        this.getOneShopSalesRepListService = async (request, callback) => {
            try {
                var response = {}
                var params = request.body
                // console.log("request auth ", params.auth)

                // request.body.data = data
                var getOneShopSalesRepListModel = await salesRepShopOwnerModel.getOneShopSalesRepListModel(request)
                if (getOneShopSalesRepListModel.error) {
                    response.error = true
                    response.statusCode = STRINGS.errorStatusCode
                    response.message = STRINGS.commanErrorString
                    callback(response)
                } else {
                    response.error = false
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.SuccessString
                    response.data = getOneShopSalesRepListModel.data[1]
                    callback(response)
                }
            } catch (e) {
                console.log(e)
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
                callback(response)
            }
        }


        //         this.salesRepUserPaymentLedgerDownloadService = async (request, callback) => {
        //     try {
        //         var response = {}
        //         console.log("ledger1 auth data", request.body.auth)
        //         var data = request.body
        //         request.body.user_id = request.body.shopId
        //         var findCustomer = await salesRepShopOwnerModel.getOneUserModel(request)
        //         // console.log("findCustomer", findCustomer)
        //         if (findCustomer.error) {
        //             response.error = true
        //             response.statusCode = STRINGS.successStatusCode
        //             response.message = STRINGS.commanErrorString
        //             reject(response)
        //         } else {
        //             var customerID = findCustomer.data[0].customerID

        //             // console.log("path.resolve(__dirname",path.resolve(__dirname, `../../../../../www/html/${process.env.USER_LEDGER}`))

        //             var rawdata = fs.readFileSync(path.resolve(__dirname, `../../../../../www/html/${process.env.USER_LEDGER}`))


        //             var ledgerData = JSON.parse(parser.toJson(rawdata, {
        //                 reversible: true
        //             }));
        //             var newrawdata = ledgerData['ENVELOPE']['LEDGERS']
        //             // console.log("newrawdata",newrawdata)
        //             if (newrawdata.length > 0) {

        //                 var filterLedger = newrawdata.filter(function (item) {
        //                     // console.log("datas",item)
        //                     return item.LEDGERCODE.$t == customerID
        //                 })
        //                 // console.log("filterLedger", filterLedger)

        //                 // console.log("filterLedger", filterLedger[0].HISTORY[0])
        //                 if (filterLedger.length > 0) {
        //                     var ledgerHistory = filterLedger[0].HISTORY
        //                     ledgerHistory = ledgerHistory == undefined ? [] : ledgerHistory
        //                     var historyResult = []
        //                     if (Array.isArray(ledgerHistory)) {
        //                         historyResult = ledgerHistory
        //                         // console.log("historyResult",historyResult)
        //                     } else if (typeof ledgerHistory === 'object') {
        //                         historyResult.push(ledgerHistory)
        //                     }
        //                     // console.log("historyResult first2", historyResult)


        //                     var resp = []
        //                     if (historyResult.lenth != 0 &&
        //                         data.fromDate.length != 0 && data.toDate.length != 0) {
        //                         // console.log("historyResult", historyResult)
        //                         historyResult.forEach((val, ind) => {
        //                             var date = new Date(val.DATE.$t)
        //                             // console.log("date history", date)
        //                             var startDate = new Date(data.fromDate);
        //                             var toDate = new Date(data.toDate);
        //                             // console.log("date startDate", startDate)
        //                             // console.log("date toDate", toDate)

        //                             if (startDate.getTime() <= date.getTime() && toDate.getTime() >= date.getTime()) {
        //                                 resp.push(val)
        //                             }
        //                         })
        //                     } else {
        //                         resp = historyResult
        //                     }

        //                     // console.log("response", resp)

        //                     var options = {
        //                         format: "A2",
        //                         orientation: "portrait",
        //                         // border: "10mm",
        //                         // header: {
        //                         //     height: "45mm",
        //                         //     // contents: '<div style="text-align: center;"><h1>Europet Products Pvt Ltd</h1></div>'
        //                         // },
        //                         // footer: {
        //                         //     height: "28mm",
        //                         //     contents: {
        //                         //         first: 'Cover page',
        //                         //         // 2: 'Second page', // Any page number is working. 1-based index
        //                         //         default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
        //                         //         last: 'Last Page'
        //                         //     }
        //                         // }
        //                     };
        //                     var ledgers = []
        //                     resp.forEach((val, ind) => {
        //                         let obj = {}
        //                         let ledger_date = val.DATE.$t.length > 0 ? val.DATE.$t.split('-') : val.DATE.$t
        //                         obj.no = ind + 1
        //                         obj.date = ledger_date[1] + '-' + ledger_date[2] + '-' + ledger_date[0]
        //                         obj.particulars = val.PARTICULARS.$t
        //                         // obj.amount = val.AMOUNT.$t
        //                         obj.voucherNmber = val.VOUCHERNUMBER.$t
        //                         obj.credit = val.TYPE.$t == 'Credit' ? val.AMOUNT.$t : null
        //                         obj.debit = val.TYPE.$t == 'Debit' ? val.AMOUNT.$t : null
        //                         obj.voucherType = val.VOUCHERTYPE.$t
        //                         ledgers.push(obj)
        //                     })
        //                     // require('../../.././../../www')

        //                     var html = fs.readFileSync(path.resolve(__dirname, `../../.././../../www/${process.env.PDF_TEMPLATE}`), "utf8");
        //                     var timestamp = (new Date).getTime().toString()

        //                     var ledgerObj = {}
        //                     ledgerObj.openingBalance = filterLedger[0].OPENINGBALANCE.$t
        //                     ledgerObj.outstandingBalance = filterLedger[0].CLOSINGBALANCE.$t
        //                     ledgerObj.totalDebit = filterLedger[0].TOTALDEBIT.$t
        //                     ledgerObj.totalCredit = filterLedger[0].TOTALCREDIT.$t

        //                     var shopAddress = findCustomer.data[0].shopAddress.length > 0 ? findCustomer.data[0].shopAddress.split(',')
        //                         : []
        //                     // console.log("shopAddress", shopAddress)
        //                     var output = [];
        //                     for (var ind = 0; ind < shopAddress.length; ind++) {
        //                         //   console.log("ind", ind)
        //                         if (shopAddress[ind].length > 11) {
        //                             var temp = shopAddress[ind]
        //                             output.push(`${temp},`)
        //                         } else {
        //                             var k = shopAddress.length > ind + 1 ? shopAddress[ind] + ',' + shopAddress[ind + 1] : shopAddress[ind]
        //                             if (ind != shopAddress.length - 1) {
        //                                 k = k + ','
        //                             }
        //                             output.push(k)
        //                             ind++;
        //                         }
        //                     }

        //                     var document = {
        //                         html: html,
        //                         data: {
        //                             ledgers: ledgers,
        //                             shopName: findCustomer.data[0].shopName,
        //                             shopAddress: output,
        //                             ledgerObj: ledgerObj
        //                         },
        //                         path: path.resolve(__dirname, `../../../../../www/html/uploads/UserLedger-${timestamp}.pdf`),
        //                         type: "",
        //                     };
        //                     // require('../../../../www/html/uploads')

        //                     try {
        //                         var pdf_data = await pdf.create(document, options)
        //                         console.log("pdfResp", pdf_data)
        //                         var fileObj = Object.assign("", pdf_data)
        //                         var file_url = fileObj.filename.replace('/var/www/html/', "");
        //                         // console.log("file_url", file_url)
        //                         var fileData = {}
        //                         fileData.file_path = path.resolve(__dirname, `../../../../../www/html/${file_url}`)
        //                         fileData.fileName = fileObj.filename.replace('/var/www/html/uploads/', "");
        //                         fileData.type = 'temp_files'
        //                         var s3PdfUpload = await uploadS3.S3_upload(fileData)
        //                         // console.log("s3PdfUpload", s3PdfUpload)
        //                         if (s3PdfUpload.error) {
        //                             console.log('s3PdfUpload error')
        //                             response.error = true
        //                             response.statusCode = STRINGS.errorStatusCode
        //                             response.message = STRINGS.commanErrorString
        //                         } else {
        //                             response.error = false
        //                             response.statusCode = STRINGS.successStatusCode
        //                             response.message = STRINGS.SuccessString
        //                             response.fileUrl = s3PdfUpload.data
        //                         }
        //                     } catch (error) {
        //                         console.log('pdf error', error)
        //                         response.error = true
        //                         response.statusCode = STRINGS.errorStatusCode
        //                         response.message = STRINGS.commanErrorString
        //                     }
        //                     // console.log("history",response.history)
        //                 } else {
        //                     response.error = true
        //                     response.statusCode = STRINGS.errorStatusCode
        //                     response.message = "Ledger Is Empty"
        //                 }
        //             } else {
        //                 response.error = true
        //                 response.statusCode = STRINGS.errorStatusCode
        //                 response.message = "Ledger Is Empty"
        //             }

        //         }
        //     } catch (e) {
        //         if (e.code === 'ENOENT') {
        //             console.error('File not found!', e);
        //             response.error = true
        //             response.statusCode = STRINGS.errorStatusCode
        //             response.message = "Ledger File Not Found"
        //           } else {
        //             console.error('An error occurred:', e);
        //             response.error = true
        //             response.statusCode = STRINGS.errorStatusCode
        //             response.message = STRINGS.oopsErrorMessage
        //           }
        //     }
        //     callback(response)
        // }


//         this.salesRepUserPaymentLedgerDownloadService = async (request, callback) => {
//             try {
//                 var response = {}
//                 console.log("ledger1 auth data", request.body.auth)
//                 var data = request.body
//                 request.body.user_id = request.body.shopId
//                 var findCustomer = await salesRepShopOwnerModel.getOneUserModel(request)
//                 // console.log("findCustomer", findCustomer)
//                 if (findCustomer.error) {
//                     response.error = true
//                     response.statusCode = STRINGS.successStatusCode
//                     response.message = STRINGS.commanErrorString
//                     reject(response)
//                 } else {
//                     var customerID = findCustomer.data[0].customerID

//                     // console.log("path.resolve(__dirname",path.resolve(__dirname, `../../../../../www/html/${process.env.USER_LEDGER}`))

//                     var rawdata = fs.readFileSync(path.resolve(__dirname, `../../../../../www/html/${process.env.USER_LEDGER}`))

//                     var ledgerData = JSON.parse(parser.toJson(rawdata, {
//                         reversible: true
//                     }));
//                     // let ledgerData;

//                     //      ledgerData = JSON.parse(rawdata);
    
// // console.log(ledgerData,'===ledgerData')
//                     var newrawdata = ledgerData['ENVELOPE']['LEDGERS']
//                     // console.log("newrawdata",newrawdata)
//                     if (newrawdata.length > 0) {

//                         var filterLedger = newrawdata.filter(function (item) {
//                             // console.log("datas",item)
//                             return item.LEDGERCODE.$t == customerID
//                         })
//                         // console.log("filterLedger", filterLedger)

//                         // console.log("filterLedger", filterLedger[0].HISTORY[0])
//                         if (filterLedger.length > 0) {
//                             var ledgerHistory = filterLedger[0].HISTORY
//                             ledgerHistory = ledgerHistory == undefined ? [] : ledgerHistory
//                             var historyResult = []
//                             if (Array.isArray(ledgerHistory)) {
//                                 historyResult = ledgerHistory
//                                 // console.log("historyResult",historyResult)
//                             } else if (typeof ledgerHistory === 'object') {
//                                 historyResult.push(ledgerHistory)
//                             }
//                             // console.log("historyResult first2", historyResult)


//                             var resp = []
//                             if (historyResult.lenth != 0 &&
//                                 data.fromDate.length != 0 && data.toDate.length != 0) {
//                                 // console.log("historyResult", historyResult)
//                                 historyResult.forEach((val, ind) => {
//                                     var date = new Date(val.DATE.$t)
//                                     // console.log("date history", date)
//                                     var startDate = new Date(data.fromDate);
//                                     var toDate = new Date(data.toDate);
//                                     // console.log("date startDate", startDate)
//                                     // console.log("date toDate", toDate)

//                                     if (startDate.getTime() <= date.getTime() && toDate.getTime() >= date.getTime()) {
//                                         resp.push(val)
//                                     }
//                                 })
//                             } else {
//                                 resp = historyResult
//                             }

//                             // console.log("response", resp)

//                             var options = {
//                                 format: "A2",
//                                 orientation: "portrait",
//                                 // border: "10mm",
//                                 // header: {
//                                 //     height: "45mm",
//                                 //     // contents: '<div style="text-align: center;"><h1>Europet Products Pvt Ltd</h1></div>'
//                                 // },
//                                 // footer: {
//                                 //     height: "28mm",
//                                 //     contents: {
//                                 //         first: 'Cover page',
//                                 //         // 2: 'Second page', // Any page number is working. 1-based index
//                                 //         default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
//                                 //         last: 'Last Page'
//                                 //     }
//                                 // }
//                             };
//                             var ledgers = []
//                             resp.forEach((val, ind) => {
//                                 let obj = {}
//                                 let ledger_date = val.DATE.$t.length > 0 ? val.DATE.$t.split('-') : val.DATE.$t
//                                 obj.no = ind + 1
//                                 obj.date = ledger_date[1] + '-' + ledger_date[2] + '-' + ledger_date[0]
//                                 obj.particulars = val.PARTICULARS.$t
//                                 // obj.amount = val.AMOUNT.$t
//                                 obj.voucherNmber = val.VOUCHERNUMBER.$t
//                                 obj.credit = val.TYPE.$t == 'Credit' ? val.AMOUNT.$t : null
//                                 obj.debit = val.TYPE.$t == 'Debit' ? val.AMOUNT.$t : null
//                                 obj.voucherType = val.VOUCHERTYPE.$t
//                                 ledgers.push(obj)
//                             })
//                             // require('../../.././../../www')

//                             var html = fs.readFileSync(path.resolve(__dirname, `../../.././../../www/${process.env.PDF_TEMPLATE}`), "utf8");
//                             var timestamp = (new Date).getTime().toString()

//                             var ledgerObj = {}
//                             ledgerObj.openingBalance = filterLedger[0].OPENINGBALANCE.$t
//                             ledgerObj.outstandingBalance = filterLedger[0].CLOSINGBALANCE.$t
//                             ledgerObj.totalDebit = filterLedger[0].TOTALDEBIT.$t
//                             ledgerObj.totalCredit = filterLedger[0].TOTALCREDIT.$t

//                             var shopAddress = findCustomer.data[0].shopAddress.length > 0 ? findCustomer.data[0].shopAddress.split(',')
//                                 : []
//                             // console.log("shopAddress", shopAddress)
//                             var output = [];
//                             for (var ind = 0; ind < shopAddress.length; ind++) {
//                                 //   console.log("ind", ind)
//                                 if (shopAddress[ind].length > 11) {
//                                     var temp = shopAddress[ind]
//                                     output.push(`${temp},`)
//                                 } else {
//                                     var k = shopAddress.length > ind + 1 ? shopAddress[ind] + ',' + shopAddress[ind + 1] : shopAddress[ind]
//                                     if (ind != shopAddress.length - 1) {
//                                         k = k + ','
//                                     }
//                                     output.push(k)
//                                     ind++;
//                                 }
//                             }

//                             var document = {
//                                 html: html,
//                                 data: {
//                                     ledgers: ledgers,
//                                     shopName: findCustomer.data[0].shopName,
//                                     shopAddress: output,
//                                     ledgerObj: ledgerObj
//                                 },
//                                 path: path.resolve(__dirname, `../../../../../www/html/uploads/UserLedger-${timestamp}.pdf`),
//                                 type: "",
//                             };
//                             // require('../../../../www/html/uploads')

//                             try {
//                                 var pdf_data = await pdf.create(document, options)
//                                 console.log("pdfResp", pdf_data)
//                                 var fileObj = Object.assign("", pdf_data)
//                                 var file_url = fileObj.filename.replace('/var/www/html/', "");
//                                 // console.log("file_url", file_url)
//                                 var fileData = {}
//                                 fileData.file_path = path.resolve(__dirname, `../../../../../www/html/${file_url}`)
//                                 fileData.fileName = fileObj.filename.replace('/var/www/html/uploads/', "");
//                                 fileData.type = 'temp_files'
//                                 var s3PdfUpload = await uploadS3.S3_upload(fileData)
//                                 // console.log("s3PdfUpload", s3PdfUpload)
//                                 if (s3PdfUpload.error) {
//                                     console.log('s3PdfUpload error')
//                                     response.error = true
//                                     response.statusCode = STRINGS.errorStatusCode
//                                     response.message = STRINGS.commanErrorString
//                                 } else {
//                                     response.error = false
//                                     response.statusCode = STRINGS.successStatusCode
//                                     response.message = STRINGS.SuccessString
//                                     response.fileUrl = s3PdfUpload.data
//                                 }
//                             } catch (error) {
//                                 console.log('pdf error', error)
//                                 response.error = true
//                                 response.statusCode = STRINGS.errorStatusCode
//                                 response.message = STRINGS.commanErrorString
//                             }
//                             // console.log("history",response.history)
//                         } else {
//                             response.error = true
//                             response.statusCode = STRINGS.errorStatusCode
//                             response.message = "Ledger Is Empty"
//                         }
//                     } else {
//                         response.error = true
//                         response.statusCode = STRINGS.errorStatusCode
//                         response.message = "Ledger Is Empty"
//                     }

//                 }
//             } catch (e) {
//                 if (e.code === 'ENOENT') {
//                     console.error('File not found!', e);
//                     response.error = true
//                     response.statusCode = STRINGS.errorStatusCode
//                     response.message = "Ledger File Not Found"
//                   } else {
//                     console.error('An error occurred:', e);
//                     response.error = true
//                     response.statusCode = STRINGS.errorStatusCode
//                     response.message = STRINGS.oopsErrorMessage
//                   }
//             }
//             callback(response)
//         }


        



//         this.salesRepUserPaymentLedgerDownloadService = async (request, callback) => {
//             try {
//                 var response = {}
//                 console.log("ledger1 auth data", request.body.auth)
//                 var data = request.body
//                 request.body.user_id = request.body.shopId
//                 var findCustomer = await salesRepShopOwnerModel.getOneUserModel(request)
//                 // console.log("findCustomer", findCustomer)
//                 if (findCustomer.error) {
//                     response.error = true
//                     response.statusCode = STRINGS.successStatusCode
//                     response.message = STRINGS.commanErrorString
//                     reject(response)
//                 } else {
//                     var customerID = findCustomer.data[0].customerID

//                     // console.log("path.resolve(__dirname",path.resolve(__dirname, `../../../../../www/html/${process.env.USER_LEDGER}`))

//                     // var rawdata = fs.readFileSync(path.resolve(__dirname, `../../../../../www/html/${process.env.USER_LEDGER}`))

//                     var rawdata = fs.readFileSync(path.resolve(__dirname, `../../../${process.env.USER_LEDGER}`))

//                     // var ledgerData = JSON.parse(parser.toJson(rawdata, {
//                     //     reversible: true
//                     // }));
//                     let ledgerData;

//                          ledgerData = JSON.parse(rawdata);
    
// console.log(ledgerData,'===ledgerData')
//                    // var newrawdata = ledgerData['ENVELOPE']['LEDGERS']
//                     // console.log("newrawdata",newrawdata)
//                     // if (newrawdata.length > 0) {

//                         // var filterLedger = newrawdata.filter(function (item) {
//                         //     // console.log("datas",item)
//                         //     return item.LEDGERCODE.$t == customerID
//                         // })

//                         var newrawdata = [{
//                         LEDGERCODE: { $t: customerID },  // you can add this to match filter if needed
//                         OPENINGBALANCE: { $t: ledgerData.openingBalance },
//                         CLOSINGBALANCE: { $t: ledgerData.outstandingBalance },
//                         TOTALDEBIT: { $t: ledgerData.totalDebit },
//                         TOTALCREDIT: { $t: ledgerData.totalCredit },
//                         HISTORY: ledgerData.history.map(h => ({
//                             DATE: { $t: h.date },
//                             PARTICULARS: { $t: h.vouchertype },  // you can adjust
//                             VOUCHERNUMBER: { $t: h.vouchernumber },
//                             TYPE: { $t: h.type },
//                             AMOUNT: { $t: h.amount },
//                             VOUCHERTYPE: { $t: h.vouchertype }
//                         }))
//                      }];console.log(newrawdata,'====newrawdata')
//  if (newrawdata.length > 0) {
//                                             var filterLedger = [{
//                         LEDGERCODE: { $t: customerID },
//                         OPENINGBALANCE: { $t: ledgerData.openingBalance },
//                         CLOSINGBALANCE: { $t: ledgerData.outstandingBalance },
//                         TOTALDEBIT: { $t: ledgerData.totalDebit },
//                         TOTALCREDIT: { $t: ledgerData.totalCredit },
//                         HISTORY: ledgerData.history.map(h => ({
//                             DATE: { $t: h.date },
//                             PARTICULARS: { $t: h.vouchertype },
//                             VOUCHERNUMBER: { $t: h.vouchernumber },
//                             TYPE: { $t: h.type },
//                             AMOUNT: { $t: h.amount },
//                             VOUCHERTYPE: { $t: h.vouchertype }
//                         }))
//                         }];

//                         console.log("filterLedger", filterLedger)

//                         // console.log("filterLedger", filterLedger[0].HISTORY[0])
//                         if (filterLedger.length > 0) {
//                             var ledgerHistory = filterLedger[0].HISTORY
//                             ledgerHistory = ledgerHistory == undefined ? [] : ledgerHistory
//                             var historyResult = []
//                             if (Array.isArray(ledgerHistory)) {
//                                 historyResult = ledgerHistory
//                                 // console.log("historyResult",historyResult)
//                             } else if (typeof ledgerHistory === 'object') {
//                                 historyResult.push(ledgerHistory)
//                             }
//                             // console.log("historyResult first2", historyResult)


//                             var resp = []
//                             if (historyResult.lenth != 0 &&
//                                 data.fromDate.length != 0 && data.toDate.length != 0) {
//                                 // console.log("historyResult", historyResult)
//                                 historyResult.forEach((val, ind) => {
//                                     var date = new Date(val.DATE.$t)
//                                     // console.log("date history", date)
//                                     var startDate = new Date(data.fromDate);
//                                     var toDate = new Date(data.toDate);
//                                     // console.log("date startDate", startDate)
//                                     // console.log("date toDate", toDate)

//                                     if (startDate.getTime() <= date.getTime() && toDate.getTime() >= date.getTime()) {
//                                         resp.push(val)
//                                     }
//                                 })
//                             } else {
//                                 resp = historyResult
//                             }

//                             // console.log("response", resp)

//                             var options = {
//                                 format: "A2",
//                                 orientation: "portrait",
//                                 // border: "10mm",
//                                 // header: {
//                                 //     height: "45mm",
//                                 //     // contents: '<div style="text-align: center;"><h1>Europet Products Pvt Ltd</h1></div>'
//                                 // },
//                                 // footer: {
//                                 //     height: "28mm",
//                                 //     contents: {
//                                 //         first: 'Cover page',
//                                 //         // 2: 'Second page', // Any page number is working. 1-based index
//                                 //         default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
//                                 //         last: 'Last Page'
//                                 //     }
//                                 // }
//                             };
//                             var ledgers = []
//                             resp.forEach((val, ind) => {
//                                 let obj = {}
//                                 let ledger_date = val.DATE.$t.length > 0 ? val.DATE.$t.split('-') : val.DATE.$t
//                                 obj.no = ind + 1
//                                 obj.date = ledger_date[1] + '-' + ledger_date[2] + '-' + ledger_date[0]
//                                 obj.particulars = val.PARTICULARS.$t
//                                 // obj.amount = val.AMOUNT.$t
//                                 obj.voucherNmber = val.VOUCHERNUMBER.$t
//                                 obj.credit = val.TYPE.$t == 'Credit' ? val.AMOUNT.$t : null
//                                 obj.debit = val.TYPE.$t == 'Debit' ? val.AMOUNT.$t : null
//                                 obj.voucherType = val.VOUCHERTYPE.$t
//                                 ledgers.push(obj)
//                             })
//                             // require('../../.././../../www')

//                            // var html = fs.readFileSync(path.resolve(__dirname, `../../.././../../www/${process.env.PDF_TEMPLATE}`), "utf8");
//                             var html = fs.readFileSync(path.resolve(__dirname, `../../../template/${process.env.PDF_TEMPLATE}`), "utf8");console.log(html,'[====html')
//                             var timestamp = (new Date).getTime().toString()

//                             var ledgerObj = {}
//                             ledgerObj.openingBalance = filterLedger[0].OPENINGBALANCE.$t
//                             ledgerObj.outstandingBalance = filterLedger[0].CLOSINGBALANCE.$t
//                             ledgerObj.totalDebit = filterLedger[0].TOTALDEBIT.$t
//                             ledgerObj.totalCredit = filterLedger[0].TOTALCREDIT.$t

//                             var shopAddress = findCustomer.data[0].shopAddress.length > 0 ? findCustomer.data[0].shopAddress.split(',')
//                                 : []
//                             // console.log("shopAddress", shopAddress)
//                             var output = [];
//                             for (var ind = 0; ind < shopAddress.length; ind++) {
//                                 //   console.log("ind", ind)
//                                 if (shopAddress[ind].length > 11) {
//                                     var temp = shopAddress[ind]
//                                     output.push(`${temp},`)
//                                 } else {
//                                     var k = shopAddress.length > ind + 1 ? shopAddress[ind] + ',' + shopAddress[ind + 1] : shopAddress[ind]
//                                     if (ind != shopAddress.length - 1) {
//                                         k = k + ','
//                                     }
//                                     output.push(k)
//                                     ind++;
//                                 }
//                             }

//                             var document = {
//                                 html: html,
//                                 data: {
//                                     ledgers: ledgers,
//                                     shopName: findCustomer.data[0].shopName,
//                                     shopAddress: output,
//                                     ledgerObj: ledgerObj
//                                 },
//                                 path: path.resolve(__dirname, `../../../uploads/UserLedger-${timestamp}.pdf`),
//                                 type: "",
//                             };
//                             // require('../../../../www/html/uploads')

//                             try {
//                                 var pdf_data = await pdf.create(document, options)
//                                 console.log("pdfResp", pdf_data)
//                                 var fileObj = Object.assign("", pdf_data)
//                                 var file_url = fileObj.filename.replace('/var/www/html/', "");
//                                 var fileData = {}
//                                 // fileData.file_path = path.resolve(__dirname, `../../../${file_url}`)
//                                  fileData.file_path = fileObj.filename 
//                                 fileData.fileName = fileObj.filename.replace('/var/www/html/uploads/', "");
//                                 fileData.type = 'temp_files'
                                
//                                 var s3PdfUpload = await uploadS3.S3_upload(fileData)
//                                  console.log(s3PdfUpload,'==fileData.fileName')
//                                 // console.log("s3PdfUpload", s3PdfUpload)
//                                 if (s3PdfUpload.error) {
//                                     console.log('s3PdfUpload error')
//                                     response.error = true
//                                     response.statusCode = STRINGS.errorStatusCode
//                                     response.message = STRINGS.commanErrorString
//                                 } else {
//                                     response.error = false
//                                     response.statusCode = STRINGS.successStatusCode
//                                     response.message = STRINGS.SuccessString
//                                     response.fileUrl = s3PdfUpload.data
//                                 }
//                             } catch (error) {
//                                 console.log('pdf error', error)
//                                 response.error = true
//                                 response.statusCode = STRINGS.errorStatusCode
//                                 response.message = STRINGS.commanErrorString
//                             }
//                             // console.log("history",response.history)
//                         } else {
//                             response.error = true
//                             response.statusCode = STRINGS.errorStatusCode
//                             response.message = "Ledger Is Empty"
//                         }
//                     } else {
//                         response.error = true
//                         response.statusCode = STRINGS.errorStatusCode
//                         response.message = "Ledger Is Empty"
//                     }

//                 }
//             } catch (e) {
//                 if (e.code === 'ENOENT') {
//                     console.error('File not found!', e);
//                     response.error = true
//                     response.statusCode = STRINGS.errorStatusCode
//                     response.message = "Ledger File Not Found"
//                   } else {
//                     console.error('An error occurred:', e);
//                     response.error = true
//                     response.statusCode = STRINGS.errorStatusCode
//                     response.message = STRINGS.oopsErrorMessage
//                   }
//             }
//             callback(response)
//         }



       
       
       
     
        this.salesRepUserOldLedgersService = async (request, callback) => {
            try {
                var response = {}
                var data = {
                    shopId: request.body.shopId
                }
                var user_files = []

                var userOldLedgersModel = await salesRepShopOwnerModel.getOneUserForLedgerModel(data)
                data.customerID = userOldLedgersModel.data[0].customerID
                var userOldLedgersModel = await salesRepShopOwnerModel.userOldLedgersModel(data)


                if (userOldLedgersModel.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                } else {
                    userOldLedgersModel.data.forEach((val, ind) => {
                        user_files.push(val.fileUrl)
                    });
                    // console.log("user_files", user_files)
                    response.error = false
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.SuccessString
                    response.data = user_files
                }
            } catch (e) {
                console.log(e)
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
            }
            callback(response)
        }










        var adminsalesRepgetOrderByMonth = function (data) {
            var response = {}
            return new Promise(async function (resolve, reject) {

                var getAllOrders = await salesRepShopOwnerModel.getAllOrdersModel(data)
                // console.log("getAllOrders",getAllOrders)
                if (getAllOrders.error) {
                    response.error = true
                    reject(response)
                } else if (getAllOrders.data.length > 0) {
                    var pageCount = await utils.pageCount(getAllOrders.data.length, 10)
                    var getOrders = await salesRepShopOwnerModel.adminownerOrderByMonthModel(data)
                    // console.log("getOrders*****", getOrders)
                    if (getOrders.error) {
                        response.error = true
                        reject(response)
                    } else {
                        response.error = false
                        response.orders = getOrders.data
                        response.TotalOrdersPages = pageCount
                        resolve(response)
                    }
                } else {
                    response.error = false
                    response.orders = []
                    response.ordersPages = 0
                    resolve(response)
                }
            })
        }

        var adminsalesRepOrderGraphReport = function (data) {
            var response = {}
            return new Promise(async function (resolve, reject) {
                // if (data.startMonth.length == 0 || data.endMonth.length == 0) {
                //   data.startMonth = 1
                //   data.endMonth = 12
                // }
                // var start = parseInt(data.startMonth);
                // var end = parseInt(data.endMonth);
                // var monthList = [];
                // // console.log("req**", data)
                // for (var i = start; i <= end; i++) {
                //   monthList.push(i);
                // }
                data.monthType = 1
                if (data.monthType === '1') {
                    var monthList = [1, 2, 3, 4, 5, 6]
                } else {
                    var monthList = [7, 8, 9, 10, 11, 12]
                }
                var length = monthList.length
                var reportData = []
                const d = new Date();
                data.graphYear = d.getFullYear();
                if (data.graphYear.length == 0) {
                    data.graphYear = d.getFullYear();
                }
                data.year = data.graphYear
                monthList.forEach(async function (item) {
                    var object = {
                        ownerId: data.ownerId,
                        month: item,
                        year: data.year,
                        ownerId: data.ownerId,
                        salesRepId: data.salesRepId
                    }
                    var report = await salesRepShopOwnerModel.shopGraphReportModel(object)
                    var payment = await salesRepShopOwnerModel.noOfPaymentModel(object)
                    // console.log("reportData", report)
                    var reportObject = report.data[0]
                    if (payment.data.length > 0) {
                        reportObject.noOfPayment = payment.data[0].payment
                    } else {
                        reportObject.noOfPayment = 0
                    }
                    reportObject.month = item
                    reportData.push(reportObject)
                    if (--length === 0) {
                        reportData.sort(function (a, b) {
                            return a.month - b.month
                        })
                        response.error = false
                        response.data = reportData

                        resolve(response)
                    }
                })
            })
        }

        var salesRepShopLedger1 = async function (data) {
            var response = {}
            return new Promise(async function (resolve, reject) {
                try {
                    // console.log("ledger auth data", data.auth)
                    // var response = {}
                    var findCustomer = await salesRepShopOwnerModel.profileModel(data.ownerId)
                    // console.log("findCustomer", findCustomer)
                    if (findCustomer.error) {
                        response.error = true
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.commanErrorString
                        reject(response)
                    } else {
                        var customerID = findCustomer.data[0].customerID
                        // var customerID = 7563
                        // var customerID = 13


                        // console.log("file path ssss", path.resolve(__dirname))

                        var rawdata = fs.readFileSync(path.resolve(__dirname, `../../../../../www/html/${process.env.USER_LEDGER}`))

                        var ledgerData = JSON.parse(parser.toJson(rawdata, {
                            reversible: true
                        }));
                        var newrawdata = ledgerData['ENVELOPE']['LEDGERS']
                        if (newrawdata.length > 0) {

                            var filterLedger = newrawdata.filter(function (item) {
                                // console.log("datas",item)
                                return item.LEDGERCODE.$t == customerID
                            })
                            // console.log("filterLedger",filterLedger[0].HISTORY)
                            // console.log("filterLedger", filterLedger[0].HISTORY[0])
                            if (filterLedger.length > 0) {
                                var ledgerHistory = filterLedger[0].HISTORY
                                ledgerHistory = ledgerHistory == undefined ? [] : ledgerHistory
                                var historyResult = []
                                if (Array.isArray(ledgerHistory)) {
                                    historyResult = ledgerHistory
                                    // console.log("historyResult",historyResult)
                                } else if (typeof ledgerHistory === 'object') {
                                    historyResult.push(ledgerHistory)
                                }
                                console.log("historyResult first", historyResult)

                                var resp = []
                                if (historyResult.lenth != 0 &&
                                    data.fromDate.length != 0 && data.toDate.length != 0) {
                                    // console.log("historyResult", historyResult)
                                    historyResult.forEach((val, ind) => {
                                        var date = new Date(val.DATE.$t)
                                        // console.log("date history", date)
                                        var startDate = new Date(data.fromDate);
                                        var toDate = new Date(data.toDate);
                                        // console.log("date startDate", startDate)
                                        // console.log("date toDate", toDate)

                                        var mnth = date.getMonth() + 1
                                        var year = date.getFullYear()
                                        var startMonth = startDate.getMonth() + 1
                                        var startYear = startDate.getFullYear()
                                        var endMonth = toDate.getMonth() + 1
                                        var endYear = toDate.getFullYear()
                                        // console.log("date month year", mnth, startMonth, year, endMonth)
                                        // if (startYear <= year && endYear >= year) {
                                        // if (mnth <= startMonth && mnth >= endMonth) {
                                        if (startDate.getTime() <= date.getTime() && toDate.getTime() >= date.getTime()) {
                                            resp.push(val)
                                        }
                                        // console.log("values",val)
                                        // }
                                        // }
                                    })
                                } else {
                                    resp = historyResult
                                }
                                var pageCount = 0
                                if (resp.length > 0) {
                                    var pageCount = await utils.pageCount(resp.length, 10);
                                    // data.paymentPage = 1
                                    var pageNumber = data.pageNumber;
                                    // console.log("response",resp)

                                    if (pageNumber == '0') {
                                        pageNumber = 0
                                    } else {
                                        pageNumber = pageNumber - 1
                                    }
                                    var limit = 10
                                    resp = resp.slice(pageNumber * limit, limit * parseInt(data.pageNumber))
                                } else {
                                    resp = []
                                }
                                // console.log("response", resp)

                                response.error = false
                                response.statusCode = STRINGS.successStatusCode
                                response.message = STRINGS.SuccessString
                                response.openingBalance = filterLedger[0].OPENINGBALANCE.$t
                                response.outstandingBalance = filterLedger[0].CLOSINGBALANCE.$t
                                response.totalDebit = filterLedger[0].TOTALDEBIT.$t
                                response.totalCredit = filterLedger[0].TOTALCREDIT.$t
                                response.TotalPages = pageCount
                                response.history = resp
                                // console.log("history",response.history)
                                resolve(response)
                            } else {
                                response.error = false
                                response.statusCode = STRINGS.successStatusCode
                                response.message = STRINGS.SuccessString
                                response.openingBalance = "0"
                                response.outstandingBalance = "0"
                                response.totalDebit = "0"
                                response.totalCredit = "0"
                                response.TotalPages = "0"
                                response.history = []
                                resolve(response)
                            }
                        } else {
                            response.error = false
                            response.statusCode = STRINGS.successStatusCode
                            response.message = STRINGS.SuccessString
                            response.openingBalance = "0"
                            response.outstandingBalance = "0"
                            response.totalDebit = "0"
                            response.totalCredit = "0"
                            response.TotalPages = "0"
                            response.history = []
                            resolve(response)
                        }
                    }
                } catch (e) {
                    if (e.code === 'ENOENT') {
                        console.error('File not found!', e);
                        response.error = true
                        response.statusCode = STRINGS.errorStatusCode
                        response.message = "Ledger File Not Found"
                      } else {
                        console.error('An error occurred:', e);
                        response.error = true
                        response.statusCode = STRINGS.errorStatusCode
                        response.message = STRINGS.oopsErrorMessage
                      }
                    reject(response)
                }
            })

        }




        var salesRepgetOrderByMonth = function (data) {
            var response = {}
            return new Promise(async function (resolve, reject) {
                var getOrders = await salesRepShopOwnerModel.ownerOrderByMonthModel(data)
                if (getOrders.error) {
                    response.error = true
                    reject(response)
                } else {
                    response.error = false
                    response.orders = getOrders.data
                    resolve(response)
                }
            })
        }



        var salesRepOrderGraphReport = function (data) {
            var response = {}
            return new Promise(async function (resolve, reject) {
                var start = parseInt(data.startMonth);
                var end = parseInt(data.endMonth);
                var monthList = [];
                // console.log("req**",data)
                for (var i = start; i <= end; i++) {
                    monthList.push(i);
                }
                // console.log("MonthList", monthList)
                // if(data.monthType === '1'){
                //   var monthList = [1, 2, 3, 4, 5, 6]
                // } else {
                //   var monthList = [7, 8, 9, 10, 11, 12]
                // }
                var length = monthList.length
                var reportData = []
                if (length > 0) {
                    monthList.forEach(async function (item) {
                        var object = {
                            ownerId: data.ownerId,
                            month: item,
                            year: data.year,
                            ownerId: data.ownerId,
                            salesRepId: data.auth.id
                        }
                        var report = await salesRepShopOwnerModel.shopGraphReportModel(object)
                        var payment = await salesRepShopOwnerModel.noOfPaymentModel(object)
                        var reportObject = report.data[0]
                        if (payment.data.length > 0) {
                            reportObject.noOfPayment = payment.data[0].payment
                        } else {
                            reportObject.noOfPayment = 0
                        }
                        reportObject.month = item
                        reportData.push(reportObject)
                        if (--length === 0) {
                            reportData.sort(function (a, b) {
                                return a.month - b.month
                            })
                            response.error = false
                            response.data = reportData
                            resolve(response)
                        }
                    })
                } else {
                    response.error = false
                    response.data = []
                    resolve(response)
                }

            })
        }


        var salesRepShopLedger = async function (data) {
            var response = {}
            return new Promise(async function (resolve, reject) {
                try {
                    console.log("ledger auth data", data.auth)
                    // var response = {}
                    var findCustomer = await salesRepShopOwnerModel.profileModel(data.ownerId)
                    // console.log("findCustomer", findCustomer)
                    if (findCustomer.error) {
                        response.error = true
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.commanErrorString
                        reject(response)
                    } else {
                        var customerID = findCustomer.data[0].customerID
                        // var customerID = 13


                        // require('../../../../../www/html')

                        var rawdata = fs.readFileSync(path.resolve(__dirname, `../../../../../www/html/${process.env.USER_LEDGER}`))

                        // console.log("file path ssss", path.resolve(__dirname, `../../../../../www/html/${process.env.USER_LEDGER}`))


                        var ledgerData = JSON.parse(parser.toJson(rawdata, {
                            reversible: true
                        }));
                        var newrawdata = ledgerData['ENVELOPE']['LEDGERS']
                        console.log("newrawdata", newrawdata)
                        if (newrawdata.length > 0) {

                            var filterLedger = newrawdata.filter(function (item) {
                                // console.log("datas",item)
                                return item.LEDGERCODE.$t == customerID
                            })
                            // console.log("filterLedger", filterLedger)

                            // console.log("filterLedger", filterLedger[0].HISTORY[0])
                            if (filterLedger.length > 0) {
                                var ledgerHistory = filterLedger[0].HISTORY
                                ledgerHistory = ledgerHistory == undefined ? [] : ledgerHistory
                                var historyResult = []
                                if (Array.isArray(ledgerHistory)) {
                                    historyResult = ledgerHistory
                                    // console.log("historyResult",historyResult)
                                } else if (typeof ledgerHistory === 'object') {
                                    historyResult.push(ledgerHistory)
                                }
                                console.log("historyResult first", historyResult)


                                var resp = []
                                if (historyResult.lenth != 0 &&
                                    data.fromDate.length != 0 && data.toDate.length != 0) {
                                    // console.log("historyResult", historyResult)
                                    historyResult.forEach((val, ind) => {
                                        var date = new Date(val.DATE.$t)
                                        // console.log("date history", date)
                                        var startDate = new Date(data.fromDate);
                                        var toDate = new Date(data.toDate);
                                        // console.log("date startDate", startDate)
                                        // console.log("date toDate", toDate)

                                        var mnth = date.getMonth() + 1
                                        var year = date.getFullYear()
                                        var startMonth = startDate.getMonth() + 1
                                        var startYear = startDate.getFullYear()
                                        var endMonth = toDate.getMonth() + 1
                                        var endYear = toDate.getFullYear()
                                        // console.log("date month year", mnth, startMonth, year, endMonth)
                                        // if (startYear <= year && endYear >= year) {
                                        // if (mnth <= startMonth && mnth >= endMonth) {
                                        if (startDate.getTime() <= date.getTime() && toDate.getTime() >= date.getTime()) {
                                            resp.push(val)
                                        }
                                        // console.log("values",val)
                                        // }
                                        // }
                                    })
                                } else {
                                    resp = historyResult
                                }
                                // if (resp.length > 0) {
                                //     var pageCount = await utils.pageCount(resp.length, 20);
                                //     data.paymentPage = 1
                                //     var pageNumber = data.paymentPage;
                                //     // console.log("response",resp)

                                //     if (pageNumber == '0') {
                                //         pageNumber = 0
                                //     } else {
                                //         pageNumber = pageNumber - 1
                                //     }
                                //     var limit = 20
                                //     resp = resp.slice(pageNumber * limit, limit * parseInt(data.paymentPage))
                                // } else {
                                //     resp = []
                                // }
                                // console.log("response", resp)

                                response.error = false
                                response.statusCode = STRINGS.successStatusCode
                                response.message = STRINGS.SuccessString
                                response.openingBalance = filterLedger[0].OPENINGBALANCE.$t
                                response.outstandingBalance = filterLedger[0].CLOSINGBALANCE.$t.toString()
                                response.totalDebit = filterLedger[0].TOTALDEBIT.$t
                                response.totalCredit = filterLedger[0].TOTALCREDIT.$t
                                // response.paymentPages = pageCount
                                response.history = resp
                                // console.log("history",response.history)
                                resolve(response)
                            } else {
                                response.error = false
                                response.statusCode = STRINGS.successStatusCode
                                response.message = STRINGS.SuccessString
                                response.openingBalance = "0"
                                response.outstandingBalance = "0"
                                response.totalDebit = "0"
                                response.totalCredit = "0"
                                response.history = []
                                resolve(response)
                            }
                        } else {
                            response.error = false
                            response.statusCode = STRINGS.successStatusCode
                            response.message = STRINGS.SuccessString
                            response.openingBalance = "0"
                            response.outstandingBalance = "0"
                            response.totalDebit = "0"
                            response.totalCredit = "0"
                            response.history = []
                            resolve(response)
                        }
                    }
                } catch (e) {
                    if (e.code === 'ENOENT') {
                        // console.error('File not found!', e);
                        response.error = true
                        response.statusCode = STRINGS.errorStatusCode
                        response.message = "Ledger File Not Found"
                      } else {
                        console.error('An error occurred:', e);
                        response.error = true
                        response.statusCode = STRINGS.errorStatusCode
                        response.message = STRINGS.oopsErrorMessage
                      }
                    reject(response)
                }
            })

        }



        var salesRepShopPendingPaymentLedger = async function (data) {
            var response = {}
            return new Promise(async function (resolve, reject) {
                try {
                    console.log("ledger auth data", data.auth)
                    // var response = {}
                    var findCustomer = await salesRepShopOwnerModel.profileModel(data.shopId)
                    // console.log("findCustomer", findCustomer)
                    if (findCustomer.error) {
                        response.error = true
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.commanErrorString
                        reject(response)
                    } else {
                        var customerID = findCustomer.data[0].customerID
                        // var customerID = 13


                        // require('../../../../../www/html')

                        var rawdata = fs.readFileSync(path.resolve(__dirname, `../../../../../www/html/${process.env.PENDING_LEDGER_FILE}`))

                        // console.log("file path ssss", path.resolve(__dirname, `../../../../../www/html/${process.env.USER_LEDGER}`))


                        var ledgerData = JSON.parse(parser.toJson(rawdata, {
                            reversible: true
                        }));
                        var newrawdata = ledgerData['ENVELOPE']['LEDGERS']
                        // console.log("newrawdata", newrawdata)
                        if (newrawdata.length > 0) {

                            var filterLedger = newrawdata.filter(function (item) {
                                // console.log("datas",item)
                                return item.LEDGERCODE.$t == customerID
                            })
                            console.log("filterLedger", filterLedger)

                            // console.log("filterLedger", filterLedger[0].HISTORY[0])
                            if (filterLedger.length > 0) {
                                var ledgerHistory = filterLedger[0].HISTORY
                                ledgerHistory = ledgerHistory == undefined ? [] : ledgerHistory
                                var historyResult = []
                                if (Array.isArray(ledgerHistory)) {
                                    historyResult = ledgerHistory
                                    // console.log("historyResult",historyResult)
                                } else if (typeof ledgerHistory === 'object') {
                                    historyResult.push(ledgerHistory)
                                }
                                // console.log("historyResult first", historyResult)


                                var resp = []


                                historyResult.forEach(val => {

                                    let obj = {}
                                    obj.date = val.DATE['$t']
                                    obj.refNumer = val.VOUCHERNUMBER['$t']
                                    obj.pendingAmount = val.CLOSINGBALANCE['$t']
                                    resp.push(obj)
                                })

                                response.error = false
                                response.statusCode = STRINGS.successStatusCode
                                response.message = STRINGS.SuccessString
                                // response.openingBalance = filterLedger[0].TOTALOPENING.$t
                                // response.outstandingBalance = filterLedger[0].TOTALPENDING.$t.toString()
                                response.openingBalance = '0';
                                response.outstandingBalance = '0';
                                
                                // Check if TOTALOPENING is defined and not empty
                                if (filterLedger[0].TOTALOPENING && filterLedger[0].TOTALOPENING.$t) {
                                    response.openingBalance = filterLedger[0].TOTALOPENING.$t;
                                }
                                
                                // Check if TOTALPENDING is defined and not empty
                                if (filterLedger[0].TOTALPENDING && filterLedger[0].TOTALPENDING.$t) {
                                    response.outstandingBalance = filterLedger[0].TOTALPENDING.$t.toString();
                                }
                                // response.paymentPages = pageCount
                                response.history = resp
                                // console.log("history",response.history)
                                resolve(response)
                            } else {
                                response.error = false
                                response.statusCode = STRINGS.successStatusCode
                                response.message = STRINGS.SuccessString
                                response.openingBalance = "0"
                                response.outstandingBalance = "0"
                                response.history = []
                                resolve(response)
                            }
                        } else {
                            response.error = false
                            response.statusCode = STRINGS.successStatusCode
                            response.message = STRINGS.SuccessString
                            response.openingBalance = "0"
                            response.outstandingBalance = "0"
                            response.history = []
                            resolve(response)
                        }
                    }
                } catch (e) {
                    if (e.code === 'ENOENT') {
                        console.error('File not found!', e);
                        response.error = true
                        response.statusCode = STRINGS.errorStatusCode
                        response.message = "Ledger File Not Found"
                      } else {
                        console.error('An error occurred:', e);
                        response.error = true
                        response.statusCode = STRINGS.errorStatusCode
                        response.message = STRINGS.oopsErrorMessage
                      }
                    reject(response)
                }
            })

        }









        var orderListStatusService = function (data, value) {
            var response = {}
            return new Promise(async function (resolve, reject) {
                var totalOrders = await salesRepShopOwnerModel.totalAllOrdersModel(data, value)
                if (totalOrders.error) {
                    response.error = true
                    reject(response)
                } else {
                    if (totalOrders.data.length) {
                        data.pageCount = 10
                        var pageCount = await utils.pageCount(totalOrders.data.length, 10)
                        var result = await salesRepShopOwnerModel.listOrderStatusModel(data, value)
                        if (result.error) {
                            response.error = true
                            reject(response)
                        } else {
                            response.pages = pageCount
                            response.data = result.data
                            resolve(response)
                        }
                    } else {
                        response.pages = 0
                        response.data = totalOrders.data
                        resolve(response)
                    }
                }
            })
        }


        var totalComplaintCountService = function (request) {
            var response = {}
            return new Promise(async function (resolve, reject) {
                // var getOrders = await salesRepShopOwnerModel.getOrderIdsModel(request)
                // console.log("getOrders", getOrders)
                // if (getOrders.data) {
                //     var ids = getOrders.data.length > 0 ? getOrders.data.map(data => data.id) : [-1, -2];
                // } else
                //     var ids = [];
                var totalComplaint = await salesRepShopOwnerModel.totalComplaintCountModel(request)
                console.log("totalComplaint", totalComplaint)
                if (totalComplaint.error) {
                    response.error = true
                    reject(response)
                } else {
                    response.error = false;
                    response.result = totalComplaint.data
                    resolve(response)
                }

            })
        }



        this.salesRepClearAllCartProductService = async (request, callback) => {
            try {
                var response = {}
                var params = request.body
                // console.log("request auth ", params.auth)



                request.body.salesRepId = params.auth.id
                // console.log("request.body.user_id ", request.body.user_id)
                var userClearAllCartProductsModel = await salesRepShopOwnerModel.salesRepClearAllCartProductsModel(request)
                // var updateUserDepotModel = {}
                let removeInstructions = await salesRepShopOwnerModel.removeInstructions(request.body.salesRepId)

                // updateUserDepotModel.error = false
                if (userClearAllCartProductsModel.error) {
                    response.error = true
                    response.statusCode = STRINGS.errorStatusCode
                    response.message = STRINGS.commanErrorString
                    callback(response)
                } else {
                    response.error = false
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.SuccessString
                    // response.result = 
                    callback(response)
                }

            } catch (e) {
                console.log(e)
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
                callback(response)
            }
        }










    }
}



export default SalesRepShopOwnerService;
