
import async from 'async'
import fs from 'fs'
import path from 'path'
import parser from 'xml2json'

import STRINGS from '../../../strings.json'
import Utils from '../../../utils/utils'
import UserOrdersModel from '../models/userOrdersModel'
import NotificationsService from '../../../utils/notificationsService'
import SmsTemplates from '../../../smsTemplates'

// var async = require('async')

require('dotenv').config();
const userOrdersModel = new UserOrdersModel
const notificationsService = new NotificationsService

const utils = new Utils()
const smsTemplates = new SmsTemplates


class UserOrdersService {
  constructor() {




    this.shopMyOrdersList = async (request, callback) => {
      try {
        console.log("request.auth", request.auth)
        var response = {}
        if (request.auth.userType === 'OWNER') {
          var object = {
            'orders.ownerId': request.auth.id
          }
        } else {
          var object = {
            'orders.cartUserId': request.auth.id
          }
        }
        var findCustomer = await userOrdersModel.profileModel(request.auth.id)
        if (findCustomer.error || findCustomer.data.length == 0) {
          response.error = true
          response.statusCode = STRINGS.successStatusCode
          response.message = STRINGS.commanErrorString
        } else {
          var totalOrders = await userOrdersModel.getMyorderList(object)

          var primarySaleRepModel = await userOrdersModel.primarySaleRepModel(findCustomer.data[0].primarySalesRepId)

          var secondarySaleRepModel = await userOrdersModel.secondarySaleRepModel(findCustomer.data[0].secondarySalesRepIds)
          if (totalOrders.error || secondarySaleRepModel.error || primarySaleRepModel.error) {
            response.error = true
            response.statusCode = STRINGS.successStatusCode
            response.message = STRINGS.commanErrorString
          } else {
            let primaryArray = primarySaleRepModel.data
            let secondaryArray = secondarySaleRepModel.data
            let salesRepList = primaryArray.concat(secondaryArray)

            console.log("salesRepList", salesRepList)
            if (totalOrders.data.length > 0) {
              request.pageCount = 10
              var pageCount = await utils.pageCount(totalOrders.data.length, 10)

              var orders = await userOrdersModel.getMyordersModel(request, object)
              if (orders.error) {
                response.error = true
                response.statusCode = STRINGS.successStatusCode
                response.message = STRINGS.commanErrorString
              } else {
                response.error = false
                response.statusCode = STRINGS.successStatusCode
                response.message = STRINGS.SuccessString
                response.isPriceVisible = request.auth.isPriceVisible
                response.pages = pageCount
                response.salesRepDetails = salesRepList
                response.orderList = orders.data
              }
            } else {
              response.error = false
              response.statusCode = STRINGS.successStatusCode
              response.message = STRINGS.SuccessString
              response.isPriceVisible = request.auth.isPriceVisible
              response.pages = 0
              response.salesRepDetails = salesRepList
              response.orderList = totalOrders.data
            }
          }
        }
      } catch (e) {
        response.error = true
        response.statusCode = STRINGS.errorStatusCode
        response.message = STRINGS.oopsErrorMessage
      }
      callback(response)
    }

    this.getAllsalesrepListServiceShopOwner = async (request, callback) => {
      try {
        console.log("request.auth", request.auth)
        var response = {}

        var findSaleRep = await userOrdersModel.findSaleRepModel(request.auth.salesRepIds)
        if (findSaleRep.error) {
          response.error = true
          response.statusCode = STRINGS.successStatusCode
          response.message = STRINGS.commanErrorString
        } else {

          response.error = false
          response.statusCode = STRINGS.successStatusCode
          response.message = STRINGS.SuccessString
          response.data = findSaleRep
        }

      } catch (e) {
        response.error = true
        response.statusCode = STRINGS.errorStatusCode
        response.message = STRINGS.oopsErrorMessage
      }
      callback(response)
    }






    this.viewMyorderDetails = async (request, callback) => {

      try {
        var response = {}
        // if (request.auth.userType === 'OWNER') {
        //   var authObject = { shopOwnerId: request.auth.id, orderId: request.orderId }
        // } else {
        //   var authObject = { complaintBy: request.auth.id, orderId: request.orderId }
        // }

        var object = {
          'orders.id': request.orderId
        }

        var orders = await userOrdersModel.getMyorderList(object)
        console.log("orders", orders)
        var findSaleRep = await userOrdersModel.findSaleRepModel(request.auth.salesRepIds)


        if (orders.error || findSaleRep.error) {
          response.error = true
          response.statusCode = STRINGS.successStatusCode
          response.message = STRINGS.commanErrorString
          callback(response)
        } else {

          if (orders.data.length > 0) {
            let paymentIds = JSON.parse(orders.data[0].paymentTypeIds)
            console.log("paymentIds", paymentIds)
            response.onlinePay = paymentIds.includes(3) == true ? 1 : 0
            var authObject = {
              shopOwnerId: request.auth.ownerId,
              orderId: orders.data[0].bookingId
            }
            var complaintResponse = await userOrdersModel.getAllComplaints(authObject)
            var complaintCount = complaintResponse.data.length
            console.log("complaintResponse***", complaintResponse)
            var getOrderItems = await userOrdersModel.getUserOrderItemsListForViewOrderModel(orders.data[0].bookingId)
            console.log("getOrderItems", getOrderItems)
            if (getOrderItems.error || complaintResponse.error) {
              response.error = true
              response.statusCode = STRINGS.successStatusCode
              response.message = STRINGS.commanErrorString
              callback(response)
            } else {
              var complaintKey = false
              if (complaintResponse.data.length > 0) {
                var complaintKey = true
              }
              var salesRepObject
              if (findSaleRep.data.length > 0) {
                salesRepObject = findSaleRep.data
              } else {
                salesRepObject = {}
              }
              var orderItems = getOrderItems.data
              var length = orderItems.length
              if (length > 0) {
                // orderItems.forEach(async function (item, index) {
                for (let i = 0; i < length; i++) {
                  let index = i
                  let item = orderItems[i]

                  var object = {
                    orderId: item.orderId,
                    productId: item.productId,
                    ownerId: request.auth.ownerId,
                    productCode: item.orderProductId

                  }
                  var complaint = await userOrdersModel.checkUserComplaint(object)
                  orderItems[index].isComplaint = false
                  orderItems[index].isFree = 0
                  if (complaint.data.length > 0) {
                    orderItems[index].isComplaint = true
                  }
                  // var free = await  userOrdersModel.checkFreeQuantityModel1(object)
                  // if (free.data.length > 0) {
                  //   orderItems[index].isFree = free.data[0].quantity
                  // }
                  orderItems[index].isFree = item.freeQuantity
                  // console.log("orderItems", item)
                  // console.log("orderItems", index, length)

                  let specialDiscountAmount = 0
                  let specialAmountValue = 0
                  if (item.specialDiscount == 1) {
                    specialAmountValue = (item.supplyPrice * item.specialDiscountValue) / 100
                    specialDiscountAmount = item.supplyPrice - specialAmountValue
                  }
                  orderItems[index].specialDiscountAmount = specialDiscountAmount
                  orderItems[index].specialAmountValue = specialAmountValue.toFixed(2)







                  if (index == length - 1) {
                    // let paymentIds = orders.data[0].paymentTypeIds ? JSON.parse(orders.data[0].paymentTypeIds)  : [] 

                    response.error = false
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.SuccessString
                    response.isPriceVisible = request.auth.isPriceVisible
                    response.isComplaint = complaintKey
                    response.salesRepDetails = salesRepObject
                    response.orderDetails = orders.data[0]
                    response.orderItems = orderItems
                    response.complaintCount = complaintCount
                    callback(response)
                  }
                }

              } else {
                response.error = false
                response.statusCode = STRINGS.successStatusCode
                response.message = STRINGS.SuccessString
                response.isPriceVisible = request.auth.isPriceVisible
                response.isComplaint = complaintKey
                response.salesRepDetails = salesRepObject
                response.orderDetails = orders.data[0]
                response.orderItems = getOrderItems.data
                response.complaintCount = complaintCount

                callback(response)
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
        console.log("error", e)
        response.error = true
        response.statusCode = STRINGS.errorStatusCode
        response.message = STRINGS.oopsErrorMessage
        callback(response)
      }
    }

    this.getIssueType = async (request, callback) => {
      try {
        var response = {}
        var issueType = await userOrdersModel.issueTypeModel()
        if (issueType.error) {
          response.error = true
          response.statusCode = STRINGS.successStatusCode
          response.message = STRINGS.commanErrorString
        } else {
          response.error = false
          response.statusCode = STRINGS.successStatusCode
          response.message = STRINGS.SuccessString
          response.issueType = issueType.data
        }
      } catch (e) {
        response.error = true
        response.statusCode = STRINGS.errorStatusCode
        response.message = STRINGS.oopsErrorMessage
      }
      callback(response)
    }

    this.addComplaint = async (request, callback) => {
      try {
        var localTime = new Date().toLocaleString(undefined, { timeZone: 'Asia/Kolkata' });
        var response = {}


        var orders = await userOrdersModel.checkOrderIdModel22(request.orderId)

        var checkPreviousComplaint = await userOrdersModel.checkPreviousComplaint()
        if (orders.error || checkPreviousComplaint.error) {
          response.error = true
          response.statusCode = STRINGS.successStatusCode
          response.message = STRINGS.commanErrorString
        } else {
          if (orders.data.length > 0) {

            var complaintObject = {}
            complaintObject.orderId = orders.data[0].bookingId
            complaintObject.complaintBy = 'USER'
            complaintObject.shopOwnerId = request.shopOwnerId

            var tckt = 'T1';
            var newTckt;
            // complaintObject.uploadImage = request.uploadImage
            if (checkPreviousComplaint.data.length > 0) {

              if (checkPreviousComplaint.data[0].ticketId.length > 0) {
                tckt = checkPreviousComplaint.data[0].ticketId;
                // Extract the prefix (first character) and the numeric part
                let prefix = tckt.substring(0, 1);
                let number = parseInt(tckt.substring(1)) + 1;

                // Concatenate them back together
                newTckt = prefix + number;

                console.log(newTckt); // Should log 'T16'
              } else {
                newTckt = tckt
              }

            } else {
              // Extract the prefix (first character) and the numeric part
              newTckt = tckt

            }

            console.log(newTckt); // Should log 'T16'




            complaintObject.ticketId = newTckt
            complaintObject.complaintDate = new Date(localTime)
            complaintObject.complaintStatus = 'Processing'
            // console.log("complaintObject", complaintObject)

            var checkComplaint = await userOrdersModel.checkComplaintModel1(complaintObject)
            // console.log("checkComplaint", checkComplaint)
            if (checkComplaint.error) {
              response.error = true
              response.statusCode = STRINGS.successStatusCode
              response.message = STRINGS.commanErrorString
            } else {
              // if (checkComplaint.data.length === 0) {

              let complaintProducts = request.complaintProducts

              for (let i = 0; i < complaintProducts.length; i++) {
                complaintProducts[i].ticketId = newTckt
              }



              var complaint = await userOrdersModel.saveComplaint2(complaintObject, complaintProducts)
              console.log("complaint save", complaint)
              if (complaint.error) {
                response.error = true
                response.statusCode = STRINGS.successStatusCode
                response.message = STRINGS.commanErrorString
              } else {
                var localTime = new Date().toLocaleString(undefined, { timeZone: 'Asia/Kolkata' });

                var profile = await userOrdersModel.profileModel(request.auth.id)

                let bookingId = orders.data[0].bookingId
                // var notificationObject = {}
                // notificationObject.complaintId = complaint.data[0]
                // notificationObject.orderId = orders.data[0].bookingId
                // // notificationObject.salesRepID = orders.data[0].salesRepID
                // notificationObject.outletId = request.auth.outletId
                // notificationObject.complaintStatus = 'Processing'
                // notificationObject.notifyType = 'PROCESSING'
                // notificationObject.title = 'COMPLAINTS'
                // notificationObject.viewBy = 'COMPLAINTS'
                // notificationObject.message = 'Complaint against order ' + orders.data[0].bookingId + ' has been processing'
                // notificationsService.sendToNotificationAdmin(notificationObject, () => { })




                let salesRepIdsData = []
                let secondarySalesRepIds = JSON.parse(profile.data[0].secondarySalesRepIds)
                let teitiarySalesRepIds = JSON.parse(profile.data[0].tertiarySalesRepIds)
                // console.log("profile.data[0].secondarySalesRepIds", secondarySalesRepIds)
                // console.log("profile.data[0].secondarySalesRepIds", teitiarySalesRepIds)


                if (profile.data[0].primarySalesRepId != null || profile.data[0].primarySalesRepId != undefined) {
                  salesRepIdsData.push(profile.data[0].primarySalesRepId)
                }
                if (secondarySalesRepIds.length > 0) {
                  salesRepIdsData = salesRepIdsData.concat(secondarySalesRepIds)
                }
                if (teitiarySalesRepIds.length > 0) {
                  salesRepIdsData = salesRepIdsData.concat(teitiarySalesRepIds)
                }


                // console.log("salesRepIdsData", salesRepIdsData)

                var checkkSalesRepForNotification = await userOrdersModel.checkkSalesRepForNotification(salesRepIdsData)

                if (checkkSalesRepForNotification.error == false) {
                  salesRepIdsData = checkkSalesRepForNotification.data
                }





                let orderTimeHours = new Date(localTime).getHours()
                let orderTimeMin = new Date(localTime).getMinutes()
                let orderTime = `${orderTimeHours}:${orderTimeMin}`

                let notificationObject1 = {}
                // notificationObject.id = "56"
                notificationObject1.orderId = bookingId
                // notificationObject.salesRepIds = JSON.stringify(salesRepIdsData)
                notificationObject1.customerID = profile.data[0].customerID
                // notificationObject.orderStatus = "ACCEPTED"
                // notificationObject.notifyType =  "ACCEPTED"
                // notificationObject.notifyType =  "ACCEPTED"
                notificationObject1.ticketId = complaintObject.ticketId
                // notificationObject1.totalAmount = orderObject.balanceAmount.toFixed(1)
                notificationObject1.orderTime = `${orderTimeHours}:${orderTimeMin}`
                notificationsService.sendComplaintStatusNotification12(notificationObject1, () => { })


                let notificationObject2 = {}
                // notificationObject.id = "56"
                notificationObject2.orderId = bookingId
                notificationObject2.salesRepIds = JSON.stringify(salesRepIdsData)
                notificationObject2.customerID = profile.data[0].customerID
                // notificationObject.orderStatus = "ACCEPTED"
                // notificationObject.notifyType =  "ACCEPTED"
                notificationObject2.shopName = profile.data[0].shopName
                notificationObject2.ticketId = complaintObject.ticketId
                // notificationObject2.totalAmount = orderObject.balanceAmount.toFixed(1)
                notificationObject2.orderTime = `${orderTimeHours}:${orderTimeMin}`
                notificationsService.sendPlaceOrderPushNotificationForUserComplaint(notificationObject2, () => { })





                let smsObj = {}
                smsObj.mobileNumber = profile.data[0].mobileNumber
                // smsObj.totalAmount = orderObject.balanceAmount.toFixed(1)
                smsObj.orderId = bookingId
                smsObj.ticketId = complaintObject.ticketId
                // smsObj.orderTime = `${orderTimeHours}:${orderTimeMin}`
                console.log("smsObj", smsObj)
                var sendShopOwnerSms = await smsTemplates.shopOwnerOpenComplaint(smsObj)
                console.log("sendShopOwnerSms", sendShopOwnerSms)


                var updateNotifications4 = {}
                updateNotifications4.orderId = orders.data[0].id
                updateNotifications4.ownerId = request.auth.id
                updateNotifications4.managerId = request.auth.id
                updateNotifications4.salesRepId = profile.data[0].primarySalesRepId
                updateNotifications4.complaintId = complaint.data[0]
                updateNotifications4.notifyType = JSON.stringify(['US'])
                updateNotifications4.type = 'COMPLAINT'
                updateNotifications4.notifyDate = new Date(localTime)
                updateNotifications4.complaintReasonId = request.issueType
                updateNotifications4.color = "#b5eee3"
                updateNotifications4.notificationMsg = `<p style="font-size: 14px;">Fetch: You have <b>OPENED</b> a complaint with Ticket ID <b>${complaintObject.ticketId}</b> for Order ID <b>${bookingId}</b> at <b>${orderTime}</b>.</p>`
                userOrdersModel.saveNotificationsModel(updateNotifications4, () => { })

                for (let j = 0; j < salesRepIdsData.length; j++) {

                  var getOnesalesRepForNotification = await userOrdersModel.getOnesalesRepForNotification(salesRepIdsData[j])
                  // console.log("getOnesalesRepForNotification", getOnesalesRepForNotification)
                  if (getOnesalesRepForNotification.data.length > 0) {

                    let updateNotifications6 = {}
                    updateNotifications6.orderId = orders.data[0].id
                    updateNotifications6.ownerId = request.auth.id
                    updateNotifications6.managerId = request.auth.id
                    updateNotifications6.salesRepId = salesRepIdsData[j]
                    updateNotifications6.type = "COMPLAINT"
                    updateNotifications6.notifyType = JSON.stringify(['SR'])
                    updateNotifications6.notifyDate = new Date(localTime)
                    updateNotifications6.activeStatus = 1
                    updateNotifications6.color = '#b5eee3'
                    updateNotifications6.complaintId = complaint.data[0]
                    updateNotifications6.notificationMsg = `<p style="font-size: 14px;">Fetch: <b>${profile.data[0].shopName}</b> has <b>OPENED</b>  a complaint with Ticket ID <b>${complaintObject.ticketId}</b> for Order ID <b>${bookingId}</b> at <b>${orderTime}</b>.</p>`
                    userOrdersModel.saveNotificationsModel(updateNotifications6, () => { })


                    let getOnesalesRepForSms = await userOrdersModel.getOnesalesRepForSms(salesRepIdsData[j])
                    console.log("getOnesalesRepForSms", getOnesalesRepForSms)
                    if (getOnesalesRepForSms.error == false) {

                      if (getOnesalesRepForSms.data.length > 0) {
                        let smsObj = {}
                        smsObj.mobileNumber = getOnesalesRepForSms.data[0].mobile
                        // smsObj.totalAmount = orderObject.balanceAmount.toFixed(1)
                        smsObj.orderId = bookingId
                        smsObj.ticketId = complaintObject.ticketId
                        // smsObj.orderTime = `${orderTimeHours}:${orderTimeMin}`
                        smsObj.shopName = profile.data[0].shopName

                        console.log("smsObj", smsObj)
                        var sendShopOwnerSms = await smsTemplates.shopOwnerOpenComplaintForSalesRep(smsObj)
                        // console.log("sendShopOwnerSms", sendShopOwnerSms)

                      }
                    }









                  }
                }


                response.error = false
                response.statusCode = STRINGS.successStatusCode
                response.message = STRINGS.SuccessString
              }
              // } 


              // else {
              //   response.error = true
              //   response.statusCode = STRINGS.successStatusCode
              //   response.message = STRINGS.complaintErrorString
              // }
            }
          } else {
            response.error = true
            response.statusCode = STRINGS.successStatusCode
            response.message = STRINGS.invalidIDErrorString
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

    this.getComplaintList = async (request, callback) => {
      try {
        var response = {}
        // if (request.auth.userType === 'OWNER') {
        //   var object = { shopOwnerId: request.auth.id, orderId: request.orderId }
        // } else {
        //   var object = { complaintBy: request.auth.id, orderId: request.orderId }
        // }
        var object = {
          shopOwnerId: request.auth.ownerId,
          orderId: request.orderId
        }
        var complaintResponse = await userOrdersModel.getAllComplaints(object)
        if (complaintResponse.error) {
          response.error = true
          response.statusCode = STRINGS.successStatusCode
          response.message = STRINGS.commanErrorString
        } else {
          if (complaintResponse.data.length > 0) {
            request.pageCount = 10
            var pageCount = await utils.pageCount(complaintResponse.data.length, 10)

            var list = await userOrdersModel.complaintListModel(object, request)
            if (list.error) {
              response.error = true
              response.statusCode = STRINGS.successStatusCode
              response.message = STRINGS.commanErrorString
            } else {
              response.error = false
              response.statusCode = STRINGS.successStatusCode
              response.message = STRINGS.SuccessString
              response.pages = pageCount
              response.count = complaintResponse.data.length
              response.complaint = list.data
            }
          } else {
            response.error = false
            response.statusCode = STRINGS.successStatusCode
            response.message = STRINGS.SuccessString
            response.pages = 0
            response.complaint = complaintResponse.data
          }
        }
      } catch (e) {
        response.error = true
        response.statusCode = STRINGS.errorStatusCode
        response.message = STRINGS.oopsErrorMessage
      }
      callback(response)
    }


    this.updateUserDeliveryStatus = async (request, callback) => {
      try {
        var response = {}
        var object = {
          'orders.id': request.orderId
        }
        var localTime = new Date().toLocaleString(undefined, { timeZone: 'Asia/Kolkata' });
        // object.deliveredDate =new Date(localTime)
        var checkOrder = await userOrdersModel.getMyorderList(object)
        if (checkOrder.error) {
          response.error = true
          response.statusCode = STRINGS.successStatusCode
          response.message = STRINGS.commanErrorString
        } else {
          if (checkOrder.data.length > 0) {
            var status = checkOrder.data[0].orderStatus


            if (status === 'SHIPPED') {
              var updateStatus = await userOrdersModel.updateDeliveryStatusModel(request.orderId)
              if (updateStatus.error) {
                response.error = true
                response.statusCode = STRINGS.successStatusCode
                response.message = STRINGS.commanErrorString
              } else {
                var notificationObject = {}
                notificationObject.id = checkOrder.data[0].id
                notificationObject.orderId = checkOrder.data[0].bookingId
                notificationObject.salesRepID = checkOrder.data[0].salesRepID
                notificationObject.outletId = checkOrder.data[0].outletId
                notificationObject.notifyType = 'ORDERDELIVERD'
                notificationObject.title = 'ORDERS'
                notificationObject.viewBy = 'ORDERS'
                notificationObject.message = 'The order ' + checkOrder.data[0].bookingId + ' has been received'
                notificationsService.sendToNotificationAdmin(notificationObject, () => { })



                // let salesRepIdsData = []
                // let secondarySalesRepIds = JSON.parse(profile.data[0].secondarySalesRepIds)
                // let teitiarySalesRepIds = JSON.parse(profile.data[0].tertiarySalesRepIds)
                // console.log("profile.data[0].secondarySalesRepIds", secondarySalesRepIds)
                // console.log("profile.data[0].secondarySalesRepIds", teitiarySalesRepIds)


                // if (profile.data[0].primarySalesRepId != null || profile.data[0].primarySalesRepId != undefined) {
                //   salesRepIdsData.push(profile.data[0].primarySalesRepId)
                // }
                // if (secondarySalesRepIds.length > 0) {
                //   salesRepIdsData = salesRepIdsData.concat(secondarySalesRepIds)
                // }
                // if (teitiarySalesRepIds.length > 0) {
                //   salesRepIdsData = salesRepIdsData.concat(teitiarySalesRepIds)
                // }


                // console.log("salesRepIdsData", salesRepIdsData)

                // var checkkSalesRepForNotification = await userOrdersModel.checkkSalesRepForNotification(salesRepIdsData)

                // if (checkkSalesRepForNotification.error == false) {
                //   salesRepIdsData = checkkSalesRepForNotification.data
                // }

                // let bookingId = orders.data[0].bookingId



                // var notificationObject = {}
                // notificationObject.id = "56"
                // notificationObject.orderId = bookingId
                // notificationObject.salesRepIds = profile.data[0].salesRepIds
                // notificationObject.customerID = profile.data[0].customerID
                // notificationObject.orderStatus = "COMPLAINT"
                // notificationObject.notifyType = "COMPLAINT"
                // notificationObject.shopName = profile.data[0].shopName
                // notificationObject.productCode = checkProduct.data.length > 0 ? checkProduct.data[0].productCode : 'Product'
                // notificationsService.sendOpenComplaintNotificationForShopOwner(notificationObject, () => { })

                // var notificationObject = {}
                // notificationObject.id = "56"
                // notificationObject.orderId = bookingId
                // notificationObject.salesRepIds = JSON.stringify(salesRepIdsData)
                // notificationObject.customerID = profile.data[0].customerID
                // notificationObject.orderStatus = "COMPLAINT"
                // notificationObject.notifyType = "COMPLAINT"
                // notificationObject.shopName = profile.data[0].shopName
                // notificationObject.productCode = checkProduct.data.length > 0 ? checkProduct.data[0].productCode : 'Product'
                // notificationsService.sendOpenComplaintNotificationForSalesRep(notificationObject, () => { })

                // let product_code = checkProduct.data.length > 0 ? checkProduct.data[0].productCode : 'Product'



                // var updateNotifications = {}
                // updateNotifications.orderId = orders.data[0].id
                // updateNotifications.ownerId = complaint.data[0].ownerId
                // updateNotifications.managerId = complaint.data[0].cartUserId
                // updateNotifications.salesRepId = profile.data[0].primarySalesRepId
                // updateNotifications.complaintId = complaint.data[0]
                // updateNotifications.notifyType = JSON.stringify(['US'])
                // updateNotifications.type = 'COMPLAINT'
                // updateNotifications.notifyDate = new Date(localTime)
                // updateNotifications.complaintReasonId = request.issueType
                // updateNotifications.color = "#b5eee3"
                // updateNotifications.notificationMsg = `<p style="font-size: 14px;">Fetch: You have <b>OPENED</b> a complaint on Order ID <b>${bookingId}</b> for the product <b>${product_code}</b>.</p>`
                // userOrdersModel.saveNotificationsModel(updateNotifications, () => { })

                // for (let j = 0; j < salesRepIdsData.length; j++) {

                //   var getOnesalesRepForNotification = await userOrdersModel.getOnesalesRepForNotification(salesRepIdsData[j])
                //   // console.log("getOnesalesRepForNotification", getOnesalesRepForNotification)
                //   if (getOnesalesRepForNotification.data.length > 0) {

                //     var updateNotifications = {}
                //     updateNotifications.orderId = orders.data[0].id
                //     updateNotifications.ownerId = request.auth.id
                //     updateNotifications.managerId = request.auth.id
                //     updateNotifications.salesRepId = salesRepIdsData[j]
                //     updateNotifications.type = "COMPLAINT"
                //     updateNotifications.notifyType = JSON.stringify(['SR'])
                //     updateNotifications.notifyDate = new Date(localTime)
                //     updateNotifications.activeStatus = 1
                //     updateNotifications.color = '#b5eee3'
                //     updateNotifications.notificationMsg = `<p style="font-size: 14px;">Fetch: <b>${profile.data[0].shopName}</b> has <b>OPENED</b> a complaint on Order ID <b>${bookingId}</b> for the product <b>${product_code}</b>.</p>`
                //     userOrdersModel.saveNotificationsModel(updateNotifications, () => { })

                //   }

                //   // var getOnesalesRepForSms = await userOrdersModel.getOnesalesRepForSms(salesRepIdsData[j])
                //   // // console.log("getOnesalesRepForSms", getOnesalesRepForSms)
                //   // if (getOnesalesRepForSms.error == false) {

                //   //   if (getOnesalesRepForSms.data.length > 0) {
                //   //     let smsObj = {}
                //   //     smsObj.mobileNumber = getOnesalesRepForSms.data[0].mobile
                //   //     smsObj.totalAmount = orderObject.balanceAmount.toFixed(1)
                //   //     smsObj.orderId = bookingId
                //   //     smsObj.orderTime = `${orderTimeHours}:${orderTimeMin}`
                //   //     smsObj.shopName = profile.data[0].shopName

                //   //     console.log("smsObj", smsObj)
                //   //     var sendShopOwnerSms = await smsTemplates.shopOwnerPlaceOrderSmsForSalesRep(smsObj)
                //   //     console.log("sendShopOwnerSms", sendShopOwnerSms)

                //   //   }
                //   // }


                // }






















                response.error = false
                response.statusCode = STRINGS.successStatusCode
                response.message = STRINGS.SuccessString
              }
            } else {
              response.error = true
              response.statusCode = STRINGS.successStatusCode
              response.message = STRINGS.updateStatusErrorString
            }
          } else {
            response.error = true
            response.statusCode = STRINGS.successStatusCode
            response.message = STRINGS.invalidIDErrorString
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

    this.addProductEnquiry = async (request, callback) => {
      try {
        var response = {}
        var enquiryObject = {}
        enquiryObject.userId = request.auth.id
        enquiryObject.uploadImage = request.uploadImage
        enquiryObject.description = request.description
        enquiryObject.customerID = request.auth.customerID
        enquiryObject.status = "Open"
        var save = await userOrdersModel.saveEnquiry(enquiryObject)
        if (save.error) {
          response.error = true
          response.statusCode = STRINGS.successStatusCode
          response.message = STRINGS.commanErrorString
        } else {
          response.error = false
          response.statusCode = STRINGS.successStatusCode
          response.message = STRINGS.SuccessString
        }
      } catch (e) {
        response.error = true
        response.statusCode = STRINGS.errorStatusCode
        response.message = STRINGS.oopsErrorMessage
      }
      callback(response)
    }

    this.userPayRequest = async (request, callback) => {
      try {
        var response = {}
        var paidObject = {
          ownerId: request.ownerId,
          paidBy: request.auth.id,
          requestAmount: request.requestAmount,
          requestStatus: 'Pending',
          payTypeID: request.payTypeID,
          chequeNumber: request.chequeNumber,
          chequeImage: request.chequeImage
        }

        if (paidObject.payTypeID == 3) {
          paidObject.activeStatus = 0
        }

        var result = await userOrdersModel.savePaidAmountModel(paidObject)
        if (result.error) {
          response.error = true
          response.statusCode = STRINGS.successStatusCode
          response.message = STRINGS.commanErrorString
        } else {
          var payment = await userOrdersModel.checkUserPayentModel(result.data[0])
          var notificationObject = {}
          notificationObject.userId = request.auth.id
          notificationObject.outletId = request.auth.outletId
          notificationObject.amount = request.requestAmount
          notificationObject.notifyType = 'USERPAYEMNT'
          notificationObject.paymentType = payment.data[0].paymentType

          if (request.auth.userType === 'OWNER') {
            notificationObject.name = payment.data[0].ownerName
          } else {
            notificationObject.name = payment.data[0].managerName
          }
          notificationObject.message = notificationObject.name + ' Rs.' + request.requestAmount + ' has paid on ' + notificationObject.paymentType
          notificationsService.userPaymentRequestNotification(notificationObject, () => { })

          var updateNotifications = {}
          updateNotifications.ownerId = request.ownerId
          updateNotifications.managerId = request.auth.id
          if (request.auth.userType === 'OWNER') {
            updateNotifications.notifyType = JSON.stringify(['AD'])
            updateNotifications.type = 'USER_PAY_PROCESSING'
          } else {
            updateNotifications.notifyType = JSON.stringify(['AD', 'US'])
            updateNotifications.type = 'MANAGER_PAY_PROCESSING'
            notificationObject.ownerId = request.auth.ownerId
            notificationObject.notifyKey = 'USER_PAYEMNT'
            notificationObject.viewBy = 'USER_PAYEMNT'
            notificationsService.managerNotificationToOwner(notificationObject, () => { })
          }
          updateNotifications.notifyDate = new Date()
          updateNotifications.payTypeID = request.payTypeID
          updateNotifications.amount = request.requestAmount
          userOrdersModel.saveNotificationsModel(updateNotifications, () => { })

          response.error = false
          response.statusCode = STRINGS.successStatusCode
          response.message = STRINGS.SuccessString
          response.orderId = result.data[0]

        }
      } catch (e) {
        response.error = true
        response.statusCode = STRINGS.errorStatusCode
        response.message = STRINGS.oopsErrorMessage
      }
      callback(response)
    }

    this.userComplaintReopen = async (request, callback) => {
      try {
        var response = {}
        var checkComplaint = await userOrdersModel.getComplaintsByIdModel(request.complaintId)
        if (checkComplaint.error) {
          response.error = true
          response.statusCode = STRINGS.successStatusCode
          response.message = STRINGS.commanErrorString
        } else {
          if (checkComplaint.data.length > 0) {
            var object = {
              id: request.complaintId,
              complaintStatus: 'Reopened'
            }
            if (checkComplaint.data[0].reopenDate == null) {
              object.reopenDate = new Date()
              object.closeDate = null
            }
            if (checkComplaint.data[0].complaintStatus === 'Resolved') {
              object.reopenDate = new Date()
            }
            var result = await userOrdersModel.updateComplaintStatus(object)
            if (result.error) {
              response.error = true
              response.statusCode = STRINGS.successStatusCode
              response.message = STRINGS.commanErrorString
            } else {
              var notificationObject = {}
              notificationObject.complaintId = request.complaintId
              notificationObject.orderId = checkComplaint.data[0].bookingId
              notificationObject.salesRepID = checkComplaint.data[0].salesRepID
              notificationObject.outletId = checkComplaint.data[0].outletId
              notificationObject.complaintStatus = 'Reopened'
              notificationObject.notifyType = 'REOPENED'
              notificationObject.title = 'COMPLAINTS'
              notificationObject.viewBy = 'COMPLAINTS'
              notificationObject.message = 'Complaint against order ' + checkComplaint.data[0].bookingId + ' has been reopened'
              notificationsService.sendToNotificationAdmin(notificationObject, () => { })

              var updateNotifications = {}
              updateNotifications.ownerId = checkComplaint.data[0].shopOwnerId
              updateNotifications.managerId = checkComplaint.data[0].complaintBy
              updateNotifications.productId = checkComplaint.data[0].productId
              updateNotifications.orderId = checkComplaint.data[0].orderId
              updateNotifications.salesRepId = checkComplaint.data[0].salesRepID
              updateNotifications.complaintId = request.complaintId
              updateNotifications.notifyType = JSON.stringify(['AD', 'SR'])
              updateNotifications.type = 'COMPLAINT_REOPEN'
              updateNotifications.notifyDate = new Date()
              updateNotifications.complaintReasonId = checkComplaint.data[0].issueType

              userOrdersModel.saveNotificationsModel(updateNotifications, () => { })

              response.error = false
              response.statusCode = STRINGS.successStatusCode
              response.message = STRINGS.SuccessString
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

    // Payment History

    this.userPaymenthistory = async (request, callback) => {
      var response = {}
      try {
        // console.log("auth request", request.auth)
        // var id = request.ownerId ? request.ownerId : request.auth.ownerId
        var id = request.auth.ownerId

        var findCustomer = await userOrdersModel.profileModel(id)
        // console.log('find Customer*******************', id);
        if (findCustomer.error) {
          response.error = true
          response.statusCode = STRINGS.successStatusCode
          response.message = STRINGS.commanErrorString
        } else {
          var customerID = findCustomer.data[0].customerID
          // var customerID = 511744022
          // console.log('calll')
          //         var convert = require('xml-js');
          //         var xml = fs.readFileSync('./Tally.xml')
          // var result1 = convert.xml2json(xml, {compact: true, spaces: 4});
          // var result2 = convert.xml2json(xml, {compact: false, spaces: 4});
          // var ledgerData = JSON.parse(result1)
          // // console.log(ledgerData['ENVELOPE']['LEDGERS'])

          // var rawdata = fs.readFileSync(process.env.USER_LEDGER)
          // var r =require('../../../../html')


          var rawdata = fs.readFileSync(path.resolve(__dirname, `../../../../../www/html/${process.env.USER_LEDGER}`))

          var ledgerData = JSON.parse(parser.toJson(rawdata, {
            reversible: true
          }));
          // console.log("ledgerData",ledgerData)
          var newrawdata = ledgerData['ENVELOPE']['LEDGERS']
          if (newrawdata.length > 0) {

            var filterLedger = newrawdata.filter(function (item) {
              return item.LEDGERCODE.$t == customerID
            })

            console.log("filterLedger", filterLedger)

            if (filterLedger.length > 0) {
              var historyResult = filterLedger[0].HISTORY
              if (!Array.isArray(filterLedger[0].HISTORY)) {
                var pushArray = []
                pushArray.push(filterLedger[0].HISTORY)
                var historyResult = pushArray
              }
              if (filterLedger[0].HISTORY == undefined) {

                var historyResult = []
              }

              var resp = []
              if (historyResult.lenth != 0 &&
                request.fromDate.length != 0 && request.toDate.length != 0) {
                // console.log("historyResult", historyResult)
                historyResult.forEach((val, ind) => {
                  var date = new Date(val.DATE.$t)
                  // console.log("date history", date)
                  var startDate = new Date(request.fromDate);
                  var toDate = new Date(request.toDate);
                  // console.log("date startDate", startDate)
                  // console.log("date toDate", toDate)

                  if (startDate.getTime() <= date.getTime() && toDate.getTime() >= date.getTime()) {
                    resp.push(val)
                  }
                })
              } else {
                resp = historyResult
              }

              response.error = false
              response.statusCode = STRINGS.successStatusCode
              response.message = STRINGS.SuccessString
              response.openingBalance = filterLedger[0].OPENINGBALANCE.$t
              response.outstandingBalance = filterLedger[0].CLOSINGBALANCE.$t
              response.totalDebit = filterLedger[0].TOTALDEBIT.$t
              response.totalCredit = filterLedger[0].TOTALCREDIT.$t
              response.history = resp
            } else {
              response.error = false
              response.statusCode = STRINGS.successStatusCode
              response.message = STRINGS.SuccessString
              response.openingBalance = 0
              response.outstandingBalance = 0
              response.totalDebit = 0
              response.totalCredit = 0
              response.history = []
            }
          } else {
            response.error = false
            response.statusCode = STRINGS.successStatusCode
            response.message = STRINGS.SuccessString
            response.openingBalance = 0
            response.outstandingBalance = 0
            response.totalDebit = 0
            response.totalCredit = 0
            response.history = []
          }
        }
      } catch (e) {
        console.log('find catch **********************************');
        // console.log(e)
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

      }
      // callback(PAYMENT)
      callback(response)
    }

    this.userPaymentRequestList = async (request, callback) => {
      try {
        var response = {}
        request.type = 'TOTAL'
        var payment = await userOrdersModel.getPyamentByDateModel(request)
        console.log("payment", payment)
        if (payment.error) {
          response.error = true
          response.statusCode = STRINGS.successStatusCode
          response.message = STRINGS.commanErrorString
          callback(response)
        } else {
          if (payment.data.length > 0) {
            request.type = 'LIST'
            request.pageCount = 10
            var pageCount = await utils.pageCount(payment.data.length, 10)
            var paymentResult = await userOrdersModel.getPyamentByDateModel(request)
            if (paymentResult.error) {
              response.error = true
              response.statusCode = STRINGS.successStatusCode
              response.message = STRINGS.commanErrorString
              callback(response)
            } else {
              if (paymentResult.data.length > 0) {
                var paymentListArray = paymentResult.data
                var length = paymentListArray.length
                paymentListArray.forEach(async function (item, index) {
                  var paymentDetails = await userOrdersModel.getPayemntDetailsListModel(item)
                  console.log("paymentDetails", paymentDetails)
                  paymentListArray[index].list = paymentDetails.data
                  if (--length === 0) {
                    response.error = false
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.SuccessString
                    response.pages = pageCount
                    response.payments = paymentListArray
                    callback(response)
                  }
                })
              } else {
                response.error = false
                response.statusCode = STRINGS.successStatusCode
                response.message = STRINGS.SuccessString
                response.pages = pageCount
                response.payments = paymentResult.data
                callback(response)
              }
            }
          } else {
            response.error = false
            response.statusCode = STRINGS.successStatusCode
            response.message = STRINGS.SuccessString
            response.pages = 0
            response.payments = payment.data
            callback(response)
          }
        }
      } catch (e) {
        response.error = true
        response.statusCode = STRINGS.errorStatusCode
        response.message = STRINGS.oopsErrorMessage
        callback(response)
      }
    }
    this.myWalletService = async (request, callback) => {
      try {
        var response = {}
        console.log("Request**", request);
        var payment = await userOrdersModel.getWalletTransactionListModel(request)


        console.log("getWalletTransactionListModel**", payment);
        if (payment.error) {
          response.error = true
          response.statusCode = STRINGS.successStatusCode
          response.message = STRINGS.commanErrorString
          callback(response)
        } else {
          if (payment.data.length > 0) {
            var creditAmount = payment.data.filter(data => data.paymentType == 'credit').map(data => data.amount).reduce(function (temp, data) {
              return temp + data;
            }, 0);
            var debitAmount = payment.data.filter(data => data.paymentType == 'debit').map(data => data.amount).reduce(function (temp, data) {
              return temp + data;
            }, 0);
            var balanceAmount = creditAmount - debitAmount
          } else {
            var creditAmount = 0
            var debitAmount = 0
            var balanceAmount = 0
          }
          response.error = false
          response.statusCode = STRINGS.successStatusCode
          response.message = STRINGS.SuccessString
          response.pages = 0
          response.totalCredit = creditAmount
          response.balanceAmount = balanceAmount
          response.totalDebit = debitAmount
          response.myWallet = payment.data
          callback(response)
        }
      } catch (e) {
        response.error = true
        response.statusCode = STRINGS.errorStatusCode
        response.message = STRINGS.oopsErrorMessage
        callback(response)
      }
    }


    this.searchProductCountService = async (request, callback) => {
      try {
        var response = {}
        var productCount = {}
        productCount.productId = request.productId
        productCount.userId = request.auth.id
        productCount.userOutlet = request.auth.outletId
        var products = await userOrdersModel.updateSearchProductCount(productCount)
        if (products.error) {
          response.error = true
          response.statusCode = STRINGS.successStatusCode
          response.message = STRINGS.commanErrorString
        } else {
          response.error = false
          response.statusCode = STRINGS.successStatusCode
          response.message = STRINGS.SuccessString
        }
      } catch (e) {
        response.error = true
        response.statusCode = STRINGS.errorStatusCode
        response.message = STRINGS.oopsErrorMessage
      }
      callback(response)
    }


    this.searchOrderProductService = async (request, callback) => {
      try {
        var response = {}

        var searchOrderProductDao = await userOrdersModel.searchOrderProductDao(request)
        if (searchOrderProductDao.error) {
          response.error = true
          response.statusCode = STRINGS.successStatusCode
          response.message = STRINGS.commanErrorString
        } else {
          response.error = false
          response.statusCode = STRINGS.successStatusCode
          response.message = STRINGS.SuccessString
          response.data = searchOrderProductDao.data
        }
      } catch (e) {
        console.log(e)
        response.error = true
        response.statusCode = STRINGS.errorStatusCode
        response.message = STRINGS.oopsErrorMessage
      }
      callback(response)
    }




    this.viewOneComplaintService = async (request, callback) => {
      try {
        var response = {}

        var viewOneComplaintService = await userOrdersModel.viewOneComplaintModel(request)
        if (viewOneComplaintService.error) {
          response.error = true
          response.statusCode = STRINGS.successStatusCode
          response.message = STRINGS.commanErrorString
        } else if (viewOneComplaintService.data.length > 0) {

          let obj = {}
          obj.ticketId = viewOneComplaintService.data[0].ticketId
          obj.orderId = viewOneComplaintService.data[0].orderId
          obj.shopName = viewOneComplaintService.data[0].shopName
          obj.shopAddress = viewOneComplaintService.data[0].shopAddress
          obj.orderDate = viewOneComplaintService.data[0].orderDate
          obj.complaintDate = viewOneComplaintService.data[0].complaintDate
          if (viewOneComplaintService.data[0].complaintBy == 'USER') {
            obj.RaisedBy = 'Shop Owner'
            obj.name = viewOneComplaintService.data[0].ShopOwnerName
          } else {
            obj.RaisedBy = 'Sales Rep'

          }
          obj.complaintStatus = viewOneComplaintService.data[0].complaintStatus
          obj.complaintStatus = viewOneComplaintService.data[0].complaintStatus
          obj.complaintFile = viewOneComplaintService.data[0].complaintFile


          var viewOneComplaintOrderItemsModel = await userOrdersModel.viewOneComplaintOrderItemsModel(obj)
          if (viewOneComplaintOrderItemsModel.error) {
            response.error = true
            response.statusCode = STRINGS.successStatusCode
            response.message = STRINGS.commanErrorString
          } else if (viewOneComplaintOrderItemsModel.data.length > 0) {
            obj.complaintProducts = viewOneComplaintOrderItemsModel.data
          } else {
            obj.complaintProducts = []

          }



          response.error = false
          response.statusCode = STRINGS.successStatusCode
          response.message = STRINGS.SuccessString
          response.data = obj
        }
      } catch (e) {
        console.log(e)
        response.error = true
        response.statusCode = STRINGS.errorStatusCode
        response.message = STRINGS.oopsErrorMessage
      }
      callback(response)
    }



    this.getAllComplaintList = async (request, callback) => {
      try {
        var response = {}
        // console.log(request)
        var object = {
          complaintBy: request.userId,
          pageNumber: request.pageNumber
        }
        var getAllOrdersComplaintsModel = await userOrdersModel.getAllOrdersComplaintsModel(object)
        console.log("getAllOrdersComplaintsModel", getAllOrdersComplaintsModel)

        if (getAllOrdersComplaintsModel.error) {
          response.error = true
          response.statusCode = STRINGS.successStatusCode
          response.message = STRINGS.commanErrorString
        } else {
          if (getAllOrdersComplaintsModel.data.length > 0) {
            var getOrdersComplaintsModel = await userOrdersModel.getOrdersComplaintsModel(object)
            console.log("getOrdersComplaintsModel", getOrdersComplaintsModel)
            var pageCount = await utils.pageCount(getAllOrdersComplaintsModel.data.length, 10)
            let result = []

            for (var i = 0; i < getOrdersComplaintsModel.data.length; i++) {
              let item = getOrdersComplaintsModel.data[i]
              let obj = {}
              obj.ticketId = item.ticketId
              obj.orderId = item.orderId
              obj.shopName = item.shopName
              obj.orderDate = item.orderDate
              obj.complaintDate = item.complaintDate
              if (item.complaintBy == 'USER') {
                obj.RaisedBy = 'Shop Owner'
                obj.name = item.ShopOwnerName
              } else {
                obj.RaisedBy = 'Sales Rep'
                obj.name = item.salesRepName

              }

              result.push(obj)
            }

            response.error = false
            response.statusCode = STRINGS.successStatusCode
            response.message = STRINGS.SuccessString
            response.pages = pageCount
            response.complaint = result
          } else {
            response.error = false
            response.statusCode = STRINGS.successStatusCode
            response.message = STRINGS.SuccessString
            response.pages = 0
            response.complaint = getAllOrdersComplaintsModel.data
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


    this.viewOneOrderComplaintService = async (request, callback) => {
      try {
        var response = {}


        let obj = {}
        var viewOneComplaintOrderItemsModel = await userOrdersModel.viewOneComplaintOrderItemsModel1(request)
        if (viewOneComplaintOrderItemsModel.error) {
          response.error = true
          response.statusCode = STRINGS.successStatusCode
          response.message = STRINGS.commanErrorString
        } else if (viewOneComplaintOrderItemsModel.data.length > 0) {


          obj.ticketId = viewOneComplaintOrderItemsModel.data[0].ticketId
          obj.orderId = viewOneComplaintOrderItemsModel.data[0].orderId
          obj.productCode = viewOneComplaintOrderItemsModel.data[0].productCode
          obj.ProductName = viewOneComplaintOrderItemsModel.data[0].ProductName
          obj.complaintText = viewOneComplaintOrderItemsModel.data[0].complaintText
          obj.reason = viewOneComplaintOrderItemsModel.data[0].reason
          obj.quantity = viewOneComplaintOrderItemsModel.data[0].quantity





          if (viewOneComplaintOrderItemsModel.data[0].complaintBy == 'USER') {
            obj.RaisedBy = 'Shop Owner'
            obj.name = viewOneComplaintOrderItemsModel.data[0].ShopOwnerName
          } else {
            obj.RaisedBy = 'Sales Rep'
            obj.name = viewOneComplaintOrderItemsModel.data[0].salesRepName

          }





          response.error = false
          response.statusCode = STRINGS.successStatusCode
          response.message = STRINGS.SuccessString
          // response.complaintFile = viewOneComplaintOrderItemsModel.data[0].complaintFile
          response.data = viewOneComplaintOrderItemsModel.data
        } else {
          response.error = false
          response.statusCode = STRINGS.successStatusCode
          response.message = STRINGS.SuccessString
          // response.complaintFile = ''
          response.data = viewOneComplaintOrderItemsModel.data
        }




      } catch (e) {
        console.log(e)
        response.error = true
        response.statusCode = STRINGS.errorStatusCode
        response.message = STRINGS.oopsErrorMessage
      }
      callback(response)
    }







  }
}




export default UserOrdersService;