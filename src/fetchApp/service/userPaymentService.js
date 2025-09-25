'use strict';

import UserPaymentModel from '../models/userPaymentModel'
import PaymentGateWay from '../../../config/payment.gateway.config'
import NotificationsService from '../../../utils/notificationsService'
import SmsTemplates from '../../../smsTemplates'
import UploadS3 from '../../../config/s3.upload'

import STRINGS from '../../../strings.json'


require('dotenv').config();
const userPaymentModel = new UserPaymentModel
const paymentGatewayConfig = new PaymentGateWay
const notificationsService = new NotificationsService
const smsTemplates = new SmsTemplates
const uploadS3 = new UploadS3




class UserPaymentService {
    constructor() {


        this.createOrderPaymentsService = async (request, callback) => {
            try {
                var response = {}
                if (request.body.type == 'order') {
                    var getOneOrderDetailsModel = await userPaymentModel.getOneOrderDetailsModel(request.body)
                    // console.log("getOneOrderDetailsModel", getOneOrderDetailsModel.data)
                    if (getOneOrderDetailsModel.error) {
                        response.error = true
                        response.statusCode = STRINGS.errorStatusCode
                        response.message = STRINGS.commanErrorString
                        callback(response)
                    } else if (getOneOrderDetailsModel.data.length == 0 || getOneOrderDetailsModel.data[0].id == null) {
                        response.error = true
                        response.statusCode = STRINGS.errorStatusCode
                        response.message = "Invalid Order"
                        callback(response)
                    } else {
                        let data = {
                            orderId: request.body.orderId,
                            totalAmount: getOneOrderDetailsModel.data[0].balanceAmount,
                            customerId: getOneOrderDetailsModel.data[0].customerID,
                            email: getOneOrderDetailsModel.data[0].email,
                            mobileNumber: getOneOrderDetailsModel.data[0].mobileNumber,
                            name: getOneOrderDetailsModel.data[0].shopName,
                            type: request.body.type,
                            orderStatus: getOneOrderDetailsModel.data[0].orderStatus,
                            userId: `${getOneOrderDetailsModel.data[0].cartUserId}`
                        }
                        var createOrderPayment = await paymentGatewayConfig.createOrder(data)

                        if (createOrderPayment.error) {
                            response.error = true
                            response.statusCode = STRINGS.errorStatusCode
                            response.message = STRINGS.commanErrorString
                            callback(response)
                        } else {
                            response.error = false
                            response.statusCode = STRINGS.successStatusCode
                            response.message = STRINGS.SuccessString
                            response.data = createOrderPayment.data
                            callback(response)
                        }
                    }
                } else if (request.body.type == 'payment') {
                    var getOnePaymentOrderDetailsModel = await userPaymentModel.getOnePaymentOrderDetailsModel(request.body)
                    console.log("getOnePaymentOrderDetailsModel", getOnePaymentOrderDetailsModel.data)
                    if (getOnePaymentOrderDetailsModel.error) {
                        response.error = true
                        response.statusCode = STRINGS.errorStatusCode
                        response.message = STRINGS.commanErrorString
                        callback(response)
                    } else if (getOnePaymentOrderDetailsModel.data.length == 0) {
                        response.error = true
                        response.statusCode = STRINGS.errorStatusCode
                        response.message = "Invalid Order"
                        callback(response)
                    } else {
                        let data = {
                            orderId: request.body.orderId,
                            totalAmount: getOnePaymentOrderDetailsModel.data[0].requestAmount,
                            customerId: getOnePaymentOrderDetailsModel.data[0].customerID,
                            email: getOnePaymentOrderDetailsModel.data[0].email,
                            mobileNumber: getOnePaymentOrderDetailsModel.data[0].mobileNumber,
                            name: getOnePaymentOrderDetailsModel.data[0].shopName,
                            type: request.body.type,
                            orderStatus: 'PENDING'
                        }
                        var createOrderPayment = await paymentGatewayConfig.createOrder(data)

                        if (createOrderPayment.error) {
                            response.error = true
                            response.statusCode = STRINGS.errorStatusCode
                            response.message = STRINGS.commanErrorString
                            callback(response)
                        } else {
                            response.error = false
                            response.statusCode = STRINGS.successStatusCode
                            response.message = STRINGS.SuccessString
                            response.data = createOrderPayment.data
                            callback(response)
                        }
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

        this.getOnePaymentStatusService = async (request, callback) => {
            try {
                var response = {}
                let data = {
                    orderId: request.body.orderId,
                }
                var getOnePaymentStatus = await paymentGatewayConfig.getorderStatus(data)

                if (getOnePaymentStatus.error) {
                    response.error = true
                    response.statusCode = STRINGS.errorStatusCode
                    response.message = STRINGS.commanErrorString
                    callback(response)
                } else {
                    let paymentData = getOnePaymentStatus.data
                    let bookingId = paymentData.order_tags.order_id == undefined ? null : paymentData.order_tags.order_id
                    let orderObj = {
                        bookingId: bookingId
                    }
                    console.log("orderObj", orderObj)
                    var getOneOrderDetailForPdf = await userPaymentModel.getOneOrderDetailForPdf(orderObj)
                    console.log("getOnePaymentStatus", getOneOrderDetailForPdf)
                    let orderItemspdfLink = getOneOrderDetailForPdf.data.length > 0 ? getOneOrderDetailForPdf.data[0].orderItemsPdf : ''
                    let orderTableStatus = getOneOrderDetailForPdf.data.length > 0 ? getOneOrderDetailForPdf.data[0].orderStatus : 'PENDING'

                    if (getOnePaymentStatus.data.order_status == 'FAILED' && orderTableStatus == 'PENDING' ||
                        getOnePaymentStatus.data.order_status == 'ACTIVE' && orderTableStatus == 'PENDING') {

                        if (orderItemspdfLink.length > 0) {
                            var orderObject = {
                                onlinePaid: 1,
                                paymentStatus: 'INCOMPLETE',
                                bookingId: getOnePaymentStatus.data.order_tags.order_id
                            }

                            var updateOneOrderDetailsModel = await userPaymentModel.updateOneFailedOrderDetailsModel(orderObject)
                            console.log("updateOneOrderDetailsModel", updateOneOrderDetailsModel)

                            var fileData = {}
                            fileData.fileName = orderItemspdfLink.replace('https://europetuploads.s3.ap-south-1.amazonaws.com/', "");
                            console.log("fileData", fileData)
                            var s3PdfUpload = await uploadS3.S3_deleteOneFile(fileData)
                            console.log("s3PdfUpload", s3PdfUpload)
                        }
                    }

                    response.error = false
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.SuccessString
                    response.orderItemsPDfLink = orderItemspdfLink
                    response.data = getOnePaymentStatus.data
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


        this.getPaymentPayloadWebhookService = async (request, callback) => {
            try {
                var response = {}
                console.log("Payload", request.body)
                var payload = request.body
                var localTime = new Date().toLocaleString(undefined, { timeZone: 'Asia/Kolkata' });


                if (payload.type == 'PAYMENT_SUCCESS_WEBHOOK') {
                    console.log("order", payload.data.order.order_tags)

                    var payment_details = {}
                    payment_details.orderId = payload.data.order.order_tags.order_id
                    payment_details.customerId = payload.data.customer_details.customer_id
                    payment_details.customerMobile = payload.data.customer_details.customer_phone
                    payment_details.orderType = payload.data.order.order_tags.type
                    payment_details.paymentTypeId = 3
                    payment_details.orderAmount = payload.data.order.order_amount
                    payment_details.orderCurrency = payload.data.order.order_currency
                    payment_details.paymentStatus = 'SUCCESS'
                    payment_details.onlinePaid = 1
                    payment_details.paymentDetails = JSON.stringify(payload.data.payment)
                    // payment_details.paymentDetails = payload.data.payment
                    console.log("payment_details", payment_details)

                    var insertOnePaymentsDetailsModel = await userPaymentModel.insertOnePaymentsDetailsModel(payment_details)
                    if (insertOnePaymentsDetailsModel.error) {
                        console.log("insertOnePaymentsDetailsModel error", insertOnePaymentsDetailsModel)
                        response.error = true
                        response.statusCode = STRINGS.errorStatusCode
                        response.message = STRINGS.commanErrorString
                    }


                    if (payload.data.order.order_tags.type == 'order') {
                        var orderObject = {
                            onlinePaid: 1,
                            paymentStatus: 'COMPLETE',
                            bookingId: payload.data.order.order_tags.order_id
                        }
                        console.log("payload.data.order.order_tags", payload.data.order.order_tags)
                        if (payload.data.order.order_tags.orderStatus == 'PENDING') {
                            orderObject.orderStatus = 'WAITING'
                        } else if (payload.data.order.order_tags.orderStatus == 'DELIVERED') {
                            orderObject.orderStatus = 'PAID'
                            orderObject.balanceAmount = 0.0
                        }

                        var updateOneOrderDetailsModel = await userPaymentModel.updateOneOrderDetailsModel(orderObject)
                        console.log("getOneOrderDetailsModel", updateOneOrderDetailsModel)
                        if (updateOneOrderDetailsModel.error) {
                            response.error = true
                            response.statusCode = STRINGS.errorStatusCode
                            response.message = STRINGS.commanErrorString
                            return callback(response)
                        } else {
                            if (payload.data.order.order_tags.orderStatus != 'DELIVERED') {

                                var clearCartForPaymentModel = await userPaymentModel.clearCartForPaymentModel(payload.data.order.order_tags)
                                if (clearCartForPaymentModel.error) {
                                    response.error = true
                                    response.statusCode = STRINGS.errorStatusCode
                                    response.message = STRINGS.commanErrorString
                                    console.log("clearCartForPaymentModel error", clearCartForPaymentModel)
                                }

                                var profile = await userPaymentModel.profileModel(payload.data.customer_details.customer_id)
                                let obj2 = {
                                    bookingId: payload.data.order.order_tags.order_id
                                }
                                var getOneOrderDetailModel = await userPaymentModel.getOneOrderDetailForPdf(obj2)


                                let orderTimeHours = new Date(localTime).getHours()
                                let orderTimeMin = new Date(localTime).getMinutes()

                                let salesRepIdsData = []
                                let secondarySalesRepIds = JSON.parse(profile.data[0].secondarySalesRepIds)
                                let teitiarySalesRepIds = JSON.parse(profile.data[0].tertiarySalesRepIds)

                                if (profile.data[0].primarySalesRepId != null || profile.data[0].primarySalesRepId != undefined) {
                                    salesRepIdsData.push(profile.data[0].primarySalesRepId)
                                }
                                if (secondarySalesRepIds.length > 0) {
                                    salesRepIdsData = salesRepIdsData.concat(secondarySalesRepIds)
                                }
                                if (teitiarySalesRepIds.length > 0) {
                                    salesRepIdsData = salesRepIdsData.concat(teitiarySalesRepIds)
                                }

                                // let salesRepIdsData = profile.data[0].salesRepIds == undefined || null ? [] : JSON.parse(profile.data[0].salesRepIds)
                                console.log("salesRepIdsData", salesRepIdsData)


                                let notificationObject1 = {}
                                // notificationObject.id = "56"
                                notificationObject1.orderId = payload.data.order.order_tags.order_id
                                // notificationObject.salesRepIds = JSON.stringify(salesRepIdsData)
                                notificationObject1.customerID = profile.data[0].customerID
                                // notificationObject.orderStatus = "ACCEPTED"
                                // notificationObject.notifyType =  "ACCEPTED"
                                notificationObject1.shopName = profile.data[0].shopName
                                notificationObject1.totalAmount = payload.data.order.order_amount.toFixed(1)
                                notificationObject1.orderTime = `${orderTimeHours}:${orderTimeMin}`
                                notificationsService.sendOwnerPlaceOrderPushNotification(notificationObject1, () => { })

                                let updateNotifications1 = {}
                                updateNotifications1.orderId = getOneOrderDetailModel.data.length > 0 ? getOneOrderDetailModel.data : payload.data.order.order_tags.order_id
                                updateNotifications1.ownerId = profile.data[0].id
                                updateNotifications1.managerId = profile.data[0].id
                                updateNotifications1.salesRepId = ''
                                // updateNotifications1.bookingId = payload.data.order.order_tags.order_id
                                updateNotifications1.type = "ORDER PLACED"
                                updateNotifications1.notifyType = JSON.stringify(['US'])
                                updateNotifications1.notifyDate = new Date(localTime)
                                updateNotifications1.activeStatus = 1
                                updateNotifications1.color = '#aaffa9'
                                // updateNotifications.color ='#1FA2FF,#12D8FA,#A6FFCB'
                                updateNotifications1.notificationMsg = `<p style="font-size: 14px;">Fetch: You have placed an order for <b>${payload.data.order.order_amount.toFixed(1)}</b> at <b>${notificationObject1.orderTime}</b> with order ID <b>${payload.data.order.order_tags.order_id}</b></p>`
                                userPaymentModel.saveNotificationsModel(updateNotifications1, () => { })


                                var notificationObject = {}
                                // notificationObject.id = "56"
                                notificationObject.orderId = payload.data.order.order_tags.order_id
                                notificationObject.salesRepIds = JSON.stringify(salesRepIdsData)
                                notificationObject.customerID = payload.data.customer_details.customer_id
                                // notificationObject.orderStatus = "ACCEPTED"
                                // notificationObject.notifyType =  "ACCEPTED"
                                notificationObject.shopName = profile.data[0].shopName
                                notificationsService.sendPlaceOrderPushNotification(notificationObject, () => { })




                                let smsObj = {}
                                smsObj.mobileNumber = profile.data[0].mobileNumber
                                smsObj.totalAmount = payload.data.order.order_amount.toFixed(1)
                                smsObj.orderId = payload.data.order.order_tags.order_id
                                smsObj.orderTime = `${orderTimeHours}:${orderTimeMin}`
                                console.log("smsObj", smsObj)
                                var sendShopOwnerSms = await smsTemplates.shopOwnerPlaceOrderSmsForShopOwner(smsObj)
                                console.log("sendShopOwnerSms", sendShopOwnerSms)


                                // let salesRepIdsData = profile.data[0].salesRepIds == undefined || null ? [] : JSON.parse(profile.data[0].salesRepIds)
                                // console.log("salesRepIdsData", salesRepIdsData)

                                for (let j = 0; j < salesRepIdsData.length; j++) {


                                    var getOnesalesRepForSms = await userPaymentModel.getOnesalesRepForSms(salesRepIdsData[j])
                                    console.log("getOnesalesRepForSms", getOnesalesRepForSms)
                                    if (getOnesalesRepForSms.error == false) {

                                        if (getOnesalesRepForSms.data.length > 0) {
                                            var updateNotifications = {}
                                            updateNotifications.orderId = getOneOrderDetailModel.data.length > 0 ? getOneOrderDetailModel.data[0].id : payload.data.order.order_tags.order_id
                                            updateNotifications.ownerId = profile.data[0].id
                                            updateNotifications.managerId = profile.data[0].id
                                            updateNotifications.salesRepId = salesRepIdsData[j]
                                            updateNotifications.type = "ORDER PLACED"
                                            updateNotifications.notifyType = JSON.stringify(['SR'])
                                            updateNotifications.notifyDate = new Date(localTime)
                                            updateNotifications.activeStatus = 1
                                            updateNotifications.color = '#f7797d'
                                            updateNotifications.notificationMsg = `<p style="font-size: 14px;">Fetch: <b>${profile.data[0].shopName}</b> has placed an order for <b>${payload.data.order.order_amount.toFixed(1)}</b> at <b>${notificationObject1.orderTime}</b> with order ID <b>${updateNotifications.orderId}</b>.</p>`
                                            userPaymentModel.saveNotificationsModel(updateNotifications, () => { })



                                            let smsObj = {}
                                            smsObj.mobileNumber = getOnesalesRepForSms.data[0].mobile
                                            smsObj.totalAmount = payload.data.order.order_amount.toFixed(1)
                                            smsObj.orderId = payload.data.order.order_tags.order_id
                                            smsObj.orderTime = `${orderTimeHours}:${orderTimeMin}`
                                            smsObj.shopName = profile.data[0].shopName

                                            console.log("smsObj", smsObj)
                                            var sendShopOwnerSms = await smsTemplates.shopOwnerPlaceOrderSmsForSalesRep(smsObj)
                                            console.log("sendShopOwnerSms", sendShopOwnerSms)

                                        }
                                    }
                                }

                                response.error = false
                                response.statusCode = STRINGS.successStatusCode
                                response.message = STRINGS.SuccessString
                                response.data = payload
                                return callback(response)
                            } else {
                                var profile = await userPaymentModel.profileModel(payload.data.customer_details.customer_id)
                                let obj2 = {
                                    bookingId: payload.data.order.order_tags.order_id
                                }
                                var getOneOrderDetailModel = await userPaymentModel.getOneOrderDetailForPdf(obj2)


                                let orderTimeHours = new Date(localTime).getHours()
                                let orderTimeMin = new Date(localTime).getMinutes()

                                let salesRepIdsData = []
                                let secondarySalesRepIds = JSON.parse(profile.data[0].secondarySalesRepIds)
                                let teitiarySalesRepIds = JSON.parse(profile.data[0].tertiarySalesRepIds)

                                if (profile.data[0].primarySalesRepId != null || profile.data[0].primarySalesRepId != undefined) {
                                    salesRepIdsData.push(profile.data[0].primarySalesRepId)
                                }
                                if (secondarySalesRepIds.length > 0) {
                                    salesRepIdsData = salesRepIdsData.concat(secondarySalesRepIds)
                                }
                                if (teitiarySalesRepIds.length > 0) {
                                    salesRepIdsData = salesRepIdsData.concat(teitiarySalesRepIds)
                                }

                                // let salesRepIdsData = profile.data[0].salesRepIds == undefined || null ? [] : JSON.parse(profile.data[0].salesRepIds)
                                console.log("salesRepIdsData", salesRepIdsData)


                                let notificationObject1 = {}
                                // notificationObject.id = "56"
                                notificationObject1.orderId = payload.data.order.order_tags.order_id
                                // notificationObject.salesRepIds = JSON.stringify(salesRepIdsData)
                                notificationObject1.customerID = profile.data[0].customerID
                                // notificationObject.orderStatus = "ACCEPTED"
                                // notificationObject.notifyType =  "ACCEPTED"
                                notificationObject1.shopName = profile.data[0].shopName
                                notificationObject1.totalAmount = payload.data.order.order_amount.toFixed(1)
                                notificationObject1.orderTime = `${orderTimeHours}:${orderTimeMin}`
                                notificationsService.sendOwnerPaidPushNotification(notificationObject1, () => { })

                                let updateNotifications1 = {}
                                updateNotifications1.orderId = getOneOrderDetailModel.data.length > 0 ? getOneOrderDetailModel.data : payload.data.order.order_tags.order_id
                                updateNotifications1.ownerId = profile.data[0].id
                                updateNotifications1.managerId = profile.data[0].id
                                updateNotifications1.salesRepId = ''
                                updateNotifications1.bookingId = payload.data.order.order_tags.order_id
                                updateNotifications1.type = "PAID"
                                updateNotifications1.notifyType = JSON.stringify(['US'])
                                updateNotifications1.notifyDate = new Date(localTime)
                                updateNotifications1.activeStatus = 1
                                updateNotifications1.color = '#b5eee3'
                                // updateNotifications.color ='#1FA2FF,#12D8FA,#A6FFCB'
                                updateNotifications.notificationMsg = `<p style="font-size: 14px;">Fetch: The payment of Rs.<b>${notificationObject1.totalAmount}</b> paid by <b>Online Payment</b> for Order ID <b>${updateNotifications1.bookingId}</b> has been Marked as <b>Paid</b>.</p>`
                                userPaymentModel.saveNotificationsModel(updateNotifications1, () => { })


                                var notificationObject = {}
                                // notificationObject.id = "56"
                                notificationObject.orderId = payload.data.order.order_tags.order_id
                                notificationObject.salesRepIds = JSON.stringify(salesRepIdsData)
                                notificationObject.customerID = payload.data.customer_details.customer_id
                                // notificationObject.orderStatus = "ACCEPTED"
                                // notificationObject.notifyType =  "ACCEPTED"
                                notificationObject.shopName = profile.data[0].shopName
                                notificationsService.sendPlaceOrderPushNotification(notificationObject, () => { })




                                let smsObj = {}
                                smsObj.mobileNumber = profile.data[0].mobileNumber
                                smsObj.totalAmount = payload.data.order.order_amount.toFixed(1)
                                smsObj.orderId = payload.data.order.order_tags.order_id
                                smsObj.orderTime = `${orderTimeHours}:${orderTimeMin}`
                                console.log("smsObj", smsObj)
                                var sendShopOwnerSms = await smsTemplates.shopOwnerPlaceOrderSmsForShopOwner(smsObj)
                                console.log("sendShopOwnerSms", sendShopOwnerSms)


                                // let salesRepIdsData = profile.data[0].salesRepIds == undefined || null ? [] : JSON.parse(profile.data[0].salesRepIds)
                                // console.log("salesRepIdsData", salesRepIdsData)

                                for (let j = 0; j < salesRepIdsData.length; j++) {


                                    var getOnesalesRepForSms = await userPaymentModel.getOnesalesRepForSms(salesRepIdsData[j])
                                    console.log("getOnesalesRepForSms", getOnesalesRepForSms)
                                    if (getOnesalesRepForSms.error == false) {

                                        if (getOnesalesRepForSms.data.length > 0) {
                                            var updateNotifications = {}
                                            updateNotifications.orderId = getOneOrderDetailModel.data.length > 0 ? getOneOrderDetailModel.data[0].id : payload.data.order.order_tags.order_id
                                            updateNotifications.ownerId = profile.data[0].id
                                            updateNotifications.managerId = profile.data[0].id
                                            updateNotifications.salesRepId = salesRepIdsData[j]
                                            updateNotifications.type = "ORDER PLACED"
                                            updateNotifications.notifyType = JSON.stringify(['SR'])
                                            updateNotifications.notifyDate = new Date(localTime)
                                            updateNotifications.activeStatus = 1
                                            updateNotifications.color = '#f7797d'
                                            updateNotifications.notificationMsg = `<p style="font-size: 14px;">Fetch: <b>${profile.data[0].shopName}</b> has placed an order for <b>${payload.data.order.order_amount.toFixed(1)}</b> at <b>${notificationObject1.orderTime}</b> with order ID <b>${updateNotifications.orderId}</b>.</p>`
                                            userPaymentModel.saveNotificationsModel(updateNotifications, () => { })



                                            let smsObj = {}
                                            smsObj.mobileNumber = getOnesalesRepForSms.data[0].mobile
                                            smsObj.totalAmount = payload.data.order.order_amount.toFixed(1)
                                            smsObj.orderId = payload.data.order.order_tags.order_id
                                            smsObj.orderTime = `${orderTimeHours}:${orderTimeMin}`
                                            smsObj.shopName = profile.data[0].shopName

                                            console.log("smsObj", smsObj)
                                            var sendShopOwnerSms = await smsTemplates.shopOwnerPlaceOrderSmsForSalesRep(smsObj)
                                            console.log("sendShopOwnerSms", sendShopOwnerSms)

                                        }
                                    }
                                }
                            }

                        }



                    } else if (payload.data.order.order_tags.type == 'payment') {
                        var orderObject = {
                            onlinePaid: 1,
                            paymentStatus: 'COMPLETE',
                            id: payload.data.order.order_tags.order_id,
                            activeStatus: 1,
                            requestStatus: 'Accepted'
                        }

                        var updateOneOrderDetailsModel = await userPaymentModel.updateOnePaymentOrderDetailsModel(orderObject)
                        console.log("getOneOrderDetailsModel", updateOneOrderDetailsModel)
                        if (updateOneOrderDetailsModel.error) {
                            response.error = true
                            response.statusCode = STRINGS.errorStatusCode
                            response.message = STRINGS.commanErrorString
                            return callback(response)
                        } else {



                                var profile = await userPaymentModel.profileModel(payload.data.customer_details.customer_id)
                                // let obj2 = {
                                //     bookingId: payload.data.order.order_tags.order_id
                                // }


                                // let orderTimeHours = new Date(localTime).getHours()
                                // let orderTimeMin = new Date(localTime).getMinutes()

                                // let salesRepIdsData = []
                                // let secondarySalesRepIds = JSON.parse(profile.data[0].secondarySalesRepIds)
                                // let teitiarySalesRepIds = JSON.parse(profile.data[0].tertiarySalesRepIds)

                                // if (profile.data[0].primarySalesRepId != null || profile.data[0].primarySalesRepId != undefined) {
                                //     salesRepIdsData.push(profile.data[0].primarySalesRepId)
                                // }
                                // if (secondarySalesRepIds.length > 0) {
                                //     salesRepIdsData = salesRepIdsData.concat(secondarySalesRepIds)
                                // }
                                // if (teitiarySalesRepIds.length > 0) {
                                //     salesRepIdsData = salesRepIdsData.concat(teitiarySalesRepIds)
                                // }

                                // // let salesRepIdsData = profile.data[0].salesRepIds == undefined || null ? [] : JSON.parse(profile.data[0].salesRepIds)
                                // console.log("salesRepIdsData", salesRepIdsData)


                                // let notificationObject1 = {}
                                // // notificationObject.id = "56"
                                // notificationObject1.orderId = payload.data.order.order_tags.order_id
                                // // notificationObject.salesRepIds = JSON.stringify(salesRepIdsData)
                                // notificationObject1.customerID = profile.data[0].customerID
                                // // notificationObject.orderStatus = "ACCEPTED"
                                // // notificationObject.notifyType =  "ACCEPTED"
                                // notificationObject1.shopName = profile.data[0].shopName
                                // notificationObject1.totalAmount = payload.data.order.order_amount.toFixed(1)
                                // notificationObject1.orderTime = `${orderTimeHours}:${orderTimeMin}`
                                // notificationsService.sendOwnerPlaceOrderPushNotification(notificationObject1, () => { })

                                // let updateNotifications1 = {}
                                // updateNotifications1.orderId = getOneOrderDetailModel.data.length > 0 ? getOneOrderDetailModel.data : payload.data.order.order_tags.order_id
                                // updateNotifications1.ownerId = profile.data[0].id
                                // updateNotifications1.managerId = profile.data[0].id
                                // updateNotifications1.salesRepId = ''
                                // updateNotifications1.bookingId = payload.data.order.order_tags.order_id
                                // updateNotifications1.type = "ORDER PLACED"
                                // updateNotifications1.notifyType = JSON.stringify(['US'])
                                // updateNotifications1.notifyDate = new Date(localTime)
                                // updateNotifications1.activeStatus = 1
                                // updateNotifications1.color = '#aaffa9'
                                // // updateNotifications.color ='#1FA2FF,#12D8FA,#A6FFCB'
                                // updateNotifications1.notificationMsg = `<p style="font-size: 14px;">Fetch: You have placed an order for <b>${payload.data.order.order_amount.toFixed(1)}</b> at <b>${notificationObject1.orderTime}</b> with order ID <b>${payload.data.order.order_tags.order_id}</b></p>`
                                // userPaymentModel.saveNotificationsModel(updateNotifications1, () => { })


                                // var notificationObject = {}
                                // // notificationObject.id = "56"
                                // notificationObject.orderId = payload.data.order.order_tags.order_id
                                // notificationObject.salesRepIds = JSON.stringify(salesRepIdsData)
                                // notificationObject.customerID = payload.data.customer_details.customer_id
                                // // notificationObject.orderStatus = "ACCEPTED"
                                // // notificationObject.notifyType =  "ACCEPTED"
                                // notificationObject.shopName = profile.data[0].shopName
                                // notificationsService.sendPlaceOrderPushNotification(notificationObject, () => { })




                                // let smsObj = {}
                                // smsObj.mobileNumber = profile.data[0].mobileNumber
                                // smsObj.totalAmount = payload.data.order.order_amount.toFixed(1)
                                // smsObj.orderId = payload.data.order.order_tags.order_id
                                // smsObj.orderTime = `${orderTimeHours}:${orderTimeMin}`
                                // console.log("smsObj", smsObj)
                                // var sendShopOwnerSms = await smsTemplates.shopOwnerPlaceOrderSmsForShopOwner(smsObj)
                                // console.log("sendShopOwnerSms", sendShopOwnerSms)


                                // // let salesRepIdsData = profile.data[0].salesRepIds == undefined || null ? [] : JSON.parse(profile.data[0].salesRepIds)
                                // // console.log("salesRepIdsData", salesRepIdsData)

                                // for (let j = 0; j < salesRepIdsData.length; j++) {


                                //     var getOnesalesRepForSms = await userPaymentModel.getOnesalesRepForSms(salesRepIdsData[j])
                                //     console.log("getOnesalesRepForSms", getOnesalesRepForSms)
                                //     if (getOnesalesRepForSms.error == false) {

                                //         if (getOnesalesRepForSms.data.length > 0) {
                                //             var updateNotifications = {}
                                //             updateNotifications.orderId = getOneOrderDetailModel.data.length > 0 ? getOneOrderDetailModel.data[0].id : payload.data.order.order_tags.order_id
                                //             updateNotifications.ownerId = profile.data[0].id
                                //             updateNotifications.managerId = profile.data[0].id
                                //             updateNotifications.salesRepId = salesRepIdsData[j]
                                //             updateNotifications.type = "ORDER PLACED"
                                //             updateNotifications.notifyType = JSON.stringify(['SR'])
                                //             updateNotifications.notifyDate = new Date(localTime)
                                //             updateNotifications.activeStatus = 1
                                //             updateNotifications.color = '#f7797d'
                                //             updateNotifications.notificationMsg = `<p style="font-size: 14px;">Fetch: <b>${profile.data[0].shopName}</b> has placed an order for <b>${payload.data.order.order_amount.toFixed(1)}</b> at <b>${notificationObject1.orderTime}</b> with order ID <b>${updateNotifications.orderId}</b>.</p>`
                                //             userPaymentModel.saveNotificationsModel(updateNotifications, () => { })



                                //             let smsObj = {}
                                //             smsObj.mobileNumber = getOnesalesRepForSms.data[0].mobile
                                //             smsObj.totalAmount = payload.data.order.order_amount.toFixed(1)
                                //             smsObj.orderId = payload.data.order.order_tags.order_id
                                //             smsObj.orderTime = `${orderTimeHours}:${orderTimeMin}`
                                //             smsObj.shopName = profile.data[0].shopName

                                //             console.log("smsObj", smsObj)
                                //             var sendShopOwnerSms = await smsTemplates.shopOwnerPlaceOrderSmsForSalesRep(smsObj)
                                //             console.log("sendShopOwnerSms", sendShopOwnerSms)

                                //         }
                                //     }
                                // }

                               







                            response.error = false
                            response.statusCode = STRINGS.successStatusCode
                            response.message = STRINGS.SuccessString
                            response.data = payload
                            return callback(response)
                        }
                    }
                } else if (payload.type == 'PAYMENT_FAILED_WEBHOOK') {
                    console.log("order", payload.data.order.order_tags)

                    var payment_details = {}
                    payment_details.orderId = payload.data.order.order_tags.order_id
                    payment_details.customerId = payload.data.customer_details.customer_id
                    payment_details.customerMobile = payload.data.customer_details.customer_phone
                    payment_details.orderType = payload.data.order.order_tags.type
                    payment_details.paymentTypeId = 3
                    payment_details.orderAmount = payload.data.order.order_amount
                    payment_details.orderCurrency = payload.data.order.order_currency
                    payment_details.paymentStatus = 'FAILED'
                    payment_details.onlinePaid = 1
                    payment_details.paymentDetails = JSON.stringify(payload.data.payment)
                    // payment_details.paymentDetails = payload.data.payment



                    var insertOnePaymentsDetailsModel = await userPaymentModel.insertOnePaymentsDetailsModel(payment_details)
                    if (insertOnePaymentsDetailsModel.error) {
                        console.log("insertOnePaymentsDetailsModel error", insertOnePaymentsDetailsModel)
                        response.error = true
                        response.statusCode = STRINGS.errorStatusCode
                        response.message = STRINGS.commanErrorString
                    }



                    if (payload.data.order.order_tags.type == 'order') {
                        var orderObject = {
                            onlinePaid: 1,
                            paymentStatus: 'INCOMPLETE',
                            bookingId: payload.data.order.order_tags.order_id
                        }
                        // if (payload.data.order.order_tags.status == 'PENDING') {
                        //     orderObject.orderStatus = 'WAITING'
                        // }
                        var updateOneOrderDetailsModel = await userPaymentModel.updateOneOrderDetailsModel(orderObject)
                        console.log("updateOneOrderDetailsModel", updateOneOrderDetailsModel)
                        if (updateOneOrderDetailsModel.error) {
                            response.error = true
                            response.statusCode = STRINGS.errorStatusCode
                            response.message = STRINGS.commanErrorString
                            return callback(response)
                        } else {

                            var getOrderItemsModel = await userPaymentModel.getOrderItemsModel(orderObject)
                            console.log("getOrderItemsModel", getOrderItemsModel)

                            if (getOrderItemsModel.error) {
                                // console.log("getOrderItemsModel", getOrderItemsModel)

                                response.error = true
                                response.statusCode = STRINGS.errorStatusCode
                                response.message = STRINGS.commanErrorString
                                return callback(response)
                            }
                            if (getOrderItemsModel.data.length > 0) {

                                for (let i = 0; i < getOrderItemsModel.data.length; i++) {
                                    let orderItemsObj = {}
                                    orderItemsObj.productCode = getOrderItemsModel.data[0].orderProductId
                                    orderItemsObj.quantity = parseInt(getOrderItemsModel.data[0].quantity) + parseInt(getOrderItemsModel.data[0].freeQuantity)
                                    orderItemsObj.outletId = getOrderItemsModel.data[0].outletId

                                    var AddProductQuantityModel = await userPaymentModel.AddProductQuantityModel(orderItemsObj)
                                    if (AddProductQuantityModel.error) {
                                        console.log("AddProductQuantityModel", AddProductQuantityModel)
                                        response.error = true
                                        response.statusCode = STRINGS.errorStatusCode
                                        response.message = STRINGS.commanErrorString
                                        // return callback(response)
                                    }
                                }
                            }

                            var updateOneOrderDetailsModel = await userPaymentModel.updateOneFailedOrderDetailsModel(orderObject)


                            var fileData = {}
                            fileData.fileName = getOrderItemsModel.data[0].orderItemsPdf.replace('https://europetuploads.s3.ap-south-1.amazonaws.com/', "");
                            console.log("fileData", fileData)
                            var s3PdfUpload = await uploadS3.S3_deleteOneFile(fileData)
                            console.log("s3PdfUpload", s3PdfUpload)
                            let obj2 = {
                                bookingId: payload.data.order.order_tags.order_id
                            }
                            var getOneOrderDetailModel = await userPaymentModel.getOneOrderDetailForPdf(obj2)
                            let orderTimeHours = new Date(localTime).getHours()
                            let orderTimeMin = new Date(localTime).getMinutes()




                            if (payload.data.order.order_tags.orderStatus != 'DELIVERED') {
                                var profile = await userPaymentModel.profileModel(payload.data.customer_details.customer_id)

                                let notificationObject1 = {}
                                // notificationObject.id = "56"
                                notificationObject1.orderId = payload.data.order.order_tags.order_id
                                // notificationObject.salesRepIds = JSON.stringify(salesRepIdsData)
                                notificationObject1.customerID = profile.data[0].customerID
                                // notificationObject.orderStatus = "ACCEPTED"
                                // notificationObject.notifyType =  "ACCEPTED"
                                notificationObject1.shopName = profile.data[0].shopName
                                notificationObject1.totalAmount = payload.data.order.order_amount.toFixed(1)
                                notificationObject1.orderTime = `${orderTimeHours}:${orderTimeMin}`
                                notificationsService.sendOwnerPlaceOrderFailedPushNotification(notificationObject1, () => { })

                                let updateNotifications1 = {}
                                updateNotifications1.orderId = getOneOrderDetailModel.data.length > 0 ? getOneOrderDetailModel.data[0].id : payload.data.order.order_tags.order_id
                                updateNotifications1.ownerId = profile.data[0].id
                                updateNotifications1.managerId = profile.data[0].id
                                updateNotifications1.salesRepId = ''
                                updateNotifications1.type = "Payment Failed"
                                updateNotifications1.notifyType = JSON.stringify(['US'])
                                updateNotifications1.notifyDate = new Date(localTime)
                                updateNotifications1.activeStatus = 1
                                updateNotifications1.color = '#f7797d'
                                // updateNotifications.color ='#1FA2FF,#12D8FA,#A6FFCB'
                                updateNotifications1.notificationMsg = `<p style="font-size: 14px;">Fetch: OOPS!! We Regret to inform you that your Payment for Order ID <b>${payload.data.order.order_tags.order_id}</b> has Failed, Please verify your payment details or Try another Payment method.</p>`
                                userPaymentModel.saveNotificationsModel(updateNotifications1, () => { })




                                let smsObj = {}
                                smsObj.mobileNumber = profile.data[0].mobileNumber
                                smsObj.totalAmount = payload.data.order.order_amount.toFixed(1)
                                smsObj.orderId = payload.data.order.order_tags.order_id
                                smsObj.orderTime = `${orderTimeHours}:${orderTimeMin}`
                                console.log("smsObj", smsObj)
                                var sendShopOwnerSms = await smsTemplates.paymentFailedSms(smsObj)
                                console.log("sendShopOwnerSms", sendShopOwnerSms)

                            }




                            response.error = false
                            response.statusCode = STRINGS.successStatusCode
                            response.message = STRINGS.SuccessString
                            response.data = payload
                            return callback(response)
                        }
                    } else if (payload.data.order.order_tags.type == 'payment') {
                        var orderObject = {
                            onlinePaid: 1,
                            paymentStatus: 'INCOMPLETE',
                            id: payload.data.order.order_tags.order_id,
                            activeStatus: 0
                        }
                        var updateOneOrderDetailsModel = await userPaymentModel.updateOnePaymentOrderDetailsModel(orderObject)
                        console.log("getOneOrderDetailsModel", updateOneOrderDetailsModel)
                        if (updateOneOrderDetailsModel.error) {
                            response.error = true
                            response.statusCode = STRINGS.errorStatusCode
                            response.message = STRINGS.commanErrorString
                            return callback(response)
                        } else {













                            response.error = false
                            response.statusCode = STRINGS.successStatusCode
                            response.message = STRINGS.SuccessString
                            response.data = payload
                            return callback(response)
                        }
                    }
                } else if (payload.type == 'PAYMENT_USER_DROPPED_WEBHOOK') {
                    console.log("order", payload.data.order.order_tags)

                    var payment_details = {}
                    payment_details.orderId = payload.data.order.order_tags.order_id
                    payment_details.customerId = payload.data.customer_details.customer_id
                    payment_details.customerMobile = payload.data.customer_details.customer_phone
                    payment_details.orderType = payload.data.order.order_tags.type
                    payment_details.paymentTypeId = 3
                    payment_details.orderAmount = payload.data.order.order_amount
                    payment_details.orderCurrency = payload.data.order.order_currency
                    payment_details.paymentStatus = 'USER_DROPPED'
                    payment_details.onlinePaid = 1
                    payment_details.paymentDetails = JSON.stringify(payload.data.payment)
                    // payment_details.paymentDetails = payload.data.payment



                    var insertOnePaymentsDetailsModel = await userPaymentModel.insertOneUserDropedPaymentsDetailsModel(payment_details)
                    if (insertOnePaymentsDetailsModel.error) {
                        console.log("insertOnePaymentsDetailsModel error", insertOnePaymentsDetailsModel)
                        response.error = true
                        response.statusCode = STRINGS.errorStatusCode
                        response.message = STRINGS.commanErrorString
                    }



                    if (payload.data.order.order_tags.type == 'order') {
                        var orderObject = {
                            onlinePaid: 1,
                            paymentStatus: 'INCOMPLETE',
                            bookingId: payload.data.order.order_tags.order_id,
                            orderStatus: 'PENDING'
                        }
                        // if (payload.data.order.order_tags.status == 'PENDING') {
                        //     orderObject.orderStatus = 'WAITING'
                        // }
                        var updateOneOrderDetailsModel = await userPaymentModel.updateOneOrderDetailsModel(orderObject)
                        console.log("getOneOrderDetailsModel", updateOneOrderDetailsModel)
                        if (updateOneOrderDetailsModel.error) {
                            response.error = true
                            response.statusCode = STRINGS.errorStatusCode
                            response.message = STRINGS.commanErrorString
                            return callback(response)
                        } else {
                            response.error = false
                            response.statusCode = STRINGS.successStatusCode
                            response.message = STRINGS.SuccessString
                            response.data = payload
                            return callback(response)
                        }
                    } else if (payload.data.order.order_tags.type == 'payment') {
                        var orderObject = {
                            onlinePaid: 1,
                            paymentStatus: 'INCOMPLETE',
                            id: payload.data.order.order_tags.order_id,
                            activeStatus: 0
                        }
                        var updateOneOrderDetailsModel = await userPaymentModel.updateOnePaymentOrderDetailsModel(orderObject)
                        console.log("getOneOrderDetailsModel", updateOneOrderDetailsModel)
                        if (updateOneOrderDetailsModel.error) {
                            response.error = true
                            response.statusCode = STRINGS.errorStatusCode
                            response.message = STRINGS.commanErrorString
                            return callback(response)
                        } else {



                            var getOrderItemsModel = await userPaymentModel.getOrderItemsModel(orderObject)
                            console.log("getOrderItemsModel", getOrderItemsModel)

                            if (getOrderItemsModel.error) {
                                // console.log("getOrderItemsModel", getOrderItemsModel)

                                response.error = true
                                response.statusCode = STRINGS.errorStatusCode
                                response.message = STRINGS.commanErrorString
                                return callback(response)
                            }
                            if (getOrderItemsModel.data.length > 0) {

                                for (let i = 0; i < getOrderItemsModel.data.length; i++) {
                                    let orderItemsObj = {}
                                    orderItemsObj.productCode = getOrderItemsModel.data[0].orderProductId
                                    orderItemsObj.quantity = parseInt(getOrderItemsModel.data[0].quantity) + parseInt(getOrderItemsModel.data[0].freeQuantity)
                                    orderItemsObj.outletId = getOrderItemsModel.data[0].outletId

                                    var AddProductQuantityModel = await userPaymentModel.AddProductQuantityModel(orderItemsObj)
                                    if (AddProductQuantityModel.error) {
                                        console.log("AddProductQuantityModel", AddProductQuantityModel)
                                        response.error = true
                                        response.statusCode = STRINGS.errorStatusCode
                                        response.message = STRINGS.commanErrorString
                                        // return callback(response)
                                    }
                                }
                            }
                            var updateOneOrderDetailsModel = await userPaymentModel.updateOneFailedOrderDetailsModel(orderObject)


                            var fileData = {}
                            fileData.fileName = getOrderItemsModel.data[0].orderItemsPdf.replace('https://europetuploads.s3.ap-south-1.amazonaws.com/', "");
                            console.log("fileData", fileData)
                            var s3PdfUpload = await uploadS3.S3_deleteOneFile(fileData)
                            console.log("s3PdfUpload", s3PdfUpload)








                            response.error = false
                            response.statusCode = STRINGS.successStatusCode
                            response.message = STRINGS.SuccessString
                            response.data = payload
                            return callback(response)
                        }
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










    }
}




export default UserPaymentService;
