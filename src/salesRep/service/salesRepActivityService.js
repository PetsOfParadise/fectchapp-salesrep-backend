
import async from 'async'

import STRINGS from '../../../strings.json'
import Utils from '../../../utils/utils'
import SalesRepActivityModel from '../models/salesRepActivityModel'
import NotificationsService from '../../../utils/notificationsService'
import SmsTemplates from '../../../smsTemplates'

require('dotenv').config();

const salesRepActivityModel = new SalesRepActivityModel
const notificationsService = new NotificationsService
const smsTemplates = new SmsTemplates

const utils = new Utils()




class SalesRepActivityService {
    constructor() {




        this.addActivityService = async (request, callback) => {
            try {
                var localTime = new Date().toLocaleString(undefined, { timeZone: 'Asia/Kolkata' });

                var response = {}
                var visitData = {}
                var notificationObject = {}
                visitData.salesRepId = request.auth.id
                visitData.shopId = request.shopId
                visitData.visitReasonId = request.visitReasonId
                visitData.activityType = request.activityType
                visitData.otherReason = request.otherReason
                var checkShopNameModel1 = await salesRepActivityModel.checkShopNameModel1(request)
                if (checkShopNameModel1.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                }
                visitData.customerID = checkShopNameModel1.data[0].customerID
                visitData.salesRepAddress = request.salesRepAddress
                visitData.visitDate = new Date(localTime)
                if (request.activityType === 'VISIT') {
                    var checkDistance = await salesRepActivityModel.checkShopDistanceModel(request)
                    if (checkDistance.error) {
                        response.error = true
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.commanErrorString
                    } else {
                        var distance = checkDistance.data[0].distance
                        console.log(distance)
                        if (distance < 1) {
                            visitData.isVisit = 1
                            visitData.salesRepLatitude = request.salesRepLatitude
                            visitData.salesRepLongitude = request.salesRepLongitude
                            var save = await salesRepActivityModel.saveActivityModel(visitData)
                            if (save.error) {
                                response.error = true
                                response.statusCode = STRINGS.successStatusCode
                                response.message = STRINGS.commanErrorString
                            } else {


                                let orderTimeHours = new Date(localTime).getHours()
                                let orderTimeMin = new Date(localTime).getMinutes()

                                let visitTime = `${orderTimeHours}:${orderTimeMin}`

                                if (request.resson == 'Order Taken') {

                                    notificationObject.id = save.data[0]
                                    notificationObject.userIds = [request.shopId]
                                    notificationObject.notifyType = request.activityType
                                    // notificationObject.message = request.auth.name + ' has updated his activity on the shop visit for the reason ' + request.resson
                                    notificationObject.salesRepName = request.auth.name
                                    notificationObject.orderTime = `${orderTimeHours}:${orderTimeMin}`
                                    notificationObject.customerID = checkShopNameModel1.data[0].customerID

                                    notificationsService.sendActivityNotificationForOrderTaken(notificationObject, () => { })

                                    var updateNotifications = {}
                                    updateNotifications.ownerId = request.ownerId
                                    updateNotifications.managerId = request.shopId
                                    updateNotifications.salesRepId = request.auth.id
                                    updateNotifications.type = request.activityType
                                    // updateNotifications.notifyType = JSON.stringify(['US', 'AD'])
                                    updateNotifications.notifyType = JSON.stringify(['US'])
                                    updateNotifications.notifyDate = new Date()
                                    updateNotifications.activityId = request.visitReasonId
                                    updateNotifications.activeStatus = 1
                                    updateNotifications.color = "#cf8bf3"
                                    updateNotifications.notificationMsg = `<p style="font-size: 14px;">Fetch: <b>${request.auth.name}</b> has logged a shop visit at <b>${visitTime}</b> to collect an order from your shop.</p>`
                                    salesRepActivityModel.saveNotificationsModel(updateNotifications, () => { })

                                    //send sms to shop Owner

                                    let smsObj = {}
                                    smsObj.mobileNumber = checkShopNameModel1.data[0].mobileNumber
                                    // smsObj.totalAmount = orderObject.balanceAmount.toFixed(1)
                                    // smsObj.orderId = bookingId
                                    smsObj.salesRepName = request.auth.name
                                    smsObj.orderTime = `${orderTimeHours}:${orderTimeMin}`
                                    console.log("smsObj", smsObj)
                                    var sendShopOwnerSms = await smsTemplates.salesRepActivityShopVisitOrderTaken(smsObj)
                                    console.log("sendShopOwnerSms", sendShopOwnerSms)

                                } else if (request.resson == 'Payment Collected') {
                                    notificationObject.id = save.data[0]
                                    notificationObject.userIds = [request.shopId]
                                    notificationObject.notifyType = request.activityType
                                    // notificationObject.message = request.auth.name + ' has updated his activity on the shop visit for the reason ' + request.resson
                                    notificationObject.salesRepName = request.auth.name
                                    notificationObject.orderTime = `${orderTimeHours}:${orderTimeMin}`
                                    notificationObject.customerID = checkShopNameModel1.data[0].customerID

                                    notificationsService.sendActivityNotificationForPaymentCollected(notificationObject, () => { })

                                    var updateNotifications = {}
                                    updateNotifications.ownerId = request.ownerId
                                    updateNotifications.managerId = request.shopId
                                    updateNotifications.salesRepId = request.auth.id
                                    updateNotifications.type = request.activityType
                                    // updateNotifications.notifyType = JSON.stringify(['US', 'AD'])
                                    updateNotifications.notifyType = JSON.stringify(['US'])
                                    updateNotifications.notifyDate = new Date(localTime)
                                    updateNotifications.activityId = request.visitReasonId
                                    updateNotifications.activeStatus = 1
                                    updateNotifications.color = "#b5eee3"
                                    updateNotifications.notificationMsg = `<p style="font-size: 14px;">Fetch: <b>${request.auth.name}</b> has updated a shop visit at <b>${visitTime}</b> to receive payment from you.</p>`
                                    salesRepActivityModel.saveNotificationsModel(updateNotifications, () => { })

                                    //send sms to shop Owner

                                    let smsObj = {}
                                    smsObj.mobileNumber = checkShopNameModel1.data[0].mobileNumber
                                    // smsObj.totalAmount = orderObject.balanceAmount.toFixed(1)
                                    // smsObj.orderId = bookingId
                                    smsObj.salesRepName = request.auth.name
                                    smsObj.orderTime = `${orderTimeHours}:${orderTimeMin}`
                                    console.log("smsObj", smsObj)
                                    var sendShopOwnerSms = await smsTemplates.salesRepActivityShopVisitCollectPayment(smsObj)
                                    console.log("sendShopOwnerSms", sendShopOwnerSms)

                                } else if (request.resson == 'Product Promotion') {
                                    notificationObject.id = save.data[0]
                                    notificationObject.userIds = [request.shopId]
                                    notificationObject.notifyType = request.activityType
                                    // notificationObject.message = request.auth.name + ' has updated his activity on the shop visit for the reason ' + request.resson
                                    notificationObject.salesRepName = request.auth.name
                                    notificationObject.orderTime = `${orderTimeHours}:${orderTimeMin}`
                                    notificationObject.customerID = checkShopNameModel1.data[0].customerID

                                    notificationsService.sendActivityNotificationForProductPromotion(notificationObject, () => { })

                                    var updateNotifications = {}
                                    updateNotifications.ownerId = request.ownerId
                                    updateNotifications.managerId = request.shopId
                                    updateNotifications.salesRepId = request.auth.id
                                    updateNotifications.type = request.activityType
                                    // updateNotifications.notifyType = JSON.stringify(['US', 'AD'])
                                    updateNotifications.notifyType = JSON.stringify(['US'])
                                    updateNotifications.notifyDate = new Date(localTime)
                                    updateNotifications.activityId = request.visitReasonId
                                    updateNotifications.activeStatus = 1
                                    updateNotifications.color = "#86a8e7"
                                    updateNotifications.notificationMsg = `<p style="font-size: 14px;">Fetch: <b>${request.auth.name}</b> has logged a shop visit at <b>${visitTime}</b> to promote products in your shop.</p>`
                                    salesRepActivityModel.saveNotificationsModel(updateNotifications, () => { })

                                    //send sms to shop Owner
                                    let smsObj = {}
                                    smsObj.mobileNumber = checkShopNameModel1.data[0].mobileNumber
                                    // smsObj.totalAmount = orderObject.balanceAmount.toFixed(1)
                                    // smsObj.orderId = bookingId
                                    smsObj.salesRepName = request.auth.name
                                    smsObj.orderTime = `${orderTimeHours}:${orderTimeMin}`
                                    console.log("smsObj", smsObj)
                                    var sendShopOwnerSms = await smsTemplates.salesRepActivityShopVisitCollectPayment(smsObj)
                                    console.log("sendShopOwnerSms", sendShopOwnerSms)
                                } else if (request.resson == 'Returns / Complaints resolution') {

                                    notificationObject.id = save.data[0]
                                    notificationObject.userIds = [request.shopId]
                                    notificationObject.notifyType = request.activityType
                                    // notificationObject.message = request.auth.name + ' has updated his activity on the shop visit for the reason ' + request.resson
                                    notificationObject.salesRepName = request.auth.name
                                    notificationObject.orderTime = `${orderTimeHours}:${orderTimeMin}`
                                    notificationObject.customerID = checkShopNameModel1.data[0].customerID

                                    notificationsService.sendActivityNotificationForReturnsComplaints(notificationObject, () => { })

                                    var updateNotifications = {}
                                    updateNotifications.ownerId = request.ownerId
                                    updateNotifications.managerId = request.shopId
                                    updateNotifications.salesRepId = request.auth.id
                                    updateNotifications.type = request.activityType
                                    // updateNotifications.notifyType = JSON.stringify(['US', 'AD'])
                                    updateNotifications.notifyType = JSON.stringify(['US'])
                                    updateNotifications.notifyDate = new Date(localTime)
                                    updateNotifications.activityId = request.visitReasonId
                                    updateNotifications.activeStatus = 1
                                    updateNotifications.color = "#ffff99"
                                    updateNotifications.notificationMsg = `<p style="font-size: 14px;">Fetch: <b>${request.auth.name}</b> has updated his activity that he visited your shop at <b>${visitTime}</b> to resolve Returns or Complaints.</p>`
                                    salesRepActivityModel.saveNotificationsModel(updateNotifications, () => { })

                                    //send sms to shop Owner
                                    let smsObj = {}
                                    smsObj.mobileNumber = checkShopNameModel1.data[0].mobileNumber
                                    // smsObj.totalAmount = orderObject.balanceAmount.toFixed(1)
                                    // smsObj.orderId = bookingId
                                    smsObj.salesRepName = request.auth.name
                                    smsObj.orderTime = `${orderTimeHours}:${orderTimeMin}`
                                    console.log("smsObj", smsObj)
                                    var sendShopOwnerSms = await smsTemplates.salesRepActivityShopVisitReturnsComplaints(smsObj)
                                    console.log("sendShopOwnerSms", sendShopOwnerSms)
                                } else if (request.resson == 'Urgent Delivery') {
                                    notificationObject.id = save.data[0]
                                    notificationObject.userIds = [request.shopId]
                                    notificationObject.notifyType = request.activityType
                                    // notificationObject.message = request.auth.name + ' has updated his activity on the shop visit for the reason ' + request.resson
                                    notificationObject.salesRepName = request.auth.name
                                    notificationObject.orderTime = `${orderTimeHours}:${orderTimeMin}`
                                    notificationObject.customerID = checkShopNameModel1.data[0].customerID

                                    notificationsService.sendActivityNotificationForUrgentDelivery(notificationObject, () => { })

                                    var updateNotifications = {}
                                    updateNotifications.ownerId = request.ownerId
                                    updateNotifications.managerId = request.shopId
                                    updateNotifications.salesRepId = request.auth.id
                                    updateNotifications.type = request.activityType
                                    // updateNotifications.notifyType = JSON.stringify(['US', 'AD'])
                                    updateNotifications.notifyType = JSON.stringify(['US'])
                                    updateNotifications.notifyDate = new Date(localTime)
                                    updateNotifications.activityId = request.visitReasonId
                                    updateNotifications.activeStatus = 1
                                    updateNotifications.color = "#cf8bf3"
                                    updateNotifications.notificationMsg = `<p style="font-size: 14px;">Fetch: <b>${request.auth.name}</b> has updated a shop visit at <b>${visitTime}</b> to deliver products on urgent basis.</p>`
                                    salesRepActivityModel.saveNotificationsModel(updateNotifications, () => { })

                                    //send sms to shop Owner
                                    let smsObj = {}
                                    smsObj.mobileNumber = checkShopNameModel1.data[0].mobileNumber
                                    // smsObj.totalAmount = orderObject.balanceAmount.toFixed(1)
                                    // smsObj.orderId = bookingId
                                    smsObj.salesRepName = request.auth.name
                                    smsObj.orderTime = `${orderTimeHours}:${orderTimeMin}`
                                    console.log("smsObj", smsObj)
                                    var sendShopOwnerSms = await smsTemplates.salesRepActivityShopVisitUrgentDelivery(smsObj)
                                    console.log("sendShopOwnerSms", sendShopOwnerSms)
                                } else if (request.resson == 'Other Office work') {

                                    notificationObject.id = save.data[0]
                                    notificationObject.userIds = [request.shopId]
                                    notificationObject.notifyType = request.activityType
                                    // notificationObject.message = request.auth.name + ' has updated his activity on the shop visit for the reason ' + request.resson
                                    notificationObject.salesRepName = request.auth.name
                                    notificationObject.orderTime = `${orderTimeHours}:${orderTimeMin}`
                                    notificationObject.customerID = checkShopNameModel1.data[0].customerID

                                    notificationsService.sendActivityNotificationForOtherOfficeWork(notificationObject, () => { })

                                    var updateNotifications = {}
                                    updateNotifications.ownerId = request.ownerId
                                    updateNotifications.managerId = request.shopId
                                    updateNotifications.salesRepId = request.auth.id
                                    updateNotifications.type = request.activityType
                                    // updateNotifications.notifyType = JSON.stringify(['US', 'AD'])
                                    updateNotifications.notifyType = JSON.stringify(['US'])
                                    updateNotifications.notifyDate = new Date(localTime)
                                    updateNotifications.activityId = request.visitReasonId
                                    updateNotifications.activeStatus = 1
                                    updateNotifications.color = "#74ebd5"
                                    updateNotifications.notificationMsg = `<p style="font-size: 14px;">Fetch: <b>${request.auth.name}</b> has logged a shop visit at <b>${visitTime}</b> to Reconcile Ledgers/ Office work.</p>`
                                    salesRepActivityModel.saveNotificationsModel(updateNotifications, () => { })

                                    //send sms to shop Owner
                                    let smsObj = {}
                                    smsObj.mobileNumber = checkShopNameModel1.data[0].mobileNumber
                                    // smsObj.totalAmount = orderObject.balanceAmount.toFixed(1)
                                    // smsObj.orderId = bookingId
                                    smsObj.salesRepName = request.auth.name
                                    smsObj.orderTime = `${orderTimeHours}:${orderTimeMin}`
                                    console.log("smsObj", smsObj)
                                    var sendShopOwnerSms = await smsTemplates.salesRepActivityShopVisitOtherOfficeWork(smsObj)
                                    console.log("sendShopOwnerSms", sendShopOwnerSms)
                                }
                                else if (request.resson == 'Order Followup') {
                                    notificationObject.id = save.data[0]
                                    notificationObject.userIds = [request.shopId]
                                    notificationObject.notifyType = request.activityType
                                    // notificationObject.message = request.auth.name + ' has updated his activity on the shop visit for the reason ' + request.resson
                                    notificationObject.salesRepName = request.auth.name
                                    notificationObject.orderTime = `${orderTimeHours}:${orderTimeMin}`
                                    notificationObject.customerID = checkShopNameModel1.data[0].customerID

                                    notificationsService.sendActivityNotificationForOrderFollowup(notificationObject, () => { })

                                    var updateNotifications = {}
                                    updateNotifications.ownerId = request.ownerId
                                    updateNotifications.managerId = request.shopId
                                    updateNotifications.salesRepId = request.auth.id
                                    updateNotifications.type = request.activityType
                                    // updateNotifications.notifyType = JSON.stringify(['US', 'AD'])
                                    updateNotifications.notifyType = JSON.stringify(['US'])
                                    updateNotifications.notifyDate = new Date()
                                    updateNotifications.activityId = request.visitReasonId
                                    updateNotifications.activeStatus = 1
                                    updateNotifications.color = "#91EAE4"
                                    updateNotifications.notificationMsg = `<p style="font-size: 14px;">Fetch: <b>${request.auth.name}</b> has logged a shop visit at <b>${notificationObject.orderTime}</b> for Order Followup in your shop.</p>`
                                    salesRepActivityModel.saveNotificationsModel(updateNotifications, () => { })

                                    //send sms to shop Owner
                                    // let smsObj = {}
                                    // smsObj.mobileNumber = checkShopNameModel1.data[0].mobileNumber
                                    // // smsObj.totalAmount = orderObject.balanceAmount.toFixed(1)
                                    // // smsObj.orderId = bookingId
                                    // smsObj.salesRepName = request.auth.name
                                    // smsObj.orderTime = `${orderTimeHours}:${orderTimeMin}`
                                    // console.log("smsObj", smsObj)
                                    // var sendShopOwnerSms = await smsTemplates.salesRepActivityShopVisitOrderFollowup(smsObj)
                                    // console.log("sendShopOwnerSms", sendShopOwnerSms)
                                } else if (request.resson == 'Payment Followup') {
                                    notificationObject.id = save.data[0]
                                    notificationObject.userIds = [request.shopId]
                                    notificationObject.notifyType = request.activityType
                                    // notificationObject.message = request.auth.name + ' has updated his activity on the shop visit for the reason ' + request.resson
                                    notificationObject.salesRepName = request.auth.name
                                    notificationObject.orderTime = `${orderTimeHours}:${orderTimeMin}`
                                    notificationObject.customerID = checkShopNameModel1.data[0].customerID

                                    notificationsService.sendActivityNotificationForPaymentFollowup(notificationObject, () => { })

                                    var updateNotifications = {}
                                    updateNotifications.ownerId = request.ownerId
                                    updateNotifications.managerId = request.shopId
                                    updateNotifications.salesRepId = request.auth.id
                                    updateNotifications.type = request.activityType
                                    // updateNotifications.notifyType = JSON.stringify(['US', 'AD'])
                                    updateNotifications.notifyType = JSON.stringify(['US'])
                                    updateNotifications.notifyDate = new Date(localTime)
                                    updateNotifications.activityId = request.visitReasonId
                                    updateNotifications.activeStatus = 1
                                    updateNotifications.color = "#91EAE4"
                                    updateNotifications.notificationMsg = `<p style="font-size: 14px;">Fetch: <b>${request.auth.name}</b> has logged a shop visit at <b>${notificationObject.orderTime}</b> for Payment Followup in your shop.</p>`
                                    salesRepActivityModel.saveNotificationsModel(updateNotifications, () => { })

                                    //send sms to shop Owner
                                    // let smsObj = {}
                                    // smsObj.mobileNumber = checkShopNameModel1.data[0].mobileNumber
                                    // // smsObj.totalAmount = orderObject.balanceAmount.toFixed(1)
                                    // // smsObj.orderId = bookingId
                                    // smsObj.salesRepName = request.auth.name
                                    // smsObj.orderTime = `${orderTimeHours}:${orderTimeMin}`
                                    // console.log("smsObj", smsObj)
                                    // var sendShopOwnerSms = await smsTemplates.salesRepActivityShopVisitOrderFollowup(smsObj)
                                    // console.log("sendShopOwnerSms", sendShopOwnerSms)
                                } else if (request.resson == 'Customer Not Available') {
                                    notificationObject.id = save.data[0]
                                    notificationObject.userIds = [request.shopId]
                                    notificationObject.notifyType = request.activityType
                                    // notificationObject.message = request.auth.name + ' has updated his activity on the shop visit for the reason ' + request.resson
                                    notificationObject.salesRepName = request.auth.name
                                    notificationObject.orderTime = `${orderTimeHours}:${orderTimeMin}`
                                    notificationObject.customerID = checkShopNameModel1.data[0].customerID

                                    notificationsService.sendActivityNotificationForCustomerNotAvailable(notificationObject, () => { })

                                    var updateNotifications = {}
                                    updateNotifications.ownerId = request.ownerId
                                    updateNotifications.managerId = request.shopId
                                    updateNotifications.salesRepId = request.auth.id
                                    updateNotifications.type = request.activityType
                                    // updateNotifications.notifyType = JSON.stringify(['US', 'AD'])
                                    updateNotifications.notifyType = JSON.stringify(['US'])
                                    updateNotifications.notifyDate = new Date(localTime)
                                    updateNotifications.activityId = request.visitReasonId
                                    updateNotifications.activeStatus = 1
                                    updateNotifications.color = "#91EAE4"
                                    updateNotifications.notificationMsg = `<p style="font-size: 14px;">Fetch: <b>${request.auth.name}</b> has logged a shop visit at <b>${notificationObject.orderTime}</b> and Marked the status as Customer not Available.</p>`
                                    salesRepActivityModel.saveNotificationsModel(updateNotifications, () => { })

                                    //send sms to shop Owner
                                    // let smsObj = {}
                                    // smsObj.mobileNumber = checkShopNameModel1.data[0].mobileNumber
                                    // // smsObj.totalAmount = orderObject.balanceAmount.toFixed(1)
                                    // // smsObj.orderId = bookingId
                                    // smsObj.salesRepName = request.auth.name
                                    // smsObj.orderTime = `${orderTimeHours}:${orderTimeMin}`
                                    // console.log("smsObj", smsObj)
                                    // var sendShopOwnerSms = await smsTemplates.salesRepActivityShopVisitOrderFollowup(smsObj)
                                    // console.log("sendShopOwnerSms", sendShopOwnerSms)
                                }





                                response.error = false
                                response.statusCode = STRINGS.successStatusCode
                                response.isUpdate = 1
                                response.message = STRINGS.SuccessString
                            }
                        } else {
                            response.error = false
                            response.statusCode = STRINGS.successStatusCode
                            response.isUpdate = 0
                            response.message = STRINGS.activityErrorString
                        }
                    }
                } else {
                    var save = await salesRepActivityModel.saveActivityModel(visitData)
                    if (save.error) {
                        response.error = true
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.commanErrorString
                    } else {
                        var localTime = new Date().toLocaleString(undefined, { timeZone: 'Asia/Kolkata' });

                        let orderTimeHours = new Date(localTime).getHours()
                        let orderTimeMin = new Date(localTime).getMinutes()

                        let visitTime = `${orderTimeHours}:${orderTimeMin}`


                        if (request.resson == 'Order Taken') {

                            notificationObject.id = save.data[0]
                            notificationObject.userIds = [request.shopId]
                            notificationObject.notifyType = request.activityType
                            // notificationObject.message = request.auth.name + ' has updated his activity on the shop visit for the reason ' + request.resson
                            notificationObject.salesRepName = request.auth.name
                            notificationObject.orderTime = `${orderTimeHours}:${orderTimeMin}`
                            notificationObject.customerID = checkShopNameModel1.data[0].customerID

                            notificationsService.sendActivityNotificationOtherInteractionOrderTaken(notificationObject, () => { })

                            var updateNotifications = {}
                            updateNotifications.ownerId = request.ownerId
                            updateNotifications.managerId = request.shopId
                            updateNotifications.salesRepId = request.auth.id
                            updateNotifications.type = request.activityType
                            // updateNotifications.notifyType = JSON.stringify(['US', 'AD'])
                            updateNotifications.notifyType = JSON.stringify(['US'])
                            updateNotifications.notifyDate = new Date(localTime)
                            updateNotifications.activityId = request.visitReasonId
                            updateNotifications.activeStatus = 1
                            updateNotifications.color = "#cf8bf3"
                            updateNotifications.notificationMsg = `<p style="font-size: 14px;">Fetch: <b>${request.auth.name}</b> has logged a Telephonic Call with you at <b>${visitTime}</b> to collect an order from your shop.</p>`
                            salesRepActivityModel.saveNotificationsModel(updateNotifications, () => { })

                            //send sms to shop Owner

                            let smsObj = {}
                            smsObj.mobileNumber = checkShopNameModel1.data[0].mobileNumber
                            // smsObj.totalAmount = orderObject.balanceAmount.toFixed(1)
                            // smsObj.orderId = bookingId
                            smsObj.salesRepName = request.auth.name
                            smsObj.orderTime = `${orderTimeHours}:${orderTimeMin}`
                            console.log("smsObj", smsObj)
                            var sendShopOwnerSms = await smsTemplates.salesRepActivityShopOtherInteractionOrderTaken(smsObj)
                            console.log("sendShopOwnerSms", sendShopOwnerSms)

                        } else if (request.resson == 'Payment Collected') {

                            notificationObject.id = save.data[0]
                            notificationObject.userIds = [request.shopId]
                            notificationObject.notifyType = request.activityType
                            // notificationObject.message = request.auth.name + ' has updated his activity on the shop visit for the reason ' + request.resson
                            notificationObject.salesRepName = request.auth.name
                            notificationObject.orderTime = `${orderTimeHours}:${orderTimeMin}`
                            notificationObject.customerID = checkShopNameModel1.data[0].customerID

                            notificationsService.sendActivityNotificationOtherInteractionForPaymentCollected(notificationObject, () => { })

                            var updateNotifications = {}
                            updateNotifications.ownerId = request.ownerId
                            updateNotifications.managerId = request.shopId
                            updateNotifications.salesRepId = request.auth.id
                            updateNotifications.type = request.activityType
                            // updateNotifications.notifyType = JSON.stringify(['US', 'AD'])
                            updateNotifications.notifyType = JSON.stringify(['US'])
                            updateNotifications.notifyDate = new Date(localTime)
                            updateNotifications.activityId = request.visitReasonId
                            updateNotifications.activeStatus = 1
                            updateNotifications.color = "#b5eee3"
                            updateNotifications.notificationMsg = `<p style="font-size: 14px;">Fetch: <b>${request.auth.name}</b> has updated a Phone call with you at <b>${visitTime}</b> to collect payment from you.</p>`
                            salesRepActivityModel.saveNotificationsModel(updateNotifications, () => { })

                            //send sms to shop Owner

                            let smsObj = {}
                            smsObj.mobileNumber = checkShopNameModel1.data[0].mobileNumber
                            // smsObj.totalAmount = orderObject.balanceAmount.toFixed(1)
                            // smsObj.orderId = bookingId
                            smsObj.salesRepName = request.auth.name
                            smsObj.orderTime = `${orderTimeHours}:${orderTimeMin}`
                            console.log("smsObj", smsObj)
                            var sendShopOwnerSms = await smsTemplates.salesRepActivityShopOtherInteractionCollectPayment(smsObj)
                            console.log("sendShopOwnerSms", sendShopOwnerSms)
                        } else if (request.resson == 'Product Promotion') {
                            notificationObject.id = save.data[0]
                            notificationObject.userIds = [request.shopId]
                            notificationObject.notifyType = request.activityType
                            // notificationObject.message = request.auth.name + ' has updated his activity on the shop visit for the reason ' + request.resson
                            notificationObject.salesRepName = request.auth.name
                            notificationObject.orderTime = `${orderTimeHours}:${orderTimeMin}`
                            notificationObject.customerID = checkShopNameModel1.data[0].customerID

                            notificationsService.sendActivityNotificationOtherInteractionForProductPromotion(notificationObject, () => { })

                            var updateNotifications = {}
                            updateNotifications.ownerId = request.ownerId
                            updateNotifications.managerId = request.shopId
                            updateNotifications.salesRepId = request.auth.id
                            updateNotifications.type = request.activityType
                            // updateNotifications.notifyType = JSON.stringify(['US', 'AD'])
                            updateNotifications.notifyType = JSON.stringify(['US'])
                            updateNotifications.notifyDate = new Date(localTime)
                            updateNotifications.activityId = request.visitReasonId
                            updateNotifications.activeStatus = 1
                            updateNotifications.color = "#86a8e7"
                            updateNotifications.notificationMsg = `<p style="font-size: 14px;">Fetch: <b>${request.auth.name}</b> has updated his activity on the shop interaction for the reason <b>Product promotion</b>.</p>`
                            salesRepActivityModel.saveNotificationsModel(updateNotifications, () => { })

                            //send sms to shop Owner
                            let smsObj = {}
                            smsObj.mobileNumber = checkShopNameModel1.data[0].mobileNumber
                            // smsObj.totalAmount = orderObject.balanceAmount.toFixed(1)
                            // smsObj.orderId = bookingId
                            smsObj.salesRepName = request.auth.name
                            smsObj.orderTime = `${orderTimeHours}:${orderTimeMin}`
                            console.log("smsObj", smsObj)
                            var sendShopOwnerSms = await smsTemplates.salesRepActivityShopOtherInteractionProductPromotion(smsObj)
                            console.log("sendShopOwnerSms", sendShopOwnerSms)
                        } else if (request.resson == 'Returns / Complaints resolution') {

                            notificationObject.id = save.data[0]
                            notificationObject.userIds = [request.shopId]
                            notificationObject.notifyType = request.activityType
                            // notificationObject.message = request.auth.name + ' has updated his activity on the shop visit for the reason ' + request.resson
                            notificationObject.salesRepName = request.auth.name
                            notificationObject.orderTime = `${orderTimeHours}:${orderTimeMin}`
                            notificationObject.customerID = checkShopNameModel1.data[0].customerID

                            notificationsService.sendActivityNotificationOtherInteractionForResolveComplaints(notificationObject, () => { })

                            var updateNotifications = {}
                            updateNotifications.ownerId = request.ownerId
                            updateNotifications.managerId = request.shopId
                            updateNotifications.salesRepId = request.auth.id
                            updateNotifications.type = request.activityType
                            // updateNotifications.notifyType = JSON.stringify(['US', 'AD'])
                            updateNotifications.notifyType = JSON.stringify(['US'])
                            updateNotifications.notifyDate = new Date(localTime)
                            updateNotifications.activityId = request.visitReasonId
                            updateNotifications.activeStatus = 1
                            updateNotifications.color = "#ffff99"
                            updateNotifications.notificationMsg = `<p style="font-size: 14px;">Fetch: <b>${request.auth.name}</b> has updated his activity that he spoke to you by a phone call at <b>${visitTime}</b> to resolve Returns or Complaints.</p>`
                            salesRepActivityModel.saveNotificationsModel(updateNotifications, () => { })

                            //send sms to shop Owner
                            let smsObj = {}
                            smsObj.mobileNumber = checkShopNameModel1.data[0].mobileNumber
                            // smsObj.totalAmount = orderObject.balanceAmount.toFixed(1)
                            // smsObj.orderId = bookingId
                            smsObj.salesRepName = request.auth.name
                            smsObj.orderTime = `${orderTimeHours}:${orderTimeMin}`
                            console.log("smsObj", smsObj)
                            var sendShopOwnerSms = await smsTemplates.salesRepActivityShopOtherInteractionResolveComplaints(smsObj)
                            console.log("sendShopOwnerSms", sendShopOwnerSms)
                        } else if (request.resson == 'Urgent Delivery') {
                            notificationObject.id = save.data[0]
                            notificationObject.userIds = [request.shopId]
                            notificationObject.notifyType = request.activityType
                            // notificationObject.message = request.auth.name + ' has updated his activity on the shop visit for the reason ' + request.resson
                            notificationObject.salesRepName = request.auth.name
                            notificationObject.orderTime = `${orderTimeHours}:${orderTimeMin}`
                            notificationObject.customerID = checkShopNameModel1.data[0].customerID

                            notificationsService.sendActivityNotificationForUrgentDelivery(notificationObject, () => { })

                            var updateNotifications = {}
                            updateNotifications.ownerId = request.ownerId
                            updateNotifications.managerId = request.shopId
                            updateNotifications.salesRepId = request.auth.id
                            updateNotifications.type = request.activityType
                            // updateNotifications.notifyType = JSON.stringify(['US', 'AD'])
                            updateNotifications.notifyType = JSON.stringify(['US'])
                            updateNotifications.notifyDate = new Date(localTime)
                            updateNotifications.activityId = request.visitReasonId
                            updateNotifications.activeStatus = 1
                            updateNotifications.color = "#cf8bf3"
                            updateNotifications.notificationMsg = `<p style="font-size: 14px;">Fetch: <b>${request.auth.name}</b> has updated a shop visit at <b>${visitTime}</b> to deliver products on urgent basis.</p>`
                            salesRepActivityModel.saveNotificationsModel(updateNotifications, () => { })

                            //send sms to shop Owner
                            let smsObj = {}
                            smsObj.mobileNumber = checkShopNameModel1.data[0].mobileNumber
                            // smsObj.totalAmount = orderObject.balanceAmount.toFixed(1)
                            // smsObj.orderId = bookingId
                            smsObj.salesRepName = request.auth.name
                            smsObj.orderTime = `${orderTimeHours}:${orderTimeMin}`
                            console.log("smsObj", smsObj)
                            var sendShopOwnerSms = await smsTemplates.salesRepActivityShopVisitUrgentDelivery(smsObj)
                            console.log("sendShopOwnerSms", sendShopOwnerSms)
                        } else if (request.resson == 'Other Office work') {

                            notificationObject.id = save.data[0]
                            notificationObject.userIds = [request.shopId]
                            notificationObject.notifyType = request.activityType
                            // notificationObject.message = request.auth.name + ' has updated his activity on the shop visit for the reason ' + request.resson
                            notificationObject.salesRepName = request.auth.name
                            notificationObject.orderTime = `${orderTimeHours}:${orderTimeMin}`
                            notificationObject.customerID = checkShopNameModel1.data[0].customerID

                            notificationsService.sendActivityNotificationForOtherOfficeWork(notificationObject, () => { })

                            var updateNotifications = {}
                            updateNotifications.ownerId = request.ownerId
                            updateNotifications.managerId = request.shopId
                            updateNotifications.salesRepId = request.auth.id
                            updateNotifications.type = request.activityType
                            // updateNotifications.notifyType = JSON.stringify(['US', 'AD'])
                            updateNotifications.notifyType = JSON.stringify(['US'])
                            updateNotifications.notifyDate = new Date(localTime)
                            updateNotifications.activityId = request.visitReasonId
                            updateNotifications.activeStatus = 1
                            updateNotifications.color = "#74ebd5"
                            updateNotifications.notificationMsg = `<p style="font-size: 14px;">Fetch: <b>${request.auth.name}</b> has logged a shop visit at <b>${visitTime}</b> to Reconcile Ledgers/ Office work.</p>`
                            salesRepActivityModel.saveNotificationsModel(updateNotifications, () => { })

                            //send sms to shop Owner
                            let smsObj = {}
                            smsObj.mobileNumber = checkShopNameModel1.data[0].mobileNumber
                            // smsObj.totalAmount = orderObject.balanceAmount.toFixed(1)
                            // smsObj.orderId = bookingId
                            smsObj.salesRepName = request.auth.name
                            smsObj.orderTime = `${orderTimeHours}:${orderTimeMin}`
                            console.log("smsObj", smsObj)
                            var sendShopOwnerSms = await smsTemplates.salesRepActivityShopVisitOtherOfficeWork(smsObj)
                            console.log("sendShopOwnerSms", sendShopOwnerSms)
                        } else if (request.resson == 'Order Followup') {
                            notificationObject.id = save.data[0]
                            notificationObject.userIds = [request.shopId]
                            notificationObject.notifyType = request.activityType
                            // notificationObject.message = request.auth.name + ' has updated his activity on the shop visit for the reason ' + request.resson
                            notificationObject.salesRepName = request.auth.name
                            notificationObject.orderTime = `${orderTimeHours}:${orderTimeMin}`
                            notificationObject.customerID = checkShopNameModel1.data[0].customerID

                            notificationsService.sendActivityNotificationOtherInteractionForOrderFollowup(notificationObject, () => { })

                            var updateNotifications = {}
                            updateNotifications.ownerId = request.ownerId
                            updateNotifications.managerId = request.shopId
                            updateNotifications.salesRepId = request.auth.id
                            updateNotifications.type = request.activityType
                            // updateNotifications.notifyType = JSON.stringify(['US', 'AD'])
                            updateNotifications.notifyType = JSON.stringify(['US'])
                            updateNotifications.notifyDate = new Date(localTime)
                            updateNotifications.activityId = request.visitReasonId
                            updateNotifications.activeStatus = 1
                            updateNotifications.color = "#91EAE4"
                            updateNotifications.notificationMsg = `<p style="font-size: 14px;">Fetch: <b>${request.auth.name}</b> has interacted with you at <b>${notificationObject.orderTime}</b> for Order Follow Up.</p>`
                            salesRepActivityModel.saveNotificationsModel(updateNotifications, () => { })

                            //send sms to shop Owner
                            // let smsObj = {}
                            // smsObj.mobileNumber = checkShopNameModel1.data[0].mobileNumber
                            // // smsObj.totalAmount = orderObject.balanceAmount.toFixed(1)
                            // // smsObj.orderId = bookingId
                            // smsObj.salesRepName = request.auth.name
                            // smsObj.orderTime = `${orderTimeHours}:${orderTimeMin}`
                            // console.log("smsObj", smsObj)
                            // var sendShopOwnerSms = await smsTemplates.salesRepActivityShopVisitOrderFollowup(smsObj)
                            // console.log("sendShopOwnerSms", sendShopOwnerSms)
                        } else if (request.resson == 'Payment Followup') {
                            notificationObject.id = save.data[0]
                            notificationObject.userIds = [request.shopId]
                            notificationObject.notifyType = request.activityType
                            // notificationObject.message = request.auth.name + ' has updated his activity on the shop visit for the reason ' + request.resson
                            notificationObject.salesRepName = request.auth.name
                            notificationObject.orderTime = `${orderTimeHours}:${orderTimeMin}`
                            notificationObject.customerID = checkShopNameModel1.data[0].customerID

                            notificationsService.sendActivityNotificationOtherInteractionForPaymentFollowup(notificationObject, () => { })

                            var updateNotifications = {}
                            updateNotifications.ownerId = request.ownerId
                            updateNotifications.managerId = request.shopId
                            updateNotifications.salesRepId = request.auth.id
                            updateNotifications.type = request.activityType
                            // updateNotifications.notifyType = JSON.stringify(['US', 'AD'])
                            updateNotifications.notifyType = JSON.stringify(['US'])
                            updateNotifications.notifyDate = new Date(localTime)
                            updateNotifications.activityId = request.visitReasonId
                            updateNotifications.activeStatus = 1
                            updateNotifications.color = "#91EAE4"
                            updateNotifications.notificationMsg = `<p style="font-size: 14px;">Fetch: <b>${request.auth.name}</b> has interacted with you at <b>${notificationObject.orderTime}</b> for Payment Follow Up.</p>`
                            salesRepActivityModel.saveNotificationsModel(updateNotifications, () => { })

                            //send sms to shop Owner
                            // let smsObj = {}
                            // smsObj.mobileNumber = checkShopNameModel1.data[0].mobileNumber
                            // // smsObj.totalAmount = orderObject.balanceAmount.toFixed(1)
                            // // smsObj.orderId = bookingId
                            // smsObj.salesRepName = request.auth.name
                            // smsObj.orderTime = `${orderTimeHours}:${orderTimeMin}`
                            // console.log("smsObj", smsObj)
                            // var sendShopOwnerSms = await smsTemplates.salesRepActivityShopVisitOrderFollowup(smsObj)
                            // console.log("sendShopOwnerSms", sendShopOwnerSms)
                        } else if (request.resson == 'Customer Not Available') {
                            notificationObject.id = save.data[0]
                            notificationObject.userIds = [request.shopId]
                            notificationObject.notifyType = request.activityType
                            // notificationObject.message = request.auth.name + ' has updated his activity on the shop visit for the reason ' + request.resson
                            notificationObject.salesRepName = request.auth.name
                            notificationObject.orderTime = `${orderTimeHours}:${orderTimeMin}`
                            notificationObject.customerID = checkShopNameModel1.data[0].customerID

                            notificationsService.sendActivityNotificationOtherInteractionForCustomerNotAvailable(notificationObject, () => { })

                            var updateNotifications = {}
                            updateNotifications.ownerId = request.ownerId
                            updateNotifications.managerId = request.shopId
                            updateNotifications.salesRepId = request.auth.id
                            updateNotifications.type = request.activityType
                            // updateNotifications.notifyType = JSON.stringify(['US', 'AD'])
                            updateNotifications.notifyType = JSON.stringify(['US'])
                            updateNotifications.notifyDate = new Date(localTime)
                            updateNotifications.activityId = request.visitReasonId
                            updateNotifications.activeStatus = 1
                            updateNotifications.color = "#91EAE4"
                            updateNotifications.notificationMsg = `<p style="font-size: 14px;">Fetch: <b>${request.auth.name}</b> has Marked as Customer Not Available.</p>`
                            salesRepActivityModel.saveNotificationsModel(updateNotifications, () => { })

                            //send sms to shop Owner
                            // let smsObj = {}
                            // smsObj.mobileNumber = checkShopNameModel1.data[0].mobileNumber
                            // // smsObj.totalAmount = orderObject.balanceAmount.toFixed(1)
                            // // smsObj.orderId = bookingId
                            // smsObj.salesRepName = request.auth.name
                            // smsObj.orderTime = `${orderTimeHours}:${orderTimeMin}`
                            // console.log("smsObj", smsObj)
                            // var sendShopOwnerSms = await smsTemplates.salesRepActivityShopVisitOrderFollowup(smsObj)
                            // console.log("sendShopOwnerSms", sendShopOwnerSms)
                        }


                        response.error = false
                        response.statusCode = STRINGS.successStatusCode
                        response.isUpdate = 1
                        response.message = STRINGS.SuccessString
                    }
                }
            } catch (e) {
                console.log("e", e)
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
            }
            callback(response)
        }

        this.updateActivityService = async (request, callback) => {
            try {

                var localTime = new Date().toLocaleString(undefined, { timeZone: 'Asia/Kolkata' });

                var response = {}
                var visitData = {}
                var notificationObject = {}

                visitData.salesRepId = request.auth.id
                visitData.shopId = request.shopId
                visitData.visitReasonId = request.visitReasonId
                visitData.activityType = 'VISIT'
                visitData.visitDate = new Date(localTime)
                visitData.isVisit = 0
                visitData.salesRepLatitude = request.salesRepLatitude
                visitData.salesRepLongitude = request.salesRepLongitude

                visitData.otherReason = request.otherReason
                var checkShopNameModel1 = await salesRepActivityModel.checkShopNameModel1(request)
                if (checkShopNameModel1.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                }
                visitData.customerID = checkShopNameModel1.data[0].customerID
                visitData.salesRepAddress = request.salesRepAddress

                var save = await salesRepActivityModel.saveActivityModel(visitData)
                if (save.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                } else {



                    let orderTimeHours = new Date(localTime).getHours()
                    let orderTimeMin = new Date(localTime).getMinutes()
                    let visitTime = `${orderTimeHours}:${orderTimeMin}`
                    if (request.resson == 'Order Taken') {

                        notificationObject.id = save.data[0]
                        notificationObject.userIds = [request.shopId]
                        notificationObject.notifyType = request.activityType
                        // notificationObject.message = request.auth.name + ' has updated his activity on the shop visit for the reason ' + request.resson
                        notificationObject.salesRepName = request.auth.name
                        notificationObject.orderTime = `${orderTimeHours}:${orderTimeMin}`
                        notificationObject.customerID = checkShopNameModel1.data[0].customerID

                        notificationsService.sendActivityNotificationForOrderTaken(notificationObject, () => { })

                        var updateNotifications = {}
                        updateNotifications.ownerId = request.ownerId
                        updateNotifications.managerId = request.shopId
                        updateNotifications.salesRepId = request.auth.id
                        updateNotifications.type = request.activityType
                        // updateNotifications.notifyType = JSON.stringify(['US', 'AD'])
                        updateNotifications.notifyType = JSON.stringify(['US'])
                        updateNotifications.notifyDate = new Date(localTime)
                        updateNotifications.activityId = request.visitReasonId
                        updateNotifications.activeStatus = 1
                        updateNotifications.color = "#cf8bf3"
                        updateNotifications.notificationMsg = `<p style="font-size: 14px;">Fetch: <b>${request.auth.name}</b> has logged a shop visit at <b>${visitTime}</b> to collect an order from your shop.</p>`
                        salesRepActivityModel.saveNotificationsModel(updateNotifications, () => { })

                        //send sms to shop Owner

                        let smsObj = {}
                        smsObj.mobileNumber = checkShopNameModel1.data[0].mobileNumber
                        // smsObj.totalAmount = orderObject.balanceAmount.toFixed(1)
                        // smsObj.orderId = bookingId
                        smsObj.salesRepName = request.auth.name
                        smsObj.orderTime = `${orderTimeHours}:${orderTimeMin}`
                        console.log("smsObj", smsObj)
                        var sendShopOwnerSms = await smsTemplates.salesRepActivityShopVisitCollectPayment(smsObj)
                        console.log("sendShopOwnerSms", sendShopOwnerSms)

                    } else if (request.resson == 'Payment Collected') {

                        notificationObject.id = save.data[0]
                        notificationObject.userIds = [request.shopId]
                        notificationObject.notifyType = request.activityType
                        // notificationObject.message = request.auth.name + ' has updated his activity on the shop visit for the reason ' + request.resson
                        notificationObject.salesRepName = request.auth.name
                        notificationObject.orderTime = `${orderTimeHours}:${orderTimeMin}`
                        notificationObject.customerID = checkShopNameModel1.data[0].customerID

                        notificationsService.sendActivityNotificationForPaymentCollected(notificationObject, () => { })

                        var updateNotifications = {}
                        updateNotifications.ownerId = request.ownerId
                        updateNotifications.managerId = request.shopId
                        updateNotifications.salesRepId = request.auth.id
                        updateNotifications.type = request.activityType
                        // updateNotifications.notifyType = JSON.stringify(['US', 'AD'])
                        updateNotifications.notifyType = JSON.stringify(['US'])
                        updateNotifications.notifyDate = new Date()
                        updateNotifications.activityId = request.visitReasonId
                        updateNotifications.activeStatus = 1
                        updateNotifications.color = "#b5eee3"
                        updateNotifications.notificationMsg = `<p style="font-size: 14px;">Fetch: <b>${request.auth.name}</b> has updated a shop visit at <b>${visitTime}</b> to receive payment from you.</p>`
                        salesRepActivityModel.saveNotificationsModel(updateNotifications, () => { })

                        //send sms to shop Owner

                        let smsObj = {}
                        smsObj.mobileNumber = checkShopNameModel1.data[0].mobileNumber
                        // smsObj.totalAmount = orderObject.balanceAmount.toFixed(1)
                        // smsObj.orderId = bookingId
                        smsObj.salesRepName = request.auth.name
                        smsObj.orderTime = `${orderTimeHours}:${orderTimeMin}`
                        console.log("smsObj", smsObj)
                        var sendShopOwnerSms = await smsTemplates.salesRepActivityShopVisitCollectPayment(smsObj)
                        console.log("sendShopOwnerSms", sendShopOwnerSms)
                    } else if (request.resson == 'Product Promotion') {
                        notificationObject.id = save.data[0]
                        notificationObject.userIds = [request.shopId]
                        notificationObject.notifyType = request.activityType
                        // notificationObject.message = request.auth.name + ' has updated his activity on the shop visit for the reason ' + request.resson
                        notificationObject.salesRepName = request.auth.name
                        notificationObject.orderTime = `${orderTimeHours}:${orderTimeMin}`
                        notificationObject.customerID = checkShopNameModel1.data[0].customerID

                        notificationsService.sendActivityNotificationForProductPromotion(notificationObject, () => { })

                        var updateNotifications = {}
                        updateNotifications.ownerId = request.ownerId
                        updateNotifications.managerId = request.shopId
                        updateNotifications.salesRepId = request.auth.id
                        updateNotifications.type = request.activityType
                        // updateNotifications.notifyType = JSON.stringify(['US', 'AD'])
                        updateNotifications.notifyType = JSON.stringify(['US'])
                        updateNotifications.notifyDate = new Date()
                        updateNotifications.activityId = request.visitReasonId
                        updateNotifications.activeStatus = 1
                        updateNotifications.color = "#86a8e7"
                        updateNotifications.notificationMsg = `<p style="font-size: 14px;">Fetch: <b>${request.auth.name}</b> has logged a shop visit at <b>${visitTime}</b> to promote products in your shop.</p>`
                        salesRepActivityModel.saveNotificationsModel(updateNotifications, () => { })

                        //send sms to shop Owner
                        let smsObj = {}
                        smsObj.mobileNumber = checkShopNameModel1.data[0].mobileNumber
                        // smsObj.totalAmount = orderObject.balanceAmount.toFixed(1)
                        // smsObj.orderId = bookingId
                        smsObj.salesRepName = request.auth.name
                        smsObj.orderTime = `${orderTimeHours}:${orderTimeMin}`
                        console.log("smsObj", smsObj)
                        var sendShopOwnerSms = await smsTemplates.salesRepActivityShopVisitPromoteProduct(smsObj)
                        console.log("sendShopOwnerSms", sendShopOwnerSms)
                    } else if (request.resson == 'Returns / Complaints resolution') {

                        notificationObject.id = save.data[0]
                        notificationObject.userIds = [request.shopId]
                        notificationObject.notifyType = request.activityType
                        // notificationObject.message = request.auth.name + ' has updated his activity on the shop visit for the reason ' + request.resson
                        notificationObject.salesRepName = request.auth.name
                        notificationObject.orderTime = `${orderTimeHours}:${orderTimeMin}`
                        notificationObject.customerID = checkShopNameModel1.data[0].customerID

                        notificationsService.sendActivityNotificationForReturnsComplaints(notificationObject, () => { })

                        var updateNotifications = {}
                        updateNotifications.ownerId = request.ownerId
                        updateNotifications.managerId = request.shopId
                        updateNotifications.salesRepId = request.auth.id
                        updateNotifications.type = request.activityType
                        // updateNotifications.notifyType = JSON.stringify(['US', 'AD'])
                        updateNotifications.notifyType = JSON.stringify(['US'])
                        updateNotifications.notifyDate = new Date()
                        updateNotifications.activityId = request.visitReasonId
                        updateNotifications.activeStatus = 1
                        updateNotifications.color = "#ffff99"
                        updateNotifications.notificationMsg = `<p style="font-size: 14px;">Fetch: <b>${request.auth.name}</b> has updated his activity that he visited your shop at <b>${visitTime}</b> to resolve Returns or Complaints.</p>`
                        salesRepActivityModel.saveNotificationsModel(updateNotifications, () => { })

                        //send sms to shop Owner
                        let smsObj = {}
                        smsObj.mobileNumber = checkShopNameModel1.data[0].mobileNumber
                        // smsObj.totalAmount = orderObject.balanceAmount.toFixed(1)
                        // smsObj.orderId = bookingId
                        smsObj.salesRepName = request.auth.name
                        smsObj.orderTime = `${orderTimeHours}:${orderTimeMin}`
                        console.log("smsObj", smsObj)
                        var sendShopOwnerSms = await smsTemplates.salesRepActivityShopVisitReturnsComplaints(smsObj)
                        console.log("sendShopOwnerSms", sendShopOwnerSms)
                    } else if (request.resson == 'Urgent Delivery') {
                        notificationObject.id = save.data[0]
                        notificationObject.userIds = [request.shopId]
                        notificationObject.notifyType = request.activityType
                        // notificationObject.message = request.auth.name + ' has updated his activity on the shop visit for the reason ' + request.resson
                        notificationObject.salesRepName = request.auth.name
                        notificationObject.orderTime = `${orderTimeHours}:${orderTimeMin}`
                        notificationObject.customerID = checkShopNameModel1.data[0].customerID

                        notificationsService.sendActivityNotificationForUrgentDelivery(notificationObject, () => { })

                        var updateNotifications = {}
                        updateNotifications.ownerId = request.ownerId
                        updateNotifications.managerId = request.shopId
                        updateNotifications.salesRepId = request.auth.id
                        updateNotifications.type = request.activityType
                        // updateNotifications.notifyType = JSON.stringify(['US', 'AD'])
                        updateNotifications.notifyType = JSON.stringify(['US'])
                        updateNotifications.notifyDate = new Date()
                        updateNotifications.activityId = request.visitReasonId
                        updateNotifications.activeStatus = 1
                        updateNotifications.color = "#cf8bf3"
                        updateNotifications.notificationMsg = `<p style="font-size: 14px;">Fetch: <b>${request.auth.name}</b> has updated a shop visit at <b>${visitTime}</b> to deliver products on urgent basis.</p>`
                        salesRepActivityModel.saveNotificationsModel(updateNotifications, () => { })

                        //send sms to shop Owner
                        let smsObj = {}
                        smsObj.mobileNumber = checkShopNameModel1.data[0].mobileNumber
                        // smsObj.totalAmount = orderObject.balanceAmount.toFixed(1)
                        // smsObj.orderId = bookingId
                        smsObj.salesRepName = request.auth.name
                        smsObj.orderTime = `${orderTimeHours}:${orderTimeMin}`
                        console.log("smsObj", smsObj)
                        var sendShopOwnerSms = await smsTemplates.salesRepActivityShopVisitUrgentDelivery(smsObj)
                        console.log("sendShopOwnerSms", sendShopOwnerSms)
                    } else if (request.resson == 'Other Office work') {

                        notificationObject.id = save.data[0]
                        notificationObject.userIds = [request.shopId]
                        notificationObject.notifyType = request.activityType
                        // notificationObject.message = request.auth.name + ' has updated his activity on the shop visit for the reason ' + request.resson
                        notificationObject.salesRepName = request.auth.name
                        notificationObject.orderTime = `${orderTimeHours}:${orderTimeMin}`
                        notificationObject.customerID = checkShopNameModel1.data[0].customerID

                        notificationsService.sendActivityNotificationForOtherOfficeWork(notificationObject, () => { })

                        var updateNotifications = {}
                        updateNotifications.ownerId = request.ownerId
                        updateNotifications.managerId = request.shopId
                        updateNotifications.salesRepId = request.auth.id
                        updateNotifications.type = request.activityType
                        // updateNotifications.notifyType = JSON.stringify(['US', 'AD'])
                        updateNotifications.notifyType = JSON.stringify(['US'])
                        updateNotifications.notifyDate = new Date()
                        updateNotifications.activityId = request.visitReasonId
                        updateNotifications.activeStatus = 1
                        updateNotifications.color = "#74ebd5"
                        updateNotifications.notificationMsg = `<p style="font-size: 14px;">Fetch: <b>${request.auth.name}</b> has logged a shop visit at <b>${visitTime}</b> to Reconcile Ledgers/ Office work.</p>`
                        salesRepActivityModel.saveNotificationsModel(updateNotifications, () => { })

                        //send sms to shop Owner
                        let smsObj = {}
                        smsObj.mobileNumber = checkShopNameModel1.data[0].mobileNumber
                        // smsObj.totalAmount = orderObject.balanceAmount.toFixed(1)
                        // smsObj.orderId = bookingId
                        smsObj.salesRepName = request.auth.name
                        smsObj.orderTime = `${orderTimeHours}:${orderTimeMin}`
                        console.log("smsObj", smsObj)
                        var sendShopOwnerSms = await smsTemplates.salesRepActivityShopVisitOtherOfficeWork(smsObj)
                        console.log("sendShopOwnerSms", sendShopOwnerSms)
                    }
                    // else if (request.resson == 'Order Followup') {
                    //     notificationObject.id = save.data[0]
                    //     notificationObject.userIds = [request.shopId]
                    //     notificationObject.notifyType = request.activityType
                    //     // notificationObject.message = request.auth.name + ' has updated his activity on the shop visit for the reason ' + request.resson
                    //     notificationObject.salesRepName = request.auth.name
                    //     notificationObject.orderTime = `${orderTimeHours}:${orderTimeMin}`
                    //     notificationObject.customerID = checkShopNameModel1.data[0].customerID

                    //     notificationsService.sendActivityNotificationForOrderFollowup(notificationObject, () => { })

                    //     var updateNotifications = {}
                    //     updateNotifications.ownerId = request.ownerId
                    //     updateNotifications.managerId = request.shopId
                    //     updateNotifications.salesRepId = request.auth.id
                    //     updateNotifications.type = request.activityType
                    //     // updateNotifications.notifyType = JSON.stringify(['US', 'AD'])
                    //     updateNotifications.notifyType = JSON.stringify(['US'])
                    //     updateNotifications.notifyDate = new Date()
                    //     updateNotifications.activityId = request.visitReasonId
                    //     updateNotifications.activeStatus = 1
                    //     updateNotifications.color = "#b5eee3"
                    //     updateNotifications.notificationMsg = `<p style="font-size: 14px;">Fetch: <b>${request.auth.name}</b> has logged a shop visit at <b>${visitTime}</b> to resolve order followup.</p>`
                    //     salesRepActivityModel.saveNotificationsModel(updateNotifications, () => { })

                    //     // send sms to shop Owner
                    //     let smsObj = {}
                    //     smsObj.mobileNumber = checkShopNameModel1.data[0].mobileNumber
                    //     // smsObj.totalAmount = orderObject.balanceAmount.toFixed(1)
                    //     // smsObj.orderId = bookingId
                    //     smsObj.salesRepName = request.auth.name
                    //     smsObj.orderTime = `${orderTimeHours}:${orderTimeMin}`
                    //     console.log("smsObj", smsObj)
                    //     var sendShopOwnerSms = await smsTemplates.salesRepActivityShopVisitOrderFollowup(smsObj)
                    //     console.log("sendShopOwnerSms", sendShopOwnerSms)
                    // }









                    response.error = false
                    response.statusCode = STRINGS.successStatusCode
                    response.isUpdate = 1
                    response.message = STRINGS.SuccessString
                }
            } catch (e) {
                console.log("error", e)
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
            }
            callback(response)
        }

        this.getActivityReasonList = async (request, callback) => {
            try {
                var response = {}
                if (request.isVisit === '1') {
                    var data = { isVisited: 1 }
                } else {
                    var data = { telephonic: 1 }
                }
                var result = await salesRepActivityModel.activityReasonListModel(data)
                console.log("result", result)
                if (result.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                } else {
                    response.error = false
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.SuccessString
                    response.list = result.data
                }
            } catch (e) {
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
            }
            callback(response)
        }

        this.getActivityTracker = async (request, callback) => {
            request.activityTracker = true;
            try {
                var response = {}
                var date = new Date()
                // request.year = date.getFullYear()
                var isVisit = 'VISIT'
                var notVisit = 'INTERACTION'
                var queryType = 'VIEW'
                var myshops = await salesRepActivityModel.totalSalesRepOwnersModel1(request.auth.id)
                if (myshops.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                    callback(response)
                } else {
                    let shopList = myshops.data
                    console.log(request)
                    Promise.all([
                        salesRepActivityModel.salesRepVisitShopCount(request, isVisit, queryType),
                        salesRepActivityModel.salesRepVisitShopCount(request, notVisit, queryType),
                        salesRepActivityModel.salesRepNoInteractionShopModel(request, shopList),
                        salesRepActivityModel.salesRepNoOrdersModel(request, shopList),
                        salesRepActivityModel.noPaymentsModel(request, shopList)
                    ])
                        .then(result => {

                            console.log(result)
                            myshops = myshops.data.length
                            response.error = false
                            response.statusCode = STRINGS.successStatusCode
                            response.message = STRINGS.SuccessString
                            response.shopVisit = result[0].data.length
                            response.shopInteraction = result[1].data.length
                            response.noInteraction = myshops - result[2].data.length < 0 ? 0 : myshops - result[2].data.length
                            response.NoOrders = myshops - result[3].data.length
                            response.NoPayments = myshops - result[4].data.length
                            callback(response)
                        })
                        .catch(error => {
                            console.log(error)
                            response.error = true
                            response.statusCode = STRINGS.successStatusCode
                            response.message = STRINGS.commanErrorString
                            callback(response)
                        })
                }
            } catch (e) {
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
                callback(response)
            }
        }



        this.viewInteractionList = async (request, callback) => {
            try {
                var response = {}
                var queryType = 'LIST'
                if (request.type == 'VISIT') {
                    var isVisit = 'VISIT'
                    var result = await salesRepActivityModel.salesRepVisitShopCountModel(request, isVisit, queryType, request.date)
                } else {
                    var isVisit = 'INTERACTION'
                    var result = await salesRepActivityModel.salesRepVisitShopCountModel(request, isVisit, queryType, request.date)
                }
                if (result.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                } else {
                    response.error = false
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.SuccessString
                    response.list = result.data
                }
            } catch (e) {
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
            }
            callback(response)
        }

        this.shopInformationList = async (request, callback) => {
            try {
                var response = {}
                request.salesRepID = request.auth.id
                console.log("request.type", request.type)

                var myshops = await salesRepActivityModel.totalSalesRepOwnersModel1(request.auth.id)
                if (myshops.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                    return callback(response)
                }
                let shopList = myshops.data
                if (request.type === 'NOORDERS') {
                    var result = await shopNoOrderListService(request, shopList)
                } else if (request.type === 'NOPAYMENTS') {
                    var result = await shopNoPaymentListService(request, shopList)
                } else {
                    var result = await shopNoInteractionShopService(request)
                    console.log("result", result)
                }
                if (result.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                } else {
                    response.error = false
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.SuccessString
                    response.pages = result.pageCount
                    response.shopList = result.data
                }
            } catch (e) {
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
            }
            callback(response)
        }




        // Remainder
        this.viewRemainderService = async (request, callback) => {
            try {
                var response = {}
                var outStandingAmount = await salesRepActivityModel.getOutstandingModel(request)
                console.log("outStandingAmount", outStandingAmount)
                request.listType = 'TOTAL'
                var result;
                let primaryRemainderList = await salesRepActivityModel.primaryRemainderListModel(request)
                let secondaryRemainderList = await salesRepActivityModel.secondaryRemainderListModel(request)
                let tertiaryRemainderList = await salesRepActivityModel.tertiaryRemainderListModel(request)


                // console.log("primaryRemainderList", primaryRemainderList)
                // console.log("secondaryRemainderList", secondaryRemainderList)
                result = primaryRemainderList.data.concat(secondaryRemainderList.data)
                result = result.concat(tertiaryRemainderList.data)
                console.log("result", result)
                if (primaryRemainderList.error || outStandingAmount.error || secondaryRemainderList.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                    callback(response)
                } else {
                    if (result.length > 0) {
                        request.pageCount = 10
                        var pageCount = await utils.pageCount(result.length, 10)
                        var usersList = result
                        //need to create a pagination for usersList array
                        // var page = request.pageNumber
                        // var start = (page - 1) * 10
                        // var end = page * 10
                        // usersList = usersList.slice(start, end)

                        var length = usersList.length
                        var shopArray = []
                        if (length > 0) {
                            usersList.forEach(async function (item) {
                                var shopObject = {}
                                var remainder = await salesRepActivityModel.checkRemailderOrders(item.cartUserId, request.auth.id)
                                console.log("remainder", remainder.data[0])
                                shopObject.id = item.cartUserId
                                shopObject.shopName = item.shopName
                                shopObject.shopAddress = item.shopAddress
                                shopObject.shopTotal = item.total
                                // if (remainder.data.length > 0) {
                                //     var diffDays = await utils.dateDifferenceInDay(new Date(), remainder.data[0].dueDate)
                                //     shopObject.duration = diffDays
                                //     shopObject.orderDate = remainder.data[0].shippedDate

                                //     shopObject.dueDate = remainder.data[0].dueDate
                                //     shopObject.orderAmount = remainder.data[0].amount
                                // }

                                var today = new Date();
                                var dd = String(today.getDate()).padStart(2, '0');
                                var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
                                var yyyy = today.getFullYear();
                                today = dd + '/' + mm + '/' + yyyy;
                                // var date1Arr = remainder.data[0].dueDate.toString().split("/");
                                var date1Arr = remainder.data[0].dueDate == null ? remainder.data[0].alterDueDate.toString().split("/") : remainder.data[0].dueDate.toString().split("/")
                                var date2Arr = today.toString().split("/")
                                var date1 = new Date(+date1Arr[2], date1Arr[1] - 1, +date1Arr[0]);
                                var date2 = new Date(+date2Arr[2], date2Arr[1] - 1, +date2Arr[0]);
                                var Difference_In_Time = date1.getTime() - date2.getTime();
                                var daysLeft = Difference_In_Time / (1000 * 3600 * 24);

                                console.log("daysLeft", daysLeft)
                                // if (daysLeft < 0) {
                                // }
                                shopObject.duration = daysLeft
                                shopObject.orderDate = remainder.data[0].shippedDate

                                shopObject.dueDate = remainder.data[0].dueDate
                                shopObject.orderAmount = remainder.data[0].amount



                                shopArray.push(shopObject)
                                if (--length === 0) {
                                    shopArray.sort(function (a, b) {
                                        return a.duration - b.duration
                                    })
                                    console.log("shopArray", shopArray)
                                    response.error = false
                                    response.statusCode = STRINGS.successStatusCode
                                    response.message = STRINGS.SuccessString
                                    response.outstandingAmount = outStandingAmount.data[0].total
                                    response.pages = pageCount
                                    response.shopList = shopArray
                                    callback(response)
                                }
                            })
                        } else {
                            response.error = false
                            response.statusCode = STRINGS.successStatusCode
                            response.message = STRINGS.SuccessString
                            response.outstandingAmount = outStandingAmount.data[0].total
                            response.pages = pageCount
                            response.shopList = shopArray
                            callback(response)
                        }
                    } else {
                        response.error = false
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.SuccessString
                        response.outstandingAmount = 0
                        response.shopList = result.data
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



        var shopNoOrderListService = function (data, shopList) {
            return new Promise(async function (resolve) {
                var response = {}
                var orders = await salesRepActivityModel.shopNoOrdersListModel(data, shopList)
                if (orders.error) {
                    response.error = true
                    resolve(response)
                } else {
                    var ids = []
                    var shops = orders.data
                    if (shops.length > 0) {
                        shops.forEach(async function (item) {
                            ids.push(item.cartUserId)
                        })
                    }
                    data.shopIds = ids
                    data.listType = 'TOTAL'
                    var totalShop = await salesRepActivityModel.shopInformationListModel(data)
                    if (totalShop.error) {
                        response.error = true
                        resolve(response)
                    } else {
                        data.pageCount = 10
                        data.listType = 'LIST'
                        var pageCount = await utils.pageCount(totalShop.data.length, 10)
                        var listResult = await salesRepActivityModel.shopInformationListModel(data)
                        if (listResult.error) {
                            response.error = true
                            resolve(response)
                        } else {
                            response.error = false
                            response.pageCount = pageCount
                            response.data = listResult.data
                            resolve(response)
                        }
                    }
                }
            })
        }




        var shopNoPaymentListService = function (data, shopList) {
            return new Promise(async function (resolve) {
                var response = {}
                var orders = await salesRepActivityModel.shopNoPaymentListModel(data, shopList)
                if (orders.error) {
                    response.error = true
                    resolve(response)
                } else {
                    var ids = []
                    var shops = orders.data
                    if (shops.length > 0) {
                        shops.forEach(async function (item) {
                            ids.push(item.shopId)
                        })
                    }
                    data.shopIds = ids
                    data.listType = 'TOTAL'
                    var totalShop = await salesRepActivityModel.shopInformationListModel(data)
                    if (totalShop.error) {
                        response.error = true
                        resolve(response)
                    } else {
                        data.pageCount = 10
                        data.listType = 'LIST'
                        var pageCount = await utils.pageCount(totalShop.data.length, 10)
                        var listResult = await salesRepActivityModel.shopInformationListModel(data)
                        if (listResult.error) {
                            response.error = true
                            resolve(response)
                        } else {
                            response.error = false
                            response.pageCount = pageCount
                            response.data = listResult.data
                            resolve(response)
                        }
                    }
                }
            })
        }


        var shopNoInteractionShopService = function (data) {
            return new Promise(async function (resolve) {
                var response = {}
                var interaction = await salesRepActivityModel.shopNoInteractionModel(data)
                if (interaction.error) {
                    response.error = true
                    resolve(response)
                } else {
                    var ids = []
                    var shops = interaction.data
                    if (shops.length > 0) {
                        shops.forEach(async function (item) {
                            ids.push(item.shopId)
                        })
                    }
                    data.shopIds = ids
                    data.listType = 'TOTAL'
                    data.shopIds = ids
                    data.listType = 'TOTAL'
                    console.log("data.shopIds", data.shopIds)
                    var totalShop = await salesRepActivityModel.shopInformationListModel(data)
                    if (totalShop.error) {
                        response.error = true
                        resolve(response)
                    } else {
                        data.pageCount = 10
                        data.listType = 'LIST'
                        var pageCount = await utils.pageCount(totalShop.data.length, 10)
                        var listResult = await salesRepActivityModel.shopInformationListModel(data)
                        console.log("listResult", listResult)
                        if (listResult.error) {
                            response.error = true
                            resolve(response)
                        } else {
                            response.error = false
                            response.pageCount = pageCount
                            response.data = listResult.data
                            resolve(response)
                        }
                    }
                }
            })
        }






        this.addActivityMessageService = async (request, callback) => {
            try {
                var localTime = new Date().toLocaleString(undefined, { timeZone: 'Asia/Kolkata' });

                let checkShop = await salesRepActivityModel.checkShopModel(request.shopId)
                console.log("checkShop", checkShop)
                if (checkShop.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                    callback(response)
                } else {
                    if (checkShop.data.length > 0) {

                        var response = {}
                        let data = {
                            salesRepId: request.auth.id,
                            shopId: request.shopId,
                            message: request.message,
                            visitDate: new Date(localTime),
                            customerID: checkShop.data[0].customerID,
                            completedDate: new Date(localTime)
                        }
                        var addActivityMessageModel = await salesRepActivityModel.addActivityMessageModel(data)

                        if (addActivityMessageModel.error) {
                            response.error = true
                            response.statusCode = STRINGS.successStatusCode
                            response.message = STRINGS.commanErrorString
                        } else {

                            var getAllSalesRepDetailsModel = await salesRepActivityModel.getAllSalesRepDetailsModel(data.customerID)
                            if (getAllSalesRepDetailsModel.error) {
                                response.error = true
                                response.statusCode = STRINGS.successStatusCode
                                response.message = STRINGS.commanErrorString
                            } else if (getAllSalesRepDetailsModel.data.length > 0) {
                                let salesRepId = request.auth.id

                                let primarySalesRep = getAllSalesRepDetailsModel.data[0].primarySalesRepId
                                let secondarySalesRep = JSON.parse(getAllSalesRepDetailsModel.data[0].secondarySalesRepIds)
                                let tertiarySalesRep = JSON.parse(getAllSalesRepDetailsModel.data[0].tertiarySalesRepIds)

                                //MERGE ALL SALES REP IDS
                                let allSalesRepIds = []
                                allSalesRepIds.push(primarySalesRep)
                                allSalesRepIds = allSalesRepIds.concat(secondarySalesRep)
                                allSalesRepIds = allSalesRepIds.concat(tertiarySalesRep)
                                allSalesRepIds = allSalesRepIds.filter(function (item) {
                                    return item != salesRepId
                                })


                                console.log("allSalesRepIds", allSalesRepIds)

                                let notificationObject = {}
                                // notificationObject.id = ''
                                notificationObject.salesRepIds = JSON.stringify(allSalesRepIds)
                                notificationObject.notifyType = 'CHAT'
                                // notificationObject.message = request.auth.name + ' has updated his activity on the shop visit for the reason ' + request.resson
                                notificationObject.salesRepName = request.auth.name
                                notificationObject.shopName = checkShop.data[0].shopName
                                // notificationObject.orderTime = `${orderTimeHours}:${orderTimeMin}`
                                // notificationObject.customerID = checkShopNameModel1.data[0].customerID

                                notificationsService.sendActivityMessageNotificationForAllSalesRep(notificationObject, () => { })


                                allSalesRepIds.forEach(function (item) {

                                    var updateNotifications = {}
                                    updateNotifications.ownerId = request.shopId
                                    updateNotifications.managerId = request.shopId
                                    updateNotifications.salesRepId = item
                                    updateNotifications.type = 'CHAT'
                                    // updateNotifications.notifyType = JSON.stringify(['US', 'AD'])
                                    updateNotifications.notifyType = JSON.stringify(['SR'])
                                    updateNotifications.notifyDate = new Date(localTime)
                                    updateNotifications.activityId = 0
                                    updateNotifications.activeStatus = 1
                                    updateNotifications.color = "#ffc09f"
                                    updateNotifications.notificationMsg = `<p><b>${request.auth.name}</b> has sent a message in <b>${checkShop.data[0].shopName}</b> chat box.</p>`
                                    salesRepActivityModel.saveNotificationsModel(updateNotifications, () => { })
                                })

                                response.error = false
                                response.statusCode = STRINGS.successStatusCode
                                response.message = STRINGS.SuccessString
                                // response.list = addActivityMessageModel.data
                            } else {
                                response.error = false
                                response.statusCode = STRINGS.successStatusCode
                                response.message = STRINGS.SuccessString
                            }
                        }
                    }
                }
            } catch (e) {
                console.log(e)
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
            }
            callback(response)
        }



        this.activityChatMessageListService = async (request, callback) => {
            try {
                var response = {}
                request.salesRepID = request.auth.id
                console.log("request.auth.id", request.auth)
                var checkShopModel = await salesRepActivityModel.checkShopModel(request.shopId)
                if (checkShopModel.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                    return callback(response)
                } else if (checkShopModel.data.length > 0) {
                    let customerID = checkShopModel.data[0].customerID

                    var shopActivityListModel = await salesRepActivityModel.shopActivityListModel(customerID)
                    let shopActivityChatListModel = await salesRepActivityModel.shopActivityChatListModel(customerID)
                    // console.log("shopActivityListModel", shopActivityListModel)
                    // console.log("shopActivityChatListModel", shopActivityChatListModel)
                    if (shopActivityListModel.error || shopActivityChatListModel.error) {
                        response.error = true
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.commanErrorString
                    } else {
                        let result = []
                        let chat = shopActivityListModel
                        let shopActivityList = shopActivityListModel.data
                        let shopActivityChatList = shopActivityChatListModel.data

                        //need to merge and add the shopActivityList and shopActivityChatList to result array
                        result = shopActivityList.concat(shopActivityChatList)
                        // console.log("result", result)

                        result.forEach(function (item) {

                            if (item.visitReasonId == 1 && item.activityType == 'VISIT') {
                                item.message = `${item.name} has logged a shop visit to collect an order`
                                item.title = `${item.name} - Activity`
                                item.task = 0
                                item.taskCompletedDate = item.visitDate
                            } else if (item.visitReasonId == 1 && item.activityType == 'INTERACTION') {
                                item.message = `${item.name} has logged a Telephonic Call  to collect an order`
                                item.title = `${item.name} - Activity`
                                item.task = 0
                                item.taskCompletedDate = item.visitDate

                            } else if (item.visitReasonId == 2 && item.activityType == 'VISIT') {
                                item.message = `${item.name} has updated a shop visit to receive payment`
                                item.title = `${item.name} - Activity`
                                item.task = 0
                                item.taskCompletedDate = item.visitDate

                            } else if (item.visitReasonId == 2 && item.activityType == 'INTERACTION') {
                                item.message = `${item.name} has updated a Phone call to collect payment`
                                item.title = `${item.name} - Activity`
                                item.task = 0
                                item.taskCompletedDate = item.visitDate

                            } else if (item.visitReasonId == 3 && item.activityType == 'VISIT') {
                                item.message = `${item.name} has logged a shop visit to promote a product in your shop.`
                                item.title = `${item.name} - Activity`
                                item.task = 0
                                item.taskCompletedDate = item.visitDate

                            } else if (item.visitReasonId == 3 && item.activityType == 'INTERACTION') {
                                item.message = `${item.name} has updated his activity on the shop interaction for the reason Product promotion`
                                item.title = `${item.name} - Activity`
                                item.task = 0
                                item.taskCompletedDate = item.visitDate

                            } else if (item.visitReasonId == 4 && item.activityType == 'VISIT') {
                                item.message = `${item.name} has updated his activity that he visited your shop to resolve Returns or Complaints.`
                                item.title = `${item.name} - Activity`
                                item.task = 0
                                item.taskCompletedDate = item.visitDate

                            } else if (item.visitReasonId == 4 && item.activityType == 'INTERACTION') {
                                item.message = `${item.name} has updated his activity that he spoke to you by a phone call  to resolve Returns or Complaints`
                                item.title = `${item.name} - Activity`
                                item.task = 0
                                item.taskCompletedDate = item.visitDate

                            } else if (item.visitReasonId == 5 && item.activityType == 'VISIT') {
                                item.message = `${item.name} has updated a shop visit to deliver products on urgent basis`
                                item.title = `${item.name} - Activity`
                                item.task = 0
                                item.taskCompletedDate = item.visitDate

                            } else if (item.visitReasonId == 5 && item.activityType == 'INTERACTION') {
                                item.message = `${item.name} has updated a shop visit  to deliver products on urgent basis.`
                                item.title = `${item.name} - Activity`
                                item.task = 0
                                item.taskCompletedDate = item.visitDate

                            } else if (item.visitReasonId == 6 && item.activityType == 'VISIT') {
                                item.message = `${item.name}  has logged a shop visit  to Reconcile Ledgers/ Office work`
                                item.title = `${item.name} - Activity`
                                item.task = 0
                                item.taskCompletedDate = item.visitDate

                            } else if (item.visitReasonId == 6 && item.activityType == 'INTERACTION') {
                                item.message = `${item.name} has interacted to Reconcile Ledgers/ Office work`
                                item.title = `${item.name} - Activity`
                                item.task = 0
                                item.taskCompletedDate = item.visitDate

                            } else if (item.visitReasonId == 7 && item.activityType == 'VISIT') {
                                item.message = `${item.name} has logged a shop visit for Order Follow Up`
                                item.title = `${item.name} - Activity`
                                item.task = 0
                                item.taskCompletedDate = item.visitDate

                            } else if (item.visitReasonId == 7 && item.activityType == 'INTERACTION') {
                                item.message = `${item.name} has interacted for Order Follow Up`
                                item.title = `${item.name} - Activity`
                                item.task = 0
                                item.taskCompletedDate = item.visitDate

                            } else if (item.visitReasonId == 8 && item.activityType == 'VISIT') {
                                item.message = `${item.name} has logged a shop visit for Payment Followup`
                                item.title = `${item.name} - Activity`
                                item.task = 0
                                item.taskCompletedDate = item.visitDate

                            } else if (item.visitReasonId == 8 && item.activityType == 'INTERACTION') {
                                item.message = `${item.name} has interacted with you for Payment  Follow Up`
                                item.title = `${item.name} - Activity`
                                item.task = 0
                                item.taskCompletedDate = item.visitDate

                            } else if (item.visitReasonId == 9 && item.activityType == 'VISIT') {
                                item.message = `${item.name} has logged a shop visit and Marked the status as Customer not Available`
                                item.title = `${item.name} - Activity`
                                item.task = 0
                                item.taskCompletedDate = item.visitDate

                            } else if (item.visitReasonId == 9 && item.activityType == 'INTERACTION') {
                                item.message = `${item.name} has logged a shop visit and Marked the status as Customer not Available`
                                item.title = `${item.name} - Activity`
                                item.task = 0
                                item.taskCompletedDate = item.visitDate

                            } else if (item.task == 1 && item.isCompleted == 0) {
                                item.title = `Task - Not Completed`
                                item.taskCompletedDate = item.visitDate
                            } else if (item.task == 1 && item.isCompleted == 1) {

                                const options = {
                                    day: "numeric",
                                    month: "short",
                                    hour: "numeric",
                                    minute: "numeric",
                                    hour12: true
                                };
                                const formattedDate = new Date(item.taskCompletedDate).toLocaleString(undefined, options, { timeZone: 'Asia/Kolkata' });
                                item.title = `Task - Completed By ${item.completedBySalesRep} On -${formattedDate}`
                            } else if (item.task == 0) {
                                item.title = `${item.name} - Message`
                            }

                            let salesRepId = request.auth.id

                            item.ownChat = salesRepId == item.salesRepId ? 1 : 0
                        })

                        result.sort(function (a, b) {
                            return new Date(b.taskCompletedDate) - new Date(a.taskCompletedDate);
                        });

                        let chatList = []
                        var count = await utils.pageCount(result.length, 10)
                        if (result.length > 0) {
                            var resp = result
                            var Page = request.pageNumber
                            var pageNumber = Page;

                            if (request.pageNumber == '0') {
                                pageNumber = 0
                            } else {
                                pageNumber = pageNumber - 1
                            }
                            var limit = 10
                            resp = resp.slice(pageNumber * limit, limit * parseInt(Page))
                            chatList = resp
                        }
                        // console.log("result", result)

                        let shopPendingTaskChatModel = await salesRepActivityModel.shopPendingTaskChatModel(customerID)

                        console.log("shopActivityChatListModel", shopPendingTaskChatModel)

                        response.error = false
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.SuccessString
                        response.pages = count
                        response.pendingTask = shopPendingTaskChatModel.data[0].count == null || undefined ? 0 : shopPendingTaskChatModel.data[0].count
                        response.list = chatList
                    }
                }
            } catch (e) {
                console.log("error", e)
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
            }
            callback(response)
        }



        this.updateTaskCompleteService = async (request, callback) => {
            try {
                var localTime = new Date().toLocaleString(undefined, { timeZone: 'Asia/Kolkata' });

                var response = {}
                let data = {
                    isCompleted: 1,
                    isCompletedBy: request.auth.id,
                    id: request.taskId,
                    completedDate: new Date(localTime),
                }
                var getOneTaskModel = await salesRepActivityModel.getOneTaskModel(data)
                console.log("getOneTaskModel", getOneTaskModel)
                console.log("request.auth.id", request.auth.name)
                var updateTaskCompleteModel = await salesRepActivityModel.updateTaskCompleteModel(data)

                if (updateTaskCompleteModel.error || getOneTaskModel.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                } else {
                    let customerID = getOneTaskModel.data[0].customerID

                    var getAllSalesRepDetailsModel = await salesRepActivityModel.getAllSalesRepDetailsModel(customerID)
                    if (getAllSalesRepDetailsModel.error) {
                        response.error = true
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.commanErrorString
                    } else if (getAllSalesRepDetailsModel.data.length > 0) {
                        let salesRepId = request.auth.id

                        let primarySalesRep = getAllSalesRepDetailsModel.data[0].primarySalesRepId
                        let secondarySalesRep = JSON.parse(getAllSalesRepDetailsModel.data[0].secondarySalesRepIds)
                        let tertiarySalesRep = JSON.parse(getAllSalesRepDetailsModel.data[0].tertiarySalesRepIds)

                        //MERGE ALL SALES REP IDS
                        let allSalesRepIds = []
                        allSalesRepIds.push(primarySalesRep)
                        allSalesRepIds = allSalesRepIds.concat(secondarySalesRep)
                        allSalesRepIds = allSalesRepIds.concat(tertiarySalesRep)
                        allSalesRepIds = allSalesRepIds.filter(function (item) {
                            return item != salesRepId
                        })


                        console.log("allSalesRepIds", allSalesRepIds)
                        let notificationObject = {}
                        // notificationObject.id = ''
                        notificationObject.salesRepIds = JSON.stringify(allSalesRepIds)
                        notificationObject.notifyType = 'CHAT'
                        // notificationObject.message = request.auth.name + ' has updated his activity on the shop visit for the reason ' + request.resson
                        notificationObject.salesRepName = request.auth.name
                        notificationObject.shopName = getAllSalesRepDetailsModel.data[0].shopName
                        // notificationObject.orderTime = `${orderTimeHours}:${orderTimeMin}`
                        // notificationObject.customerID = checkShopNameModel1.data[0].customerID

                        notificationsService.sendActivityTaskCompletedNotificationForAllSalesRep(notificationObject, () => { })


                        allSalesRepIds.forEach(function (item) {

                            // var getAllSalesRepDetailsModel = await salesRepActivityModel.getAllSalesRepDetailsModel(item)

                            // if (getAllSalesRepDetailsModel.error) {
                                response.error = true
                                response.statusCode = STRINGS.successStatusCode
                                response.message = STRINGS.commanErrorString
                                // } else if (getAllSalesRepDetailsModel.data.length > 0) {
                                var updateNotifications = {}
                                updateNotifications.ownerId = getOneTaskModel.data[0].shopId
                                updateNotifications.managerId = getOneTaskModel.data[0].shopId
                                updateNotifications.salesRepId = item
                                updateNotifications.type = 'CHAT'
                                // updateNotifications.notifyType = JSON.stringify(['US', 'AD'])
                                updateNotifications.notifyType = JSON.stringify(['SR'])
                                updateNotifications.notifyDate = new Date(localTime)
                                updateNotifications.activityId = 0
                                updateNotifications.activeStatus = 1
                                updateNotifications.color = "#ffc09f"
                                updateNotifications.notificationMsg = `<p style="font-size: 14px;"><b>${request.auth.name}</b> has Successfully completed the assigned Task for <b>${notificationObject.shopName}</b>.</p>`
                               console.log("updateNotifications.notificationMsg",updateNotifications.notificationMsg)
                                salesRepActivityModel.saveNotificationsModel(updateNotifications, () => { })


                            // }
                        })

                        response.error = false
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.SuccessString
                        // response.list = addActivityMessageModel.data
                    } else {
                        response.error = false
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.SuccessString
                    }
                }

            } catch (e) {
                console.log("error", e)
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
            }
            callback(response)
        }







    }
}



export default SalesRepActivityService;
