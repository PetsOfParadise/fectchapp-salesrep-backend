'use strict';

import knex from '../../../config/db.config'

class SalesRepProductModel {
    constructor() {

        this.checkSalesRepMycart = function (id, productId, shopID) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('cartItems')
                    .where({
                        userId: shopID,
                        salesRepID: id,
                        productId: productId,
                        cartType: 'SALESREP'
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


        this.featureBannerModel = function (data) {
            var response = {}
            return new Promise(function (resolve, reject) {
                knex.db('featureProductBanner')
                    .select('*')
                    .where('outlet_id', data.auth.outletId)
                    .andWhere('type', data.type)
                    .orderBy('featureProductBanner.id', 'desc')
                    .then((result) => {
                        response.error = false
                        response.data = result
                        resolve(response)
                    })
                    .catch((error) => {
                        console.log("featureProductBanner error")
                        reject(error)
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
                        'paymentTypes.type as paymentTypes', knex.db.raw('SUM(totalAmount + totalGST - referralDiscount) as finalTotal'),
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

        this.updateOrderStatusModel = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('orders')
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

        this.profileModel = function (id) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('users')
                    .select('id', 'name', 'customerID', 'mobileNumber', 'email', 'userType', 'users.isNonGst',
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

        this.checkMyCartProduct = function (userId, productId, salesrepId) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('cartItems')
                    .select('cartItems.*', 'productCatalog.MRP')
                    .innerJoin('products', 'products.id', '=', 'cartItems.productId')
                    .innerJoin('productCatalog', 'cartItems.productId', '=', 'productCatalog.productId')
                    .where({
                        'cartItems.userId': userId,
                        'cartItems.salesRepID': salesrepId,
                        'cartItems.productId': productId,
                        'cartType': 'SALESREP'
                    })
                    .groupBy('products.id')
                    .then((result) => {
                        response.error = false
                        response.data = result
                    })
                    .catch((error) => {
                        console.log("checkMyCartProduct", error)
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
        this.checkProductId = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('products')
                    .select('products.id', 'productName', 'productImage', 'productCatalog.MRP', 'products.productCode', 'weight',
                        'productGST', 'MOQ', 'maxQty', 'products.defaultQuantity', 'productStockCount', 'finishingFast', 'fewStocksLeft',
                        'subCategory.subCategoryName', 'category.categoryName', 'description', 'specifications', 'productOfferX', 'productOfferY',
                        'discountValue as discount', 'products.specialDiscount', 'products.specialDiscountValue',
                        knex.db.raw('(productCatalog.MRP - ( productCatalog.MRP * ( discountValue/100 ) )) as price'),
                        'productOfferX', 'productOfferY', 'attributeOptionsIds', 'attributeIds')
                    .leftJoin('subCategory', 'products.subcategoryId', '=', 'subCategory.id')
                    .leftJoin('category', 'products.categoryId', '=', 'category.id')
                    .innerJoin('disCountDetails', 'products.id', '=', 'disCountDetails.productId')
                    .innerJoin('productInventory', 'products.id', '=', 'productInventory.productId')
                    .innerJoin('productCatalog', 'products.id', '=', 'productCatalog.productId')
                    .where({
                        'deleteProduct': 0,
                        'productCatalog.productStatus': 1,
                        'products.id': data.productId,
                        'disCountDetails.discountId': data.auth.discountId,
                        'productInventory.outletId': data.auth.outletId,
                        'productCatalog.catalogId': data.auth.catalogId

                    })
                    .groupBy('products.id')
                    .then((result) => {
                        response.error = false
                        response.data = result
                        resolve(response)
                        // console.log("result", result)
                    })
                    .catch((error) => {
                        console.log(error)
                        response.error = true
                        resolve(response)
                    })
                // .finally(() => {
                //   resolve(response)
                // })
            })
        }

        this.getCatalogCategoryModel = function (data) {
            var response = {}
            var params = data.auth
            return new Promise(function (resolve) {
                knex.db('category')
                    .select('category.id', 'category.categoryName', 'category.categoryImage', 'category.categoryDescription',
                        'categoryCatalog.activeStatus', 'categoryCatalog.sortingOrder',
                        'categoryCatalog.catalogId')
                    .innerJoin('categoryCatalog', 'categoryCatalog.categoryId', '=', 'category.id')
                    .where('category.activeStatus', 1)
                    .andWhere('categoryCatalog.catalogId', params.catalogId)
                    .andWhere('categoryCatalog.activeStatus', 1)
                    .orderBy('categoryCatalog.sortingOrder', 'asc')
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

        this.checkSalesRepCartProduct = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('cartItems')
                    .where({
                        userId: data.shopId,
                        productId: data.productId,
                        cartType: 'SALESREP',
                        salesRepID: data.auth.id
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

        this.checkSalesMyCartProduct = function (userId, productId, salesRepID) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('cartItems')
                    .select('cartItems.*', 'products.MRP')
                    .innerJoin('products', 'products.id', '=', 'cartItems.productId')
                    .where({
                        'userId': userId,
                        'productId': productId,
                        'cartType': 'SALESREP',
                        salesRepID: salesRepID

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

        this.updateSalesRepCartItemsModel = function (id, quantity) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('cartItems')
                    .update({
                        quantity: quantity
                    })
                    .where('id', id)
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

        this.deleteCartModel = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('cartItems')
                    .where('id', data)
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



        this.SalesRepCatalogSubcategoryModel = function (data) {
            var response = {}
            var params = data.auth
            // console.log(data.catalogId,data.categoryId)
            return new Promise(function (resolve) {
                knex.db('subCategory')
                    .select('subCategory.id', 'subCategory.categoryId', 'subCategory.subCategoryName',
                        'subCategory.discount', 'subCategory.subCategoryDescription',
                        'subCategory.subcategoryImage as subCategoryImage', 'subCategoryCatalog.activeStatus'
                        , 'subCategoryCatalog.catalogId'
                    )
                    .innerJoin('subCategoryCatalog', 'subCategoryCatalog.subCategoryId', '=', 'subCategory.id')
                    .where('subCategory.activeStatus', 1)
                    .andWhere('subCategory.categoryId', data.categoryId)
                    .andWhere('subCategoryCatalog.catalogId', data.catalogId)
                    .andWhere('subCategoryCatalog.activeStatus', 1)
                    .orderBy('subCategoryCatalog.sortingOrder', 'asc')
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


        this.updateCartItems = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('cartItems')
                    .where('id', data.id)
                    .update(data)
                    .then((result) => {
                        response.error = false
                        response.data = result
                    })
                    .catch((error) => {
                        console.log("updateCartItems", error)
                        response.error = true
                    })
                    .finally(() => {
                        resolve(response)
                    })
            })
        }
        this.insertCartItems = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('cartItems')
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

        this.salesRepCardItems = function (data) {
            var response = {}
            console.log(data)
            return new Promise(function (resolve) {
                // knex.db.raw('SELECT cartItems.id, products.MRP, products.productName, productCode, products.productImage, products.productGST, cartItems.productId, cartItems.quantity, subCategory.discount, SUM(products.MRP * cartItems.quantity) AS totalamt ,SUM(products.MRP * cartItems.quantity - ( products.MRP * cartItems.quantity * ( subCategory.discount/100))) AS dicountAmount FROM `cartItems` INNER JOIN products ON cartItems.productId = products.id INNER JOIN subCategory ON products.subcategoryId = subCategory.id WHERE userId=? GROUP BY cartItems.quantity, products.MRP, cartItems.id', [data])
                knex.db('cartItems')
                    .select('cartItems.id', 'cartItems.productId', 'cartItems.userId', 'cartItems.quantity', 'products.defaultQuantity',
                        'productName', 'products.productCode', 'productImage', 'productCatalog.MRP', 'MOQ', 'maxQty',
                        'productStockCount', 'finishingFast', 'fewStocksLeft', 'productGST', 'productOfferX','products.remarks',
                        'productOfferY', 'attribute', 'options', 'discountValue as discount',
                        'products.specialDiscount', 'products.specialDiscountValue',
                        knex.db.raw('SUM( productCatalog.MRP - (productCatalog.MRP * ( discountValue/100))) as supplyPrice'),
                        knex.db.raw('SUM(productCatalog.MRP * cartItems.quantity - ( productCatalog.MRP * cartItems.quantity * ( discountValue/100))) as totalPrice, SUM((productCatalog.MRP * cartItems.quantity - ( productCatalog.MRP * cartItems.quantity * ( discountValue/100))) * ( products.productGST/100) ) AS gstAmount'), 'attribute', 'options')
                    .innerJoin('products', 'cartItems.productId', '=', 'products.id')
                    .leftJoin('subCategory', 'products.subcategoryId', '=', 'subCategory.id')
                    .innerJoin('disCountDetails', 'products.id', '=', 'disCountDetails.productId')
                    .innerJoin('productInventory', 'products.id', '=', 'productInventory.productId')
                    .innerJoin('productCatalog', 'products.id', '=', 'productCatalog.productId')
                    .where({
                        'cartItems.userId': data.shopId,
                        'disCountDetails.discountId': data.auth.discountId,
                        'productInventory.outletId': data.auth.outletId,
                        'cartType': 'SALESREP',
                        'cartItems.salesRepID': data.auth.id,
                        'productCatalog.catalogId': data.auth.catalogId,
                        'productCatalog.productStatus': 1,

                    })
                    // .andWhere(function () {
                    //     this.where('productInventory.productStockCount', '>', 0)
                    // })
                    .groupBy('cartItems.id', 'cartItems.productId', 'products.id', 'cartItems.quantity', 'productCatalog.productId')
                    .orderBy('cartItems.id', 'asc')
                    .then((result) => {
                        response.error = false
                        response.data = result
                    })
                    .catch((error) => {
                        console.log("salesRepCardItems", error)
                        response.error = true
                    })
                    .finally(() => {
                        resolve(response)
                    })
            })
        }


        this.salesRepCardItemsByPage = function (data) {
            var response = {}
            var limit = 10
            var page = data.page
            // var page=1;
            console.log(data)
            return new Promise(function (resolve) {
                // knex.db.raw('SELECT cartItems.id, products.MRP, products.productName, productCode, products.productImage, products.productGST, cartItems.productId, cartItems.quantity, subCategory.discount, SUM(products.MRP * cartItems.quantity) AS totalamt ,SUM(products.MRP * cartItems.quantity - ( products.MRP * cartItems.quantity * ( subCategory.discount/100))) AS dicountAmount FROM `cartItems` INNER JOIN products ON cartItems.productId = products.id INNER JOIN subCategory ON products.subcategoryId = subCategory.id WHERE userId=? GROUP BY cartItems.quantity, products.MRP, cartItems.id', [data])
                knex.db('cartItems')
                    .select('cartItems.id', 'cartItems.productId', 'cartItems.userId', 'cartItems.quantity', 'products.defaultQuantity',
                        'productName', 'products.productCode', 'productImage', 'productCatalog.MRP', 'MOQ', 'maxQty', 'productStockCount',
                        'finishingFast', 'fewStocksLeft', 'productGST', 'productOfferX', 'productOfferY', 'attribute',
                        'options', 'discountValue as discount',
                        'products.specialDiscount', 'products.specialDiscountValue',
                        knex.db.raw('SUM( productCatalog.MRP - (productCatalog.MRP * ( discountValue/100))) as supplyPrice'),
                        knex.db.raw('SUM(productCatalog.MRP * cartItems.quantity - ( productCatalog.MRP * cartItems.quantity * ( discountValue/100))) as totalPrice, SUM((productCatalog.MRP * cartItems.quantity - ( productCatalog.MRP * cartItems.quantity * ( discountValue/100))) * ( products.productGST/100) ) AS gstAmount'), 'attribute', 'options')

                    .innerJoin('products', 'cartItems.productId', '=', 'products.id')
                    .leftJoin('subCategory', 'products.subcategoryId', '=', 'subCategory.id')
                    .innerJoin('disCountDetails', 'products.id', '=', 'disCountDetails.productId')
                    .innerJoin('productInventory', 'products.id', '=', 'productInventory.productId')
                    .innerJoin('productCatalog', 'products.id', '=', 'productCatalog.productId')

                    .where({
                        'cartItems.userId': data.shopId,
                        'disCountDetails.discountId': data.auth.discountId,
                        'productInventory.outletId': data.auth.outletId,
                        'cartType': 'SALESREP',
                        'cartItems.salesRepID': data.auth.id,
                        'productCatalog.catalogId': data.auth.catalogId,
                        'productCatalog.productStatus': 1
                    })
                    // .groupBy('cartItems.id', 'cartItems.productId', 'products.id', 'cartItems.quantity', 'productCatalog.productId')
                    .groupBy('cartItems.id', 'cartItems.productId', 'products.id', 'cartItems.quantity', 'productCatalog.productId',
                        //  'productStockCount' ,'discountValue'
                    )
                    .orderBy('cartItems.id', 'asc')
                    // .limit(limit).offset(offset)
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


        this.getBoughtProductsSalesRepShopOwnerModel = function (data) {
            var response = {}

            return new Promise(function (resolve, reject) {
                knex.db('orderItems')
                    .select('products.id', 'orderItems.productId', 'cartShopId',
                        knex.db.raw('SUM(quantity) as qty, COUNT(orderItems.productId) as productCount'),
                        'subCategory.subCategoryName', 'productName', 'productImage', 'productCatalog.MRP', 'products.productCode',
                        'categoryName', 'weight', 'productGST', 'MOQ', 'maxQty', 'products.defaultQuantity', 'productStockCount', 'finishingFast',
                        'fewStocksLeft', 'productStatus', 'discountValue as discount',
                        'products.specialDiscount', 'products.specialDiscountValue',
                        knex.db.raw('(productCatalog.MRP - ( productCatalog.MRP * ( discountValue/100 ) )) as price'),
                        'productOfferX', 'productOfferY')
                    .innerJoin('products', 'orderItems.productId', '=', 'products.id')
                    .innerJoin('subCategory', 'products.subcategoryId', '=', 'subCategory.id')
                    .innerJoin('category', 'products.categoryId', '=', 'category.id')
                    .innerJoin('productInventory', 'products.id', '=', 'productInventory.productId')
                    .innerJoin('productCatalog', 'products.id', '=', 'productCatalog.productId')
                    // .innerJoin('orders', 'orderItems.orderId', '=', 'orders.id')
                    .innerJoin('disCountDetails', 'products.id', '=', 'disCountDetails.productId')
                    .where('orderItems.cartShopId', data.id)
                    // .where('orders.cartUserId', data.auth.id)
                    .where('orderItems.orderCost', '!=', 0)
                    .where({
                        'products.activeStatus': 1,
                        'productCatalog.catalogId': data.userCatalogId,
                        'disCountDetails.discountId': data.userDiscountId,
                        'productInventory.outletId': data.outletId
                    })
                    .groupBy('orderItems.productId', 'orderItems.cartShopId', 'discountValue', 'productStatus', 'productStockCount')
                    .orderBy('productCount', 'desc')
                    .orderBy('qty', 'desc')
                    .orderBy('products.id', 'desc')
                    .limit(25)
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

        this.salesRepCardItems1 = function (data) {
            var response = {}
            console.log(data)
            return new Promise(function (resolve) {
                // knex.db.raw('SELECT cartItems.id, products.MRP, products.productName, productCode, products.productImage, products.productGST, cartItems.productId, cartItems.quantity, subCategory.discount, SUM(products.MRP * cartItems.quantity) AS totalamt ,SUM(products.MRP * cartItems.quantity - ( products.MRP * cartItems.quantity * ( subCategory.discount/100))) AS dicountAmount FROM `cartItems` INNER JOIN products ON cartItems.productId = products.id INNER JOIN subCategory ON products.subcategoryId = subCategory.id WHERE userId=? GROUP BY cartItems.quantity, products.MRP, cartItems.id', [data])
                knex.db('cartItems')
                    .select('cartItems.id', 'products.defaultQuantity')
                    .innerJoin('products', 'cartItems.productId', '=', 'products.id')
                    .innerJoin('disCountDetails', 'products.id', '=', 'disCountDetails.productId')
                    .leftJoin('subCategory', 'products.subcategoryId', '=', 'subCategory.id')
                    .innerJoin('productInventory', 'products.id', '=', 'productInventory.productId')
                    .where({
                        'cartItems.userId': data.shopId,
                        'disCountDetails.discountId': data.auth.discountId,
                        'productInventory.outletId': data.auth.outletId,
                        'cartType': 'SALESREP',
                        'cartItems.salesRepID': data.auth.id,
                        'productInventory.productStockCount': 0,
                        'products.defaultQuantity': 0
                    })
                    .groupBy('cartItems.id', 'cartItems.productId', 'cartItems.quantity', 'discountValue', 'productStockCount')
                    .orderBy('cartItems.id', 'asc')
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


        this.salesRepCardTotalSumValue = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db.raw('SELECT SUM(discountAmount) as finaltotal, SUM(gstAmount) as gsttotal FROM (SELECT cartItems.id, products.productGST, cartItems.productId, cartItems.quantity, subCategory.discount, SUM(products.MRP * cartItems.quantity) AS totalamt ,SUM(products.MRP * cartItems.quantity - ( products.MRP * cartItems.quantity * ( discountValue/100))) AS discountAmount, SUM((products.MRP * cartItems.quantity - ( products.MRP * cartItems.quantity * ( discountValue/100))) * ( products.productGST/100) ) AS gstAmount FROM `cartItems` INNER JOIN products ON cartItems.productId = products.id INNER JOIN subCategory ON products.subcategoryId = subCategory.id INNER JOIN disCountDetails ON products.id = disCountDetails.productId WHERE userId=? AND disCountDetails.discountId=? AND cartType=? AND cartItems.salesRepID=? GROUP BY cartItems.quantity, products.MRP, cartItems.id) t1', [data.shopId, data.auth.discountId, 'SALESREP', data.auth.id])
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

        this.salesRepInstructionsModel = function (data) {
            var response = {}
            return new Promise(function (resolve, reject) {
                knex.db('ordersInstructions')
                    .select('id', 'barCode', 'PVCCovers', 'goodsInBulk', 'MRPOnLabels', 'instruction')
                    .where({
                        userId: data.shopId,
                        type: 'SALESREP',
                        salesRepID: data.auth.id
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



        this.RemoveCartItemsModel = function (id) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('cartItems')
                    .where('id', id)
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





        this.updateCartItemsModel = function (id, quantity) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('cartItems')
                    .update({
                        quantity: quantity
                    })
                    .where('id', id)
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
                    .select(knex.db.raw("sum(case when  orderStatus IN ('WAITING', 'ACCEPTED') then totalAmount + totalGST - referralDiscount - orders.cashDiscountAmount - orders.additionalDiscountAmount - orders.specialDiscountAmount else 0 end) AS totalAcceptWaitingAmount"))
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








        this.saveOrderDetailsModel = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('orders')
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


        this.saveOrderDetails = function (orderData, paymentDetails, updateNotifications) {
            var response = {}

            // console.log( "params.auth.userDepotId",params.auth.userDepotId)
            return new Promise(function (resolve, reject) {
                var transac = knex.db.transaction(function (trx) {
                    knex.db('orders')
                        .insert(orderData)
                        .transacting(trx)
                        .then((result) => {
                            console.log("result", result)
                            // let orderId = result[0]
                            // console.log("orderId", orderId)
                            paymentDetails.orderId = result[0]
                            updateNotifications.orderId = result[0]

                            var salesRepPayment = knex.db('salesRepPayment')
                                .insert(paymentDetails)
                                .transacting(trx)

                            var notifications = knex.db('notifications')
                                .insert(updateNotifications)
                                .transacting(trx)


                            // var salessrepOrderUpdate = knex.db.raw('Update orders set paidAmount = paidAmount + ?, orderStatus=?, balanceAmount=?, balanceDue=?  where id=?', [updateOrderPayDetail.amount, 'PAID', updateOrderPayDetail.paidAmount, updateOrderPayDetail.paidAmount, orderId])
                            //     .transacting(trx)

                            return Promise.all([result, salesRepPayment, notifications])
                        })
                        .then(trx.commit)
                        .catch(trx.rollback);
                })
                transac.then(function (result) {

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












        this.updateProductStockCount = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db.raw('Update productInventory set productStockCount = productStockCount - ? where productId=? AND 	outletId=?', [data.quantity, data.productId, data.outletId])
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

        this.updateOrderOty = function (orderID, totalOty, offerItems) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('orders')
                    .where('id', orderID)
                    .update({
                        totalQuantity: totalOty,
                        offerOty: offerItems
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


        this.updateCreditValueModel = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db.raw("Update users set creditLimit = creditLimit - ? where id=? AND userType='OWNER'", [data.creditLimit, data.id])
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


        this.getTotalCategoryProducts = function (data, object) {
            var response = {}
            console.log("object.auth", object.auth)
            return new Promise(function (resolve) {
                var optionsArray = JSON.parse(object.optionsIds)
                knex.db('products')
                    .select('products.id', 'productName', 'productImage', 'productCatalog.MRP', 'products.productCode',
                        'products.fewStocksLeft', 'products.finishingFast',
                        'products.specialDiscount', 'products.specialDiscountValue',
                        'weight', 'productGST', 'MOQ', 'maxQty', 'products.defaultQuantity', 'productStockCount', 'productCatalog.productStatus	',
                        'subCategory.subCategoryName', 'discountValue as discount', 'productCatalog.sortingOrder',
                        knex.db.raw('(productCatalog.MRP - ( productCatalog.MRP * ( discountValue/100 ) )) as price'),
                        'productOfferX', 'productOfferY', 'attributeOptionsIds')
                    .innerJoin('subCategory', 'products.subcategoryId', '=', 'subCategory.id')
                    .innerJoin('productCatalog', 'products.id', '=', 'productCatalog.productId')
                    .innerJoin('disCountDetails', 'products.id', '=', 'disCountDetails.productId')
                    .innerJoin('productInventory', 'products.id', '=', 'productInventory.productId')
                    .where({
                        'deleteProduct': 0,
                        'products.activeStatus': 1,
                        'productCatalog.catalogId': object.auth.catalogId,
                        'productCatalog.productStatus': 1,
                        'disCountDetails.discountId': object.auth.discountId,
                        'productInventory.outletId': object.auth.outletId
                    })
                    .distinct('products.id', 'products.productCode')
                    // .where(data)
                    // .whereIn('products.subcategoryId', [1])
                    .modify(function (queryBuilder) {
                        if (object.sortBy === '1') {
                            // Sort by price low to high - 1
                            queryBuilder.orderBy('price', 'asc')
                        } else if (object.sortBy === '2') {
                            // Sort by price high to low - 2
                            queryBuilder.orderBy('price', 'desc')
                        } else if (object.sortBy === '3') {
                            // Sort by productCatalog.MRP low to high - 3
                            queryBuilder.orderBy('productCatalog.MRP', 'asc')
                        } else if (object.sortBy === '4') {
                            // Sort by productCatalog.MRP high to low - 4
                            queryBuilder.orderBy('productCatalog.MRP', 'desc')
                        } else if (object.sortBy === '5') {
                            // Sort by discount low to high - 5
                            queryBuilder.orderBy('discount', 'asc')
                        } else if (object.sortBy === '6') {
                            // Sort by discount high to low - 7
                            queryBuilder.orderBy('discount', 'desc')
                        } else if (object.sortBy === '7') {
                            // Sort by product name - 7
                            queryBuilder.orderBy('productName')
                        } else {
                            queryBuilder.orderBy('productCatalog.sortingOrder', 'asc')
                        }


                        if (optionsArray.length > 0) {
                            // Attribute options
                            // var conv = optionsArray.toString().split(',')
                            // var strValue = JSON.stringify(conv)
                            // queryBuilder.whereRaw('(JSON_CONTAINS(attributeOptionsIds, ? ) AND products.categoryId = ? )', [strValue, object.categoryId])
                            var queryFunction = optionsArray.map(function (item) {
                                return "JSON_CONTAINS(attributeOptionsIds, '" + '"' + item + '"' + "')"
                            }).join(' OR ')
                            var build = '(' + queryFunction + ')' + ' AND ' + 'products.categoryId =' + object.categoryId
                            queryBuilder.whereRaw(build)
                        } else {
                            queryBuilder.where(data)
                        }

                        var subCategoryArray = JSON.parse(object.subcategoryId)
                        if (subCategoryArray.length > 0) {
                            queryBuilder.whereIn('products.subcategoryId', subCategoryArray)
                        }
                        // Min and Mix price
                        if (object.minPrice !== '0' && object.maxPrice !== '0') {
                            queryBuilder.having('price', '>=', object.minPrice)
                            queryBuilder.having('price', '<=', object.maxPrice)
                        } else if (object.minPrice !== '0' && object.maxPrice == '0') {
                            queryBuilder.having('price', '>=', object.minPrice)
                        }
                        if (object.minPrice == '0' && object.maxPrice !== '0') {
                            queryBuilder.having('price', '>=', object.minPrice)
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



        this.saveOrderItems = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('orderItems')
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

        this.getOrdersForBookindIdModel = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('orders')
                    .orderBy('id', 'desc')
                    .limit(2)
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


        this.getTotalNewArrivalProducts = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('products')
                    .select('products.id', 'productName', 'productImage', 'productCatalog.MRP', 'products.productCode',
                        'weight', 'productGST', 'MOQ', 'maxQty', 'products.defaultQuantity', 'productStockCount',
                        'productStatus	', 'subCategory.subCategoryName', 'discountValue as discount',
                        knex.db.raw('(productCatalog.MRP - ( productCatalog.MRP * ( discountValue/100 ) )) as price'),
                        'productOfferX', 'productOfferY')
                    .innerJoin('subCategory', 'products.subcategoryId', '=', 'subCategory.id')
                    .innerJoin('productCatalog', 'products.id', '=', 'productCatalog.productId')
                    .innerJoin('disCountDetails', 'products.id', '=', 'disCountDetails.productId')
                    .innerJoin('productInventory', 'products.id', '=', 'productInventory.productId')
                    .where({
                        'deleteProduct': 0,
                        'products.newArrivals': 1,
                        'products.activeStatus': 1,
                        'productCatalog.catalogId': data.auth.catalogId,
                        'disCountDetails.discountId': data.auth.discountId,
                        'productInventory.outletId': data.auth.outletId
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

        this.getNewArrivalProducts = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                var pageNumber = data.pageNumber
                if (pageNumber == '0') {
                    pageNumber = '0'
                } else {
                    pageNumber = pageNumber - 1
                }
                var pageOffset = parseInt(pageNumber * data.pageCount)
                //knex.db.raw('1 as productStatus')
                knex.db('products')
                    .select('products.id', 'productName', 'productImage', 'productCatalog.MRP',
                        'products.productCode', 'weight', 'productGST', 'MOQ', 'maxQty', 'productStockCount', 'products.defaultQuantity',
                        'productStatus	', 'subCategory.subCategoryName', 'category.categoryName', 'discountValue as discount',
                        knex.db.raw('(productCatalog.MRP - ( productCatalog.MRP * ( discountValue/100 ) )) as price'),
                        'productOfferX', 'productOfferY')
                    .innerJoin('subCategory', 'products.subcategoryId', '=', 'subCategory.id')
                    .innerJoin('category', 'products.categoryId', '=', 'category.id')
                    .innerJoin('productCatalog', 'products.id', '=', 'productCatalog.productId')
                    .innerJoin('disCountDetails', 'products.id', '=', 'disCountDetails.productId')
                    .innerJoin('productInventory', 'products.id', '=', 'productInventory.productId')
                    .where({
                        'deleteProduct': 0,
                        'products.newArrivals': 1,
                        'products.activeStatus': 1,
                        'productCatalog.catalogId': data.auth.catalogId,
                        'disCountDetails.discountId': data.auth.discountId,
                        'productInventory.outletId': data.auth.outletId
                    })
                    .orderBy('products.id', 'desc')
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
        this.salesRepCheckInstruction = function (data) {
            var response = {}
            return new Promise(function (resolve, reject) {
                knex.db('ordersInstructions')
                    .where({
                        userId: data.shopId,
                        type: 'SALESREP',
                        salesRepID: data.auth.id
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

        this.removeSalesRepInstructions = function (data) {
            var response = {}
            return new Promise(function (resolve, reject) {
                knex.db('ordersInstructions')
                    .where({
                        userId: data.shopId,
                        type: 'SALESREP',
                        salesRepID: data.auth.id
                    })
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

        //create jest unit test for calculate cart total




        this.removeSalesRepCartItems = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('cartItems')
                    .where({
                        userId: data.shopId,
                        cartType: 'SALESREP',
                        salesRepID: data.auth.id
                    })
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

        this.salesRepRemoveCartItemsModel = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('cartItems')
                    .whereIn('id', data)
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


        this.getProductIDs = function (id) {
            var response = {}
            return new Promise(function (resolve, reject) {
                knex.db('exploreProducts')
                    .select('id', 'exploreId', 'productId')
                    .where('exploreId', id)
                    .where('activeStatus', 1)
                    .orderBy('id', 'desc')
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

        this.exploreProductListModel = function (data) {
            var response = {}
            return new Promise(function (resolve, reject) {
                var optionsArray = JSON.parse(data.optionsIds)
                var pageNumber = data.pageNumber
                if (pageNumber == '0') {
                    pageNumber = '0'
                } else {
                    pageNumber = pageNumber - 1
                }
                var pageOffset = parseInt(pageNumber * data.pageCount)
                knex.db('products')
                    .select('products.id', 'productName', 'productImage', 'productCatalog.MRP', 'products.productCode', 'weight',
                        'productGST', 'MOQ', 'maxQty', 'products.defaultQuantity',
                        'products.specialDiscount', 'products.specialDiscountValue',
                        'productStockCount', 'finishingFast', 'fewStocksLeft', 'productStatus	', 'subCategory.subCategoryName', 'categoryName', 'discountValue as discount', knex.db.raw('(productCatalog.MRP - ( productCatalog.MRP * ( discountValue/100 ) )) as price'), 'productOfferX', 'productOfferY')
                    .innerJoin('subCategory', 'products.subcategoryId', '=', 'subCategory.id')
                    .innerJoin('category', 'products.categoryId', '=', 'category.id')
                    .innerJoin('productCatalog', 'products.id', '=', 'productCatalog.productId')
                    .innerJoin('disCountDetails', 'products.id', '=', 'disCountDetails.productId')
                    .innerJoin('productInventory', 'products.id', '=', 'productInventory.productId')
                    .where({
                        'deleteProduct': 0,
                        'products.activeStatus': 1,
                        'productCatalog.catalogId': data.auth.catalogId,
                        'disCountDetails.discountId': data.auth.discountId,
                        'productInventory.outletId': data.auth.outletId
                    })
                    // .whereIn('products.id', data.productIds)
                    .modify(function (queryBuilder) {
                        if (data.sortBy === '1') {
                            // Sort by price low to high - 1
                            queryBuilder.orderBy('price', 'asc')
                        } else if (data.sortBy === '2') {
                            // Sort by price high to low - 2
                            queryBuilder.orderBy('price', 'desc')
                        } else if (data.sortBy === '3') {
                            // Sort by productCatalog.MRP low to high - 3
                            queryBuilder.orderBy('productCatalog.MRP', 'asc')
                        } else if (data.sortBy === '4') {
                            queryBuilder.orderBy('productCatalog.MRP', 'desc')
                        } else if (data.sortBy === '5') {
                            // Sort by discount low to high - 5
                            queryBuilder.orderBy('discount', 'asc')
                        } else if (data.sortBy === '6') {
                            // Sort by discount high to low - 7
                            queryBuilder.orderBy('discount', 'desc')
                        } else if (data.sortBy === '7') {
                            // Sort by product name A-Z - 7
                            queryBuilder.orderBy('productName', 'asc')
                        } else if (data.sortBy === '8') {
                            // Sort by product name Z-A- 8
                            queryBuilder.orderBy('productName', 'desc')
                        } else {
                            queryBuilder.orderBy('products.id', 'desc')
                        }

                        // if (optionsArray.length > 0) {
                        //   // Attribute options
                        //   var stringValue = JSON.stringify(optionsArray)
                        //   queryBuilder.whereRaw('JSON_CONTAINS(attributeOptionsIds, ? )', [stringValue])
                        // }
                        if (optionsArray.length > 0) {
                            // Attribute options
                            // var conv = optionsArray.toString().split(',')
                            // var strValue = JSON.stringify(conv)
                            // queryBuilder.whereRaw('(JSON_CONTAINS(attributeOptionsIds, ? ) )', [strValue])
                            var queryFunction = optionsArray.map(function (item) {
                                return "JSON_CONTAINS(attributeOptionsIds, '" + '"' + item + '"' + "')"
                            }).join(' OR ')
                            var build = '(' + queryFunction + ')'
                            queryBuilder.whereRaw(build)
                        }
                        queryBuilder.whereIn('products.id', data.productIds)
                        // Min and Mix price
                        if (data.minPrice !== '0' && data.maxPrice !== '0') {
                            queryBuilder.having('price', '>=', data.minPrice)
                            queryBuilder.having('price', '<=', data.maxPrice)
                        } else if (data.minPrice !== '0') {
                            queryBuilder.having('price', '>=', data.minPrice)
                        } else if (data.minPrice == '0' && data.maxPrice !== '0') {
                            queryBuilder.having('price', '>=', data.minPrice)
                            queryBuilder.having('price', '<=', data.maxPrice)
                        }
                    })
                    // .orderBy('products.id', 'desc')
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

        this.expolreProductCount = function (Ids, data) {
            var response = {}
            return new Promise(function (resolve, reject) {
                var optionsArray = JSON.parse(data.optionsIds)
                knex.db('products')
                    .select('products.id', 'productName', 'productImage', 'productCatalog.MRP',
                        'products.productCode', 'weight', 'productGST', 'MOQ', 'maxQty', 'products.defaultQuantity',
                        'productStockCount', 'products.specialDiscount', 'products.specialDiscountValue',
                        'productStatus	', 'subCategory.subCategoryName', 'discountValue as discount',
                        knex.db.raw('(productCatalog.MRP - ( productCatalog.MRP * ( discountValue/100 ) )) as price'),
                        'productOfferX', 'productOfferY')
                    .innerJoin('subCategory', 'products.subcategoryId', '=', 'subCategory.id')
                    .innerJoin('productCatalog', 'products.id', '=', 'productCatalog.productId')
                    .innerJoin('disCountDetails', 'products.id', '=', 'disCountDetails.productId')
                    .innerJoin('productInventory', 'products.id', '=', 'productInventory.productId')
                    .where({
                        'deleteProduct': 0,
                        'products.activeStatus': 1,
                        'productCatalog.catalogId': data.auth.catalogId,
                        'disCountDetails.discountId': data.auth.discountId,
                        'productInventory.outletId': data.auth.outletId
                    })
                    // .whereIn('products.id', Ids)
                    .modify(function (queryBuilder) {
                        if (data.sortBy === '1') {
                            // Sort by price low to high - 1
                            queryBuilder.orderBy('price', 'asc')
                        } else if (data.sortBy === '2') {
                            // Sort by price high to low - 2
                            queryBuilder.orderBy('price', 'desc')
                        } else if (data.sortBy === '3') {
                            // Sort by productCatalog.MRP low to high - 3
                            queryBuilder.orderBy('productCatalog.MRP', 'asc')
                        } else if (data.sortBy === '4') {
                            queryBuilder.orderBy('productCatalog.MRP', 'desc')
                        } else if (data.sortBy === '5') {
                            // Sort by discount low to high - 5
                            queryBuilder.orderBy('discount', 'asc')
                        } else if (data.sortBy === '6') {
                            // Sort by discount high to low - 7
                            queryBuilder.orderBy('discount', 'desc')
                        } else if (data.sortBy === '7') {
                            // Sort by product name A-Z - 7
                            queryBuilder.orderBy('productName', 'asc')
                        } else if (data.sortBy === '8') {
                            // Sort by product name Z-A- 8
                            queryBuilder.orderBy('productName', 'desc')
                        } else {
                            queryBuilder.orderBy('products.id', 'desc')
                        }

                        // if (optionsArray.length > 0) {
                        //   // Attribute options
                        //   var stringValue = JSON.stringify(optionsArray)
                        //   queryBuilder.whereRaw('JSON_CONTAINS(attributeOptionsIds, ? )', [stringValue])
                        // }

                        if (optionsArray.length > 0) {
                            // Attribute options
                            // var conv = optionsArray.toString().split(',')
                            // var strValue = JSON.stringify(conv)
                            // queryBuilder.whereRaw('(JSON_CONTAINS(attributeOptionsIds, ? ))', [strValue])
                            var queryFunction = optionsArray.map(function (item) {
                                return "JSON_CONTAINS(attributeOptionsIds, '" + '"' + item + '"' + "')"
                            }).join(' OR ')
                            var build = '(' + queryFunction + ')'
                            queryBuilder.whereRaw(build)
                        }
                        queryBuilder.whereIn('products.id', Ids)
                        // Min and Mix price
                        if (data.minPrice !== '0' && data.maxPrice !== '0') {
                            queryBuilder.having('price', '>=', data.minPrice)
                            queryBuilder.having('price', '<=', data.maxPrice)
                        } else if (data.minPrice !== '0') {
                            queryBuilder.having('price', '>=', data.minPrice)
                        } else if (data.minPrice == '0' && data.maxPrice !== '0') {
                            queryBuilder.having('price', '>=', data.minPrice)
                            queryBuilder.having('price', '<=', data.maxPrice)
                        }
                    })
                    // .orderBy('products.id', 'desc')
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

        this.salesRepCartQuantity = function (id) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('cartItems')
                    .where('userId', id)
                    .where('cartType', 'SALESREP')
                    .sum('quantity as totalQty')
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

        this.salesRepPaymentModeModel = function (id) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('paymentTypes')
                    .select('id', 'type')
                    .where('IsPaidList', 1)
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

        this.getFeatureProductColor = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('appSettings')
                    .select('id', 'featureProductColor')
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
        this.listFeatureProduct = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                var pageNumber = data.pageNumber
                if (pageNumber == '0') {
                    pageNumber = '0'
                } else {
                    pageNumber = pageNumber - 1
                }
                var pageOffset = parseInt(pageNumber * data.pageCount)
                knex.db('products')
                    .select('products.id', 'productName', 'productImage', 'productCatalog.MRP', 'products.productCode', 'weight',
                        'products.fewStocksLeft', 'products.finishingFast',
                        'products.specialDiscount', 'products.specialDiscountValue',
                        'productGST', 'MOQ', 'maxQty', 'products.defaultQuantity', 'productStockCount', 'productStatus', 'FeatuteTitle as featuteTitle',
                        'FeatuteDescription as featuteDescription', 'subCategory.subCategoryName', 'category.categoryName',
                        'discountValue as discount', knex.db.raw('(productCatalog.MRP - ( productCatalog.MRP * ( discountValue/100 ) )) as price'), 'productOfferX',
                        'productOfferY')
                    .innerJoin('subCategory', 'products.subcategoryId', '=', 'subCategory.id')
                    .innerJoin('category', 'products.categoryId', '=', 'category.id')
                    .innerJoin('productCatalog', 'products.id', '=', 'productCatalog.productId')
                    .innerJoin('disCountDetails', 'products.id', '=', 'disCountDetails.productId')
                    .innerJoin('productInventory', 'products.id', '=', 'productInventory.productId')
                    .innerJoin('featureProducts', 'products.id', '=', 'featureProducts.productId')
                    .where({
                        'deleteProduct': 0,
                        // 'products.featureProduct': 1,
                        'products.activeStatus': 1,
                        'productCatalog.catalogId': data.auth.catalogId,
                        'disCountDetails.discountId': data.auth.discountId,
                        'productInventory.outletId': data.auth.outletId,
                        'featureProducts.title': data.title,
                        'featureProducts.activeStatus': 1
                    })
                    // .orderBy('products.id', 'desc')
                    .orderBy('featureProducts.id', 'desc')
                    .distinct('products.id', 'products.productCode')
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

        this.productImages = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('productImages')
                    .select('id', 'productId', 'imageURL', 'type', 'imageURL as name', 'id as fileId')
                    .whereNot('imageURL', "")
                    .andWhere('productId', data)
                    .orderBy('id', 'asc')
                    .then((result) => {
                        response.error = false
                        response.data = result
                        // console.log("productImages",result)

                    })
                    .catch((error) => {
                        console.log("productImages", error)
                        response.error = true
                    })
                    .finally(() => {
                        resolve(response)
                    })
            })
        }
        this.totalFeatureProduct = function (data) {
            var response = {}
            return new Promise(function (resolve, reject) {
                knex.db('products')
                    .select('products.id', 'productName', 'productImage', 'productCatalog.MRP', 'products.productCode',
                        'weight', 'productGST', 'MOQ', 'maxQty', 'products.defaultQuantity', 'productStockCount', 'productStatus',
                        'products.specialDiscount', 'products.specialDiscountValue',
                        'subCategory.subCategoryName', 'discountValue as discount',
                        knex.db.raw('(productCatalog.MRP - ( productCatalog.MRP * ( discountValue/100 ) )) as price'),
                        'productOfferX', 'productOfferY')
                    .innerJoin('subCategory', 'products.subcategoryId', '=', 'subCategory.id')
                    .innerJoin('productCatalog', 'products.id', '=', 'productCatalog.productId')
                    .innerJoin('disCountDetails', 'products.id', '=', 'disCountDetails.productId')
                    .innerJoin('productInventory', 'products.id', '=', 'productInventory.productId')
                    .innerJoin('featureProducts', 'products.id', '=', 'featureProducts.productId')
                    .where({
                        'deleteProduct': 0,
                        // 'products.featureProduct': 1,
                        'products.activeStatus': 1,
                        'productCatalog.catalogId': data.auth.catalogId,
                        'disCountDetails.discountId': data.auth.discountId,
                        'productInventory.outletId': data.auth.outletId,
                        'featureProducts.title': data.title,
                        'featureProducts.activeStatus': 1

                    })
                    .orderBy('featureProducts.id', 'desc')
                    .distinct('products.id', 'products.productCode')
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


        this.productAttribute = function (data, show) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('attribute')
                    .select('id', 'attributeName')
                    .whereIn('id', data)
                    .modify(function (queryBuilder) {
                        if (show) {
                            queryBuilder.where('activeStatus', 1)
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

        this.getCategoryProductsList1 = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                var pageNumber = data.pageNumber
                if (pageNumber == '0') {
                    pageNumber = '0'
                } else {
                    pageNumber = pageNumber - 1
                }
                var pageOffset = parseInt(pageNumber * data.pageCount)
                // var optionsArray = JSON.parse(data.optionsIds)
                knex.db('products')
                    .select('products.id', 'productName', 'productImage', 'productCatalog.MRP', 'products.productCode',
                        'weight', 'productGST', 'MOQ', 'maxQty', 'products.defaultQuantity', 'productStockCount', 'productCatalog.productStatus',
                        'finishingFast', 'fewStocksLeft', 'subCategory.subCategoryName', 'categoryName', 'productCatalog.sortingOrder',
                        'discountValue as discount', knex.db.raw('(productCatalog.MRP - ( productCatalog.MRP * ( discountValue/100 ) )) as price'),
                        'productOfferX', 'productOfferY')
                    .innerJoin('subCategory', 'products.subcategoryId', '=', 'subCategory.id')
                    .innerJoin('category', 'products.categoryId', '=', 'category.id')
                    .innerJoin('productCatalog', 'products.id', '=', 'productCatalog.productId')
                    .innerJoin('disCountDetails', 'products.id', '=', 'disCountDetails.productId')
                    .innerJoin('productInventory', 'products.id', '=', 'productInventory.productId')
                    .where({
                        'deleteProduct': 0,
                        'products.activeStatus': 1,
                        'productCatalog.catalogId': data.auth.catalogId,
                        'productCatalog.productStatus': 1,
                        'disCountDetails.discountId': data.auth.discountId,
                        'productInventory.outletId': data.auth.outletId
                    })
                    // .where('productName', 'like', '%' + data.text + '%')
                    .andWhere(knex.db.raw(`(products.productName like '%${data.text}%'
        or products.productCode like '%${data.text}%'
        or category.categoryName like '%${data.text}%'
        or subCategory.subCategoryName like '%${data.text}%'
        )`))
                    // .orWhere('products.productCode', 'like', '%' + data.text + '%')
                    // .orWhere('category.categoryName', 'like', '%' + data.text + '%')
                    // .orWhere('subCategory.subCategoryName', 'like', '%' + data.text + '%')
                    // .distinct('products.id', 'products.productCode')
                    .groupBy('products.id')
                    .orderBy('productCatalog.sortingOrder', 'asc')
                    .offset(pageOffset).limit(data.pageCount)
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

        this.getTotalCategoryProductsModelSalesrep = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                // var optionsArray = JSON.parse(request.optionsIds)
                knex.db('products')
                    .select('products.id', 'productName', 'productImage', 'productCatalog.MRP', 'products.productCode',
                        'products.finishingFast', 'products.fewStocksLeft',
                        'products.specialDiscount', 'products.specialDiscountValue',
                        'weight', 'productGST', 'MOQ', 'maxQty', 'products.defaultQuantity', 'productStockCount', 'productCatalog.productStatus',
                        'subCategory.subCategoryName', 'discountValue as discount', 'productCatalog.sortingOrder',
                        knex.db.raw('(productCatalog.MRP - ( productCatalog.MRP * ( discountValue/100 ) )) as price'),
                        'productOfferX', 'productOfferY', 'attributeOptionsIds')
                    .innerJoin('subCategory', 'products.subcategoryId', '=', 'subCategory.id')
                    .innerJoin('category', 'products.categoryId', '=', 'category.id')
                    .innerJoin('productCatalog', 'products.id', '=', 'productCatalog.productId')
                    .innerJoin('disCountDetails', 'products.id', '=', 'disCountDetails.productId')
                    .innerJoin('productInventory', 'products.id', '=', 'productInventory.productId')
                    .where({
                        'deleteProduct': 0,
                        'products.activeStatus': 1,
                        'productCatalog.catalogId': data.auth.catalogId,
                        'productCatalog.productStatus': 1,
                        'disCountDetails.discountId': data.auth.discountId,
                        'productInventory.outletId': data.auth.outletId
                    })
                    // .where('productName', 'like', '%' + request.text + '%')
                    .andWhere(knex.db.raw(`(products.productName like '%${data.text}%'
                        or products.productCode like '%${data.text}%'
                        or category.categoryName like '%${data.text}%'
                        or subCategory.subCategoryName like '%${data.text}%'
                        )`))
                    // .orWhere('products.productCode', 'like', '%' + request.text + '%')
                    // .orWhere('category.categoryName', 'like', '%' + request.text + '%')
                    // .orWhere('subCategory.subCategoryName', 'like', '%' + request.text + '%')
                    .groupBy('products.id')
                    // .distinct('products.id', 'products.productCode')
                    .orderBy('productCatalog.sortingOrder', 'desc')
                    .then((result) => {
                        response.error = false
                        response.data = result
                    })
                    .catch((error) => {
                        console.log("getTotalCategoryProducts1", error)
                        response.error = true
                    })
                    .finally(() => {
                        resolve(response)
                    })
            })
        }







        this.searchAllCategoryModel = function (data) {
            var response = {}
            return new Promise(function (resolve, reject) {
                knex.db('category')
                    .select('category.id', 'categoryName', 'categoryDescription', 'categoryImage')
                    // .innerJoin('subCategory', 'category.id', '=', 'subCategory.categoryId')
                    .where('categoryName', 'like', '%' + data.text + '%')
                    .where('category.activeStatus', 1)
                    .orderBy('category.id', 'desc')
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


        this.searchAllSubcategoryModel = function (data) {
            var response = {}
            return new Promise(function (resolve, reject) {
                knex.db('subCategory')
                    .select('subCategory.id', 'subCategoryName', 'subCategoryImage', 'subCategoryName', 'subCategoryDescription', 'categoryId')
                    .where('subCategoryName', 'like', '%' + data.text + '%')
                    .where({
                        activeStatus: 1,
                        categoryId: data.categoryId
                    })
                    .orderBy('subCategory.id', 'desc')
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

        this.searchSubcategoryModel = function (data) {
            var response = {}
            return new Promise(function (resolve, reject) {

                var pageNumber = data.pageNumber
                if (pageNumber == '0') {
                    pageNumber = '0'
                } else {
                    pageNumber = pageNumber - 1
                }
                var pageOffset = parseInt(pageNumber * 20)

                knex.db('subCategory')
                    .select('subCategory.id', 'subCategoryName', 'subCategoryImage', 'subCategoryName', 'subCategoryDescription', 'categoryId')
                    .where('subCategoryName', 'like', '%' + data.text + '%')
                    .where({
                        activeStatus: 1,
                        categoryId: data.categoryId
                    })
                    .orderBy('subCategory.id', 'desc')
                    .offset(pageOffset).limit(20)
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
        this.searchAllProductListModel = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('products')
                    .select('products.id', 'productName', 'productImage', 'productCatalog.MRP', 'products.productCode', 'products.defaultQuantity',
                        'weight', 'productGST', 'MOQ', 'maxQty', 'productStockCount', 'productStatus', 'finishingFast', 'fewStocksLeft', 'subCategory.subCategoryName', 'discountValue as discount', knex.db.raw('(productCatalog.MRP - ( productCatalog.MRP * ( discountValue/100 ) )) as price'), 'productOfferX', 'productOfferY')
                    .innerJoin('subCategory', 'products.subcategoryId', '=', 'subCategory.id')
                    .innerJoin('productCatalog', 'products.id', '=', 'productCatalog.productId')
                    .innerJoin('disCountDetails', 'products.id', '=', 'disCountDetails.productId')
                    .innerJoin('productInventory', 'products.id', '=', 'productInventory.productId')
                    .where('productName', 'like', '%' + data.text + '%')
                    .where({
                        'productCatalog.catalogId': data.auth.catalogId,
                        'disCountDetails.discountId': data.auth.discountId
                    })
                    .where({
                        'deleteProduct': 0,
                        'products.activeStatus': 1,
                        'products.subcategoryId': data.subcategoryId,
                        'products.categoryId': data.categoryId,
                        'productInventory.outletId': data.auth.outletId
                    })
                    .orderBy('products.id', 'desc')
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


        this.searchAllExploreModel = function (data) {
            var response = {}
            return new Promise(function (resolve, reject) {
                knex.db('explore')
                    .select('id', 'exploreName', 'exploreImage')
                    .where('activeStatus', 1)
                    .where('exploreName', 'like', '%' + data.text + '%')
                    .orderBy('id', 'desc')
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










        this.searchExploreModel = function (data) {
            var response = {}
            return new Promise(function (resolve, reject) {
                var pageNumber = data.pageNumber
                if (pageNumber == '0') {
                    pageNumber = '0'
                } else {
                    pageNumber = pageNumber - 1
                }
                var pageOffset = parseInt(pageNumber * 20)
                knex.db('explore')
                    .select('id', 'exploreName', 'exploreImage')
                    .where('activeStatus', 1)
                    .where('exploreName', 'like', '%' + data.text + '%')
                    .orderBy('id', 'desc')
                    .offset(pageOffset).limit(20)
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
        this.searchAllProductModel = function (data) {
            var response = {}
            return new Promise(function (resolve, reject) {
                knex.db('products')
                    .select('products.id', 'productName', 'productImage', 'productCatalog.MRP', 'products.productCode',
                        'weight', 'productGST', 'MOQ', 'maxQty', 'productStockCount', 'products.defaultQuantity',
                        'productCatalog.productStatus',
                        'finishingFast', 'fewStocksLeft', 'subCategory.subCategoryName', 'categoryName', 'productCatalog.sortingOrder',
                        'discountValue as discount', knex.db.raw('(productCatalog.MRP - ( productCatalog.MRP * ( discountValue/100 ) )) as price'),
                        'productOfferX', 'productOfferY')
                    .innerJoin('subCategory', 'products.subcategoryId', '=', 'subCategory.id')
                    .innerJoin('category', 'products.categoryId', '=', 'category.id')
                    .innerJoin('productCatalog', 'products.id', '=', 'productCatalog.productId')
                    .innerJoin('disCountDetails', 'products.id', '=', 'disCountDetails.productId')
                    .innerJoin('productInventory', 'products.id', '=', 'productInventory.productId')
                    .where('productName', 'like', '%' + data.text + '%')
                    .orWhere('products.productCode', 'like', '%' + data.text + '%')
                    .orWhere('category.categoryName', 'like', '%' + data.text + '%')
                    .orWhere('subCategory.subCategoryName', 'like', '%' + data.text + '%')
                    .where({
                        'deleteProduct': 0,
                        'products.activeStatus': 1,
                        'productCatalog.catalogId': data.auth.catalogId,
                        'productCatalog.productStatus': 1,
                        'disCountDetails.discountId': data.auth.discountId,
                        'productInventory.outletId': data.auth.outletId
                    })
                    .groupBy('products.id')
                    .orderBy('products.id', 'desc')
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



        this.updateOtherInstruction = function (data) {
            var response = {}
            return new Promise(function (resolve, reject) {
                knex.db('ordersInstructions')
                    .where('userId', data.userId)
                    .where('type', data.type)
                    .update(data)
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



        this.addOtherInstruction = function (data) {
            var response = {}
            return new Promise(function (resolve, reject) {
                knex.db('ordersInstructions')
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

        this.getPaymentListModel = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('paymentTypes')
                    .select('id', 'type', 'payDescription', 'id as value')
                    .where('activeStatus', 1)
                    .modify(function (queryBuilder) {
                        if (data.auth.userType == 'SALESREP') {
                            queryBuilder.where('type', '!=', 'Pay Online')
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


        this.verifiedUserId = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('users')
                    .select('id', 'name', 'customerID', 'mobileNumber', 'shopName', 'latitude', 'longitude', 'minOrderValue',
                        'shopAddress', 'pincode', 'city', 'state', 'userType', 'userCatalogId',
                        'isEnableDiscount', 'userDiscountId', 'outletId', "creditFixedtLimit",
                        'ownerId', 'salesRepIds', 'creditLimit', 'cashOnCarry',
                        'creditPeriod', 'isPriceVisible', 'bonusPoint', 'userDepotId')
                    .where({
                        id: data,
                        //  activeStatus: 1 
                    })
                    .then((result) => {
                        console.log("data", data)
                        console.log("result", result)
                        if (result.length > 0) {
                            response.error = false
                            response.data = result[0]
                        } else {
                            response.error = true
                        }
                    })
                    .catch((error) => {
                        response.error = true
                    })
                    .finally(() => {
                        resolve(response)
                    })
            })
        }



        this.getCatalogCategoryDao = function (data) {
            var response = {}
            var params = data.auth
            return new Promise(function (resolve) {
                knex.db('category')
                    .select('category.id', 'category.categoryName', 'category.categoryImage', 'category.categoryDescription',
                        'categoryCatalog.activeStatus', 'categoryCatalog.sortingOrder',
                        'categoryCatalog.catalogId')
                    .innerJoin('categoryCatalog', 'categoryCatalog.categoryId', '=', 'category.id')
                    .where('category.activeStatus', 1)
                    .andWhere('categoryCatalog.catalogId', params.catalogId)
                    .andWhere('categoryCatalog.activeStatus', 1)
                    .orderBy('categoryCatalog.sortingOrder', 'asc')
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



        this.newArrivals = function (data) {
            var response = {}
            return new Promise(function (resolve, reject) {
                knex.db('products')
                    .select('products.id', 'productName', 'productImage', 'productCatalog.MRP', 'products.productCode', 'weight',
                        'productGST', 'MOQ', 'maxQty', 'products.defaultQuantity', 'productInventory.productStockCount',
                        'productCatalog.productStatus	', 'subCategory.subCategoryName', 'productCatalog.catalogId',
                        'products.fewStocksLeft', 'products.finishingFast',
                        'products.specialDiscount', 'products.specialDiscountValue',
                        'category.categoryName', 'discountValue as discount',
                        knex.db.raw('(productCatalog.MRP - ( productCatalog.MRP * ( discountValue/100 ) )) as price'),
                        'productOfferX', 'productOfferY')
                    .innerJoin('subCategory', 'products.subcategoryId', '=', 'subCategory.id')
                    .innerJoin('category', 'products.categoryId', '=', 'category.id')
                    .innerJoin('productCatalog', 'products.id', '=', 'productCatalog.productId')
                    .innerJoin('disCountDetails', 'products.id', '=', 'disCountDetails.productId')
                    .innerJoin('productInventory', 'products.id', '=', 'productInventory.productId')
                    .where({
                        'deleteProduct': 0,
                        'productInventory.new_arrivals': 1,
                        'products.activeStatus': 1,
                        'productCatalog.catalogId': data.auth.catalogId,
                        'productCatalog.productStatus': 1,
                        'disCountDetails.discountId': data.auth.discountId,
                        'productInventory.outletId': data.auth.outletId
                    })
                    .groupBy('products.id')
                    .limit(12)
                    .orderBy('products.id', 'desc')
                    .then((result) => {
                        response.error = false
                        response.data = result
                        //  console.log("NewArrivals***",result)
                        resolve(response)
                    })
                    .catch((error) => {
                        console.log("NewArrivals error", error)
                        response.error = true
                        reject(response)
                    })
            })
        }



        this.getExploreListModel = function (data) {
            var response = {}
            return new Promise(function (resolve, reject) {
                var pageNumber = data.pageNumber
                if (pageNumber == '0') {
                    pageNumber = '0'
                } else {
                    pageNumber = pageNumber - 1
                }
                var pageOffset = parseInt(pageNumber * data.pageCount)
                knex.db('explore')
                    .select('id', 'exploreName', 'exploreImage')
                    .where('activeStatus', 1)
                    .orderBy('id', 'desc')
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


        this.getAllExploreList = function () {
            var response = {}
            return new Promise(function (resolve, reject) {
                knex.db('explore')
                    .select('id', 'exploreName', 'exploreImage')
                    .where('activeStatus', 1)
                    .orderBy('id', 'desc')
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

        this.searchCategoryModel = function (data) {
            var response = {}
            return new Promise(function (resolve, reject) {
                var pageNumber = data.pageNumber
                if (pageNumber == '0') {
                    pageNumber = '0'
                } else {
                    pageNumber = pageNumber - 1
                }
                var pageOffset = parseInt(pageNumber * 20)

                knex.db('category')
                    .select('category.id', 'categoryName', 'categoryDescription', 'categoryImage')
                    // .innerJoin('subCategory', 'category.id', '=', 'subCategory.categoryId')
                    .where('categoryName', 'like', '%' + data.text + '%')
                    .where('category.activeStatus', 1)
                    .orderBy('category.id', 'desc')
                    .offset(pageOffset).limit(20)
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


        this.findSubcategory = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('subCategory')
                    .select('subCategory.id', 'categoryId', 'subCategory.discount',
                        'subCategoryName', 'subCategoryImage', 'subCategoryDescription',
                        'subCategory.activeStatus')
                    .where({
                        categoryId: data,
                        activeStatus: 1
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


        this.creditDaysForOrderModel = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('orders')
                    .select('orders.id', 'bookingId', 'orders.orderStatus', 'orders.ownerId', 'orders.shippedDate',
                        'ow.creditPeriod', knex.db.raw('DATE_FORMAT(shippedDate + INTERVAL ow.creditPeriod DAY, "%d/%m/%Y") as dueDate, DATE_FORMAT(shippedDate, "%d/%m/%Y") AS shippedDate'),
                        knex.db.raw('SUM(totalAmount + totalGST - referralDiscount) as totalAmount'), 'paidAmount', 'balanceAmount')
                    .innerJoin('paymentTypes', 'orders.paymentId', '=', 'paymentTypes.id')
                    .leftJoin('users as au', 'orders.cartUserId', '=', 'au.id')
                    .leftJoin('users as ow', 'orders.ownerId', '=', 'ow.id')
                    .whereIn('orders.orderStatus', ['SHIPPED', 'DELIVERED', 'PAID'])
                    .where('orders.cartUserId', data)
                    .andWhere('orders.balanceAmount', '!=', 0)
                    .orderBy('orders.shippedDate', 'asc')
                    .groupBy('orders.id')
                    .limit(1)
                    .then((result) => {
                        // console.log("result model", result)
                        if (result.length > 0) {
                            response.error = false
                            const hasNullValues = Object.values(result[0]).includes(null);
                            var resp = hasNullValues == true && result[0].dueDate == null ? [] : result
                            response.data = resp
                        } else {
                            response.error = false
                            response.data = result
                        }
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



        this.updateOrderItemsPdfModel = function (data) {
            var response = {}
            return new Promise(function (resolve) {
                knex.db('orders')
                    .update({
                        orderItemsPdf: data.orderItemsPdf,
                    })
                    .where('bookingId', data.bookingId)
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








export default SalesRepProductModel;