
import async from 'async'

import STRINGS from '../../../strings.json'
import Utils from '../../../utils/utils'
import SalesRepComplaintModel from '../models/salesRepComplaintModel'
import NotificationsService from '../../../utils/notificationsService'
import SmsTemplates from '../../../smsTemplates'

require('dotenv').config();

const salesRepComplaintModel = new SalesRepComplaintModel
const notificationsService = new NotificationsService
const smsTemplates = new SmsTemplates

const utils = new Utils()




class SalesRepComplaintService {
  constructor() {


    this.viewComplaintListService1 = async (request, callback) => {
      try {
        var response = {}
        request.queryType = 'TOTAL'
        var getComplaint = await salesRepComplaintModel.getShopComplaintModel(request)
        if (getComplaint.error) {
          response.error = true
          response.statusCode = STRINGS.successStatusCode
          response.message = STRINGS.commanErrorString
        } else {
          if (getComplaint.data.length > 0) {
            request.pageCount = 10
            request.queryType = 'LIST'
            var pageCount = await utils.pageCount(getComplaint.data.length, 10)
            var results = await salesRepComplaintModel.getShopComplaintModel(request)
            if (results.error) {
              response.error = true
              response.statusCode = STRINGS.successStatusCode
              response.message = STRINGS.commanErrorString
            } else {
              response.error = false
              response.statusCode = STRINGS.successStatusCode
              response.message = STRINGS.SuccessString
              response.pages = pageCount
              response.complaintList = results.data
            }
          } else {
            response.error = false
            response.statusCode = STRINGS.successStatusCode
            response.message = STRINGS.SuccessString
            response.pages = 0
            response.complaintList = getComplaint.data
          }
        }
      } catch (e) {
        response.error = true
        response.statusCode = STRINGS.errorStatusCode
        response.message = STRINGS.oopsErrorMessage
      }
      callback(response)
    }




    this.viewComplaintListService = async (request, callback) => {
      try {
        var response = {}
        // console.log(request)
        // var object = {
        //   complaintBy: request.userId,
        //   pageNumber: request.pageNumber
        // }
        var getAllOrdersComplaintsModel = await salesRepComplaintModel.getAllOrdersComplaintsModel(request)
        console.log("getAllOrdersComplaintsModel", getAllOrdersComplaintsModel)

        if (getAllOrdersComplaintsModel.error) {
          response.error = true
          response.statusCode = STRINGS.successStatusCode
          response.message = STRINGS.commanErrorString
        } else {
          if (getAllOrdersComplaintsModel.data.length > 0) {
            var getOrdersComplaintsModel = await salesRepComplaintModel.getOrdersComplaintsModel(request)
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










    this.viewComplaintDetailService = async (request, callback) => {
      try {
        var response = {}
        var result = await salesRepComplaintModel.viewComplaintDetailModel(request)
        if (result.error) {
          response.error = true
          response.statusCode = STRINGS.successStatusCode
          response.message = STRINGS.commanErrorString
        } else {
          if (result.data.length > 0) {
            var complaint = result.data[0].complaintStatus
            if (complaint === 'Processing' && result.data[0].openDate === null) {
              var data = { id: request.complaintId, complaintStatus: 'Acknowledged', openDate: new Date() }
              await salesRepComplaintModel.adminUpdateComplaintStatusModel(data)

              var notificationObject = {}
              notificationObject.complaintId = result.data[0].id
              notificationObject.orderId = result.data[0].orderId,
                notificationObject.productCode = result.data[0].productCode
              notificationObject.userIds = [result.data[0].shopOwnerId, result.data[0].complaintBy]
              notificationObject.orderStatus = 'acknowledged'
              notificationObject.notifyType = 'Acknowledged'
              notificationsService.sendComplaintStatusNotification(notificationObject, () => { })

              var updateNotifications = {}
              updateNotifications.ownerId = result.data[0].ownerId
              updateNotifications.managerId = result.data[0].cartUserId
              updateNotifications.orderId = result.data[0].ordId
              updateNotifications.complaintId = result.data[0].id
              updateNotifications.notifyType = JSON.stringify(['US'])
              updateNotifications.type = 'COMPLAINT_ACK'
              updateNotifications.notifyDate = new Date()
              updateNotifications.productId = result.data[0].productId
              updateNotifications.complaintReasonId = result.data[0].issueType

              await salesRepComplaintModel.saveNotificationsModel(updateNotifications, () => { })

            }
            response.error = false
            response.statusCode = STRINGS.successStatusCode
            response.message = STRINGS.SuccessString
            response.complaintDetails = result.data[0]
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

    this.complaintResolvedService = async (request, callback) => {
      try {
        var response = {}
        var localTime = new Date().toLocaleString(undefined, { timeZone: 'Asia/Kolkata' });

        var result = await salesRepComplaintModel.viewComplaintDetailModel(request)
        if (result.error) {
          response.error = true
          response.statusCode = STRINGS.successStatusCode
          response.message = STRINGS.commanErrorString
        } else {
          if (result.data.length > 0) {
            var complaint = result.data[0].complaintStatus
            // if (complaint === 'Acknowledged' || complaint === 'Reopened') {
            var data = { id: result.data[0].id, complaintStatus: 'Resolved' }
            data.closeDate = new Date(localTime)
            data.resolvedBy = 'SALESREP'
            data.resolvedById = request.auth.id


            var update = await salesRepComplaintModel.adminUpdateComplaintStatusModel2(data)
            if (update.error) {
              response.error = true
              response.statusCode = STRINGS.successStatusCode
              response.message = STRINGS.commanErrorString
            } else {

              var profile = await salesRepComplaintModel.profileModel1(result.data[0].customerId)


              let salesRepIdsData = []
              let secondarySalesRepIds = JSON.parse(profile.data[0].secondarySalesRepIds)
              let teitiarySalesRepIds = JSON.parse(profile.data[0].tertiarySalesRepIds)
              console.log("profile.data[0].secondarySalesRepIds", secondarySalesRepIds)
              console.log("profile.data[0].secondarySalesRepIds", teitiarySalesRepIds)


              if (profile.data[0].primarySalesRepId != null || profile.data[0].primarySalesRepId != undefined) {
                salesRepIdsData.push(profile.data[0].primarySalesRepId)
              }
              if (secondarySalesRepIds.length > 0) {
                salesRepIdsData = salesRepIdsData.concat(secondarySalesRepIds)
              }
              if (teitiarySalesRepIds.length > 0) {
                salesRepIdsData = salesRepIdsData.concat(teitiarySalesRepIds)
              }


              console.log("salesRepIdsData", salesRepIdsData)

              var checkkSalesRepForNotification = await salesRepComplaintModel.checkkSalesRepForNotification(salesRepIdsData)

              if (checkkSalesRepForNotification.error == false) {
                salesRepIdsData = checkkSalesRepForNotification.data
              }




              let orderTimeHours = new Date(localTime).getHours()
              let orderTimeMin = new Date(localTime).getMinutes()
              let orderTime = `${orderTimeHours}:${orderTimeMin}`



              var notificationObject = {}
              notificationObject.complaintId = result.data[0].id
              notificationObject.orderId = result.data[0].orderId,
                // notificationObject.userIds = [result.data[0].shopOwnerId, result.data[0].complaintBy]
                notificationObject.customerID = result.data[0].customerId
              notificationObject.orderStatus = 'resolved'
              notificationObject.notifyType = 'Resolved'
              notificationObject.ticketId = request.complaintId
              notificationObject.orderTime = `${orderTimeHours}:${orderTimeMin}`
              notificationsService.sendResolvedNotificationShopOwner(notificationObject, () => { })

              var updateNotifications = {}
              updateNotifications.ownerId = result.data[0].cartUserId
              updateNotifications.managerId = result.data[0].cartUserId
              updateNotifications.orderId = result.data[0].ordId
              updateNotifications.complaintId = request.complaintId
              updateNotifications.notifyType = JSON.stringify(['US'])
              updateNotifications.type = 'resolved'
              updateNotifications.notifyDate = new Date(localTime)
              updateNotifications.color = "#89fffd"
              // updateNotifications.ticketId = request.complaintId
              updateNotifications.notificationMsg = `<p style="font-size: 14px;"> A complaint has been <b>RESOLVED</b> by ${data.salesRepName} on behalf of your shop ${result.data[0].shopName} with Ticket ID <b>${request.complaintId}</b> for Order ID <b>${result.data[0].orderId}</b> at ${orderTime}.</p>`
              updateNotifications.complaintReasonId = result.data[0].issueType
              salesRepComplaintModel.saveNotificationsModel(updateNotifications, () => { })

              var notificationObject1 = {}
              notificationObject1.id = "56"
              notificationObject1.orderId = result.data[0].orderId
              notificationObject1.salesRepIds = JSON.stringify(salesRepIdsData)
              notificationObject1.customerID = profile.data[0].customerID
              notificationObject1.orderStatus = "COMPLAINT"
              notificationObject1.notifyType = "COMPLAINT"
              notificationObject1.shopName = profile.data[0].shopName
              notificationObject1.salesRepName = request.auth.name
              notificationObject1.ticketId = result.data[0].ticketId
              notificationObject1.orderTime = `${orderTimeHours}:${orderTimeMin}`
              notificationsService.sendComplaintStatusNotificationForSalesRepResolved(notificationObject1, () => { })

              for (let j = 0; j < salesRepIdsData.length; j++) {

                var getOnesalesRepForNotification = await salesRepComplaintModel.getOnesalesRepForNotification(salesRepIdsData[j])
                // console.log("getOnesalesRepForNotification", getOnesalesRepForNotification)
                if (getOnesalesRepForNotification.data.length > 0) {

                  var updateNotifications = {}
                  updateNotifications.orderId = result.data[0].orderId
                  updateNotifications.ownerId = result.data[0].cartUserId
                  updateNotifications.managerId = result.data[0].cartUserId
                  updateNotifications.salesRepId = salesRepIdsData[j]
                  updateNotifications.type = "COMPLAINT"
                  updateNotifications.notifyType = JSON.stringify(['SR'])
                  updateNotifications.notifyDate = new Date(localTime)
                  updateNotifications.activeStatus = 1
                  updateNotifications.color = '#b5eee3'
                  updateNotifications.notificationMsg = `<p style="font-size: 14px;">${request.auth.name} on behalf of ${profile.data[0].shopName} has <b>RESOLVED</b> a complaint with Ticket ID <b>${request.complaintId}</b> for Order ID <b>${result.data[0].ordId}</b> at ${orderTime}.</p>`
                  salesRepComplaintModel.saveNotificationsModel(updateNotifications, () => { })

                }
              }







              response.error = false
              response.statusCode = STRINGS.successStatusCode
              response.message = STRINGS.SuccessString
            }
            // } else {
            //   response.error = true
            //   response.statusCode = STRINGS.successStatusCode
            //   response.message = STRINGS.complaintStatusErrorString
            // }
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

    this.updateOrRemoveComplaintFile = async (request, callback) => {
      try {
        var response = {}
        if (request.isUpdate === '0') {
          var data = { id: request.complaintId, salesRepUploads: '' }
          var update = await salesRepComplaintModel.adminUpdateComplaintStatusModel(data)
          if (update.error) {
            response.error = true
            response.statusCode = STRINGS.successStatusCode
            response.message = STRINGS.commanErrorString
          } else {
            response.error = false
            response.statusCode = STRINGS.successStatusCode
            response.message = STRINGS.SuccessString
          }
        } else {
          if (request.file) {
            var data = { id: request.complaintId, salesRepUploads: request.file }
            var update = await salesRepComplaintModel.adminUpdateComplaintStatusModel(data)
            if (update.error) {
              response.error = true
              response.statusCode = STRINGS.successStatusCode
              response.message = STRINGS.commanErrorString
            } else {
              response.error = false
              response.statusCode = STRINGS.successStatusCode
              response.message = STRINGS.SuccessString
            }
          } else {
            response.error = true
            response.statusCode = STRINGS.successStatusCode
            response.message = STRINGS.complaintFileErrorString
          }
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


        var orders = await salesRepComplaintModel.checkOrderIdModel22(request.orderId)
        console.log("orders", orders)
        var checkPreviousComplaint = await salesRepComplaintModel.checkPreviousComplaint()
        if (orders.error || checkPreviousComplaint.error) {
          response.error = true
          response.statusCode = STRINGS.successStatusCode
          response.message = STRINGS.commanErrorString
        } else {
          if (orders.data.length > 0) {

            var complaintObject = {}
            complaintObject.orderId = orders.data[0].bookingId
            complaintObject.complaintBy = 'SALESREP'
            complaintObject.shopOwnerId = orders.data[0].ownerId
            complaintObject.salesRepId = request.auth.id

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
            console.log("complaintObject", complaintObject)

            var checkComplaint = await salesRepComplaintModel.checkComplaintModel1(complaintObject)
            console.log("checkComplaint", checkComplaint)
            if (checkComplaint.error) {
              response.error = true
              response.statusCode = STRINGS.successStatusCode
              response.message = STRINGS.commanErrorString
            } else {
              // if (checkComplaint.data.length === 0) {

              let complaintProducts = request.complaintProducts
              complaintProducts.forEach(val => {
                val.ticketId = newTckt

              });

              var complaint = await salesRepComplaintModel.saveComplaint2(complaintObject, complaintProducts)
              console.log("complaint save", complaint)
              if (complaint.error) {
                response.error = true
                response.statusCode = STRINGS.successStatusCode
                response.message = STRINGS.commanErrorString
              } else {
                var localTime = new Date().toLocaleString(undefined, { timeZone: 'Asia/Kolkata' });

                var profile = await salesRepComplaintModel.profileModel1(orders.data[0].customerID)

                let bookingId = orders.data[0].bookingId
                var notificationObject = {}
                notificationObject.complaintId = complaint.data[0]
                notificationObject.orderId = orders.data[0].bookingId
                notificationObject.salesRepID = orders.data[0].salesRepID
                notificationObject.outletId = request.auth.outletId
                notificationObject.complaintStatus = 'Processing'
                notificationObject.notifyType = 'PROCESSING'
                notificationObject.title = 'COMPLAINTS'
                notificationObject.viewBy = 'COMPLAINTS'
                notificationObject.message = 'Complaint against order ' + orders.data[0].bookingId + ' has been processing'
                notificationsService.sendToNotificationAdmin(notificationObject, () => { })


                let orderTimeHours = new Date(localTime).getHours()
                let orderTimeMin = new Date(localTime).getMinutes()
                let orderTime = `${orderTimeHours}:${orderTimeMin}`


                let salesRepIdsData = []
                let secondarySalesRepIds = JSON.parse(profile.data[0].secondarySalesRepIds)
                let teitiarySalesRepIds = JSON.parse(profile.data[0].tertiarySalesRepIds)
                console.log("profile.data[0].secondarySalesRepIds", secondarySalesRepIds)
                console.log("profile.data[0].secondarySalesRepIds", teitiarySalesRepIds)


                if (profile.data[0].primarySalesRepId != null || profile.data[0].primarySalesRepId != undefined) {
                  salesRepIdsData.push(profile.data[0].primarySalesRepId)
                }
                if (secondarySalesRepIds.length > 0) {
                  salesRepIdsData = salesRepIdsData.concat(secondarySalesRepIds)
                }
                if (teitiarySalesRepIds.length > 0) {
                  salesRepIdsData = salesRepIdsData.concat(teitiarySalesRepIds)
                }


                console.log("salesRepIdsData", salesRepIdsData)

                var checkkSalesRepForNotification = await salesRepComplaintModel.checkkSalesRepForNotification(salesRepIdsData)

                if (checkkSalesRepForNotification.error == false) {
                  salesRepIdsData = checkkSalesRepForNotification.data
                }


                var notificationObject3 = {}
                notificationObject3.id = "56"
                notificationObject3.orderId = bookingId
                notificationObject3.salesRepIds = JSON.stringify(salesRepIdsData)
                notificationObject3.customerID = profile.data[0].customerID
                notificationObject3.orderStatus = "COMPLAINT"
                notificationObject3.notifyType = "COMPLAINT"
                notificationObject3.shopName = profile.data[0].shopName
                notificationObject3.salesRepName = request.auth.name
                notificationObject3.ticketId = complaintObject.ticketId
                // notificationObject.totalAmount = orderObject.balanceAmount.toFixed(1)
                notificationObject3.orderTime = `${orderTimeHours}:${orderTimeMin}`
                notificationsService.sendComplaintStatusNotificationForSalesRepOpened(notificationObject3, () => { })

                var notificationObject1 = {}
                notificationObject1.id = "56"
                notificationObject1.orderId = bookingId
                // notificationObject1.salesRepIds = JSON.stringify(salesRepIdsData)
                notificationObject1.customerID = profile.data[0].customerID
                notificationObject1.orderStatus = "COMPLAINT"
                notificationObject1.notifyType = "COMPLAINT"
                notificationObject1.shopName = profile.data[0].shopName
                notificationObject1.salesRepName = request.auth.name
                notificationObject1.ticketId = complaintObject.ticketId
                // notificationObject1.totalAmount = orderObject.balanceAmount.toFixed(1)
                notificationObject1.orderTime = `${orderTimeHours}:${orderTimeMin}`
                notificationsService.sendComplaintNotificationSalesRepForUsersOpened(notificationObject1, () => { })



                let smsObj = {}
                smsObj.mobileNumber = profile.data[0].mobileNumber
                // smsObj.totalAmount = orderObject.balanceAmount.toFixed(1)
                smsObj.orderId = bookingId
                smsObj.ticketId = complaintObject.ticketId
                smsObj.salesRepName = request.auth.name
                // smsObj.orderTime = `${orderTimeHours}:${orderTimeMin}`
                console.log("smsObj", smsObj)
                var sendShopOwnerSms = await smsTemplates.salesRepOpenComplaintForShopOwner(smsObj)
                console.log("sendShopOwnerSms", sendShopOwnerSms)




                var updateNotifications = {}
                updateNotifications.orderId = orders.data[0].id
                updateNotifications.ownerId = complaint.data[0].ownerId
                updateNotifications.managerId = complaint.data[0].cartUserId
                updateNotifications.salesRepId = profile.data[0].primarySalesRepId
                updateNotifications.complaintId = complaintObject.ticketId
                updateNotifications.notifyType = JSON.stringify(['US'])
                updateNotifications.type = 'COMPLAINT'
                updateNotifications.notifyDate = new Date(localTime)
                updateNotifications.complaintReasonId = request.issueType
                updateNotifications.color = "#b5eee3"
                updateNotifications.notificationMsg = `<p style="font-size: 14px;">${request.auth.name} on behalf of  ${profile.data[0].shopName} has <b>OPENED</b> a complaint with Ticket ID <b>${complaintObject.ticketId}</b> for Order ID <b>${bookingId}</b> at ${orderTime}.</p>`
                salesRepComplaintModel.saveNotificationsModel(updateNotifications, () => { })

                for (let j = 0; j < salesRepIdsData.length; j++) {

                  var getOnesalesRepForNotification = await salesRepComplaintModel.getOnesalesRepForNotification(salesRepIdsData[j])
                  // console.log("getOnesalesRepForNotification", getOnesalesRepForNotification)
                  if (getOnesalesRepForNotification.data.length > 0) {

                    var updateNotifications = {}
                    updateNotifications.orderId = orders.data[0].id
                    updateNotifications.ownerId = request.auth.id
                    updateNotifications.managerId = request.auth.id
                    updateNotifications.salesRepId = salesRepIdsData[j]
                    updateNotifications.type = "COMPLAINT"
                    updateNotifications.complaintId = complaintObject.ticketId
                    updateNotifications.notifyType = JSON.stringify(['SR'])
                    updateNotifications.notifyDate = new Date(localTime)
                    updateNotifications.activeStatus = 1
                    updateNotifications.color = '#b5eee3'
                    updateNotifications.notificationMsg = `<p style="font-size: 14px;">A complaint has been <b>OPENED</b> by ${request.auth.name} on behalf of your shop ${profile.data[0].shopName} with Ticket ID <b>${complaintObject.ticketId}</b> for Order ID <b>${bookingId}</b> at ${orderTime}.</p>`
                    salesRepComplaintModel.saveNotificationsModel(updateNotifications, () => { })

                  }

                  var getOnesalesRepForSms = await salesRepComplaintModel.getOnesalesRepForSms(salesRepIdsData[j])
                  // console.log("getOnesalesRepForSms", getOnesalesRepForSms)
                  if (getOnesalesRepForSms.error == false) {

                    if (getOnesalesRepForSms.data.length > 0) {
                      let smsObj = {}
                      smsObj.mobileNumber = getOnesalesRepForSms.data[0].mobile
                      smsObj.orderId = bookingId
                      // smsObj.orderTime = `${orderTimeHours}:${orderTimeMin}`
                      smsObj.shopName = profile.data[0].shopName
                      smsObj.salesRepName = request.auth.name

                      console.log("smsObj", smsObj)
                      var sendsalesOwnerSms = await smsTemplates.salesRepOpenComplaintForShopOwner(smsObj)
                      console.log("sendsalesOwnerSms", sendsalesOwnerSms)

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





    this.viewOneComplaintService = async (request, callback) => {
      try {
        var response = {}

        var viewOneComplaintService = await salesRepComplaintModel.viewOneComplaintModel(request)
        console.log("viewOneComplaintService", viewOneComplaintService)
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
          obj.complaintFile = viewOneComplaintService.data[0].complaintFile
          obj.orderDate = viewOneComplaintService.data[0].orderDate
          obj.complaintDate = viewOneComplaintService.data[0].complaintDate
          if (viewOneComplaintService.data[0].complaintBy == 'USER') {
            obj.RaisedBy = 'Shop Owner'
            obj.name = viewOneComplaintService.data[0].ShopOwnerName
          } else {
            obj.RaisedBy = 'Sales Rep'
            obj.name = viewOneComplaintService.data[0].salesRepName

          }
          obj.complaintStatus = viewOneComplaintService.data[0].complaintStatus

          var viewOneComplaintOrderItemsModel = await salesRepComplaintModel.viewOneComplaintOrderItemsModel(obj)
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






    this.searchOrderProductService = async (request, callback) => {
      try {
        var response = {}

        var searchOrderProductDao = await salesRepComplaintModel.searchOrderProductDao(request)
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



    this.getIssueType = async (request, callback) => {
      try {
        var response = {}
        var issueType = await salesRepComplaintModel.issueTypeModel()
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










  }

}



export default SalesRepComplaintService;
