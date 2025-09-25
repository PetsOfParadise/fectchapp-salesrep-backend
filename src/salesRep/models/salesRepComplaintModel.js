'use strict';

import knex from './../../../config/db.config'

class SalesRepComplaintModel {
 constructor(){

    this.getShopComplaintModel = function (data) {
        var response = {}
        return new Promise(function (resolve) {
          if (data.queryType === 'LIST') {
            var pageNumber = data.pageNumber
            if (pageNumber == '0') {
              pageNumber = '0'
            } else {
              pageNumber = pageNumber - 1
            }
            var pageOffset = parseInt(pageNumber * data.pageCount)
          }
          knex.db('complaints')
            .select('complaints.id', 'orderId', 'bookingId', 'productId',
             'productCode', 'shopName', 'complaintText', 'issueType', 'reason', 
             'uploadImage', 'complaintStatus', knex.db.raw('DATE_FORMAT(complaintDate, "%d/%m/%Y") AS complaintDate'))
            .innerJoin('orders', 'complaints.orderId', '=', 'orders.id')
            .innerJoin('products', 'complaints.productId', '=', 'products.id')
            .innerJoin('users', 'complaints.complaintBy', '=', 'users.id')
            .innerJoin('complaintTypes', 'complaints.issueType', '=', 'complaintTypes.id')
            // .where('users.salesRepIds', data.auth.id)
            // .where('users.primarySalesRepId', data.auth.id)
            .where(function() {
              this.where('users.primarySalesRepId', data.auth.id)
                .orWhereRaw('JSON_CONTAINS(users.secondarySalesRepIds, ?)', [JSON.stringify(data.auth.id)])
                .orWhereRaw('JSON_CONTAINS(users.tertiarySalesRepIds, ?)', [JSON.stringify(data.auth.id)]);
            })
            .orderBy('id', 'desc')
            .modify(function (queryBuilder) {
              if (data.type === 'LIST') {
                queryBuilder.offset(pageOffset).limit(data.pageCount)
              }
              if (data.type === 'OPEN') {
                queryBuilder.whereIn('complaints.complaintStatus', ['Processing'])
              } else if(data.type === 'REOPENED') {
                queryBuilder.whereIn('complaints.complaintStatus', ['Reopened'])
              }
              else if(data.type === 'ACKNOWLEDGED'){
                queryBuilder.whereIn('complaints.complaintStatus', ['Acknowledged'])
              }
              else if(data.type === 'CLOSE'){
                queryBuilder.whereIn('complaints.complaintStatus', ['Resolved'])
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
    
      this.viewComplaintDetailModel = function (data) {
        var response = {}
        return new Promise(function (resolve) {
          knex.db('complaints')
            .select('complaints.id', 'bookingId as orderId', 'complaints.orderId as ordId', 
            'orders.ownerId', 'orders.cartUserId', 'complaintBy', 'shopOwnerId','complaints.salesRepId',
             'shopName', 'shopAddress', 'users.customerId',   'complaints.complaintStatus','ticketId',
             'users.shopName',
           'openDate' , knex.db.raw('DATE_FORMAT(complaintDate, "%d/%m/%Y") AS complaintDate'))
            .innerJoin('orders', 'complaints.orderId', '=', 'orders.bookingId')
            .innerJoin('users', 'complaints.shopOwnerId', '=', 'users.id')
            .where({ 'complaints.ticketId': data.complaintId })
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


      this.adminUpdateComplaintStatusModel = function (data) {
        var response = {}
        return new Promise(function (resolve) {
          knex.db('complaintsOrderItems')
            .where('id', data.id)
            .update(data)
            .then((result) => {
              response.error = false
              response.data = result
            })
            .catch((error) => {
              console.log("adminUpdateComplaintStatusModel",error)
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






      this.adminUpdateComplaintStatusModel2 = function (data) {
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
              console.log("adminUpdateComplaintStatusModel",error)
              response.error = true
            })
            .finally(() => {
              resolve(response)
            })
        })
      }


      this.profileModel1 = function (customerID) {
        var response = {}
        return new Promise(function (resolve) {
            knex.db('users')
                .select('id', 'name', 'customerID', 'mobileNumber', 'email', 'userType', 'users.primarySalesRepId',
                    'users.secondarySalesRepIds', 'users.tertiarySalesRepIds',
                    'ownerId', 'outletId', 'userDiscountId', 'isProfileCompleted', 'activeStatus',
                    'isProfileCompleted', 'shopName', 'shopAddress', 'pincode', 'city', 'state', 'users.cashOnCarry',
                    'longitude', 'latitude', 'bonusPoint', 'creditLimit', 'creditFixedtLimit', 'creditPeriod', 'paymentTypeIds',
                    'gst', 'isOfferApply', 'activeStatus', 'isPriceVisible', 'salesRepIds', 'managerCart', 'rating', 'userCatalogId')
                .where('customerID', customerID)
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
















      this.checkOrderIdModel22 = function (orderId) {
        var response = {}
        return new Promise(function (resolve) {
            knex.db('orders')
                .select('orders.id', 'bookingId', 'orders.ownerId', 'managerId',
                    'cartUserId', 'orders.salesRepID', 'users.name', 'users.mobileNumber', 'users.shopName',
                    'orders.outletId','users.shopName','users.customerID',
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











this.saveComplaint2 = function (data, complaintProducts) {
  var response = {}

  return new Promise(function (resolve, reject) {
      var transac = knex.db.transaction(function (trx) {
          knex.db('complaints')
              .insert(data)
              .transacting(trx)
              .then((result) => {
                console.log("result",result)
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


this.viewOneComplaintModel = function (data) {
  var response = {}
  return new Promise(function (resolve) {
      knex.db('complaints')
          .select('complaints.id', 'orderId', 'ticketId', 'complaintBy', 'shopOwnerId', 'complaintStatus', 'salesRep.name as salesRepName',
              'users.shopName', 'users.shopAddress', 'users.name as ShopOwnerName','complaints.complaintFile',
              knex.db.raw('DATE_FORMAT(orderDate, "%d/%m/%Y") AS orderDate'),
              knex.db.raw('DATE_FORMAT(complaintDate, "%d/%m/%Y") AS complaintDate'),
              knex.db.raw('DATE_FORMAT(reopenDate, "%d/%m/%Y") AS reopenDate'),
              knex.db.raw('DATE_FORMAT(openDate, "%d/%m/%Y") AS openDate'),
              knex.db.raw('DATE_FORMAT(closeDate, "%d/%m/%Y") AS closeDate'),
              'complaints.salesRepId')
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
              'complaintsOrderItems.salesRepUploads',
              'complaintsOrderItems.reason', 'complaintsOrderItems.quantity',
              "complaintTypes.complaintText as complaintIssue"
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










this.getShopComplaintModel = function (data) {
  var response = {}
  return new Promise(function (resolve) {
    if (data.queryType === 'LIST') {
      var pageNumber = data.pageNumber
      if (pageNumber == '0') {
        pageNumber = '0'
      } else {
        pageNumber = pageNumber - 1
      }
      var pageOffset = parseInt(pageNumber * data.pageCount)
    }
    knex.db('complaints')
      .select('complaints.id', 'orderId', 'bookingId', 'productId',
       'productCode', 'shopName', 'complaintText', 'issueType', 'reason', 
       'uploadImage', 'complaintStatus', knex.db.raw('DATE_FORMAT(complaintDate, "%d/%m/%Y") AS complaintDate'))
      .innerJoin('orders', 'complaints.orderId', '=', 'orders.id')
      .innerJoin('products', 'complaints.productId', '=', 'products.id')
      .innerJoin('users', 'complaints.complaintBy', '=', 'users.id')
      .innerJoin('complaintTypes', 'complaints.issueType', '=', 'complaintTypes.id')
      // .where('users.salesRepIds', data.auth.id)
      // .where('users.primarySalesRepId', data.auth.id)
      .where(function() {
        this.where('users.primarySalesRepId', data.auth.id)
          .orWhereRaw('JSON_CONTAINS(users.secondarySalesRepIds, ?)', [JSON.stringify(data.auth.id)])
          .orWhereRaw('JSON_CONTAINS(users.tertiarySalesRepIds, ?)', [JSON.stringify(data.auth.id)]);
      })
      .orderBy('id', 'desc')
      .modify(function (queryBuilder) {
        if (data.type === 'LIST') {
          queryBuilder.offset(pageOffset).limit(data.pageCount)
        }
        if (data.type === 'OPEN') {
          queryBuilder.whereIn('complaints.complaintStatus', ['Processing'])
        } else if(data.type === 'REOPENED') {
          queryBuilder.whereIn('complaints.complaintStatus', ['Reopened'])
        }
        else if(data.type === 'ACKNOWLEDGED'){
          queryBuilder.whereIn('complaints.complaintStatus', ['Acknowledged'])
        }
        else if(data.type === 'CLOSE'){
          queryBuilder.whereIn('complaints.complaintStatus', ['Resolved'])
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







this.getAllOrdersComplaintsModel = function (data) {
  var response = {}
  return new Promise(function (resolve) {
      knex.db('complaints')
          .select('complaints.id', 'orderId', 'ticketId', 'complaintBy', 'shopOwnerId',
              'complaintStatus', 'salesRep.name as salesRepName',
              knex.db.raw('DATE_FORMAT(complaintDate, "%d/%m/%Y") AS complaintDate'),
              knex.db.raw('DATE_FORMAT(orders.orderDate, "%d/%m/%Y") AS orderDate'),
              'users.shopName','users.name as ShopOwnerName',
              'complaints.salesRepId',)
          .innerJoin('orders', 'orders.bookingId', '=', 'complaints.orderId')
          .innerJoin('users', 'users.id', '=', 'complaints.shopOwnerId')
          .leftJoin('salesRep', 'salesRep.id', '=', 'complaints.salesRepId')
          // .where('complaints.shopOwnerId', data.complaintBy)
          // .groupBy('orderItems.productId')
          .where(function() {
            this.where('users.primarySalesRepId', data.auth.id)
              .orWhereRaw('JSON_CONTAINS(users.secondarySalesRepIds, ?)', [JSON.stringify(data.auth.id)])
              .orWhereRaw('JSON_CONTAINS(users.tertiarySalesRepIds, ?)', [JSON.stringify(data.auth.id)]);
          })
          .orderBy('id', 'desc')
          .modify(function (queryBuilder) {
          
            if (data.type === 'OPEN') {
              queryBuilder.whereIn('complaints.complaintStatus', ['Processing'])
            } else if(data.type === 'REOPENED') {
              queryBuilder.whereIn('complaints.complaintStatus', ['Reopened'])
            }
            else if(data.type === 'ACKNOWLEDGED'){
              queryBuilder.whereIn('complaints.complaintStatus', ['Acknowledged'])
            }
            else if(data.type === 'CLOSE'){
              queryBuilder.whereIn('complaints.complaintStatus', ['Resolved'])
            }
          })
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
              knex.db.raw('DATE_FORMAT(complaintDate, "%d/%m/%Y") AS complaintDate'),
              knex.db.raw('DATE_FORMAT(orders.orderDate, "%d/%m/%Y") AS orderDate'),
              'users.shopName', 'users.name as ShopOwnerName',
              'complaints.salesRepId')
          .innerJoin('orders', 'orders.bookingId', '=', 'complaints.orderId')
          .innerJoin('users', 'users.id', '=', 'complaints.shopOwnerId')
          .leftJoin('salesRep', 'salesRep.id', '=', 'complaints.salesRepId')
          // .where('complaints.shopOwnerId', data.complaintBy)
          // .groupBy('orderItems.productId')
          .where(function() {
            this.where('users.primarySalesRepId', data.auth.id)
              .orWhereRaw('JSON_CONTAINS(users.secondarySalesRepIds, ?)', [JSON.stringify(data.auth.id)])
              .orWhereRaw('JSON_CONTAINS(users.tertiarySalesRepIds, ?)', [JSON.stringify(data.auth.id)]);
          })
          .orderBy('id', 'desc')
          .modify(function (queryBuilder) {
          
            if (data.type === 'OPEN') {
              queryBuilder.whereIn('complaints.complaintStatus', ['Processing'])
            } else if(data.type === 'REOPENED') {
              queryBuilder.whereIn('complaints.complaintStatus', ['Reopened'])
            }
            else if(data.type === 'ACKNOWLEDGED'){
              queryBuilder.whereIn('complaints.complaintStatus', ['Acknowledged'])
            }
            else if(data.type === 'CLOSE'){
              queryBuilder.whereIn('complaints.complaintStatus', ['Resolved'])
            }
          })
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



      
 }
}








export default SalesRepComplaintModel;