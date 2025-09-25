

import NotificationConfig from '../config/notification.config'
import NotificationModel from '../utilsModel/notificationModel'
import UserModel from '../src/fetchApp/models/userModel'


const notificationConfig = new NotificationConfig
const notificationModel = new NotificationModel
const userModel = new UserModel

require('dotenv').config();



class NotificationService {
  constructor() {

    this.remindePushNotification = async (data) => {
      data.viewBy = 'REMAINDER'
      var notifyMessage = {
        to: data.deviceToken,
        collapse_key: data.notifyType,
        notification: {
          title: 'PAYMENT REMAINDER',
          body: data.body,
          notifyType: data.notifyType,
          content_available: true
        },
        data: {
          title: 'PAYMENT REMAINDER',
          body: data.body,
          notifyType: data.notifyType,
          payload: data
        }
      }
      notificationConfig.sendFcm(notifyMessage, function (notifyResponse) { })
    }

    this.sendOrderStatusNotification = async (data) => {
      // var ids = data.userIds
      var tokens = await getUserAndSalesRepDeviveTokenService(data)
      console.log("tokens", tokens)
      if (!tokens.error) {
        data.userIds = ''
        data.viewBy = 'ORDERS'
        var notifyMessage = {
          registration_ids: tokens.deviceTokens,
          collapse_key: data.notifyType,
          notification: {
            title: 'ORDER STATUS',
            body: 'Your order ID' + data.orderId + ' has been ' + data.orderStatus,
            notifyType: data.notifyType,
            content_available: true
          },
          data: {
            title: 'ORDER STATUS',
            body: 'Your order ' + data.orderId + ' has been ' + data.orderStatus,
            notifyType: data.notifyType,
            payload: data
          }
        }
        notificationConfig.sendFcm(notifyMessage, function (notifyResponse) { })
      }
    }




    this.sendPlaceOrderPushNotification = async (data) => {
      // var ids = data.userIds
      var tokens = await getSalesRepDeviveTokenForUserPlaceOrderService(data)
      console.log("tokens", tokens)
      if (!tokens.error) {
        data.userIds = ''
        data.viewBy = 'ORDERS'
        var notifyMessage = {
          registration_ids: tokens.deviceTokens,
          collapse_key: data.notifyType,
          notification: {
            title: 'ORDER Placed',
            // body: data.shopName + +'shop order has been Placed And Order ID' + data.orderId,
            body: `${data.shopName} shop order has been Placed And Order ID ${data.orderId}`,
            notifyType: 'ORDER Placed',
            content_available: true
          },
          data: {
            title: 'ORDER Placed',
            // body: data.shopName + 'shop order has been Placed And Order ID' + data.orderId,
            body: `${data.shopName} shop order has been Placed And Order ID ${data.orderId}`,

            notifyType: 'ORDER Placed',
            payload: data
          },
          priority: 'high'
          // "android":{
          //   "priority":"normal"
          // },
          // "apns":{
          //   "headers":{
          //     "apns-priority":"10"
          //   }
          // },
          // "webpush": {
          //   "headers": {
          //     "Urgency": "high"
          //   }
          // }
        }
        notificationConfig.sendFcm(notifyMessage, function (notifyResponse) { })
      }
    }

    //   this.sendPlaceOrderPushNotification = async (data) => {
    //     // var ids = data.userIds
    // console.log("DATA",data)

    //     var tokens = await getUserAndSalesRepDeviveTokenForPlaceOrderService(data)
    //     console.log("tokens", tokens)
    //     tokens.deviceTokens.forEach((deviceToken) => {
    //       var notifyMessage = { 
    //         to:deviceToken,
    //         title: "PLACED ORDER",
    //         body: 'Your order ID' + data.orderId + ' has been Placed',
    //         // notifyType:data.notifyType,

    //       }

    //       notificationConfig.sendFcm(notifyMessage, function (notifyResponse) { })

    //     })
    //   }



    this.sendSalesRepPlaceOrderPushNotification = async (data) => {
      // var ids = data.userIds
      var tokens = await getUserDeviveTokenForSalesRepPlaceOrderService(data)
      console.log("tokens", tokens)
      if (!tokens.error) {
        data.userIds = ''
        data.viewBy = 'ORDERS'

        var notifyMessage = {
          registration_ids: tokens.deviceTokens,
          collapse_key: data.notifyType,
          notification: {
            title: 'ORDER Placed',
            body: `Fetch: ${data.salesRepName} has placed an order with ID ${data.orderId}. Please check My Orders section.`,
            notifyType: 'ORDER Placed',
            content_available: true
          },
          data: {
            title: 'ORDER Placed',
            body: `Fetch: ${data.salesRepName} has placed an order with ID ${data.orderId}. Please check My Orders section.`,
            notifyType: 'ORDER Placed',
            payload: data
          },
          priority: 'high'

          // "android":{
          //   "priority":"high"
          // },
          // "apns":{
          //   "headers":{
          //     "apns-priority":"10"
          //   }
          // },
          // "webpush": {
          //   "headers": {
          //     "Urgency": "high"
          //   }
          // }
        }
        notificationConfig.sendFcm(notifyMessage, function (notifyResponse) { })
      }
    }

    this.sendActivityNotificationForOrderTaken = async (data) => {
      // var ids = data.userIds
      var tokens = await getUserDeviveTokenForSalesRepPlaceOrderService(data)
      console.log("tokens", tokens)
      if (!tokens.error) {
        data.userIds = ''
        data.viewBy = 'SALESREP ACTIVITY'

        var notifyMessage = {
          registration_ids: tokens.deviceTokens,
          collapse_key: data.notifyType,
          notification: {
            title: 'SALESREP ACTIVITY',
            body: `Fetch: ${data.salesRepName} has logged a shop visit at ${data.orderTime} to collect an order from your shop.`,
            notifyType: 'SALESREP ACTIVITY',
            content_available: true
          },
          data: {
            title: 'SALESREP ACTIVITY',
            body: `Fetch: ${data.salesRepName} has logged a shop visit at ${data.orderTime} to collect an order from your shop.`,
            notifyType: 'SALESREP ACTIVITY',
            payload: data
          },
          priority: 'high'

          // "android":{
          //   "priority":"high"
          // },
          // "apns":{
          //   "headers":{
          //     "apns-priority":"10"
          //   }
          // },
          // "webpush": {
          //   "headers": {
          //     "Urgency": "high"
          //   }
          // }
        }
        notificationConfig.sendFcm(notifyMessage, function (notifyResponse) { })
      }
    }

    this.sendOwnerPlaceOrderPushNotification = async (data) => {
      // var ids = data.userIds
      var tokens = await getUserDeviveTokenForSalesRepPlaceOrderService(data)
      console.log("users tokens", tokens)
      if (!tokens.error) {
        data.userIds = ''
        data.viewBy = 'ORDERS'

        var notifyMessage = {
          registration_ids: tokens.deviceTokens,
          collapse_key: data.notifyType,
          notification: {
            title: 'Order Placed',
            body: `Fetch: You have placed an order for ${data.totalAmount} at ${data.orderTime} with order ID ${data.orderId}.`,
            notifyType: 'Order Placed',
            content_available: true
          },
          data: {
            title: 'Order Placed',
            body: `Fetch: You have placed an order for ${data.totalAmount} at ${data.orderTime} with order ID ${data.orderId}.`,
            notifyType: 'Order Placed',
            payload: data
          },
          priority: 'high'

          // "android":{
          //   "priority":"high"
          // },
          // "apns":{
          //   "headers":{
          //     "apns-priority":"10"
          //   }
          // },
          // "webpush": {
          //   "headers": {
          //     "Urgency": "high"
          //   }
          // }
        }
        notificationConfig.sendFcm(notifyMessage, function (notifyResponse) { })
      }
    }

    this.sendOwnerPlaceOrderFailedPushNotification = async (data) => {
      // var ids = data.userIds
      var tokens = await getUserDeviveTokenForSalesRepPlaceOrderService(data)
      console.log("users tokens", tokens)
      if (!tokens.error) {
        data.userIds = ''
        data.viewBy = 'ORDERS'

        var notifyMessage = {
          registration_ids: tokens.deviceTokens,
          collapse_key: data.notifyType,
          notification: {
            title: 'Payment Failed',
            body: `Fetch :OOPS!! We Regret to inform you that your Payment for Order ID ${data.orderId} has Failed , Please verify your payment details or Try another Payment method`,
            notifyType: 'Payment Failed',
            content_available: true
          },
          data: {
            title: 'Payment Failed',
            body: `Fetch :OOPS!! We Regret to inform you that your Payment for Order ID ${data.orderId} has Failed , Please verify your payment details or Try another Payment method`,
            notifyType: 'Payment Failed',
            payload: data
          },
          priority: 'high'

          // "android":{
          //   "priority":"high"
          // },
          // "apns":{
          //   "headers":{
          //     "apns-priority":"10"
          //   }
          // },
          // "webpush": {
          //   "headers": {
          //     "Urgency": "high"
          //   }
          // }
        }
        notificationConfig.sendFcm(notifyMessage, function (notifyResponse) { })
      }
    }

    this.sendOwnerPaidPushNotification = async (data) => {
      // var ids = data.userIds
      var tokens = await getUserDeviveTokenForSalesRepPlaceOrderService(data)
      console.log("users tokens", tokens)
      if (!tokens.error) {
        data.userIds = ''
        data.viewBy = 'ORDERS'

        var notifyMessage = {
          registration_ids: tokens.deviceTokens,
          collapse_key: data.notifyType,
          notification: {
            title: 'Payment Completed',
            body: `Fetch: The payment of Rs.${data.totalAmount} paid by Online Payment for Order ID ${data.orderId} has been Marked as Paid.`,
            notifyType: 'Payment Completed',
            content_available: true
          },
          data: {
            title: 'Payment Completed',
            body: `Fetch: The payment of Rs.${data.totalAmount} paid by Online Payment for Order ID ${data.orderId} has been Marked as Paid.`,
            notifyType: 'Payment Completed',
            payload: data
          },
          priority: 'high'

          // "android":{
          //   "priority":"high"
          // },
          // "apns":{
          //   "headers":{
          //     "apns-priority":"10"
          //   }
          // },
          // "webpush": {
          //   "headers": {
          //     "Urgency": "high"
          //   }
          // }
        }
        notificationConfig.sendFcm(notifyMessage, function (notifyResponse) { })
      }
    }













    this.sendActivityNotificationForPaymentCollected = async (data) => {
      // var ids = data.userIds
      var tokens = await getUserDeviveTokenForSalesRepPlaceOrderService(data)
      console.log("tokens", tokens)
      if (!tokens.error) {
        data.userIds = ''
        data.viewBy = 'SALESREP ACTIVITY'

        var notifyMessage = {
          registration_ids: tokens.deviceTokens,
          collapse_key: data.notifyType,
          notification: {
            title: 'SALESREP ACTIVITY',
            body: `Fetch: ${data.salesRepName} has updated a shop visit at ${data.orderTime} to receive payment from you.`,
            notifyType: 'SALESREP ACTIVITY',
            content_available: true
          },
          data: {
            title: 'SALESREP ACTIVITY',
            body: `Fetch: ${data.salesRepName} has updated a shop visit at ${data.orderTime} to receive payment from you.`,
            notifyType: 'SALESREP ACTIVITY',
            payload: data
          },
          priority: 'high'

          // "android":{
          //   "priority":"high"
          // },
          // "apns":{
          //   "headers":{
          //     "apns-priority":"10"
          //   }
          // },
          // "webpush": {
          //   "headers": {
          //     "Urgency": "high"
          //   }
          // }
        }
        notificationConfig.sendFcm(notifyMessage, function (notifyResponse) { })
      }
    }


    this.sendActivityNotificationForProductPromotion = async (data) => {
      // var ids = data.userIds
      var tokens = await getUserDeviveTokenForSalesRepPlaceOrderService(data)
      console.log("tokens", tokens)
      if (!tokens.error) {
        data.userIds = ''
        data.viewBy = 'SALESREP ACTIVITY'

        var notifyMessage = {
          registration_ids: tokens.deviceTokens,
          collapse_key: data.notifyType,
          notification: {
            title: 'SALESREP ACTIVITY',
            body: `Fetch: ${data.salesRepName} has logged a shop visit at ${data.orderTime} to promote a product in your shop.`,
            notifyType: 'SALESREP ACTIVITY',
            content_available: true
          },
          data: {
            title: 'SALESREP ACTIVITY',
            body: `Fetch: ${data.salesRepName} has logged a shop visit at ${data.orderTime} to promote a product in your shop.`,
            notifyType: 'SALESREP ACTIVITY',
            payload: data
          },
          priority: 'high'

          // "android":{
          //   "priority":"high"
          // },
          // "apns":{
          //   "headers":{
          //     "apns-priority":"10"
          //   }
          // },
          // "webpush": {
          //   "headers": {
          //     "Urgency": "high"
          //   }
          // }
        }
        notificationConfig.sendFcm(notifyMessage, function (notifyResponse) { })
      }
    }


    this.sendActivityNotificationForReturnsComplaints = async (data) => {
      // var ids = data.userIds
      var tokens = await getUserDeviveTokenForSalesRepPlaceOrderService(data)
      console.log("tokens", tokens)
      if (!tokens.error) {
        data.userIds = ''
        data.viewBy = 'SALESREP ACTIVITY'

        var notifyMessage = {
          registration_ids: tokens.deviceTokens,
          collapse_key: data.notifyType,
          notification: {
            title: 'SALESREP ACTIVITY',
            body: `Fetch: ${data.salesRepName} has updated his activity that he visited your shop at ${data.orderTime} to resolve Returns or Complaints.`,
            notifyType: 'SALESREP ACTIVITY',
            content_available: true
          },
          data: {
            title: 'SALESREP ACTIVITY',
            body: `Fetch: ${data.salesRepName} has updated his activity that he visited your shop at ${data.orderTime} to resolve Returns or Complaints.`,
            notifyType: 'SALESREP ACTIVITY',
            payload: data
          },
          priority: 'high'

          // "android":{
          //   "priority":"high"
          // },
          // "apns":{
          //   "headers":{
          //     "apns-priority":"10"
          //   }
          // },
          // "webpush": {
          //   "headers": {
          //     "Urgency": "high"
          //   }
          // }
        }
        notificationConfig.sendFcm(notifyMessage, function (notifyResponse) { })
      }
    }


    this.sendActivityNotificationForUrgentDelivery = async (data) => {
      // var ids = data.userIds
      var tokens = await getUserDeviveTokenForSalesRepPlaceOrderService(data)
      console.log("tokens", tokens)
      if (!tokens.error) {
        data.userIds = ''
        data.viewBy = 'SALESREP ACTIVITY'

        var notifyMessage = {
          registration_ids: tokens.deviceTokens,
          collapse_key: data.notifyType,
          notification: {
            title: 'SALESREP ACTIVITY',
            body: `Fetch: ${data.salesRepName} has updated a shop visit at ${data.orderTime} to deliver products on urgent basis.`,
            notifyType: 'SALESREP ACTIVITY',
            content_available: true
          },
          data: {
            title: 'SALESREP ACTIVITY',
            body: `Fetch: ${data.salesRepName} has updated a shop visit at ${data.orderTime} to deliver products on urgent basis.`,
            notifyType: 'SALESREP ACTIVITY',
            payload: data
          },
          priority: 'high'

          // "android":{
          //   "priority":"high"
          // },
          // "apns":{
          //   "headers":{
          //     "apns-priority":"10"
          //   }
          // },
          // "webpush": {
          //   "headers": {
          //     "Urgency": "high"
          //   }
          // }
        }
        notificationConfig.sendFcm(notifyMessage, function (notifyResponse) { })
      }
    }

    this.sendActivityNotificationForOtherOfficeWork = async (data) => {
      // var ids = data.userIds
      var tokens = await getUserDeviveTokenForSalesRepPlaceOrderService(data)
      console.log("tokens", tokens)
      if (!tokens.error) {
        data.userIds = ''
        data.viewBy = 'SALESREP ACTIVITY'

        var notifyMessage = {
          registration_ids: tokens.deviceTokens,
          collapse_key: data.notifyType,
          notification: {
            title: 'SALESREP ACTIVITY',
            body: `Fetch: ${data.salesRepName} has logged a shop visit at ${data.orderTime} to Reconcile Ledgers/ Office work.`,
            notifyType: 'SALESREP ACTIVITY',
            content_available: true
          },
          data: {
            title: 'SALESREP ACTIVITY',
            body: `Fetch: ${data.salesRepName} has logged a shop visit at ${data.orderTime} to Reconcile Ledgers/ Office work.`,
            notifyType: 'SALESREP ACTIVITY',
            payload: data
          },
          priority: 'high'

          // "android":{
          //   "priority":"high"
          // },
          // "apns":{
          //   "headers":{
          //     "apns-priority":"10"
          //   }
          // },
          // "webpush": {
          //   "headers": {
          //     "Urgency": "high"
          //   }
          // }
        }
        notificationConfig.sendFcm(notifyMessage, function (notifyResponse) { })
      }
    }




    this.sendActivityNotificationOtherInteractionOrderTaken = async (data) => {
      // var ids = data.userIds
      var tokens = await getUserDeviveTokenForSalesRepPlaceOrderService(data)
      console.log("tokens", tokens)
      if (!tokens.error) {
        data.userIds = ''
        data.viewBy = 'SALESREP ACTIVITY'

        var notifyMessage = {
          registration_ids: tokens.deviceTokens,
          collapse_key: data.notifyType,
          notification: {
            title: 'SALESREP ACTIVITY',
            body: `Fetch: ${data.salesRepName} has logged a Telephonic Call with you at ${data.orderTime} to collect an order from your shop.`,
            notifyType: 'SALESREP ACTIVITY',
            content_available: true
          },
          data: {
            title: 'SALESREP ACTIVITY',
            body: `Fetch: ${data.salesRepName} has logged a Telephonic Call with you at ${data.orderTime} to collect an order from your shop.`,
            notifyType: 'SALESREP ACTIVITY',
            payload: data
          },
          priority: 'high'

          // "android":{
          //   "priority":"high"
          // },
          // "apns":{
          //   "headers":{
          //     "apns-priority":"10"
          //   }
          // },
          // "webpush": {
          //   "headers": {
          //     "Urgency": "high"
          //   }
          // }
        }
        notificationConfig.sendFcm(notifyMessage, function (notifyResponse) { })
      }
    }



    this.sendActivityNotificationOtherInteractionForPaymentCollected = async (data) => {
      // var ids = data.userIds
      var tokens = await getUserDeviveTokenForSalesRepPlaceOrderService(data)
      console.log("tokens", tokens)
      if (!tokens.error) {
        data.userIds = ''
        data.viewBy = 'SALESREP ACTIVITY'

        var notifyMessage = {
          registration_ids: tokens.deviceTokens,
          collapse_key: data.notifyType,
          notification: {
            title: 'SALESREP ACTIVITY',
            body: `Fetch: ${data.salesRepName} has updated a Phone call with you at ${data.orderTime} to collect payment from you.`,
            notifyType: 'SALESREP ACTIVITY',
            content_available: true
          },
          data: {
            title: 'SALESREP ACTIVITY',
            body: `Fetch: ${data.salesRepName} has updated a Phone call with you at ${data.orderTime} to collect payment from you.`,
            notifyType: 'SALESREP ACTIVITY',
            payload: data
          },
          priority: 'high'

          // "android":{
          //   "priority":"high"
          // },
          // "apns":{
          //   "headers":{
          //     "apns-priority":"10"
          //   }
          // },
          // "webpush": {
          //   "headers": {
          //     "Urgency": "high"
          //   }
          // }
        }
        notificationConfig.sendFcm(notifyMessage, function (notifyResponse) { })
      }
    }

    this.sendActivityNotificationOtherInteractionForProductPromotion = async (data) => {
      // var ids = data.userIds
      var tokens = await getUserDeviveTokenForSalesRepPlaceOrderService(data)
      console.log("tokens", tokens)
      if (!tokens.error) {
        data.userIds = ''
        data.viewBy = 'SALESREP ACTIVITY'

        var notifyMessage = {
          registration_ids: tokens.deviceTokens,
          collapse_key: data.notifyType,
          notification: {
            title: 'SALESREP ACTIVITY',
            body: `Fetch: ${data.salesRepName} has updated his activity on the shop interaction for the reason Product promotion.`,
            notifyType: 'SALESREP ACTIVITY',
            content_available: true
          },
          data: {
            title: 'SALESREP ACTIVITY',
            body: `Fetch: ${data.salesRepName} has updated his activity on the shop interaction for the reason Product promotion.`,
            notifyType: 'SALESREP ACTIVITY',
            payload: data
          },
          priority: 'high'

          // "android":{
          //   "priority":"high"
          // },
          // "apns":{
          //   "headers":{
          //     "apns-priority":"10"
          //   }
          // },
          // "webpush": {
          //   "headers": {
          //     "Urgency": "high"
          //   }
          // }
        }
        notificationConfig.sendFcm(notifyMessage, function (notifyResponse) { })
      }
    }

    this.sendActivityNotificationOtherInteractionForResolveComplaints = async (data) => {
      // var ids = data.userIds
      var tokens = await getUserDeviveTokenForSalesRepPlaceOrderService(data)
      console.log("tokens", tokens)
      if (!tokens.error) {
        data.userIds = ''
        data.viewBy = 'SALESREP ACTIVITY'

        var notifyMessage = {
          registration_ids: tokens.deviceTokens,
          collapse_key: data.notifyType,
          notification: {
            title: 'SALESREP ACTIVITY',
            body: `Fetch: ${data.salesRepName} has updated his activity that he spoke to you by a phone call at ${data.orderTime} to resolve Returns or Complaints.`,
            notifyType: 'SALESREP ACTIVITY',
            content_available: true
          },
          data: {
            title: 'SALESREP ACTIVITY',
            body: `Fetch: ${data.salesRepName} has updated his activity that he spoke to you by a phone call at ${data.orderTime} to resolve Returns or Complaints.`,
            notifyType: 'SALESREP ACTIVITY',
            payload: data
          },
          priority: 'high'

          // "android":{
          //   "priority":"high"
          // },
          // "apns":{
          //   "headers":{
          //     "apns-priority":"10"
          //   }
          // },
          // "webpush": {
          //   "headers": {
          //     "Urgency": "high"
          //   }
          // }
        }
        notificationConfig.sendFcm(notifyMessage, function (notifyResponse) { })
      }
    }


    this.sendActivityNotificationForOrderFollowup = async (data) => {
      // var ids = data.userIds
      var tokens = await getUserDeviveTokenForSalesRepPlaceOrderService(data)
      console.log("tokens", tokens)
      if (!tokens.error) {
        data.userIds = ''
        data.viewBy = 'SALESREP ACTIVITY'

        var notifyMessage = {
          registration_ids: tokens.deviceTokens,
          collapse_key: data.notifyType,
          notification: {
            title: 'SALESREP ACTIVITY',
            body: `Fetch: ${data.salesRepName} has logged a shop visit at ${data.orderTime} for Order Followup in your shop`,
            notifyType: 'SALESREP ACTIVITY',
            content_available: true
          },
          data: {
            title: 'SALESREP ACTIVITY',
            body: `Fetch: ${data.salesRepName} has logged a shop visit at ${data.orderTime} for Order Followup in your shop`,
            notifyType: 'SALESREP ACTIVITY',
            payload: data
          },
          priority: 'high'

          // "android":{
          //   "priority":"high"
          // },
          // "apns":{
          //   "headers":{
          //     "apns-priority":"10"
          //   }
          // },
          // "webpush": {
          //   "headers": {
          //     "Urgency": "high"
          //   }
          // }
        }
        notificationConfig.sendFcm(notifyMessage, function (notifyResponse) { })
      }
    }


    this.sendActivityNotificationOtherInteractionForOrderFollowup = async (data) => {
      // var ids = data.userIds
      var tokens = await getUserDeviveTokenForSalesRepPlaceOrderService(data)
      console.log("tokens", tokens)
      if (!tokens.error) {
        data.userIds = ''
        data.viewBy = 'SALESREP ACTIVITY'

        var notifyMessage = {
          registration_ids: tokens.deviceTokens,
          collapse_key: data.notifyType,
          notification: {
            title: 'SALESREP ACTIVITY',
            body: `Fetch: ${data.salesRepName} has interacted with you at ${data.orderTime} for Order Follow Up`,
            notifyType: 'SALESREP ACTIVITY',
            content_available: true
          },
          data: {
            title: 'SALESREP ACTIVITY',
            body: `Fetch: ${data.salesRepName} has logged a shop visit at ${data.orderTime} for Order Followup in your shop`,
            notifyType: 'SALESREP ACTIVITY',
            payload: data
          },
          priority: 'high'

          // "android":{
          //   "priority":"high"
          // },
          // "apns":{
          //   "headers":{
          //     "apns-priority":"10"
          //   }
          // },
          // "webpush": {
          //   "headers": {
          //     "Urgency": "high"
          //   }
          // }
        }
        notificationConfig.sendFcm(notifyMessage, function (notifyResponse) { })
      }
    }


    this.sendActivityNotificationOtherInteractionForPaymentFollowup = async (data) => {
      // var ids = data.userIds
      var tokens = await getUserDeviveTokenForSalesRepPlaceOrderService(data)
      console.log("tokens", tokens)
      if (!tokens.error) {
        data.userIds = ''
        data.viewBy = 'SALESREP ACTIVITY'

        var notifyMessage = {
          registration_ids: tokens.deviceTokens,
          collapse_key: data.notifyType,
          notification: {
            title: 'SALESREP ACTIVITY',
            body: `Fetch: ${data.salesRepName} has interacted with you at ${data.orderTime} for Payment  Follow Up`,
            notifyType: 'SALESREP ACTIVITY',
            content_available: true
          },
          data: {
            title: 'SALESREP ACTIVITY',
            body: `Fetch: ${data.salesRepName} has interacted with you at ${data.orderTime} for Payment  Follow Up`,
            notifyType: 'SALESREP ACTIVITY',
            payload: data
          },
          priority: 'high'

          // "android":{
          //   "priority":"high"
          // },
          // "apns":{
          //   "headers":{
          //     "apns-priority":"10"
          //   }
          // },
          // "webpush": {
          //   "headers": {
          //     "Urgency": "high"
          //   }
          // }
        }
        notificationConfig.sendFcm(notifyMessage, function (notifyResponse) { })
      }
    }


    this.sendActivityNotificationForPaymentFollowup = async (data) => {
      // var ids = data.userIds
      var tokens = await getUserDeviveTokenForSalesRepPlaceOrderService(data)
      console.log("tokens", tokens)
      if (!tokens.error) {
        data.userIds = ''
        data.viewBy = 'SALESREP ACTIVITY'

        var notifyMessage = {
          registration_ids: tokens.deviceTokens,
          collapse_key: data.notifyType,
          notification: {
            title: 'SALESREP ACTIVITY',
            body: `Fetch: ${data.salesRepName} has logged a shop visit at ${data.orderTime} for Payment Followup in your shop.`,
            notifyType: 'SALESREP ACTIVITY',
            content_available: true
          },
          data: {
            title: 'SALESREP ACTIVITY',
            body: `Fetch: ${data.salesRepName} has interacted with you at ${data.orderTime} for Payment  Follow Up`,
            notifyType: 'SALESREP ACTIVITY',
            payload: data
          },
          priority: 'high'

          // "android":{
          //   "priority":"high"
          // },
          // "apns":{
          //   "headers":{
          //     "apns-priority":"10"
          //   }
          // },
          // "webpush": {
          //   "headers": {
          //     "Urgency": "high"
          //   }
          // }
        }
        notificationConfig.sendFcm(notifyMessage, function (notifyResponse) { })
      }
    }


    this.sendActivityNotificationOtherInteractionForCustomerNotAvailable = async (data) => {
      // var ids = data.userIds
      var tokens = await getUserDeviveTokenForSalesRepPlaceOrderService(data)
      console.log("tokens", tokens)
      if (!tokens.error) {
        data.userIds = ''
        data.viewBy = 'SALESREP ACTIVITY'

        var notifyMessage = {
          registration_ids: tokens.deviceTokens,
          collapse_key: data.notifyType,
          notification: {
            title: 'SALESREP ACTIVITY',
            body: `Fetch: ${data.salesRepName} has Marked as Customer Not Available`,
            notifyType: 'SALESREP ACTIVITY',
            content_available: true
          },
          data: {
            title: 'SALESREP ACTIVITY',
            body: `Fetch: ${data.salesRepName} has Marked as Customer Not Available`,
            notifyType: 'SALESREP ACTIVITY',
            payload: data
          },
          priority: 'high'

          // "android":{
          //   "priority":"high"
          // },
          // "apns":{
          //   "headers":{
          //     "apns-priority":"10"
          //   }
          // },
          // "webpush": {
          //   "headers": {
          //     "Urgency": "high"
          //   }
          // }
        }
        notificationConfig.sendFcm(notifyMessage, function (notifyResponse) { })
      }
    }

    this.sendActivityNotificationForCustomerNotAvailable = async (data) => {
      // var ids = data.userIds
      var tokens = await getUserDeviveTokenForSalesRepPlaceOrderService(data)
      console.log("tokens", tokens)
      if (!tokens.error) {
        data.userIds = ''
        data.viewBy = 'SALESREP ACTIVITY'

        var notifyMessage = {
          registration_ids: tokens.deviceTokens,
          collapse_key: data.notifyType,
          notification: {
            title: 'SALESREP ACTIVITY',
            body: `Fetch: ${data.salesRepName} has logged a shop visit at ${data.orderTime} and Marked the status as Customer not Available`,
            notifyType: 'SALESREP ACTIVITY',
            content_available: true
          },
          data: {
            title: 'SALESREP ACTIVITY',
            body: `Fetch: ${data.salesRepName} has logged a shop visit at ${data.orderTime} and Marked the status as Customer not Available`,
            notifyType: 'SALESREP ACTIVITY',
            payload: data
          },
          priority: 'high'

          // "android":{
          //   "priority":"high"
          // },
          // "apns":{
          //   "headers":{
          //     "apns-priority":"10"
          //   }
          // },
          // "webpush": {
          //   "headers": {
          //     "Urgency": "high"
          //   }
          // }
        }
        notificationConfig.sendFcm(notifyMessage, function (notifyResponse) { })
      }
    }
    this.sendComplaintStatusNotification = async (data) => {
      var ids = data.userIds
      var tokens = await getDeviveTokensService(ids)
      if (!tokens.error) {
        data.userIds = ''
        data.viewBy = 'COMPLAINTS'
        var notifyMessage = {
          registration_ids: tokens.deviceTokens,
          collapse_key: data.notifyType,
          notification: {
            title: 'COMPLAINT STATUS',
            body: 'Your complaint on order ' + data.orderId + ' product code ' + data.productCode + ' has been ' + data.orderStatus,
            notifyType: data.notifyType,
            content_available: true
          },
          data: {
            title: 'COMPLAINT STATUS',
            body: 'Your complaint on order ' + data.orderId + ' product code ' + data.productCode + ' has been ' + data.orderStatus,
            notifyType: data.notifyType,
            payload: data
          }
        }
        notificationConfig.sendFcm(notifyMessage, function (notifyResponse) { })
      }
    }



    // Admin push notification
    this.adminPushNotificationService = function (data) {
      return new Promise(async function (resolve) {
        var payloadData = {}
        payloadData.title = data.title
        payloadData.body = data.description
        payloadData.viewBy = data.viewBy

        var notifyMessage = {
          registration_ids: data.tokens,
          userIds: data.userIds,
          collapse_key: 'ADMIN_NOTIFY',
          notification: {
            title: data.title,
            body: data.description,
            notifyType: 'ADMIN_NOTIFY',
            content_available: true
          },
          data: {
            title: data.title,
            body: data.description,
            notifyType: 'ADMIN_NOTIFY',
            payload: payloadData
          }
        }
        notificationConfig.sendFcm(notifyMessage, function (notifyResponse) { })
        resolve()
      })
    }

    // User Send Admin Notification
    this.sendToNotificationAdmin = async (data) => {
      var adminTokens = await getAdminSalesRepDeviveTokenService(data)
      if (!adminTokens.error) {
        var notifyMessage = {
          registration_ids: adminTokens.deviceTokens,
          collapse_key: data.notifyType,
          notification: {
            title: data.title,
            body: data.message,
            notifyType: data.notifyType,
            content_available: true
          },
          data: {
            title: data.title,
            body: data.message,
            notifyType: data.notifyType,
            payload: data
          }
        }
        notificationConfig.sendFcm(notifyMessage, function (notifyResponse) { })
      }
    }



    // Payment Remainder
    this.sendRemainderNotification = async (data) => {
      var ids = data.userIds
      var tokens = await getDeviveTokensService(ids)
      if (!tokens.error) {
        data.userIds = ''
        data.viewBy = 'REMAINDER'
        var notifyMessage = {
          registration_ids: tokens.deviceTokens,
          collapse_key: data.notifyType,
          notification: {
            title: 'PAYMENT REMAINDER',
            body: 'Your order ' + data.orderId + ' outstanding amount is Rs.' + data.balanceAmount + '. Make sure you pay before the due date, ' + data.userDueDate + '',
            notifyType: data.notifyType,
            content_available: true
          },
          data: {
            title: 'PAYMENT REMAINDER',
            body: 'Your order ' + data.orderId + ' outstanding amount is Rs.' + data.balanceAmount + '. Make sure you pay before the due date, ' + data.userDueDate + '',
            notifyType: data.notifyType,
            payload: data
          }
        }
        notificationConfig.sendFcm(notifyMessage, function (notifyResponse) { })
      }
    }

    // User payment request to admin
    this.userPaymentRequestNotification = async (data) => {
      var tokens = await notificationModel.adminOutletTokensDao(data.outletId)
      if (!tokens.error) {
        var getToken = await getTokensListService(tokens.data)
        if (!getToken.error) {
          var notifyMessage = {
            registration_ids: getToken.deviceTokens,
            collapse_key: 'USER_PAYEMNT',
            notification: {
              title: data.notifyType,
              body: data.message,
              notifyType: 'USER_PAYEMNT',
              content_available: true
            },
            data: {
              title: data.notifyType,
              body: data.message,
              notifyType: 'USER_PAYEMNT',
              payload: data
            }
          }
          notificationConfig.sendFcm(notifyMessage, function (notifyResponse) { })
        }
      }
    }

    // Admin update payment status
    this.sendPaymentStatusNotification = async (data) => {
      var tokens = await getDeviveTokensService(data.userIds)
      if (!tokens.error) {
        var notifyMessage = {
          registration_ids: tokens.deviceTokens,
          collapse_key: 'PAYMENTSTATUS',
          notification: {
            title: data.notifyType,
            body: data.message,
            notifyType: 'PAYMENTSTATUS',
            content_available: true
          },
          data: {
            title: data.notifyType,
            body: data.message,
            notifyType: 'PAYMENTSTATUS',
            payload: data
          }
        }
        notificationConfig.sendFcm(notifyMessage, function (notifyResponse) { })
      }
    }

    // admin update payment notification
    this.adminUpdatePaymentNotification = async (data) => {
      var tokens = await getUserAndSalesRepDeviveTokenService(data)
      if (!tokens.error) {
        data.viewBy = 'ORDERS'
        var notifyMessage = {
          registration_ids: tokens.deviceTokens,
          collapse_key: 'PAID',
          notification: {
            title: data.notifyType,
            body: data.message,
            notifyType: 'PAID',
            content_available: true
          },
          data: {
            title: data.notifyType,
            body: data.message,
            notifyType: 'PAID',
            payload: data
          }
        }
        notificationConfig.sendFcm(notifyMessage, function (notifyResponse) { })
      }
    }

    // User and SalesRep tokens


    // Token get function



    // SalesRep activity
    this.sendActivityNotification = async (data) => {
      var ids = data.userIds
      var tokens = await getDeviveTokensService(ids)
      console.log("tokens", tokens)
      if (!tokens.error) {
        data.userIds = ''
        // data.viewBy = 'ACTIVITY'
        var notifyMessage = {
          registration_ids: tokens.deviceTokens,
          collapse_key: data.notifyType,
          notification: {
            title: 'SALESREP ACTIVITY',
            body: data.message,
            notifyType: data.notifyType,
            content_available: true
          },
          data: {
            title: 'SALESREP ACTIVITY',
            body: data.message,
            notifyType: data.notifyType,
            payload: data
          }
        }
        notificationConfig.sendFcm(notifyMessage, function (notifyResponse) { })
      }
    }

    // Process order
    this.sendProcessOrderNotification = async (data) => {
      var ids = data.userIds
      var tokens = await getDeviveTokensService(ids)
      if (!tokens.error) {
        // data.userIds = ''
        // data.viewBy = 'ACTIVITY'
        var notifyMessage = {
          registration_ids: tokens.deviceTokens,
          collapse_key: data.notifyType,
          notification: {
            title: 'PROCESS ORDER',
            body: data.message,
            notifyType: data.notifyType,
            content_available: true
          },
          data: {
            title: 'PROCESS ORDER',
            body: data.message,
            notifyType: data.notifyType,
            payload: data
          }
        }
        notificationConfig.sendFcm(notifyMessage, function (notifyResponse) { })
      }
    }

    // Manager Payment Request
    this.managerNotificationToOwner = async (data) => {
      var ids = [data.ownerId]
      var tokens = await getDeviveTokensService(ids)
      if (!tokens.error) {
        // data.userIds = ''
        // data.viewBy = data.viewBy
        var notifyMessage = {
          registration_ids: tokens.deviceTokens,
          collapse_key: data.notifyKey,
          notification: {
            title: data.notifyType,
            body: data.message,
            notifyType: data.notifyKey,
            content_available: true
          },
          data: {
            title: data.notifyType,
            body: data.message,
            notifyType: data.notifyKey,
            payload: data
          }
        }
        // console.log(notifyMessage)
        notificationConfig.sendFcm(notifyMessage, function (notifyResponse) { })
      }
    }

    var getTokensListService = function (tokens) {
      var response = {}
      return new Promise(async function (resolve) {
        if (tokens.length > 0) {
          var tokenArray = []
          tokens.forEach(element => {
            if (element.deviceToken) {
              tokenArray.push(element.deviceToken)
            }
          })
          response.error = false
          response.deviceTokens = tokenArray
          resolve(response)
        } else {
          response.error = true
          resolve(response)
        }
      })
    }


    var getUserAndSalesRepDeviveTokenService = function (data) {
      var response = {}
      return new Promise(async function (resolve) {
        var userTokens = await userModel.getUserDeviceToken(data.userIds)
        console.log("userTokens", userTokens)
        var salesRepToken = await notificationModel.getSalesRepToken(data.salesRepId)
        if (!userTokens.error || !salesRepToken.error) {
          if (userTokens.data.length > 0) {
            var tokens = []
            userTokens.data.forEach(element => {
              if (element.deviceToken) {
                tokens.push(element.deviceToken)
              }
            })
            if (salesRepToken.data.length > 0) {
              if (salesRepToken.data[0].deviceToken) {
                tokens.push(salesRepToken.data[0].deviceToken)
              }
            }
            response.error = false
            response.deviceTokens = tokens
            resolve(response)
          } else {
            response.error = true
            resolve(response)
          }
        } else {
          response.error = true
          resolve(response)
        }
      })
    }


    var getDeviveTokensService = function (ids) {
      var response = {}
      return new Promise(async function (resolve) {
        var userTokens = await userModel.getUserDeviceToken(ids)
        if (!userTokens.error) {
          if (userTokens.data.length > 0) {
            var tokens = []
            userTokens.data.forEach(element => {
              if (element.deviceToken) {
                tokens.push(element.deviceToken)
              }
            })
            response.error = false
            response.deviceTokens = tokens
            resolve(response)
          } else {
            response.error = true
            resolve(response)
          }
        } else {
          response.error = true
          resolve(response)
        }
      })
    }



    var getAdminSalesRepDeviveTokenService = function (data) {
      var response = {}
      return new Promise(async function (resolve) {
        var adminTokens = await notificationModel.adminOutletTokensDao(data.outletId)
        var salesRepToken = await notificationModel.getSalesRepToken(data.salesRepID)
        if (!adminTokens.error || !salesRepToken.error) {
          // if (adminTokens.data.length > 0) {
          var tokens = []
          adminTokens.data.forEach(element => {
            if (element.deviceToken) {
              tokens.push(element.deviceToken)
            }
          })
          if (salesRepToken.data[0].deviceToken) {
            tokens.push(salesRepToken.data[0].deviceToken)
          }
          response.error = false
          response.deviceTokens = tokens
          resolve(response)
          // } else {
          //   response.error = true
          //   resolve(response)
          // }
        } else {
          response.error = true
          resolve(response)
        }
      })
    }

    var getUserAndSalesRepDeviveTokenForPlaceOrderService = function (data) {
      var response = {}
      return new Promise(async function (resolve) {
        console.log("data", data)
        let salesRepIds = JSON.parse(data.salesRepIds)
        var userTokens = await userModel.getUserDeviceTokenForPlaceOrder(data.customerID)
        console.log("userTokens", userTokens)
        var salesRepToken = await notificationModel.getSalesRepTokenForPlaceOrder(salesRepIds)
        console.log("salesRepToken", salesRepToken)
        // userTokens.data[0].deviceToken = salesRepToken.data[0].deviceToken
        if (!userTokens.error) {
          if (userTokens.data.length > 0) {
            var tokens = []
            userTokens.data.forEach(element => {
              if (element.deviceToken) {
                tokens.push(element.deviceToken)
              }
            })

            if (salesRepToken.data.length > 0) {
              salesRepToken.data.forEach(element => {
                if (element.deviceToken) {
                  tokens.push(element.deviceToken)
                }
              })
            }

            response.error = false
            response.deviceTokens = tokens
            resolve(response)
          } else {
            response.error = true
            resolve(response)
          }
        } else {
          response.error = true
          resolve(response)
        }
      })
    }



    var getUserDeviveTokenForSalesRepPlaceOrderService = function (data) {
      var response = {}
      return new Promise(async function (resolve) {
        console.log("data", data)
        var userTokens = await userModel.getUserDeviceTokenForPlaceOrder(data.customerID)
        console.log("userTokens", userTokens)

        // userTokens.data[0].deviceToken = salesRepToken.data[0].deviceToken
        if (!userTokens.error) {
          if (userTokens.data.length > 0) {
            var tokens = []
            userTokens.data.forEach(element => {
              if (element.deviceToken) {
                tokens.push(element.deviceToken)
              }
            })


            response.error = false
            response.deviceTokens = tokens
            resolve(response)
          } else {
            response.error = true
            resolve(response)
          }
        } else {
          response.error = true
          resolve(response)
        }
      })
    }


    var getSalesRepDeviveTokenForUserPlaceOrderService = function (data) {
      var response = {}
      return new Promise(async function (resolve) {
        console.log("datasss", data)
        let salesRepIds = JSON.parse(data.salesRepIds)

        var salesRepToken = await notificationModel.getSalesRepTokenForPlaceOrder(salesRepIds)
        console.log("salesRepToken", salesRepToken)
        // userTokens.data[0].deviceToken = salesRepToken.data[0].deviceToken
        if (!salesRepToken.error) {
          if (salesRepToken.data.length > 0) {
            var tokens = []


            if (salesRepToken.data.length > 0) {
              salesRepToken.data.forEach(element => {
                if (element.deviceToken) {
                  tokens.push(element.deviceToken)
                }
              })
            }

            response.error = false
            response.deviceTokens = tokens
            resolve(response)
          } else {
            response.error = true
            resolve(response)
          }
        } else {
          response.error = true
          resolve(response)
        }
      })
    }


    this.sendResolvedNotificationShopOwner = async (data) => {
      // var ids = data.userIds
      var tokens = await getUserDeviveTokenForSalesRepPlaceOrderService(data)
      console.log("tokens", tokens)
      if (!tokens.error) {
        data.userIds = ''
        data.viewBy = 'COMPLAINTS'
        var notifyMessage = {
          registration_ids: tokens.deviceTokens,
          collapse_key: data.notifyType,
          notification: {
            title: 'COMPLAINT RESOLVED',
            body: `A complaint has been resolved by ${data.salesRepName} on behalf of your shop ${data.shopName} with Ticket ID ${data.ticketId} for Order ID ${data.orderId} at ${data.orderTime}.`,
            notifyType: data.notifyType,
            content_available: true
          },
          data: {
            title: 'COMPLAINT RESOLVED',
            body: `A complaint has been resolved by ${data.salesRepName} on behalf of your shop ${data.shopName} with Ticket ID ${data.ticketId} for Order ID ${data.orderId} at ${data.orderTime}.`,
            notifyType: data.notifyType,
            payload: data
          }
        }
        notificationConfig.sendFcm(notifyMessage, function (notifyResponse) { })
      }
    }


    this.sendOpenComplaintNotificationForShopOwner = async (data) => {
      // var ids = data.userIds
      var tokens = await getUserDeviveTokenForSalesRepPlaceOrderService(data)
      console.log("tokens", tokens)
      if (!tokens.error) {
        data.userIds = ''
        data.viewBy = 'COMPLAINT'
        var notifyMessage = {
          registration_ids: tokens.deviceTokens,
          collapse_key: data.notifyType,
          notification: {
            title: 'COMPLAINT OPENED',
            // body: data.shopName + +'shop order has been Placed And Order ID' + data.orderId,
            body: `Fetch: You Have OPENED a complaint on Order ID ${data.orderId} for the product ${data.productCode}.`,
            notifyType: 'COMPLAINT',
            content_available: true
          },
          data: {
            title: 'COMPLAINT OPENED',
            // body: data.shopName + 'shop order has been Placed And Order ID' + data.orderId,
            body: `Fetch: You Have OPENED a complaint on Order ID ${data.orderId} for the product ${data.productCode}.`,
            notifyType: 'COMPLAINT',
            payload: data
          },
          priority: 'high'

        }
        notificationConfig.sendFcm(notifyMessage, function (notifyResponse) { })
      }
    }



    this.sendOpenComplaintNotificationForSalesRep = async (data) => {
      // var ids = data.userIds
      var tokens = await getSalesRepDeviveTokenForUserPlaceOrderService(data)
      console.log("tokens", tokens)
      if (!tokens.error) {
        data.userIds = ''
        data.viewBy = 'ORDERS'
        var notifyMessage = {
          registration_ids: tokens.deviceTokens,
          collapse_key: data.notifyType,
          notification: {
            title: 'COMPLAINT OPENED',
            // body: data.shopName + +'shop order has been Placed And Order ID' + data.orderId,
            body: `Fetch: ${data.shopName} has OPENED a complaint on Order ID ${data.orderId} for the product ${data.productCode}.`,
            notifyType: 'COMPLAINT',
            content_available: true
          },
          data: {
            title: 'COMPLAINT OPENED',
            // body: data.shopName + 'shop order has been Placed And Order ID' + data.orderId,
            body: `Fetch: ${data.shopName} has OPENED a complaint on Order ID ${data.orderId} for the product ${data.productCode}.`,
            notifyType: 'COMPLAINT',
            payload: data
          },
          priority: 'high'

        }
        notificationConfig.sendFcm(notifyMessage, function (notifyResponse) { })
      }
    }


    this.sendActivityMessageNotificationForAllSalesRep = async (data) => {
      // var ids = data.userIds
      var tokens = await getSalesRepDeviveTokenForUserPlaceOrderService(data)
      console.log("tokens", tokens)
      if (!tokens.error) {
        data.userIds = ''
        data.viewBy = 'CHAT'
        var notifyMessage = {
          registration_ids: tokens.deviceTokens,
          collapse_key: data.notifyType,
          notification: {
            title: 'New message alert!',
            // body: data.shopName + +'shop order has been Placed And Order ID' + data.orderId,
            body: `${data.salesRepName} has sent a message in ${data.shopName} chat box`,
            notifyType: 'CHAT',
            content_available: true
          },
          data: {
            title: 'New message alert!',
            // body: data.shopName + 'shop order has been Placed And Order ID' + data.orderId,
            body: `${data.salesRepName} has sent a message in ${data.shopName} chat box`,
            notifyType: 'CHAT',
            payload: data
          },
          priority: 'high'

        }
        notificationConfig.sendFcm(notifyMessage, function (notifyResponse) { })
      }
    }


    this.sendActivityTaskCompletedNotificationForAllSalesRep = async (data) => {
      // var ids = data.userIds
      var tokens = await getSalesRepDeviveTokenForUserPlaceOrderService(data)
      console.log("tokens", tokens)
      if (!tokens.error) {
        data.userIds = ''
        data.viewBy = 'CHAT'
        var notifyMessage = {
          registration_ids: tokens.deviceTokens,
          collapse_key: data.notifyType,
          notification: {
            title: 'Task Completed!',
            // body: data.shopName + +'shop order has been Placed And Order ID' + data.orderId,
            body: `${data.salesRepName} has Successfully completed the assigned Task for ${data.shopName}`,
            notifyType: 'CHAT',
            content_available: true
          },
          data: {
            title: 'Task Completed!',
            // body: data.shopName + 'shop order has been Placed And Order ID' + data.orderId,
            body: `${data.salesRepName} has Successfully completed the assigned Task for ${data.shopName}`,
            notifyType: 'CHAT',
            payload: data
          },
          priority: 'high'

        }
        notificationConfig.sendFcm(notifyMessage, function (notifyResponse) { })
      }
    }





    this.sendPlaceOrderPushNotificationForUserComplaint = async (data) => {
      // var ids = data.userIds
      var tokens = await getSalesRepDeviveTokenForUserPlaceOrderService(data)
      console.log("tokens", tokens)
      if (!tokens.error) {
        data.userIds = data.userIds
        data.viewBy = 'COMPLAINTS'
        var notifyMessage = {
          registration_ids: tokens.deviceTokens,
          collapse_key: data.notifyType,
          notification: {
            title: 'COMPLAINT OPENED',
            body: `${data.shopName} has OPENED a complaint with Ticket ID` + data.ticketId + ' for Order ID ' + data.orderId + ' at ' + data.orderTime,
            notifyType: data.notifyType,
            content_available: true
          },
          data: {
            title: 'COMPLAINT OPENED',
            body: `${data.shopName} has OPENED a complaint with Ticket ID` + data.ticketId + ' for Order ID ' + data.orderId + ' at ' + data.orderTime,
            notifyType: data.notifyType,
            payload: data
          },
          priority: 'high'
        }

        notificationConfig.sendFcm(notifyMessage, function (notifyResponse) { })
      }
    }




    this.sendComplaintStatusNotification12 = async (data) => {
      var ids = data.userIds
      var tokens = await getDeviveTokensService(ids)
      if (!tokens.error) {
        data.userIds = ''
        data.viewBy = 'COMPLAINTS'
        var notifyMessage = {
          registration_ids: tokens.deviceTokens,
          collapse_key: data.notifyType,
          notification: {
            title: 'COMPLAINT OPENED',
            body: 'You have OPENED a complaint with Ticket ID' + data.ticketId + ' for Order ID ' + data.orderId + ' at ' + data.orderTime,
            notifyType: data.notifyType,
            content_available: true
          },
          data: {
            title: 'COMPLAINT OPENED',
            body: 'You have OPENED a complaint with Ticket ID' + data.ticketId + ' for Order ID ' + data.orderId + ' at ' + data.orderTime,
            notifyType: data.notifyType,
            payload: data
          }
        }
        notificationConfig.sendFcm(notifyMessage, function (notifyResponse) { })
      }
    }



    this.sendComplaintStatusNotification123 = async (data) => {
      var ids = data.userIds
      var tokens = await getDeviveTokensService(ids)
      if (!tokens.error) {
        data.userIds = ''
        data.viewBy = 'COMPLAINTS'
        var notifyMessage = {
          registration_ids: tokens.deviceTokens,
          collapse_key: data.notifyType,
          notification: {
            title: 'COMPLAINT OPENED',
            body: 'You have OPENED a complaint with Ticket ID' + data.ticketId + ' for Order ID ' + data.orderId + ' at ' + data.orderTime,
            notifyType: data.notifyType,
            content_available: true
          },
          data: {
            title: 'COMPLAINT OPENED',
            body: 'You have OPENED a complaint with Ticket ID' + data.ticketId + ' for Order ID ' + data.orderId + ' at ' + data.orderTime,
            notifyType: data.notifyType,
            payload: data
          }
        }
        notificationConfig.sendFcm(notifyMessage, function (notifyResponse) { })
      }
    }

    this.sendComplaintStatusNotificationForSalesRepOpened = async (data) => {
      var ids = data.userIds
      var tokens = await getSalesRepDeviveTokenForUserPlaceOrderService(data)
      if (!tokens.error) {
        data.userIds = ''
        data.viewBy = 'COMPLAINTS'
        var notifyMessage = {
          registration_ids: tokens.deviceTokens,
          collapse_key: data.notifyType,
          notification: {
            title: 'COMPLAINT OPENED',
            body: `${data.salesRepName} on behalf of ${data.shopName} has OPENED a complaint with Ticket ID` + data.ticketId + ' for Order ID ' + data.orderId + ' at ' + data.orderTime,
            notifyType: data.notifyType,
            content_available: true
          },
          data: {
            title: 'COMPLAINT OPENED',
            body: `${data.salesRepName} on behalf of ${data.shopName} has OPENED a complaint with Ticket ID` + data.ticketId + ' for Order ID ' + data.orderId + ' at ' + data.orderTime,
            notifyType: data.notifyType,
            payload: data
          }
        }
        notificationConfig.sendFcm(notifyMessage, function (notifyResponse) { })
      }
    }


    this.sendComplaintNotificationSalesRepForUsersOpened = async (data) => {
      var tokens = await getUserDeviveTokenForSalesRepPlaceOrderService(data)
      if (!tokens.error) {
        data.userIds = ''
        data.viewBy = 'COMPLAINTS'
        var notifyMessage = {
          registration_ids: tokens.deviceTokens,
          collapse_key: data.notifyType,
          notification: {
            title: 'COMPLAINT OPENED',
            body: ` A complaint has been OPENED by ${data.salesRepName} on behalf of your shop ${data.shopName} with Ticket ID` + data.ticketId + ' for Order ID ' + data.orderId + ' at ' + data.orderTime,
            notifyType: data.notifyType,
            content_available: true
          },
          data: {
            title: 'COMPLAINT OPENED',
            body: ` A complaint has been OPENED by ${data.salesRepName} on behalf of your shop ${data.shopName} with Ticket ID` + data.ticketId + ' for Order ID ' + data.orderId + ' at ' + data.orderTime,
            notifyType: data.notifyType,
            payload: data
          }
        }
        notificationConfig.sendFcm(notifyMessage, function (notifyResponse) { })
      }
    }


    this.sendComplaintStatusNotificationForSalesRepResolved = async (data) => {
      // var ids = data.userIds
      var tokens = await getSalesRepDeviveTokenForUserPlaceOrderService(data)
      if (!tokens.error) {
        data.userIds = ''
        data.viewBy = 'COMPLAINTS'
        var notifyMessage = {
          registration_ids: tokens.deviceTokens,
          collapse_key: data.notifyType,
          notification: {
            title: 'COMPLAINT OPENED',
            body: `${data.salesRepName} on behalf of ${data.shopName} has  resolved a complaint with Ticket ID` + data.ticketId + ' for Order ID ' + data.orderId + ' at ' + data.orderTime,
            notifyType: data.notifyType,
            content_available: true
          },
          data: {
            title: 'COMPLAINT OPENED',
            body: `${data.salesRepName} on behalf of ${data.shopName} has  resolved a complaint with Ticket ID` + data.ticketId + ' for Order ID ' + data.orderId + ' at ' + data.orderTime,
            notifyType: data.notifyType,
            payload: data
          }
        }
        notificationConfig.sendFcm(notifyMessage, function (notifyResponse) { })
      }
    }





  }
}

export default NotificationService;
