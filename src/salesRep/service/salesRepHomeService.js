

import STRINGS from '../../../strings.json'
import Utils from '../../../utils/utils'
import SalesRepHomeModel from '../models/salesRepHomeModel'
import NotificationsService from '../../../utils/notificationsService'

require('dotenv').config();

const salesRepHomeModel = new SalesRepHomeModel
const notificationsService = new NotificationsService

const utils = new Utils()




class SalesRepHomeService {
  constructor() {



    this.salesRepHomeService = async (request, callback) => {
      // console.log("salesRepHomeService*******",request)
      try {
        var response = {}
        console.log("request.auth.id", request.auth.id)
        var profile = await salesRepHomeModel.salesRepHomeProfile(request.auth.id)
        if (profile.error) {
          response.error = true
          response.statusCode = STRINGS.successStatusCode
          response.message = STRINGS.commanErrorString
          callback(response)
        } else {
          request.profile = profile.data[0]
          // var date = new Date()
          // request.year = date.getFullYear()
          request.limit = 5
          Promise.all([
            salesRepHomeModel.salesRepCurrentMonthOrders(request),
            salesRepHomeModel.salesrepPrmiaryShopCurrentMonthOrders(request),

            salesRepHomeModel.salesRepCurrentMonthOrdersTotal(request),//1
            salesRepHomeModel.salesRepPrimaryShopCurrentMonthOrdersTotal(request),

            salesRepHomeModel.salesRepCurrentMonthNoOFOrders(request),//2
            salesRepHomeModel.salesRepPrimaryShopCurrentMonthNoOFOrders(request),


            salesRepHomeModel.salesRepCurrentMonthPaymentCollected(request),//3
            salesRepHomeModel.salesRepPrimaryShopCurrentMonthPaymentCollected(request),

            salesRepHomeModel.homeTopOrderProducts(request),//4
            salesRepHomeModel.salesRepNotificationCountDao(request)//5
          ])
            .then(result => {
              // console.log(profile.data[0])
              console.log("totalOrders", result[3].data)

              // TOTAL ORDERS
              var ordersObject = {}
              ordersObject.totalOrders = profile.data[0].totalOrders
              ordersObject.ordersValue = result[0].data.length + result[1].data.length
              var ordersCal = (ordersObject.ordersValue / ordersObject.totalOrders) * 100
              ordersObject.percent = ordersCal
              var totalAmount = 0
              // TOTAL AMOUNT
              if (result[2].data[0]) {
                totalAmount = result[2].data[0].total + result[3].data.total == null ? 0 : result[3].data.total
              } else {
                totalAmount = + result[3].data.total == null ? 0 : result[3].data.total
              }



              var totalAmountObject = {}
              totalAmountObject.totalAmount = profile.data[0].totalAmount
              totalAmountObject.totalAmountValue = totalAmount
              var totalAmtCal = (totalAmountObject.totalAmountValue / totalAmountObject.totalAmount) * 100
              totalAmountObject.percent = totalAmtCal

              // NO OF PAYMENTS
              var paymentObject = {}
              paymentObject.noOfPayments = profile.data[0].totalPayments
              paymentObject.paymentValue = result[4].data + result[5].data
              var paymentCal = (paymentObject.paymentValue / paymentObject.noOfPayments) * 100
              paymentObject.percent = paymentCal

              var collectedAmount = 0
              // PAYMENT COLLECTED
              if (result[6].data[0].total) {
                var collectedAmount = result[6].data[0].total
              }
              if (result[7].data[0].total) {
                collectedAmount = collectedAmount + result[7].data[0].total
              }




              var collectObject = {}
              collectObject.totalAmount = profile.data[0].totalAmountCollected
              collectObject.collectedValue = collectedAmount
              var collectedCal = (collectObject.collectedValue / collectObject.totalAmount) * 100
              collectObject.percent = collectedCal

              response.error = false
              response.statusCode = STRINGS.successStatusCode
              response.message = STRINGS.SuccessString
              response.notificationCount = result[9].data[0].count
              response.totalOrders = ordersObject
              response.totalAmount = totalAmountObject
              response.noOfPayments = paymentObject
              response.paymentCollected = collectObject
              response.topProducts = result[8].data
              callback(response)
            })
            .catch(error => {
              console.log("error", error)
              response.error = true
              response.statusCode = STRINGS.successStatusCode
              response.message = STRINGS.commanErrorString
              callback(response)
            })
        }
      } catch (e) {
        console.log(e)
        response.error = true
        response.statusCode = STRINGS.errorStatusCode
        response.message = STRINGS.oopsErrorMessage
        callback(response)
      }
    }

    this.viewTopProducts = async (request, callback) => {
      try {
        var response = {}
        request.limit = 25
        var totalProduct = await salesRepHomeModel.homeTopOrderProducts(request)
        if (totalProduct.error) {
          response.error = true
          response.statusCode = STRINGS.successStatusCode
          response.message = STRINGS.commanErrorString
        } else {
          response.error = false
          response.statusCode = STRINGS.successStatusCode
          response.message = STRINGS.SuccessString
          response.products = totalProduct.data
        }
      } catch (e) {
        response.error = true
        response.statusCode = STRINGS.errorStatusCode
        response.message = STRINGS.oopsErrorMessage
      }
      callback(response)
    }

    this.salesRepNotificationService = async (request, callback) => {
      try {
        var response = {}
        request.queryType = 'TOTAL'
        var getTotalList = await salesRepHomeModel.salesRepNotificationListDao(request)
        if (getTotalList.error) {
          response.error = true
          response.statusCode = STRINGS.successStatusCode
          response.message = STRINGS.commanErrorString
        } else {
          if (getTotalList.data.length > 0) {
            request.pageCount = 10
            request.queryType = 'LIST'
            var pageCount = await utils.pageCount(getTotalList.data.length, request.pageCount)
            var result = await salesRepHomeModel.salesRepNotificationListDao(request)
            if (result.error) {
              response.error = true
              response.statusCode = STRINGS.successStatusCode
              response.message = STRINGS.commanErrorString
            } else {
              response.error = false
              response.statusCode = STRINGS.successStatusCode
              response.message = STRINGS.SuccessString
              response.pages = pageCount
              response.list = result.data
            }
          } else {
            response.error = false
            response.statusCode = STRINGS.successStatusCode
            response.message = STRINGS.SuccessString
            response.pages = 0
            response.list = getTotalList.data
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




  }
}



export default SalesRepHomeService;
