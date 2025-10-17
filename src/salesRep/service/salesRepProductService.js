
import async from 'async'
import pdf from 'pdf-creator-node'
import path from 'path'
import fs from 'fs'



import STRINGS from '../../../strings.json'
import Utils from '../../../utils/utils'
import SalesRepProductModel from '../models/salesRepProductModel'
import NotificationsService from '../../../utils/notificationsService'
import UploadS3 from '../../../config/s3.upload'
import SmsTemplates from '../../../smsTemplates'

require('dotenv').config();

const salesRepProductModel = new SalesRepProductModel
const notificationsService = new NotificationsService
const uploadS3 = new UploadS3
const smsTemplates = new SmsTemplates

const utils = new Utils()



class SalesRepHomeService {
    constructor() {





        this.homeProductService = async (request, callback) => {
            try {
                console.log("auth request", request.auth)
                var response = {}
                var shops = await shopVerification(request)
                console.log("shops data listng ", shops.data.auth)
                request.auth.outletId = shops.data.auth.outletId
                request.auth.catalogId = shops.data.auth.catalogId
                request.auth.discountId = shops.data.auth.discountId
                if (!shops.error) {
                    Promise.all([
                        salesRepCatalogService(request, shops.data.auth),
                        salesRepProductModel.featureBannerModel(request),
                        salesRepNewArrivalService(shops.data),
                        exploreListService(shops.data),
                        salesRepCartDetails(shops.data)
                    ])
                        .then(result => {

                            response.error = false
                            response.statusCode = STRINGS.successStatusCode
                            response.message = STRINGS.SuccessString
                            response.outletId = shops.data.auth.outletId
                            response.shopName = shops.data.auth.shopName
                            response.latitude = shops.data.auth.latitude
                            response.longitude = shops.data.auth.longitude
                            response.cartDeatils = result[4]
                            response.catalog = result[0]
                            response.featureProducts = result[1].data
                            response.newArrivals = result[2].data
                            response.exploreProducts = result[3].exploreList
                            callback(response)
                        })
                        .catch(error => {
                            console.log(error)
                            response.error = true
                            response.statusCode = STRINGS.successStatusCode
                            response.message = STRINGS.commanErrorString
                            callback(response)
                        })
                } else {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                    callback(response)
                }
            } catch (e) {
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
                callback(response)
            }
        }



        this.frequentlyBoughtProductsService = async (request, callback) => {
            try {
                var response = {}

                var getOneProfileModel = await salesRepProductModel.profileModel(request.userId)
                if (getOneProfileModel.error) {
                    console.log("getOneProfileModel error", getOneProfileModel)
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                    return callback(response)
                }

                var productResponse = await salesRepProductModel.getBoughtProductsSalesRepShopOwnerModel(getOneProfileModel.data[0].id)
                // console.log(productResponse)
                if (productResponse.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                    callback(response)
                } else {
                    if (productResponse.data.length > 0) {
                        var products = productResponse.data
                        var length = products.length

                        products.forEach(async function (item, index) {
                            var cart = await salesRepProductModel.checkMyCartProduct(request.userId, item.id, request.auth.id)
                            var cartCount = 0
                            var attribute = []
                            var options = []
                            if (cart.data.length > 0) {
                                var cartCount = cart.data[0].quantity
                                var attribute = JSON.parse(cart.data[0].attribute)
                                var options = JSON.parse(cart.data[0].options)
                            }
                            // Stock Status
                            products[index].stockStatus = STRINGS.inStockString
                            item.productStockCount = item.defaultQuantity > 0 ? item.defaultQuantity : item.productStockCount
                            if (item.productStockCount < item.finishingFast) {
                                products[index].stockStatus = STRINGS.finishingFastString
                            }

                            if (item.productStockCount < item.fewStocksLeft) {
                                products[index].stockStatus = STRINGS.fewStocksLeftString
                            }

                            if (item.productStockCount === 0) {
                                products[index].stockStatus = STRINGS.outOfStockString
                            }
                            if (item.productStockCount < item.MOQ) {
                                products[index].stockStatus = STRINGS.outOfStockString
                            }
                            products[index].cartCount = cartCount
                            products[index].attributeIds = attribute
                            products[index].attributeOptionsIds = options
                            if (--length === 0) {
                                response.error = false
                                response.statusCode = STRINGS.successStatusCode
                                response.message = STRINGS.SuccessString
                                response.isPriceVisible = request.auth.isPriceVisible
                                response.productList = products
                                callback(response)
                            }
                        })
                    } else {
                        response.error = false
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.SuccessString
                        response.isPriceVisible = request.auth.isPriceVisible
                        response.productList = productResponse.data
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





        this.salesRepExploreList = async (request, callback) => {
            try {
                var response = {}
                var explore = await exploreListService(request)
                if (explore.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                } else {
                    response.error = false
                    response.message = STRINGS.SuccessString
                    response.pages = explore.explorePage
                    response.exploreList = explore.exploreList
                }
            } catch (e) {
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
            }
            callback(response)
        }






        // Add Cart
        this.salesRepAddCartService = async (request, callback) => {
            try {
                var response = {}
                var shops = await shopVerification(request)
                if (shops.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                } else {
                    var product = await salesRepProductModel.checkProductId(request)
                    // console.log("product",product)

                    if (product.error) {
                        response.error = true
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.commanErrorString
                    } else {
                        if (product.data.length > 0) {
                            var stockCount = product.data[0].defaultQuantity > 0 ? product.data[0].defaultQuantity : product.data[0].productStockCount
                            var maxQty = product.data[0].maxQty
                            var cart = await salesRepProductModel.checkSalesRepCartProduct(request)
                            if (cart.data.length > 0) {

                                if (request.key != 0) {
                                    var defaultQuantity = product.data[0].defaultQuantity
                                    // stockCount = defaultQuantity > 0 ? defaultQuantity : stockCount
                                    let cartQuantityValue = request.isEdit == 1 ? 0 : parseInt(cart.data[0].quantity)

                                    var addQuantity2 = cartQuantityValue + parseInt(request.quantity)
                                    let freeQty = 0
                                    // let add_extra_quantity = parseInt(addQty) + parseInt()
                                    console.log("addQty", addQuantity2)
                                    if (addQuantity2 >= product.data[0].productOfferX) {
                                        freeQty = Math.floor(addQuantity2 / product.data[0].productOfferX) * product.data[0].productOfferY
                                    }
                                    var addQuantity;
                                    console.log("freeQty", freeQty)
                                    addQuantity = parseInt(addQuantity2) + parseInt(freeQty)
                                    console.log("defaultQuantity", defaultQuantity, "addQty", addQuantity2, "stockCount", stockCount, "add quantity Test", addQuantity)



                                    if (maxQty != 0) {
                                        if (addQuantity > stockCount || addQuantity > maxQty) {
                                            response.error = true
                                            response.statusCode = STRINGS.successStatusCode
                                            response.message = STRINGS.quantityNotAvaiableString
                                            callback(response)
                                            return
                                        }
                                    } else {
                                        if (addQuantity > stockCount) {
                                            response.error = true
                                            response.statusCode = STRINGS.successStatusCode
                                            response.message = STRINGS.quantityNotAvaiableString
                                            callback(response)
                                            return
                                        }
                                    }


                                }
                                var cartId = cart.data[0].id
                                var cartQuantity = cart.data[0].quantity

                                var cartQuantity = Math.abs(cart.data[0].quantity)
                                request.quantity = Math.abs(request.quantity)
                                var addQty
                                if (request.isEdit == 0) {
                                    if (request.key == 1) {
                                        addQty = parseInt(cartQuantity) + parseInt(request.quantity)
                                    } else {
                                        if (cartQuantity == request.quantity) {
                                            await salesRepProductModel.deleteCartModel(cartId)
                                            await salesRepProductModel.removeSalesRepInstructions(request)
                                            var mycart = await salesRepCartDetails(request)
                                            response.error = false
                                            response.statusCode = STRINGS.successStatusCode
                                            response.message = STRINGS.cartUpdateString
                                            response.cartCount = mycart.cartCount
                                            response.cartAmount = mycart.subtotal
                                            callback(response)
                                            return
                                        } else {
                                            addQty = parseInt(cartQuantity) - parseInt(request.quantity)
                                        }
                                    }
                                    var object = {
                                        id: cartId,
                                        userId: request.shopId,
                                        productId: request.productId,
                                        quantity: addQty,
                                        attribute: request.attribute,
                                        options: request.options
                                    }
                                    // await  salesRepProductModel.updateCartItems(object)
                                } else {
                                    addQty = request.quantity
                                    var object = {
                                        id: cartId,
                                        userId: request.shopId,
                                        productId: request.productId,
                                        quantity: addQty,
                                        attribute: request.attribute,
                                        options: request.options
                                    }
                                    // await  salesRepProductModel.updateCartItems(object)
                                }

                                var defaultQuantity = product.data[0].defaultQuantity
                                // stockCount = defaultQuantity > 0 ? defaultQuantity : stockCount

                                var freeQty = 0
                                // let add_extra_quantity = parseInt(addQty) + parseInt()
                                console.log("addQty", addQty)
                                if (addQty >= product.data[0].productOfferX) {
                                    freeQty = Math.floor(addQty / product.data[0].productOfferX) * product.data[0].productOfferY
                                }
                                var addQuantity;
                                console.log("freeQty", freeQty)
                                addQuantity = parseInt(addQty) + parseInt(freeQty)
                                console.log("defaultQuantity", defaultQuantity, "addQty", addQty, "stockCount", stockCount, "add quantity Test", addQuantity)



                                if (maxQty != 0) {
                                    if (addQuantity > stockCount || addQuantity > maxQty) {
                                        response.error = true
                                        response.statusCode = STRINGS.successStatusCode
                                        response.message = STRINGS.quantityNotAvaiableString
                                        callback(response)
                                        return
                                    } else {
                                        await salesRepProductModel.updateCartItems(object)
                                    }
                                } else {
                                    if (addQuantity > stockCount) {
                                        response.error = true
                                        response.statusCode = STRINGS.successStatusCode
                                        response.message = STRINGS.quantityNotAvaiableString
                                        callback(response)
                                        return
                                    } else {
                                        await salesRepProductModel.updateCartItems(object)
                                    }
                                }
                            } else {

                                request.quantity = Math.abs(request.quantity)

                                var defaultQuantity = product.data[0].defaultQuantity
                                // stockCount = defaultQuantity > 0 ? defaultQuantity : stockCount
                                var addQuantity2 = parseInt(request.quantity)
                                let freeQty = 0
                                // let add_extra_quantity = parseInt(addQty) + parseInt()
                                console.log("addQty", addQuantity2)
                                if (addQuantity2 >= product.data[0].productOfferX) {
                                    freeQty = Math.floor(addQuantity2 / product.data[0].productOfferX) * product.data[0].productOfferY
                                }
                                var addQuantity;
                                console.log("freeQty", freeQty)
                                addQuantity = parseInt(addQuantity2) + parseInt(freeQty)
                                console.log("defaultQuantity", defaultQuantity, "addQty", addQuantity2, "stockCount", stockCount, "add quantity Test", addQuantity)



                                if (maxQty != 0) {
                                    if (addQuantity > stockCount || addQuantity > maxQty) {
                                        response.error = true
                                        response.statusCode = STRINGS.successStatusCode
                                        response.message = STRINGS.quantityNotAvaiableString
                                        callback(response)
                                        return
                                    }
                                } else {
                                    if (addQuantity > stockCount) {
                                        response.error = true
                                        response.statusCode = STRINGS.successStatusCode
                                        response.message = STRINGS.quantityNotAvaiableString
                                        callback(response)
                                        return
                                    }
                                }

                                if (request.key == 1) {
                                    var object = {
                                        userId: request.shopId,
                                        productId: request.productId,
                                        quantity: Math.abs(request.quantity),
                                        attribute: request.attribute,
                                        options: request.options,
                                        cartType: 'SALESREP',
                                        salesRepID: request.auth.id
                                    }
                                    await salesRepProductModel.insertCartItems(object)
                                }
                            }
                            var mycart = await salesRepCartDetails(request)
                            var cartAfter = await salesRepProductModel.checkSalesMyCartProduct(request.shopId, request.productId, request.auth.id)
                            console.log("cartAfter***", cartAfter)
                            if (cartAfter.data.length > 0) {
                                var itemCount = cartAfter.data[0].quantity;
                                var itemAmount = cartAfter.data[0].quantity * cartAfter.data[0].MRP;
                            }
                            if (mycart.error) {
                                response.error = true
                                response.statusCode = STRINGS.successStatusCode
                                response.message = STRINGS.commanErrorString
                            } else {
                                var freeQty = 0
                                if (product.data[0].productOfferX != 0) {
                                    freeQty = Math.floor(itemCount / product.data[0].productOfferX) * product.data[0].productOfferY
                                }

                                var gstAmount = (itemAmount - (itemAmount * (product.data[0].discount / 100))) * (product.data[0].productGST / 100)


                                response.error = false
                                response.statusCode = STRINGS.successStatusCode
                                response.productName = product.data[0].productName
                                response.message = STRINGS.cartUpdateString
                                response.itemCount = itemCount
                                response.cartCount = mycart.cartCount
                                response.cartAmount = mycart.subtotal
                                response.gstAmount = gstAmount
                                response.freeQty = freeQty
                            }
                        } else {
                            response.error = true
                            response.statusCode = STRINGS.successStatusCode
                            response.message = STRINGS.invalidProductString
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

        this.salesRepviewCartDetails = async (request, callback) => {
            try {
                var response = {}
                var shops = await shopVerification(request)
                // console.log("shops", shops)
                if (shops.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                } else {
                    var cartItems1 = await salesRepProductModel.salesRepCardItems1(request)


                    var cartItems = await salesRepProductModel.salesRepCardItems(request)

                    if (cartItems.error || cartItems1.error) {
                        response.error = true
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.commanErrorString
                    } else {

                        for (var i = 0; i < cartItems.data.length; i++) {
                            var cartID = cartItems.data[i].id
                            var stockCount = cartItems.data[i].defaultQuantity > 0 ? cartItems.data[i].defaultQuantity : cartItems.data[i].productStockCount
                            if (cartItems.data[i].quantity > stockCount) {
                                var CartQuantity = stockCount
                                cartItems.data[i].quantity = CartQuantity
                                var updateSalesRepCartItemsModel = await salesRepProductModel.updateSalesRepCartItemsModel(cartID, CartQuantity)
                                if (updateSalesRepCartItemsModel.error) {
                                    response.error = true
                                    response.statusCode = STRINGS.successStatusCode
                                    response.message = STRINGS.commanErrorString
                                    // callback(response)
                                }
                            }
                            // console.log("updateSalesRepCartItemsModel",updateSalesRepCartItemsModel)
                        }


                        var shopInfo = {}
                        shopInfo.id = request.shopId
                        shopInfo.shopName = shops.data.auth.shopName
                        shopInfo.shopAddress = shops.data.auth.shopAddress
                        shopInfo.cashOnCarry = shops.data.auth.cashOnCarry
                        // console.log("cartItems", cartItems)
                        if (cartItems.data.length > 0) {
                            var total = await salesRepProductModel.salesRepCardTotalSumValue(request)
                            var instructions = await salesRepProductModel.salesRepInstructionsModel(request)
                            if (total.error || instructions.error) {
                                response.error = true
                                response.statusCode = STRINGS.successStatusCode
                                response.message = STRINGS.commanErrorString
                            } else {
                                const orderItemsList = cartItems.data.map(item => {
                                    const orderObject = {}
                                    orderObject.id = item.id
                                    orderObject.productId = item.productId
                                    orderObject.userId = item.userId
                                    orderObject.isOffer = false
                                    orderObject.productName = item.productName
                                    orderObject.productImage = item.productImage
                                    orderObject.productCode = item.productCode
                                    orderObject.productOfferX = item.productOfferX
                                    orderObject.productOfferY = item.productOfferY
                                    orderObject.finishingFast = item.finishingFast
                                    orderObject.fewStocksLeft = item.fewStocksLeft
                                    orderObject.maxQty = item.maxQty
                                    // orderObject.stockCount = item.stockCount
                                    orderObject.productStockCount = item.productStockCount
                                    orderObject.MRP = item.MRP
                                    orderObject.isFreeQty = 0
                                    orderObject.offerPrice = 0

                                    // Stock Status
                                    orderObject.stockStatus = STRINGS.inStockString
                                    if (item.productStockCount < item.finishingFast) {
                                        orderObject.stockStatus = STRINGS.finishingFastString
                                    }

                                    if (item.productStockCount < item.fewStocksLeft) {
                                        orderObject.stockStatus = STRINGS.fewStocksLeftString
                                    }

                                    if (item.productStockCount === 0) {
                                        orderObject.stockStatus = STRINGS.outOfStockString
                                    }
                                    if (item.productStockCount < item.MOQ) {
                                        orderObject.stockStatus = STRINGS.outOfStockString
                                    }

                                    if (item.productOfferX != 0) {
                                        if (item.quantity >= item.productOfferX) {
                                            var freeQty = Math.floor(item.quantity / item.productOfferX) * item.productOfferY
                                            var offPrice = item.totalPrice / (freeQty + item.quantity)
                                            var offFinal = offPrice * item.quantity
                                            orderObject.isOffer = true
                                            orderObject.isFreeQty = freeQty
                                            orderObject.offerPrice = parseInt(offFinal.toFixed(2))
                                        }
                                    }
                                    orderObject.quantity = item.quantity
                                    orderObject.attributeOptionsIds = JSON.parse(item.options)
                                    orderObject.attributeIds = JSON.parse(item.attribute)
                                    orderObject.MOQ = item.MOQ
                                    orderObject.productGST = item.productGST
                                    orderObject.discount = item.discount
                                    orderObject.totalPrice = item.totalPrice
                                    orderObject.supplyPrice = item.supplyPrice
                                    orderObject.gstAmount = item.gstAmount
                                    orderObject.specialDiscount = item.specialDiscount
                                    orderObject.specialDiscountValue = item.specialDiscountValue
                                    let specialDiscountAmount = 0
                                    let specialAmountValue = 0
                                    if (item.specialDiscount == 1) {
                                        specialAmountValue = (item.supplyPrice * item.specialDiscountValue) / 100
                                        specialDiscountAmount = item.supplyPrice - specialAmountValue
                                    }
                                    orderObject.specialDiscountAmount = specialDiscountAmount
                                    orderObject.specialAmountValue = specialAmountValue



                                    return orderObject
                                })

                                var specialTotalAmountValue = orderItemsList.reduce((acc, val) => {
                                    let totalSpecialAmount = val.quantity * val.specialAmountValue
                                    return acc + totalSpecialAmount
                                }, 0)


                                // Other instructions
                                var instructionObject = {}

                                var profile = await salesRepProductModel.profileModel(request.shopId)
                                var additional_Discount = false
                                var additionalDiscountValue = 0

                                if (instructions.data.length > 0) {
                                    instructionObject.barCode = instructions.data[0].barCode
                                    instructionObject.PVCCovers = instructions.data[0].PVCCovers
                                    instructionObject.goodsInBulk = instructions.data[0].goodsInBulk
                                    instructionObject.MRPOnLabels = instructions.data[0].MRPOnLabels
                                    instructionObject.instruction = instructions.data[0].instruction
                                } else {
                                    instructionObject.barCode = 0
                                    instructionObject.PVCCovers = 0
                                    instructionObject.goodsInBulk = 0
                                    instructionObject.MRPOnLabels = 0
                                    instructionObject.instruction = ''
                                }
                                var priceArray = []
                                var subTotalObject = {}
                                var GSTObject = {}
                                var grandTotalObject = {}
                                var subtotal = total.data[0].finaltotal
                                var subtotalValue = subtotal

                                subTotalObject.value = +subtotalValue.toFixed(2)
                                subTotalObject.type = 'Sub Total'
                                subTotalObject.isDiscount = false
                                priceArray.push(subTotalObject)

                                if (specialTotalAmountValue > 1) {
                                    let specialDiscount = {}
                                    specialDiscount.value = +specialTotalAmountValue.toFixed(2)
                                    specialDiscount.value = parseFloat(specialDiscount.value)

                                    specialDiscount.type = 'Offer Discount'
                                    specialDiscount.isDiscount = true
                                    // console.log("specialDiscount", specialDiscount)
                                    priceArray.push(specialDiscount)

                                }








                                GSTObject.value = +total.data[0].gsttotal.toFixed(2)
                                GSTObject.type = 'GST Amount'
                                GSTObject.isDiscount = false
                                if (profile.data[0].isNonGst == 1) {
                                    // console.log("NonGst customer")
                                    let additionalDiscount = {}
                                    additionalDiscount.value = +total.data[0].gsttotal.toFixed(2)
                                    additionalDiscount.type = 'Additional Discount '
                                    additionalDiscount.isDiscount = true
                                    // console.log("subtotalValue", additionalDiscount)
                                    priceArray.push(additionalDiscount)
                                    additional_Discount = true
                                    additionalDiscountValue = additionalDiscount.value
                                }
                                var grandTotal = subtotalValue + total.data[0].gsttotal
                                grandTotal = additional_Discount == true ? grandTotal - additionalDiscountValue
                                    : grandTotal
                                grandTotal = grandTotal - specialTotalAmountValue
                                grandTotalObject.value = +grandTotal.toFixed(2)
                                grandTotalObject.type = 'Grand Total'
                                grandTotalObject.isDiscount = false

                                priceArray.push(GSTObject)
                                priceArray.push(grandTotalObject)
                                // console.log("priceArray************", priceArray)
                                response.error = false
                                response.statusCode = STRINGS.successStatusCode
                                response.message = STRINGS.SuccessString
                                response.shopDetails = shopInfo
                                // response.isPriceVisible = request.auth.isPriceVisible
                                response.creditLimit = request.auth.creditLimit
                                // response.isOfferApply = profile.data[0].isOfferApply
                                // response.isreferral = referral
                                response.otherInstruction = instructionObject
                                response.grandTotal = +grandTotal.toFixed(2)
                                response.priceList = priceArray
                                // response.cartItems = orderItemsList
                                response.count = cartItems.data.length
                                // response.pages= await  utils.pageCount(cartItems.data.length, 10)
                            }
                        } else {
                            response.error = false
                            response.statusCode = STRINGS.successStatusCode
                            response.message = STRINGS.emptyCartString
                            response.shopDetails = shopInfo
                            response.creditLimit = request.auth.creditLimit
                            // response.cartItems = cartItems.data
                            response.count = cartItems.data.length
                            // response.pages= await  utils.pageCount(cartItems.data.length, 10)
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


        this.salesRepviewCartByPageDetailsTry = async (request, callback) => {
            try {
                var response = {}
                console.log("auth", request.auth)
                var shops = await shopVerification(request)
                // console.log("shops", shops)
                if (shops.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                } else {
                    var cartAll = await salesRepProductModel.salesRepCardItemsByPage(request)
                    // console.log("cartAll****", cartAll.data)
                    if (cartAll.error) {
                        response.error = true
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.commanErrorString
                    } else {
                        var unique = {};
                        let cartItemsData = []

                        for (var i = 0; i < cartAll.data.length; i++) {
                            var val = cartAll.data[i]
                            let ind = i
                            // console.log("values products", val)

                            if (unique.hasOwnProperty(val.productCode)) {

                            } else {
                                unique[val.productCode] = 0;
                                cartItemsData.push(val)
                            }
                        }
                        // console.log("cartItemsData", cartItemsData)
                        let arr = []
                        for (var i = 0; i < cartItemsData.length; i++) {
                            var val = cartItemsData[i]
                            var stockCount = val.defaultQuantity > 0 ? val.defaultQuantity : val.productStockCount


                            if (val.quantity > stockCount && val.quantity > 0) {
                                val.quantity = stockCount

                                arr.push(val)
                            } else if (val.quantity == 0 || val.quantity < 0) {
                                val.quantity = parseInt(val.MOQ)

                                arr.push(val)
                            } else {
                                arr.push(val)
                            }
                        }
                        // var cartItems = await salesRepProductModel.salesRepCardItemsByPage(request)
                        var cartItems = {}
                        cartItems.data = arr
                        cartItems.error = false
                        console.log("cartItems real", cartItems)
                        if (cartItems.error) {
                            response.error = true
                            response.statusCode = STRINGS.successStatusCode
                            response.message = STRINGS.commanErrorString
                        } else {
                            var shopInfo = {}
                            shopInfo.id = request.shopId
                            shopInfo.shopName = shops.data.auth.shopName
                            shopInfo.shopAddress = shops.data.auth.shopAddress
                            shopInfo.cashOnCarry = shops.data.auth.cashOnCarry
                            var UserLedger = await utils.UserLedger(shops.data.auth.customerID)
                            if (UserLedger.error) {
                                // console.log("UserLedger error", UserLedger)
                                response.error = true
                                response.statusCode = STRINGS.errorStatusCode
                                response.message = STRINGS.commanErrorString
                            } else {
                                // console.log("UserLedger", UserLedger)
                                var userLedgerAmount = 0;
                                if (UserLedger.length > 0) {
                                    userLedgerAmount = UserLedger.length > 0 ? parseFloat(UserLedger[0].CLOSINGBALANCE.$t) : 0
                                    var closingBalance = parseFloat(UserLedger[0].TOTALDEBIT.$t) >= parseFloat(UserLedger[0].TOTALCREDIT.$t) ? 1 : -1
                                    userLedgerAmount = userLedgerAmount * closingBalance
                                }
                                var totalAmount = await salesRepProductModel.totalAcceptWaitingAmountModel(request.auth.ownerId)
                                // console.log("totalAmount", totalAmount)
                                let accept_waiting_amount = parseFloat(totalAmount.data[0].totalAcceptWaitingAmount == null ? 0 :
                                    totalAmount.data[0].totalAcceptWaitingAmount)

                                let availableCredit = parseFloat(userLedgerAmount) + (accept_waiting_amount)
                                if (cartItems.data.length > 0) {
                                    var total = await salesRepProductModel.salesRepCardTotalSumValue(request)
                                    var instructions = await salesRepProductModel.salesRepInstructionsModel(request)
                                    if (total.error || instructions.error) {
                                        response.error = true
                                        response.statusCode = STRINGS.successStatusCode
                                        response.message = STRINGS.commanErrorString
                                    } else {
                                        const orderItemsList = cartItems.data.map(item => {
                                            item.productStockCount = item.defaultQuantity > 0 ? item.defaultQuantity : item.productStockCount

                                            const orderObject = {}
                                            orderObject.id = item.id
                                            orderObject.productId = item.productId
                                            orderObject.userId = item.userId
                                            orderObject.isOffer = false
                                            orderObject.productName = item.productName
                                            orderObject.productImage = item.productImage
                                            orderObject.productCode = item.productCode
                                            orderObject.productOfferX = item.productOfferX
                                            orderObject.productOfferY = item.productOfferY
                                            orderObject.finishingFast = item.finishingFast
                                            orderObject.fewStocksLeft = item.fewStocksLeft
                                            orderObject.maxQty = item.maxQty
                                            // orderObject.stockCount = item.stockCount
                                            orderObject.productStockCount = item.productStockCount
                                            orderObject.MRP = item.MRP
                                            orderObject.isFreeQty = 0
                                            orderObject.offerPrice = 0

                                            // Stock Status
                                            orderObject.stockStatus = STRINGS.inStockString
                                            if (item.productStockCount < item.finishingFast) {
                                                orderObject.stockStatus = STRINGS.finishingFastString
                                            }
                                            if (item.productStockCount < item.fewStocksLeft) {
                                                orderObject.stockStatus = STRINGS.fewStocksLeftString
                                            }
                                            if (item.productStockCount === 0) {
                                                orderObject.stockStatus = STRINGS.outOfStockString
                                            }
                                            if (item.productStockCount < item.MOQ) {
                                                orderObject.stockStatus = STRINGS.outOfStockString
                                            }
                                            if (item.productOfferX != 0) {
                                                if (item.quantity >= item.productOfferX) {
                                                    var freeQty = Math.floor(item.quantity / item.productOfferX) * item.productOfferY
                                                    var offPrice = item.totalPrice / (freeQty + item.quantity)
                                                    var offFinal = offPrice * item.quantity
                                                    orderObject.isOffer = true
                                                    orderObject.isFreeQty = freeQty
                                                    orderObject.offerPrice = parseInt(offFinal.toFixed(2))
                                                }
                                            }
                                            orderObject.quantity = item.quantity
                                            orderObject.defaultQuantity = item.defaultQuantity
                                            orderObject.attributeOptionsIds = JSON.parse(item.options)
                                            orderObject.attributeIds = JSON.parse(item.attribute)
                                            orderObject.MOQ = item.MOQ
                                            orderObject.productGST = item.productGST
                                            orderObject.discount = item.discount
                                            orderObject.totalPrice = item.totalPrice
                                            orderObject.supplyPrice = item.supplyPrice
                                            orderObject.gstAmount = item.gstAmount

                                            orderObject.specialDiscount = item.specialDiscount
                                            orderObject.specialDiscountValue = item.specialDiscountValue
                                            let specialDiscountAmount = 0
                                            let specialAmountValue = 0
                                            if (item.specialDiscount == 1) {
                                                specialAmountValue = (item.supplyPrice * item.specialDiscountValue) / 100
                                                specialDiscountAmount = item.supplyPrice - specialAmountValue
                                            }
                                            orderObject.specialDiscountAmount = specialDiscountAmount
                                            orderObject.specialAmountValue = specialAmountValue
                                            return orderObject
                                        })
                                        var specialTotalAmountValue = orderItemsList.reduce((acc, val) => {
                                            let totalSpecialAmount = val.quantity * val.specialAmountValue
                                            return acc + totalSpecialAmount
                                        }, 0)

                                        // Other instructions
                                        var instructionObject = {}
                                        if (instructions.data.length > 0) {
                                            instructionObject.barCode = instructions.data[0].barCode
                                            instructionObject.PVCCovers = instructions.data[0].PVCCovers
                                            instructionObject.goodsInBulk = instructions.data[0].goodsInBulk
                                            instructionObject.MRPOnLabels = instructions.data[0].MRPOnLabels
                                            instructionObject.instruction = instructions.data[0].instruction
                                        } else {
                                            instructionObject.barCode = 0
                                            instructionObject.PVCCovers = 0
                                            instructionObject.goodsInBulk = 0
                                            instructionObject.MRPOnLabels = 0
                                            instructionObject.instruction = ''
                                        }
                                        var priceArray = []
                                        var subTotalObject = {}
                                        var GSTObject = {}
                                        var grandTotalObject = {}
                                        var subtotal = total.data[0].finaltotal
                                        var subtotalValue = subtotal

                                        var profile = await salesRepProductModel.profileModel(request.shopId)
                                        var additional_Discount = false
                                        var additionalDiscountValue = 0
                                        subTotalObject.value = subtotalValue
                                        subTotalObject.type = 'Sub Total'
                                        subTotalObject.isDiscount = false
                                        priceArray.push(subTotalObject)
                                        if (specialTotalAmountValue > 1) {
                                            let specialDiscount = {}
                                            specialDiscount.value = +specialTotalAmountValue.toFixed(2)
                                            specialDiscount.value = parseFloat(specialDiscount.value)

                                            specialDiscount.type = 'Offer Discount'
                                            specialDiscount.isDiscount = true
                                            // console.log("specialDiscount", specialDiscount)
                                            priceArray.push(specialDiscount)

                                        }
                                        GSTObject.value = total.data[0].gsttotal
                                        GSTObject.type = 'GST Amount'
                                        GSTObject.isDiscount = false
                                        if (profile.data[0].isNonGst == 1) {
                                            // console.log("NonGst customer")
                                            let additionalDiscount = {}
                                            additionalDiscount.value = +total.data[0].gsttotal.toFixed(2)
                                            additionalDiscount.type = 'Additional Discount '
                                            additionalDiscount.isDiscount = true
                                            // console.log("subtotalValue", additionalDiscount)
                                            priceArray.push(additionalDiscount)
                                            additional_Discount = true
                                            additionalDiscountValue = additionalDiscount.value
                                        }

                                        var grandTotal = subtotalValue + total.data[0].gsttotal
                                        grandTotal = additional_Discount == true ? grandTotal - additionalDiscountValue
                                            : grandTotal

                                        grandTotal = grandTotal - specialTotalAmountValue
                                        grandTotalObject.value = +grandTotal.toFixed(2)
                                        grandTotalObject.type = 'Grand Total'
                                        grandTotalObject.isDiscount = false

                                        priceArray.push(GSTObject)
                                        priceArray.push(grandTotalObject)
                                        response.error = false
                                        response.statusCode = STRINGS.successStatusCode
                                        response.message = STRINGS.SuccessString
                                        response.shopDetails = shopInfo
                                        // response.isPriceVisible = request.auth.isPriceVisible
                                        response.creditLimit = shops.data.auth.creditFixedtLimit
                                        response.availableCreditAmount = (parseFloat(shops.data.auth.creditFixedtLimit) - availableCredit).toFixed(1)
                                        // response.isOfferApply = profile.data[0].isOfferApply
                                        // response.isreferral = referral
                                        var creditDaysForOrderModel = await salesRepProductModel.creditDaysForOrderModel(request.shopId)
                                        // console.log("creditDaysForOrderModel", creditDaysForOrderModel)

                                        if (creditDaysForOrderModel.error) {
                                            response.error = true
                                            response.statusCode = STRINGS.errorStatusCode
                                            response.message = STRINGS.commanErrorString
                                        } else if (creditDaysForOrderModel.data.length > 0) {
                                            if (creditDaysForOrderModel.data[0].dueDate != null) {
                                                var today = new Date();
                                                var dd = String(today.getDate()).padStart(2, '0');
                                                var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
                                                var yyyy = today.getFullYear();
                                                today = dd + '/' + mm + '/' + yyyy;
                                                var date1Arr = creditDaysForOrderModel.data[0].dueDate.toString().split("/");
                                                var date2Arr = today.toString().split("/")
                                                var date1 = new Date(+date1Arr[2], date1Arr[1] - 1, +date1Arr[0]);
                                                var date2 = new Date(+date2Arr[2], date2Arr[1] - 1, +date2Arr[0]);
                                                var Difference_In_Time = date1.getTime() - date2.getTime();
                                                var daysLeft = Difference_In_Time / (1000 * 3600 * 24);
                                                // data.daysLeft = daysLeft;
                                                // console.log("daysLeft", daysLeft)
                                                response.creditPeriod = daysLeft
                                                if (daysLeft < 0) {


                                                    response.isOverdue = 1
                                                }
                                            }
                                        } else {
                                            response.creditPeriod = profile.data[0].creditPeriod
                                            response.isOverdue = 0

                                        }
                                        response.otherInstruction = instructionObject
                                        response.grandTotal = +grandTotal.toFixed(2)
                                        response.priceList = priceArray
                                        response.cartItems = orderItemsList
                                        response.count = cartAll.data.length
                                        response.pages = await utils.pageCount(cartAll.data.length, 10)
                                    }
                                } else {
                                    response.error = false
                                    response.statusCode = STRINGS.successStatusCode
                                    response.message = STRINGS.emptyCartString
                                    response.shopDetails = shopInfo
                                    response.creditLimit = shops.data.auth.creditFixedtLimit
                                    response.creditPeriod = "0"
                                    response.isOverdue = "0"
                                    response.availableCreditAmount = (parseFloat(shops.data.auth.creditFixedtLimit) - availableCredit).toFixed(1)
                                    response.cartItems = cartItems.data
                                    response.count = cartAll.data.length
                                    response.pages = await utils.pageCount(cartAll.data.length, 10)
                                }
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

        this.salesRepviewCartByPageDetails = async (request, callback) => {
            try {
                var response = {}
                console.log("auth", request.auth)
                var shops = await shopVerification(request)
                console.log("shops", shops)
                if (shops.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                } else {


                    // console.log("cartItems12", cartItems1)
                    var removeItemsFromSalesRepCart = []
                    // if (cartItems1.data.length > 0) {
                    // cartItems1.data.forEach((val, ind) => {
                    //     if (parseInt(val.defaultQuantity) == 0) {
                    //         removeItemsFromSalesRepCart.push(val.id)
                    //     }
                    // })
                    // console.log("removeCartIds",removeItemsFromSalesRepCart)
                    // var salesRepRemoveCartItemsModel = await salesRepProductModel.salesRepRemoveCartItemsModel(removeItemsFromSalesRepCart)
                    // if (salesRepRemoveCartItemsModel.error) {
                    //     response.error = true
                    //     response.statusCode = STRINGS.successStatusCode
                    //     response.message = STRINGS.commanErrorString
                    //     callback(response)
                    // }
                    // }



                    var cartAll = await salesRepProductModel.salesRepCardItemsByPage(request)
                    console.log("cartAll****", cartAll.data)
                    var unique = {};
                    let cartItemsData = []

                    for (var i = 0; i < cartAll.data.length; i++) {
                        var val = cartAll.data[i]
                        let ind = i
                        // console.log("values products", val)

                        if (unique.hasOwnProperty(val.productCode)) {
                            // console.log("cartItems.data[i].productCode", val)
                            var RemoveCartItemsModel = await salesRepProductModel.RemoveCartItemsModel(val.id)
                            if (RemoveCartItemsModel.error) {
                                response.error = true
                                response.statusCode = STRINGS.successStatusCode
                                response.message = STRINGS.commanErrorString
                                return callback(response)
                            }
                        } else {
                            unique[val.productCode] = 0;
                            cartItemsData.push(val)
                        }
                    }

                    let arr = []
                    for (var i = 0; i < cartAll.data.length; i++) {
                        var val = cartAll.data[i]
                        var stockCount = val.defaultQuantity > 0 ? val.defaultQuantity : val.productStockCount


                        if (val.quantity > stockCount && val.quantity > 0) {
                            val.quantity = stockCount
                            var updateCartItemsModel = await salesRepProductModel.updateCartItemsModel(val.id, val.quantity)
                            if (updateCartItemsModel.error) {
                                response.error = true
                                response.statusCode = STRINGS.successStatusCode
                                response.message = STRINGS.commanErrorString
                                return callback(response)
                            }
                            arr.push(val)
                        } else if (val.quantity == 0 || val.quantity < 0) {
                            val.quantity = parseInt(val.MOQ)
                            var updateCartItemsModel = await salesRepProductModel.updateCartItemsModel(val.id, val.quantity)
                            if (updateCartItemsModel.error) {
                                response.error = true
                                response.statusCode = STRINGS.successStatusCode
                                response.message = STRINGS.commanErrorString
                                return callback(response)
                            }
                        }


                    }


                    var cartItems = await salesRepProductModel.salesRepCardItemsByPage(request)
                    // console.log("cartItems real", cartItems)
                    if (cartItems.error) {
                        response.error = true
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.commanErrorString
                    } else {


                        for (var i = 0; i < cartItems.data.length; i++) {
                            var cartID = cartItems.data[i].id
                            var stockCount = cartItems.data[i].defaultQuantity > 0 ? cartItems.data[i].defaultQuantity : cartItems.data[i].productStockCount

                            if (cartItems.data[i].quantity > stockCount) {
                                var CartQuantity = stockCount
                                cartItems.data[i].quantity = CartQuantity
                                var updateSalesRepCartItemsModel = await salesRepProductModel.updateSalesRepCartItemsModel(cartID, CartQuantity)
                                if (updateSalesRepCartItemsModel.error) {
                                    response.error = true
                                    response.statusCode = STRINGS.successStatusCode
                                    response.message = STRINGS.commanErrorString
                                    // callback(response)
                                }
                            }
                            // console.log("updateSalesRepCartItemsModel",updateSalesRepCartItemsModel)
                        }


                        var shopInfo = {}
                        shopInfo.id = request.shopId
                        shopInfo.shopName = shops.data.auth.shopName
                        shopInfo.shopAddress = shops.data.auth.shopAddress
                        shopInfo.cashOnCarry = shops.data.auth.cashOnCarry



                        var UserLedger = await utils.UserLedger(shops.data.auth.customerID)
                        if (UserLedger.error) {
                            // console.log("UserLedger error", UserLedger)
                            response.error = true
                            response.statusCode = STRINGS.errorStatusCode
                            response.message = STRINGS.commanErrorString
                        } else {
                            // console.log("UserLedger", UserLedger)

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

                            var totalAmount = await salesRepProductModel.totalAcceptWaitingAmountModel(request.auth.ownerId)
                            // console.log("totalAmount", totalAmount)
                            let accept_waiting_amount = parseFloat(totalAmount.data[0].totalAcceptWaitingAmount == null ? 0 :
                                totalAmount.data[0].totalAcceptWaitingAmount)

                            let availableCredit = parseFloat(userLedgerAmount) + (accept_waiting_amount)
                            console.log()




                            if (cartItems.data.length > 0) {
                                var total = await salesRepProductModel.salesRepCardTotalSumValue(request)
                                var instructions = await salesRepProductModel.salesRepInstructionsModel(request)
                                if (total.error || instructions.error) {
                                    response.error = true
                                    response.statusCode = STRINGS.successStatusCode
                                    response.message = STRINGS.commanErrorString
                                } else {
                                    const orderItemsList = cartItems.data.map(item => {
                                        item.productStockCount = item.defaultQuantity > 0 ? item.defaultQuantity : item.productStockCount

                                        const orderObject = {}
                                        orderObject.id = item.id
                                        orderObject.productId = item.productId
                                        orderObject.userId = item.userId
                                        orderObject.isOffer = false
                                        orderObject.productName = item.productName
                                        orderObject.productImage = item.productImage
                                        orderObject.productCode = item.productCode
                                        orderObject.productOfferX = item.productOfferX
                                        orderObject.productOfferY = item.productOfferY
                                        orderObject.finishingFast = item.finishingFast
                                        orderObject.fewStocksLeft = item.fewStocksLeft
                                        orderObject.maxQty = item.maxQty
                                        // orderObject.stockCount = item.stockCount
                                        orderObject.productStockCount = item.productStockCount
                                        orderObject.MRP = item.MRP
                                        orderObject.isFreeQty = 0
                                        orderObject.offerPrice = 0

                                        // Stock Status
                                        orderObject.stockStatus = STRINGS.inStockString
                                        if (item.productStockCount < item.finishingFast) {
                                            orderObject.stockStatus = STRINGS.finishingFastString
                                        }

                                        if (item.productStockCount < item.fewStocksLeft) {
                                            orderObject.stockStatus = STRINGS.fewStocksLeftString
                                        }

                                        if (item.productStockCount === 0) {
                                            orderObject.stockStatus = STRINGS.outOfStockString
                                        }
                                        if (item.productStockCount < item.MOQ) {
                                            orderObject.stockStatus = STRINGS.outOfStockString
                                        }

                                        if (item.productOfferX != 0) {
                                            if (item.quantity >= item.productOfferX) {
                                                var freeQty = Math.floor(item.quantity / item.productOfferX) * item.productOfferY
                                                var offPrice = item.totalPrice / (freeQty + item.quantity)
                                                var offFinal = offPrice * item.quantity
                                                orderObject.isOffer = true
                                                orderObject.isFreeQty = freeQty
                                                orderObject.offerPrice = parseInt(offFinal.toFixed(2))
                                            }
                                        }
                                        orderObject.quantity = item.quantity
                                        orderObject.defaultQuantity = item.defaultQuantity
                                        orderObject.attributeOptionsIds = JSON.parse(item.options)
                                        orderObject.attributeIds = JSON.parse(item.attribute)
                                        orderObject.MOQ = item.MOQ
                                        orderObject.productGST = item.productGST
                                        orderObject.discount = item.discount
                                        orderObject.totalPrice = item.totalPrice
                                        orderObject.supplyPrice = item.supplyPrice
                                        orderObject.gstAmount = item.gstAmount

                                        orderObject.specialDiscount = item.specialDiscount
                                        orderObject.specialDiscountValue = item.specialDiscountValue
                                        let specialDiscountAmount = 0
                                        let specialAmountValue = 0
                                        if (item.specialDiscount == 1) {
                                            specialAmountValue = (item.supplyPrice * item.specialDiscountValue) / 100
                                            specialDiscountAmount = item.supplyPrice - specialAmountValue
                                        }
                                        orderObject.specialDiscountAmount = specialDiscountAmount
                                        orderObject.specialAmountValue = specialAmountValue



                                        return orderObject
                                    })

                                    var specialTotalAmountValue = orderItemsList.reduce((acc, val) => {
                                        let totalSpecialAmount = val.quantity * val.specialAmountValue
                                        return acc + totalSpecialAmount
                                    }, 0)


                                    // Other instructions
                                    var instructionObject = {}
                                    if (instructions.data.length > 0) {
                                        instructionObject.barCode = instructions.data[0].barCode
                                        instructionObject.PVCCovers = instructions.data[0].PVCCovers
                                        instructionObject.goodsInBulk = instructions.data[0].goodsInBulk
                                        instructionObject.MRPOnLabels = instructions.data[0].MRPOnLabels
                                        instructionObject.instruction = instructions.data[0].instruction
                                    } else {
                                        instructionObject.barCode = 0
                                        instructionObject.PVCCovers = 0
                                        instructionObject.goodsInBulk = 0
                                        instructionObject.MRPOnLabels = 0
                                        instructionObject.instruction = ''
                                    }
                                    var priceArray = []
                                    var subTotalObject = {}
                                    var GSTObject = {}
                                    var grandTotalObject = {}
                                    var subtotal = total.data[0].finaltotal
                                    var subtotalValue = subtotal

                                    var profile = await salesRepProductModel.profileModel(request.shopId)
                                    var additional_Discount = false
                                    var additionalDiscountValue = 0



                                    subTotalObject.value = subtotalValue
                                    subTotalObject.type = 'Sub Total'
                                    subTotalObject.isDiscount = false
                                    priceArray.push(subTotalObject)




                                    if (specialTotalAmountValue > 1) {
                                        let specialDiscount = {}
                                        specialDiscount.value = +specialTotalAmountValue.toFixed(2)
                                        specialDiscount.value = parseFloat(specialDiscount.value)

                                        specialDiscount.type = 'Offer Discount'
                                        specialDiscount.isDiscount = true
                                        console.log("specialDiscount", specialDiscount)
                                        priceArray.push(specialDiscount)

                                    }



                                    GSTObject.value = total.data[0].gsttotal
                                    GSTObject.type = 'GST Amount'
                                    GSTObject.isDiscount = false


                                    if (profile.data[0].isNonGst == 1) {
                                        console.log("NonGst customer")
                                        let additionalDiscount = {}
                                        additionalDiscount.value = +total.data[0].gsttotal.toFixed(2)
                                        additionalDiscount.type = 'Additional Discount '
                                        additionalDiscount.isDiscount = true
                                        console.log("subtotalValue", additionalDiscount)
                                        priceArray.push(additionalDiscount)
                                        additional_Discount = true
                                        additionalDiscountValue = additionalDiscount.value
                                    }

                                    var grandTotal = subtotalValue + total.data[0].gsttotal
                                    grandTotal = additional_Discount == true ? grandTotal - additionalDiscountValue
                                        : grandTotal

                                    grandTotal = grandTotal - specialTotalAmountValue
                                    grandTotalObject.value = +grandTotal.toFixed(2)
                                    grandTotalObject.type = 'Grand Total'
                                    grandTotalObject.isDiscount = false

                                    priceArray.push(GSTObject)
                                    priceArray.push(grandTotalObject)


                                    response.error = false
                                    response.statusCode = STRINGS.successStatusCode
                                    response.message = STRINGS.SuccessString
                                    response.shopDetails = shopInfo
                                    // response.isPriceVisible = request.auth.isPriceVisible
                                    response.creditLimit = shops.data.auth.creditFixedtLimit
                                    response.availableCreditAmount = (parseFloat(shops.data.auth.creditFixedtLimit) - availableCredit).toFixed(1)
                                    // response.isOfferApply = profile.data[0].isOfferApply
                                    // response.isreferral = referral
                                    var creditDaysForOrderModel = await salesRepProductModel.creditDaysForOrderModel(request.shopId)
                                    // console.log("creditDaysForOrderModel", creditDaysForOrderModel)

                                    if (creditDaysForOrderModel.error) {
                                        response.error = true
                                        response.statusCode = STRINGS.errorStatusCode
                                        response.message = STRINGS.commanErrorString
                                    } else if (creditDaysForOrderModel.data.length > 0) {
                                        if (creditDaysForOrderModel.data[0].dueDate != null) {
                                            var today = new Date();
                                            var dd = String(today.getDate()).padStart(2, '0');
                                            var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
                                            var yyyy = today.getFullYear();
                                            today = dd + '/' + mm + '/' + yyyy;
                                            var date1Arr = creditDaysForOrderModel.data[0].dueDate.toString().split("/");
                                            var date2Arr = today.toString().split("/")
                                            var date1 = new Date(+date1Arr[2], date1Arr[1] - 1, +date1Arr[0]);
                                            var date2 = new Date(+date2Arr[2], date2Arr[1] - 1, +date2Arr[0]);
                                            var Difference_In_Time = date1.getTime() - date2.getTime();
                                            var daysLeft = Difference_In_Time / (1000 * 3600 * 24);
                                            // data.daysLeft = daysLeft;
                                            console.log("daysLeft", daysLeft)
                                            response.creditPeriod = daysLeft
                                            if (daysLeft < 0) {
                                                // response.error = true
                                                // response.statusCode = STRINGS.errorStatusCode
                                                // response.message = "Sorry, Your credit Period is overdue, Can't place order"
                                                // console.log("response", response)
                                                // return callback(response)

                                                response.isOverdue = 1
                                            }
                                        }
                                    } else {
                                        response.creditPeriod = profile.data[0].creditPeriod
                                        response.isOverdue = 0

                                    }

                                    response.otherInstruction = instructionObject
                                    response.grandTotal = +grandTotal.toFixed(2)
                                    response.priceList = priceArray
                                    response.cartItems = orderItemsList
                                    response.count = cartAll.data.length
                                    response.pages = await utils.pageCount(cartAll.data.length, 10)
                                }
                            } else {
                                response.error = false
                                response.statusCode = STRINGS.successStatusCode
                                response.message = STRINGS.emptyCartString
                                response.shopDetails = shopInfo
                                response.creditLimit = shops.data.auth.creditFixedtLimit
                                response.creditPeriod = "0"
                                response.isOverdue = "0"
                                response.availableCreditAmount = (parseFloat(shops.data.auth.creditFixedtLimit) - availableCredit).toFixed(1)
                                response.cartItems = cartItems.data
                                response.count = cartAll.data.length
                                response.pages = await utils.pageCount(cartAll.data.length, 10)
                            }
                        }
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
            }
            callback(response)
        }

        this.salesRepDeleteCart = async (request, callback) => {
            try {
                var response = {}
                var shops = await shopVerification(request)
                if (shops.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                } else {
                    var cartItems = await salesRepProductModel.salesRepCardItems(request)
                    if (cartItems.error) {
                        response.error = true
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.commanErrorString
                    } else {
                        if (cartItems.data.length > 0) {
                            if (cartItems.data.length == 1) {
                                await salesRepProductModel.removeSalesRepInstructions(request)
                            }
                            var cart = await salesRepProductModel.deleteCartModel(request.cartId)
                            if (cart.error) {
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
                            response.message = STRINGS.emptyCartString
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




        this.salesRepPlaceOrder = async (request, callback) => {
            try {
                var response = {}
                var shops = await shopVerification(request)
                // console.log("shopverification", shops)
                if (shops.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                } else {
                    // console.log(request)
                    // return;
                    var cartItems = await salesRepProductModel.salesRepCardItems(request)
                    console.log("cartItems", cartItems)

                    var localTime = new Date().toLocaleString(undefined, { timeZone: 'Asia/Kolkata' });


                    var unique = {};
                    let cartItemsData = []


                    for (var i = 0; i < cartItems.data.length; i++) {
                        var val = cartItems.data[i]
                        let ind = i
                        // console.log("values products", val)

                        if (unique.hasOwnProperty(cartItems.data[i].productCode)) {
                            console.log("cartItems.data[i].productCode", cartItems.data[i])
                            var RemoveCartItemsModel = await salesRepProductModel.RemoveCartItemsModel(val.id)
                            if (RemoveCartItemsModel.error) {
                                response.error = true
                                response.statusCode = STRINGS.successStatusCode
                                response.message = STRINGS.commanErrorString
                                return callback(response)
                            }
                        } else {
                            unique[cartItems.data[i].productCode] = 0;
                            cartItemsData.push(val)
                        }
                    }







                    let arr = []
                    cartItems.data = cartItemsData
                    for (var i = 0; i < cartItems.data.length; i++) {
                        var val = cartItems.data[i]
                        let ind = i
                        console.log("values products", val)
                        val.productStockCount = parseInt(val.defaultQuantity) > 0 ? parseInt(val.defaultQuantity) : parseInt(val.productStockCount)
                        if (val.productStockCount == 0) {

                            var RemoveCartItemsModel = await salesRepProductModel.RemoveCartItemsModel(val.id)
                            if (RemoveCartItemsModel.error) {
                                response.error = true
                                response.statusCode = STRINGS.successStatusCode
                                response.message = STRINGS.commanErrorString
                                return callback(response)
                            }
                        } else if (val.quantity > val.productStockCount && val.quantity > 0) {
                            val.quantity = val.productStockCount
                            var updateCartItemsModel = await salesRepProductModel.updateCartItemsModel(val.id, val.quantity)
                            if (updateCartItemsModel.error) {
                                response.error = true
                                response.statusCode = STRINGS.successStatusCode
                                response.message = STRINGS.commanErrorString
                                return callback(response)
                            }
                            arr.push(val)
                        } else if (val.quantity == 0 || val.quantity < 0) {

                            val.quantity = parseInt(val.MOQ)
                            var updateCartItemsModel = await salesRepProductModel.updateCartItemsModel(val.id, val.quantity)
                            if (updateCartItemsModel.error) {
                                response.error = true
                                response.statusCode = STRINGS.successStatusCode
                                response.message = STRINGS.commanErrorString
                                return callback(response)
                            }
                            arr.push(val)
                        }
                        else {
                            arr.push(val)
                        }
                    }
                    console.log("arr", arr)
                    cartItems.data = arr









                    if (cartItems.error) {
                        response.error = true
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.commanErrorString
                        callback(response)
                    } else {
                        if (cartItems.data.length > 0) {
                            var cartItemsList = cartItems.data



                            var specialTotalAmountValue = cartItemsList.reduce((acc, item) => {
                                let specialDiscountValue = 0
                                if (item.specialDiscount == 1) {
                                    let totalSpecialAmount = (item.supplyPrice * item.quantity)
                                    specialDiscountValue = (totalSpecialAmount * item.specialDiscountValue) / 100
                                }
                                return acc + specialDiscountValue
                            }, 0)





                            var arrayFilter = cartItemsList.filter(function (element) {
                                element.productStockCount = element.defaultQuantity > 0 ? element.defaultQuantity : element.productStockCount
                                let freeQty = 0

                                if (element.productOfferX === 0) {
                                    freeQty = 0
                                } else {
                                    freeQty = Math.floor(element.quantity / element.productOfferX) * element.productOfferY
                                }
                                return element.productStockCount < (element.quantity + freeQty)
                            })
                            // console.log("arrayFilter",arrayFilter)
                            if (arrayFilter.length === 0) {

                                var getOrdersForBookindIdModel = await salesRepProductModel.getOrdersForBookindIdModel()
                                // console.log("getOrdersForBookindIdModel", getOrdersForBookindIdModel)
                                if (getOrdersForBookindIdModel.error) {
                                    response.error = true
                                    response.statusCode = STRINGS.successStatusCode
                                    response.message = STRINGS.commanErrorString
                                    callback(response)
                                } else {
                                    var bookingId = 50000

                                    if (getOrdersForBookindIdModel.data.length > 0) {
                                        var book_id = parseInt(getOrdersForBookindIdModel.data[0].bookingId)
                                        bookingId = book_id + 1
                                    }


                                    var UserLedger = await utils.UserLedger(shops.data.auth.customerID)
                                    if (UserLedger.error) {
                                        console.log("UserLedger error", UserLedger)
                                        response.error = true
                                        response.statusCode = STRINGS.errorStatusCode
                                        response.message = STRINGS.commanErrorString
                                    } else {
                                        console.log("UserLedger", UserLedger)

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

                                        var totalAmount = await salesRepProductModel.totalAcceptWaitingAmountModel(request.auth.ownerId)
                                        console.log("totalAmount", totalAmount)
                                        let accept_waiting_amount = parseFloat(totalAmount.data[0].totalAcceptWaitingAmount == null ? 0 :
                                            totalAmount.data[0].totalAcceptWaitingAmount)

                                        var availableCredit = parseFloat(userLedgerAmount) + (accept_waiting_amount)



                                        var itemLength = cartItemsList.length
                                        var total = await salesRepProductModel.salesRepCardTotalSumValue(request)
                                        var instructions = await salesRepProductModel.salesRepInstructionsModel(request)
                                        if (!total.error || !instructions.error) {
                                            var orderObject = {}
                                            // var bookingId  = await  salesRepProductModel.generateOTP()
                                            orderObject.ownerId = request.auth.ownerId
                                            orderObject.bookingId = bookingId
                                            orderObject.cartUserId = request.shopId
                                            orderObject.managerId = request.managerId
                                            orderObject.orderDate = new Date(localTime)
                                            orderObject.orderStatus = 'WAITING'
                                            orderObject.totalAmount = total.data[0].finaltotal
                                            orderObject.totalGST = total.data[0].gsttotal
                                            orderObject.paymentId = request.paymentId
                                            orderObject.orderBy = 'SALESREP'
                                            orderObject.salesRepID = request.auth.id
                                            if (instructions.data.length > 0) {
                                                orderObject.ordbarCode = instructions.data[0].barCode
                                                orderObject.ordPVCCovers = instructions.data[0].PVCCovers
                                                orderObject.ordgoodsInBulk = instructions.data[0].goodsInBulk
                                                orderObject.ordMRPOnLabels = instructions.data[0].MRPOnLabels
                                                // orderObject.orderInstruction = instructions.data[0].instruction
                                                let instruction = instructions.data[0].instruction;

                                                // Removing special characters and replacing each with a space
                                                instruction = instruction.replace(/[^\w\s]/gi, ' ');
        
                                                // Assigning the modified string back to the object
                                                orderObject.orderInstruction = instruction;
                                            }
                                            var availableCreditLimit = (parseFloat(shops.data.auth.creditFixedtLimit) - availableCredit).toFixed(1)
                                            console.log("availableCreditAmount", availableCreditLimit)
                                            var balanceAmount = parseFloat((total.data[0].finaltotal + total.data[0].gsttotal))

                                            var creditDaysForOrderModel = await salesRepProductModel.creditDaysForOrderModel(request.shopId)
                                            console.log("creditDaysForOrderModel", creditDaysForOrderModel)

                                            if (creditDaysForOrderModel.error) {
                                                response.error = true
                                                response.statusCode = STRINGS.errorStatusCode
                                                response.message = STRINGS.commanErrorString
                                            } else if (creditDaysForOrderModel.data.length > 0) {
                                                var today = new Date();
                                                var dd = String(today.getDate()).padStart(2, '0');
                                                var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
                                                var yyyy = today.getFullYear();
                                                today = dd + '/' + mm + '/' + yyyy;
                                                var date1Arr = creditDaysForOrderModel.data[0].dueDate.toString().split("/");
                                                var date2Arr = today.toString().split("/")
                                                var date1 = new Date(+date1Arr[2], date1Arr[1] - 1, +date1Arr[0]);
                                                var date2 = new Date(+date2Arr[2], date2Arr[1] - 1, +date2Arr[0]);
                                                var Difference_In_Time = date1.getTime() - date2.getTime();
                                                var daysLeft = Difference_In_Time / (1000 * 3600 * 24);
                                                // data.daysLeft = daysLeft;
                                                console.log("daysLeft", daysLeft)
                                                if (daysLeft < 0) {
                                                    response.error = true
                                                    response.statusCode = STRINGS.errorStatusCode
                                                    // response.message = "Sorry, Your credit Period is overdue, Can't place order"
                                                    response.message = "Sorry,You have bills overdue beyond your credit period"
                                                    console.log("response", response)
                                                    return callback(response)
                                                }
                                            }
                                            // if (availableCreditAmount < total.data[0].finaltotal) {
                                            //   response.error = true
                                            //   response.statusCode = STRINGS.successStatusCode
                                            //   response.message = STRINGS.creditErrorString
                                            //   callback(response)
                                            //   return
                                            // }


                                            var profile = await salesRepProductModel.profileModel(request.shopId)

                                            balanceAmount = balanceAmount - specialTotalAmountValue.toFixed(2)
                                            // balanceAmount = balanceAmount - orderObject.additionalDiscountAmount

                                            orderObject.balanceAmount = total.data[0].finaltotal + total.data[0].gsttotal

                                            orderObject.additionalDiscountAmount = profile.data[0].isNonGst == 1 ? total.data[0].gsttotal.toFixed(2) : 0
                                            orderObject.balanceAmount = orderObject.balanceAmount - orderObject.additionalDiscountAmount
                                            orderObject.outletId = profile.data[0].outletId
                                            orderObject.specialDiscountAmount = specialTotalAmountValue.toFixed(2)



                                            if (availableCreditLimit < balanceAmount &&
                                                shops.data.auth.cashOnCarry == 0) {
                                                response.error = true
                                                response.statusCode = STRINGS.errorStatusCode
                                                // response.message = "Total Amount is Greater Than Available Credit"
                                                response.message = "Sorry,you have exceeded your credit limit,please clear your previous bill to continue"
                                                // console.log("response", response)
                                                return callback(response)
                                            }
                                            // if (shops.data.auth.minOrderValue > balanceAmount) {
                                            //     response.error = true
                                            //     response.statusCode = STRINGS.errorStatusCode
                                            //     response.message = "Total Amount is Less Than Minimum Order Value"
                                            //     // console.log("response", response)
                                            //     return callback(response)
                                            // }



                                            var Qty = await salesRepProductModel.salesRepCartQuantity(request.shopId)
                                            orderObject.totalQuantity = Qty.data[0].totalQty



                                            var saveOrder;

                                            let balanceAmount1 = orderObject.balanceAmount
                                            // console.log("balanceAmount1", balanceAmount1)
                                            if (request.paymentId == 2) {
                                                if (balanceAmount1 >= request.chequeAmount) {
                                                    var paymentDetails = {}
                                                    paymentDetails.orderId = ''
                                                    paymentDetails.salesRepID = request.auth.id
                                                    paymentDetails.amount = request.chequeAmount
                                                    paymentDetails.payTypeID = request.paymentId
                                                    paymentDetails.paidDate = new Date()
                                                    paymentDetails.shopID = request.shopId
                                                    paymentDetails.chequeNumber = request.chequeNumber
                                                    paymentDetails.chequeImage = request.chequeImage
                                                    paymentDetails.requestStatus = 'Pending'
                                                    // var paidAmount = balanceAmount1 - request.amount

                                                    // let updateOrderPayDetail = {}
                                                    // updateOrderPayDetail.paidAmount = paidAmount
                                                    // updateOrderPayDetail.orderId = ''
                                                    // updateOrderPayDetail.amount = request.amount


                                                    var updateNotifications = {}
                                                    updateNotifications.ownerId = request.shopId
                                                    updateNotifications.orderId = ''
                                                    updateNotifications.managerId = request.shopId
                                                    updateNotifications.salesRepId = request.auth.id
                                                    updateNotifications.type = 'SALESREP_PAYMENT'
                                                    updateNotifications.notifyType = JSON.stringify(['AD'])
                                                    updateNotifications.notifyDate = new Date()
                                                    updateNotifications.payTypeID = request.paymentId
                                                    updateNotifications.amount = request.chequeAmount



                                                    saveOrder = await salesRepProductModel.saveOrderDetails(orderObject, paymentDetails, updateNotifications)

                                                } else {
                                                    console.log("payment error", request.chequeAmount, balanceAmount1)
                                                    response.error = true
                                                    response.statusCode = STRINGS.errorStatusCode
                                                    response.message = STRINGS.paymentErrorString
                                                    return callback(response)
                                                }
                                            } else {
                                                saveOrder = await salesRepProductModel.saveOrderDetailsModel(orderObject)
                                            }



                                            // saveOrder = await salesRepProductModel.saveOrderDetailsModel(orderObject)


                                            if (saveOrder.error) {
                                                response.error = true
                                                response.statusCode = STRINGS.errorStatusCode
                                                response.message = STRINGS.commanErrorString
                                                callback(response)
                                            } else {
                                                var orderID = saveOrder.data[0]
                                                var totalOty = 0
                                                var offerOty = 0
                                                var orderItemsArray = []
                                                for (let i = 0; i < cartItemsList.length; i++) {

                                                    // cartItemsList.forEach(async function (item)
                                                    let item = cartItemsList[i]
                                                    let ind = i

                                                    var orderItems = {}
                                                    var offerItems = {}
                                                    var fullQuantity = 0
                                                    var freeQty = 0

                                                    // var cartManagerId = item.userId
                                                    if (item.productOfferX != 0) {
                                                        if (item.quantity >= item.productOfferX) {
                                                            let freeQty = Math.floor(item.quantity / item.productOfferX) * item.productOfferY

                                                            orderItems.freeQuantity = freeQty
                                                            fullQuantity = parseInt(item.quantity) + parseInt(freeQty)

                                                            offerOty += (item.quantity / item.productOfferX) * item.productOfferY
                                                            offerOty.toFixed(1)
                                                            offerItems.orderId = orderID
                                                            offerItems.bookingOrderId = bookingId
                                                            offerItems.productId = item.productId
                                                            offerItems.quantity = freeQty
                                                            offerItems.price = item.MRP
                                                            offerItems.orderCost = 0
                                                            offerItems.supplyPrice = 0
                                                            offerItems.cartShopId = item.userId
                                                            // offerItems.ownerUserId = request.auth.id
                                                            offerItems.orderAttribute = item.attribute
                                                            offerItems.orderOptions = item.options
                                                            // await  salesRepProductModel.saveOrderItems(offerItems)
                                                            if (item.defaultQuantity == 0) {
                                                                var stockObject = {}
                                                                stockObject.productId = item.productId
                                                                stockObject.quantity = freeQty
                                                                stockObject.outletId = request.auth.outletId
                                                                await salesRepProductModel.updateProductStockCount(stockObject)
                                                            }
                                                        }
                                                    } else {
                                                        fullQuantity = parseInt(item.quantity) + parseInt(freeQty)
                                                        orderItems.fullQuantity = fullQuantity
                                                    }
                                                    totalOty += item.quantity
                                                    orderItems.orderId = orderID
                                                    orderItems.bookingOrderId = bookingId
                                                    orderItems.productId = item.productId
                                                    orderItems.quantity = item.quantity
                                                    orderItems.fullQuantity = fullQuantity > 0 ? fullQuantity : item.quantity
                                                    orderItems.price = item.MRP
                                                    // orderItems.orderCost = item.totalPrice
                                                    let totalCost = parseFloat(item.supplyPrice) * parseInt(item.quantity)
                                                    orderItems.orderCost = totalCost > 0 ? totalCost : item.totalPrice
                                                    orderItems.supplyPrice = item.supplyPrice
                                                    orderItems.GSTAmount = item.gstAmount
                                                    orderItems.productDiscount = item.discount
                                                    // orderItems.ownerUserId = request.auth.id
                                                    orderItems.customerUserId = request.auth.customerID
                                                    orderItems.cartShopId = item.userId
                                                    orderItems.orderAttribute = item.attribute
                                                    orderItems.orderOptions = item.options
                                                    orderItems.orderProductId = item.productCode

                                                    orderItems.remarks = item.remarks

                                                    let orderItemsObject = Object.assign("", orderItems)
                                                    orderItemsObject.no = ind + 1
                                                    orderItemsObject.productName = item.productName
                                                    orderItemsObject.freeQuantity = orderItemsObject.freeQuantity == null ? 0 : orderItemsObject.freeQuantity

                                                    orderItemsArray.push(orderItemsObject)


                                                    await salesRepProductModel.saveOrderItems(orderItems)
                                                    // Update stock count
                                                    if (item.defaultQuantity == 0) {

                                                        var stockObject = {}
                                                        stockObject.productId = item.productId
                                                        stockObject.quantity = item.quantity
                                                        stockObject.outletId = request.auth.outletId
                                                        await salesRepProductModel.updateProductStockCount(stockObject)
                                                    }

                                                    if (--itemLength === 0) {
                                                        // var Ids = [cartManagerId, request.auth.id]
                                                        // var discountAmountValue = 0
                                                        // if (referralCheck.referral && request.isOfferApply == 1) {
                                                        //   var discountAmountValue = referralCheck.discount
                                                        //   var referralObject = { id: request.auth.id, bonusPoint: discountAmountValue }
                                                        //   await  salesRepProductModel.referralAmountModel(referralObject)
                                                        // }
                                                        // this.updateOrderProfile(Ids, () => {})
                                                        await salesRepProductModel.updateOrderOty(orderID, totalOty, offerOty)
                                                        await salesRepProductModel.removeSalesRepCartItems(request)
                                                        await salesRepProductModel.removeSalesRepInstructions(request)
                                                        var finalAmount = total.data[0].finaltotal + total.data[0].gsttotal
                                                        var creditObject = {
                                                            id: request.auth.ownerId,
                                                            creditLimit: finalAmount
                                                        }
                                                        await salesRepProductModel.updateCreditValueModel(creditObject)
                                                        let orderItemsPdfLink;
                                                        let pdfFileName = process.env.ORDERITEMS_FILE_NAME == undefined || process.env.ORDERITEMS_FILE_NAME == null ? 'UserOrderItems' : process.env.ORDERITEMS_FILE_NAME

                                                        try {



                                                            let orderTimeHours = new Date(localTime).getHours()
                                                            let orderTimeMin = new Date(localTime).getMinutes()
                                                            //send sms to shop Owner

                                                            let smsObj = {}
                                                            smsObj.mobileNumber = profile.data[0].mobileNumber
                                                            smsObj.totalAmount = orderObject.balanceAmount.toFixed(1)
                                                            smsObj.orderId = bookingId
                                                            smsObj.salesRepName = request.auth.name
                                                            smsObj.orderTime = `${orderTimeHours}:${orderTimeMin}`
                                                            console.log("smsObj", smsObj)
                                                            var sendShopOwnerSms = await smsTemplates.SalesRepPlaceOrderSmsForShopOwner(smsObj)
                                                            console.log("sendShopOwnerSms", sendShopOwnerSms)


                                                            var notificationObject = {}
                                                            notificationObject.id = "56"
                                                            notificationObject.orderId = bookingId
                                                            notificationObject.salesRepId = request.auth.id
                                                            notificationObject.customerID = profile.data[0].customerID
                                                            // notificationObject.orderStatus = "ACCEPTED"
                                                            // notificationObject.notifyType =  "ACCEPTED"
                                                            notificationObject.salesRepName = request.auth.name
                                                            notificationObject.shopName = profile.data[0].shopName
                                                            notificationsService.sendSalesRepPlaceOrderPushNotification(notificationObject, () => { })



                                                            var updateNotifications = {}
                                                            updateNotifications.orderId = bookingId
                                                            updateNotifications.ownerId = request.shopId
                                                            updateNotifications.managerId = request.shopId
                                                            updateNotifications.salesRepId = request.auth.id
                                                            updateNotifications.type = "ORDER PLACED"
                                                            updateNotifications.notifyType = JSON.stringify(['US'])
                                                            updateNotifications.notifyDate = new Date(localTime)
                                                            updateNotifications.activeStatus = 1
                                                            updateNotifications.color = "#86a8e7"
                                                            updateNotifications.notificationMsg = `<p style="font-size: 14px;">Fetch: <b>${request.auth.name}</b> has placed an order with ID <b>${bookingId}</b>. Please check My Orders section.</p>`
                                                            salesRepProductModel.saveNotificationsModel(updateNotifications, () => { })






                                                            var options = {
                                                                format: "A2",
                                                                orientation: "portrait",
                                                            };

                                                            var html = fs.readFileSync(path.resolve(__dirname, `../../.././../../www/${process.env.ORDERITEMS_PDF_TEMPLATE}`), "utf8");
                                                            var timestamp = (new Date).getTime().toString()
                                                            var document = {
                                                                html: html,
                                                                data: {
                                                                    orderItems: orderItemsArray,
                                                                    shopName: profile.data[0].shopName,
                                                                    totalAmount: orderObject.balanceAmount.toFixed(1)
                                                                },
                                                                path: path.resolve(__dirname, `../../../../../www/html/uploads/${pdfFileName}-${timestamp}.pdf`),
                                                                type: "",
                                                            };

                                                            var pdf_data = await pdf.create(document, options)
                                                            console.log("pdfResp", pdf_data)

                                                            var fileObj = Object.assign("", pdf_data)
                                                            var file_url = fileObj.filename.replace('/var/www/html/', "");
                                                            // console.log("file_url", file_url)
                                                            var fileData = {}
                                                            fileData.file_path = path.resolve(__dirname, `../../../../../www/html/${file_url}`)
                                                            fileData.fileName = fileObj.filename.replace('/var/www/html/uploads/', "");
                                                            fileData.type = 'europetuploads'
                                                            var s3PdfUpload = await uploadS3.S3_upload(fileData)
                                                            console.log("s3PdfUpload,", s3PdfUpload)
                                                            let updateOrderItemsPdfObj = {}
                                                            updateOrderItemsPdfObj.bookingId = bookingId
                                                            updateOrderItemsPdfObj.orderItemsPdf = s3PdfUpload.data
                                                            orderItemsPdfLink = s3PdfUpload.data
                                                            var updateOrderItemsPdfModel = await salesRepProductModel.updateOrderItemsPdfModel(updateOrderItemsPdfObj)
                                                            console.log('updateOrderItemsPdfModel', updateOrderItemsPdfModel)



                                                        } catch (error) {
                                                            console.log('pdf error', error)
                                                            // response.error = true
                                                            // response.statusCode = STRINGS.errorStatusCode
                                                            // response.message = STRINGS.commanErrorString
                                                        }









                                                        response.error = false
                                                        response.statusCode = STRINGS.successStatusCode
                                                        response.message = STRINGS.orderSuccessString
                                                        response.orderId = bookingId
                                                        response.orderItemsPdfLink = orderItemsPdfLink
                                                        console.log("response", response)
                                                        callback(response)
                                                    }
                                                }
                                            }
                                        } else {
                                            response.error = true
                                            response.statusCode = STRINGS.errorStatusCode
                                            response.message = STRINGS.commanErrorString
                                            callback(response)
                                        }
                                    }
                                }
                            } else {
                                response.error = true
                                response.statusCode = STRINGS.errorStatusCode
                                response.message = STRINGS.productOutofStockString
                                callback(response)
                            }
                        } else {
                            response.error = true
                            response.statusCode = STRINGS.errorStatusCode
                            response.message = STRINGS.emptyCartString
                            callback(response)
                        }
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




        // ProductList new way like fetch app List
        this.salesRepProductList = async (request, callback) => {
            try {
                var response = {}
                var shops = await shopVerification(request)
                if (shops.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                    callback(response)
                } else {
                    var object = {
                        'products.categoryId': request.categoryId
                    }
                    var productResponse = await salesRepProductModel.getTotalCategoryProducts(object, request)
                    if (productResponse.error) {
                        response.error = true
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.commanErrorString
                        callback(response)
                    } else {
                        if (productResponse.data.length > 0) {
                            var count = await utils.pageCount(productResponse.data.length, 10)
                            request.pageCount = 10
                            // var product = await  salesRepProductModel.getCategoryProductsList(object, request)
                            // console.log("total products", productResponse.data)

                            var products = productResponse.data
                            var sortingProduct = [];
                            var zeroStockProduct = [];

                            products.forEach((val, ind) => {
                                if (val.productStockCount < val.MOQ && val.defaultQuantity < val.MOQ) {
                                    zeroStockProduct.push(val);
                                } else {
                                    sortingProduct.push(val);
                                }
                            })

                            // console.log("zeroStockProduct", zeroStockProduct)
                            zeroStockProduct.forEach((val, ind) => {
                                sortingProduct.push(val);
                            })

                            // if (sortingProduct.length > 0) {
                            //     var resp = sortingProduct
                            //     var Page = request.pageNumber
                            //     var pageNumber = Page;

                            //     if (request.pageNumber == '0') {
                            //         pageNumber = 0
                            //     } else {
                            //         pageNumber = pageNumber - 1
                            //     }
                            //     var limit = 10
                            //     resp = resp.slice(pageNumber * limit, limit * parseInt(Page))
                            //     products = resp
                            // }



                            var resp = sortingProduct

                            products = resp



                            //if its last page then only add zero quantity products
                            // console.log("products", products)
                            var length = products.length

                            // products = sortingProduct
                            for (let i = 0; i < products.length; i++) {
                                var index = i
                                var item = products[i]

                                var cart = await salesRepProductModel.checkMyCartProduct(request.shopId, item.id, request.auth.id)
                                var cartCount = 0
                                var attribute = []
                                var options = []
                                console.log("cart", cart.data)
                                if (cart.data.length > 0) {
                                    var cartCount = cart.data[0].quantity
                                    var attribute = JSON.parse(cart.data[0].attribute) == null ? [] : JSON.parse(cart.data[0].attribute)
                                    var options = JSON.parse(cart.data[0].options) == null ? [] : JSON.parse(cart.data[0].options)
                                }
                                // User discount calculation
                                // if (request.auth.isEnableDiscount === 1) {
                                //   var discountObject = { userId: request.auth.id, productId: item.id }
                                //   var discountValue = await  salesRepProductModel.userProductDiscountOption(discountObject)
                                //   if (discountValue.data) {
                                //     products[index].discount = discountValue.data.discount
                                //     products[index].price = item.MRP - (item.MRP * (discountValue.data.discount / 100))
                                //   }
                                // }

                                // Stock Status
                                // console.log("products[index].productImage",products[index].productImage)
                                var S3Img = products[index].productImage
                                const s3Images = {
                                    url: S3Img.replace('https://europetuploads.s3.ap-south-1.amazonaws.com/', '')
                                }

                                var imageFile = await uploadS3.S3_getObject(s3Images)
                                // console.log("imageFile", imageFile)
                                if (imageFile.error || products[index].productImage.length == 0 || s3Images.url == 'europet_images/-') {
                                    // dummy image this one
                                    // products[index].productImage = "https://europetuploads.uploadS3.ap-south-1.amazonaws.com/europet_images/download.png"
                                    products[index].productImage = process.env.NO_IMAGE

                                } else {
                                    const dateObj = new Date(imageFile.lastModified);
                                    const timestamp = dateObj.getTime()
                                    products[index].productImage = products[index].productImage + '?' + timestamp
                                }

                                products[index].stockStatus = STRINGS.inStockString
                                item.productStockCount = item.defaultQuantity > 0 ? item.defaultQuantity : item.productStockCount

                                if (item.productStockCount < item.finishingFast) {
                                    products[index].stockStatus = STRINGS.finishingFastString
                                }

                                if (item.productStockCount < item.fewStocksLeft) {
                                    products[index].stockStatus = STRINGS.fewStocksLeftString
                                }

                                if (item.productStockCount == 0 && item.defaultQuantity == 0) {
                                    products[index].stockStatus = STRINGS.outOfStockString
                                }
                                if (item.productStockCount < item.MOQ && item.defaultQuantity < item.MOQ) {
                                    products[index].stockStatus = STRINGS.outOfStockString
                                }
                                products[index].cartCount = cartCount
                                products[index].attributeIds = attribute
                                products[index].attributeOptionsIds = options
                                products[index].price = parseInt(products[index].price)
                                if (--length === 0) {
                                    response.error = false
                                    response.statusCode = STRINGS.successStatusCode
                                    response.pages = count
                                    response.message = STRINGS.SuccessString
                                    response.isPriceVisible = request.auth.isPriceVisible
                                    response.products = products
                                    callback(response)
                                }
                            }
                        } else {
                            response.error = false
                            response.statusCode = STRINGS.successStatusCode
                            response.message = STRINGS.SuccessString
                            response.pages = 0
                            response.products = productResponse.data
                            callback(response)
                        }
                    }
                }
            } catch (e) {
                console.log("e", e)
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
                callback(response)
            }
        }


        this.salesRepViewNewArrival = async (request, callback) => {
            try {
                var response = {}
                var shops = await shopVerification(request)
                if (shops.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                    callback(response)
                } else {
                    var productResponse = await salesRepProductModel.getTotalNewArrivalProducts(request)
                    if (productResponse.error) {
                        response.error = true
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.commanErrorString
                        callback(response)
                    } else {
                        if (productResponse.data.length > 0) {
                            var count = await utils.pageCount(productResponse.data.length, 10)
                            request.pageCount = 10
                            var product = await salesRepProductModel.getNewArrivalProducts(request)
                            var products = product.data
                            var length = products.length
                            if (length > 0) {
                                var productList = await productInfoService(product.data, request)
                                response.error = false
                                response.statusCode = STRINGS.successStatusCode
                                response.pages = count
                                response.message = STRINGS.SuccessString
                                response.products = productList.data
                                callback(response)
                            } else {
                                response.error = false
                                response.statusCode = STRINGS.successStatusCode
                                response.pages = count
                                response.message = STRINGS.SuccessString
                                response.products = products
                                callback(response)
                            }
                        } else {
                            response.error = false
                            response.statusCode = STRINGS.successStatusCode
                            response.message = STRINGS.SuccessString
                            response.pages = 0
                            response.products = productResponse.data
                            callback(response)
                        }
                    }
                }
            } catch (e) {
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
                callback(response)
            }
        }

        this.salesRepExploreProducts = async (request, callback) => {
            try {
                var response = {}
                var shops = await shopVerification(request)
                if (shops.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                    callback(response)
                } else {
                    var productIDResponse = await salesRepProductModel.getProductIDs(request.exploreId)
                    if (productIDResponse.error) {
                        response.error = true
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.commanErrorString
                        callback(response)
                    } else {
                        if (productIDResponse.data.length > 0) {
                            var Ids = []
                            productIDResponse.data.map(item => {
                                Ids.push(item.productId)
                            })
                            request.productIds = Ids
                            var expProductCount = await salesRepProductModel.expolreProductCount(Ids, request)
                            if (expProductCount.error) {
                                response.error = true
                                response.statusCode = STRINGS.successStatusCode
                                response.message = STRINGS.commanErrorString
                                callback(response)
                            } else {
                                var count = await utils.pageCount(expProductCount.data.length, 10)
                                request.pageCount = 10
                                var expProductList = await salesRepProductModel.exploreProductListModel(request)
                                if (expProductList.error) {
                                    response.error = true
                                    response.statusCode = STRINGS.successStatusCode
                                    response.message = STRINGS.commanErrorString
                                    callback(response)
                                } else {
                                    var products = expProductList.data
                                    var length = products.length
                                    if (length > 0) {
                                        var productList = await productInfoService(expProductList.data, request)
                                        response.error = false
                                        response.message = STRINGS.SuccessString
                                        response.pages = count
                                        response.exploreProduct = productList.data
                                        callback(response)
                                    } else {
                                        response.error = false
                                        response.message = STRINGS.SuccessString
                                        response.pages = count
                                        response.exploreProduct = products
                                        callback(response)
                                    }
                                }
                            }
                        } else {
                            response.error = false
                            response.message = STRINGS.SuccessString
                            response.pages = 0
                            response.exploreProduct = []
                            callback(response)
                        }
                    }
                }
            } catch (e) {
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
                callback(response)
            }
        }

        this.salesRepFeatureProducts = async (request, callback) => {
            try {
                var response = {}
                var shops = await shopVerification(request)
                if (shops.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                    callback(response)
                } else {
                    var color = await salesRepProductModel.getFeatureProductColor()
                    var product = await salesRepProductModel.totalFeatureProduct(request)
                    if (product.error || color.error) {
                        response.error = true
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.commanErrorString
                        callback(response)
                    } else {
                        var productLength = product.data.length
                        if (productLength > 0) {
                            request.pageCount = 10
                            var pageCount = await utils.pageCount(productLength, 10)
                            var productResponse = await salesRepProductModel.listFeatureProduct(request)

                            var products = productResponse.data
                            var length = products.length
                            if (length > 0) {
                                var productList = await productInfoService(products, request)
                                response.error = false
                                response.statusCode = STRINGS.successStatusCode
                                response.pages = pageCount
                                response.color = color.data[0].featureProductColor
                                response.message = STRINGS.SuccessString
                                response.featureProducts = productList.data
                                callback(response)
                            } else {
                                response.error = false
                                response.statusCode = STRINGS.successStatusCode
                                response.pages = pageCount
                                response.color = color.data[0].featureProductColor
                                response.message = STRINGS.SuccessString
                                response.featureProducts = products
                                callback(response)
                            }
                        } else {
                            response.error = false
                            response.statusCode = STRINGS.successStatusCode
                            response.pages = 0
                            response.color = color.data[0].featureProductColor
                            response.message = STRINGS.SuccessString
                            response.featureProducts = product.data
                            callback(response)
                        }
                    }
                }
            } catch (e) {
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
                callback(response)
            }
        }

        this.salesRepViewProduct = async (request, callback) => {
            try {
                var response = {}
                var shops = await shopVerification(request)
                if (shops.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                    callback(response)
                } else {
                    var checkProduct = await salesRepProductModel.checkProductId(request)
                    console.log("check product", checkProduct.data[0])
                    if (checkProduct.error) {
                        response.error = true
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.commanErrorString
                        callback(response)
                    } else {
                        if (checkProduct.data.length > 0) {
                            var imageResponse = await salesRepProductModel.productImages(request.productId)
                            if (imageResponse.error) {
                                response.error = true
                                response.statusCode = STRINGS.successStatusCode
                                response.message = STRINGS.commanErrorString
                                callback(response)
                            } else {
                                checkProduct.data[0].attributeIds = checkProduct.data[0].attributeIds == null ? '[]' : checkProduct.data[0].attributeIds
                                checkProduct.data[0].attributeOptionsIds = checkProduct.data[0].attributeOptionsIds == null ? '[]' : checkProduct.data[0].attributeOptionsIds

                                var productDetails = checkProduct.data[0]
                                var isShow = true
                                var attValues = await salesRepProductModel.productAttribute(JSON.parse(checkProduct.data[0].attributeIds), isShow)
                                var optionsValue = JSON.parse(checkProduct.data[0].attributeOptionsIds)
                                var attributeIds = attValues.data
                                var length = attributeIds.length
                                var cart = await salesRepProductModel.checkSalesRepCartProduct(request)
                                var cartCount = 0
                                var selectedAttribute = []
                                var selectedOptions = []
                                if (cart.data.length > 0) {
                                    var selectedAttribute = JSON.parse(cart.data[0].attribute)
                                    var selectedOptions = JSON.parse(cart.data[0].options)
                                    var cartCount = cart.data[0].quantity
                                }
                                var imageObject = {}
                                imageObject.productId = productDetails.id
                                imageObject.type = 'IMAGE'
                                imageObject.imageURL = productDetails.productImage

                                var productImagesArray = imageResponse.data
                                // productImagesArray.push(imageObject)
                                var productImagesArray = imageResponse.data
                                var productImagesList = [imageObject].concat(productImagesArray)

                                productImagesList.forEach(async val => {
                                    var S3Img = val.imageURL
                                    const s3Images = {
                                        url: S3Img.replace('https://europetuploads.s3.ap-south-1.amazonaws.com/', '')
                                    }

                                    var imageFile = await uploadS3.S3_getObject(s3Images)
                                    // console.log("imageFile", imageFile)
                                    // console.log("imageFile", s3Images)

                                    if (imageFile.error || val.imageURL.length == 0 || s3Images.url == 'europet_images/-') {
                                        // console.log("no image")
                                        // dummy image this one
                                        // products[index].productImage = "https://europetuploads.uploadS3.ap-south-1.amazonaws.com/europet_images/download.png"
                                        val.imageURL = process.env.NO_IMAGE

                                    }
                                })




                                productDetails.cartCount = cartCount
                                productDetails.attributeOptionsIds = selectedOptions
                                productDetails.attributeIds = selectedAttribute
                                productDetails.productImages = productImagesList

                                // Stock Status
                                productDetails.stockStatus = STRINGS.inStockString
                                productDetails.productStockCount = productDetails.defaultQuantity > 0 ? productDetails.defaultQuantity : productDetails.productStockCount
                                if (productDetails.productStockCount < productDetails.finishingFast) {
                                    productDetails.stockStatus = STRINGS.finishingFastString
                                }

                                if (productDetails.productStockCount < productDetails.fewStocksLeft) {
                                    productDetails.stockStatus = STRINGS.fewStocksLeftString
                                }

                                if (productDetails.productStockCount === 0) {
                                    productDetails.stockStatus = STRINGS.outOfStockString
                                }
                                if (productDetails.productStockCount < productDetails.MOQ) {
                                    productDetails.stockStatus = STRINGS.outOfStockString
                                }


                                var S3Img = productDetails.productImage
                                const s3Images = {
                                    url: S3Img.replace('https://europetuploads.s3.ap-south-1.amazonaws.com/', '')
                                }

                                var imageFile = await uploadS3.S3_getObject(s3Images)
                                // console.log("imageFile", imageFile)
                                console.log("imageFile", s3Images)

                                if (imageFile.error || productDetails.productImage.length == 0 || s3Images.url == 'europet_images/-') {
                                    console.log("no image")
                                    // dummy image this one
                                    // products[index].productImage = "https://europetuploads.uploadS3.ap-south-1.amazonaws.com/europet_images/download.png"
                                    productDetails.productImage = process.env.NO_IMAGE

                                }


                                if (length > 0) {
                                    attributeIds.forEach(async function (item, index) {
                                        var isShow = true
                                        var options = await salesRepProductModel.attOptions(item.id, optionsValue, isShow)
                                        attributeIds[index].options = options.data

                                        // Selected Attribute
                                        attributeIds[index].selected = false
                                        if (selectedAttribute.length > 0) {
                                            selectedAttribute.filter(function (attributeId) {
                                                if (item.id == attributeId) {
                                                    attributeIds[index].selected = true
                                                }
                                            })
                                        }

                                        if (--length === 0) {
                                            var optionsfilters = await attributeSelectedOption(attributeIds, selectedOptions)
                                            productDetails.attribute = optionsfilters
                                            response.error = false
                                            response.statusCode = STRINGS.successStatusCode
                                            response.message = STRINGS.SuccessString
                                            response.isPriceVisible = request.auth.isPriceVisible
                                            response.productDetails = productDetails
                                            callback(response)
                                        }
                                    })
                                } else {
                                    productDetails.attribute = attributeIds
                                    response.error = false
                                    response.statusCode = STRINGS.successStatusCode
                                    response.message = STRINGS.SuccessString
                                    response.isPriceVisible = request.auth.isPriceVisible
                                    response.productDetails = productDetails
                                    callback(response)
                                }
                            }
                        } else {
                            console.log("error")
                            response.error = true
                            response.statusCode = STRINGS.successStatusCode
                            response.message = STRINGS.invalidProductString
                            callback(response)
                        }
                    }
                }
            } catch (e) {
                console.log("salesrep product view issue", e)
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
                callback(response)
            }
        }

        // Search Products
        this.salesRepSearchProductService = async (request, callback) => {
            try {
                var response = {}
                var count;
                var shops = await shopVerification(request)
                if (shops.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                } else {
                    if (request.key === 'EXPLORE') {

                        var searchAllExploreModel = await salesRepProductModel.searchAllExploreModel(request)
                        if (searchAllExploreModel.error) {
                            response.error = true
                            response.statusCode = STRINGS.successStatusCode
                            response.message = STRINGS.commanErrorString
                            callback(response)
                        }
                        count = await utils.pageCount(searchAllExploreModel.data.length, 20)
                        var search = await salesRepProductModel.searchExploreModel(request)
                        if (search.error) {
                            response.error = true
                            response.statusCode = STRINGS.successStatusCode
                            response.message = STRINGS.commanErrorString
                            callback(response)
                        } else {
                            response.error = false
                            response.statusCode = STRINGS.successStatusCode
                            response.message = STRINGS.SuccessString
                            response.pages = count
                            response.isPriceVisible = request.auth.isPriceVisible
                            response.searchData = search.data
                            callback(response)
                        }
                    } else {


                        var productResponse = await salesRepProductModel.getTotalCategoryProductsModelSalesrep(request)
                        // console.log("productResponse",productResponse)
                        if (productResponse.error) {
                            response.error = true
                            response.statusCode = STRINGS.successStatusCode
                            response.message = STRINGS.commanErrorString
                            callback(response)
                        } else {
                            console.log("productResponse.data.length****", productResponse.data.length)
                            if (productResponse.data.length > 0) {

                                var count = await utils.pageCount(productResponse.data.length, 10)
                                request.pageCount = 10
                                var products = productResponse.data

                                // console.log("products", product)

                                var sortingProduct = [];
                                var zeroStockProduct = [];

                                products.forEach((val, ind) => {
                                    if (val.productStockCount == 0) {
                                        zeroStockProduct.push(val);
                                    } else {
                                        sortingProduct.push(val);
                                    }
                                })
                                // console.log("zeroStockProduct",zeroStockProduct)
                                zeroStockProduct.forEach((val, ind) => {
                                    sortingProduct.push(val);
                                })
                                console.log("sortingProduct", sortingProduct.length)
                                products = sortingProduct

                                if (sortingProduct.length > 0) {
                                    var resp = sortingProduct
                                    var Page = request.pageNumber
                                    var pageNumber = Page;

                                    if (request.pageNumber == '0') {
                                        pageNumber = 0
                                    } else {
                                        pageNumber = pageNumber - 1
                                    }
                                    var limit = 10
                                    resp = resp.slice(pageNumber * limit, limit * parseInt(Page))
                                    products = resp
                                }



                                var length = products.length

                                for (let i = 0; i < products.length; i++) {
                                    var index = i
                                    var item = products[i]

                                    var cart = await salesRepProductModel.checkMyCartProduct(request.shopId, item.id, request.auth.id)
                                    var cartCount = 0
                                    var attribute = []
                                    var options = []
                                    // console.log("cart",cart.data)
                                    if (cart.data.length > 0) {
                                        var cartCount = cart.data[0].quantity
                                        var attribute = JSON.parse(cart.data[0].attribute) == null ? [] : JSON.parse(cart.data[0].attribute)
                                        var options = JSON.parse(cart.data[0].options) == null ? [] : JSON.parse(cart.data[0].options)
                                    }
                                    // User discount calculation
                                    // if (request.auth.isEnableDiscount === 1) {
                                    //   var discountObject = { userId: request.auth.id, productId: item.id }
                                    //   var discountValue = await userProductsModel.userProductDiscountOption(discountObject)
                                    //   if (discountValue.data) {
                                    //     products[index].discount = discountValue.data.discount
                                    //     products[index].price = item.MRP - (item.MRP * (discountValue.data.discount / 100))
                                    //   }
                                    // }

                                    // Stock Status
                                    products[index].stockStatus = STRINGS.inStockString
                                    item.productStockCount = item.defaultQuantity > 0 ? item.defaultQuantity : item.productStockCount



                                    var S3Img = products[index].productImage
                                    const s3Images = {
                                        url: S3Img.replace('https://europetuploads.s3.ap-south-1.amazonaws.com/', '')
                                    }
                                    console.log("S3Img", products[index].productImage)
                                    var imageFile = await uploadS3.S3_getObject(s3Images)
                                    console.log("imageFile", imageFile)
                                    if (imageFile.error || products[index].productImage.length == 0 || s3Images.url == 'europet_images/-') {
                                        // dummy image this one
                                        // products[index].productImage = "https://europetuploads.s3.ap-south-1.amazonaws.com/europet_images/download.png"
                                        products[index].productImage = process.env.NO_IMAGE == undefined ? STRINGS.noImagePath : process.env.NO_IMAGE
                                        console.log("no image", products[index].productImage)

                                    }




                                    console.log("productDetails.productStockCount", item.productStockCount, item.finishingFast)

                                    if (item.productStockCount < item.finishingFast) {
                                        products[index].stockStatus = STRINGS.finishingFastString
                                    }

                                    if (item.productStockCount < item.fewStocksLeft) {
                                        products[index].stockStatus = STRINGS.fewStocksLeftString
                                    }

                                    if (item.productStockCount == 0 && item.defaultQuantity == 0) {
                                        products[index].stockStatus = STRINGS.outOfStockString
                                    }
                                    if (item.productStockCount < item.MOQ && item.defaultQuantity < item.MOQ) {
                                        products[index].stockStatus = STRINGS.outOfStockString
                                    }

                                    console.log("products[index].stockStatus", products[index].stockStatus)

                                    products[index].cartCount = cartCount
                                    products[index].attributeIds = attribute
                                    products[index].attributeOptionsIds = options
                                    products[index].price = parseInt(products[index].price)
                                    if (--length === 0) {
                                        response.error = false
                                        response.statusCode = STRINGS.successStatusCode
                                        response.pages = count
                                        response.message = STRINGS.SuccessString
                                        response.isPriceVisible = request.auth.isPriceVisible
                                        response.products = products
                                        callback(response)
                                    }
                                }

                            } else {
                                response.error = false
                                response.statusCode = STRINGS.successStatusCode
                                response.message = STRINGS.SuccessString
                                response.pages = 0
                                response.isPriceVisible = request.auth.isPriceVisible
                                response.products = productResponse.data
                                callback(response)
                            }
                        }
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






        this.salesRepUserSettings = async (request, callback) => {
            try {
                var response = {}
                var shops = await shopVerification(request)
                if (shops.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                } else {
                    var cart = await salesRepCartDetails(request)
                    if (cart.error) {
                        response.error = true
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.commanErrorString
                    } else {
                        response.error = false
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.SuccessString
                        response.cartDeatils = cart
                    }
                }
            } catch (e) {
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
            }
            callback(response)
        }



        this.salesRepOtherInstruction = async (request, callback) => {
            try {
                var response = {}
                var shops = await shopVerification(request)
                if (shops.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                    callback(response)
                } else {
                    var checkCart = await salesRepProductModel.salesRepCardItems(request)
                    if (checkCart.data.length > 0) {
                        var update = {}
                        update.userId = request.shopId
                        update.barCode = request.barCode
                        update.salesRepID = request.auth.id
                        update.PVCCovers = request.PVCCovers
                        update.goodsInBulk = request.goodsInBulk
                        update.MRPOnLabels = request.MRPOnLabels
                        update.instruction = request.instruction
                        update.type = 'SALESREP'
                        var checkInstruction = await salesRepProductModel.salesRepCheckInstruction(request)
                        if (checkInstruction.error) {
                            response.error = true
                            response.statusCode = STRINGS.successStatusCode
                            response.message = STRINGS.commanErrorString
                        } else {
                            if (checkInstruction.data.length > 0) {
                                var save = await salesRepProductModel.updateOtherInstruction(update)
                            } else {
                                var save = await salesRepProductModel.addOtherInstruction(update)
                            }
                            if (save.error) {
                                response.error = true
                                response.statusCode = STRINGS.successStatusCode
                                response.message = STRINGS.commanErrorString
                            } else {
                                response.error = false
                                response.statusCode = STRINGS.successStatusCode
                                response.message = STRINGS.updateInstructionString
                            }
                        }
                    } else {
                        response.error = true
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.emptyCartString
                    }
                }
            } catch (e) {
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
            }
            callback(response)
        }



        this.salesRepPaymentMode = async (request, callback) => {
            try {
                var response = {}
                var payment = await salesRepProductModel.getPaymentListModel(request)
                var user = await salesRepProductModel.profileModel(request.ownerId)
                if (payment.error || user.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                    callback(response)
                } else {
                    if (payment.data.length > 0) {
                        var paymentData = payment.data
                        var paymentIds = JSON.parse(user.data[0].paymentTypeIds)
                        var length = paymentData.length
                        paymentData.forEach(async function (item, index) {
                            paymentData[index].isEnable = false
                            if (paymentIds.length > 0) {
                                paymentIds.forEach(async function (pay) {
                                    if (item.id == pay) {
                                        paymentData[index].isEnable = true
                                    }
                                })
                            }
                            if (--length === 0) {
                                response.error = false
                                response.statusCode = STRINGS.successStatusCode
                                response.message = STRINGS.SuccessString
                                response.paymentList = paymentData
                                callback(response)
                            }
                        })
                    } else {
                        response.error = false
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.SuccessString
                        response.paymentList = []
                        callback(response)
                    }
                }
            } catch (e) {
                console.log("e", e)
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
                callback(response)
            }
        }


        this.SalesRepGetSubCategoryList = async function (request, callback) {
            var response = {}
            try {
                var profileModel = await salesRepProductModel.profileModel(request.user_id)
                // console.log("profileModel",profileModel)
                request.catalogId = profileModel.data[0].userCatalogId
                var CatalogSubcategoryModel = await salesRepProductModel.SalesRepCatalogSubcategoryModel(request)

                if (CatalogSubcategoryModel.error || profileModel.error) {
                    // console.log("catalog service error")
                    response.error = true
                    response.statusCode = STRINGS.errorStatusCode
                    response.message = STRINGS.commanErrorString
                    return callback(response)

                } else {
                    var CatalogSubcategorList = CatalogSubcategoryModel.data
                    var length = CatalogSubcategorList.length
                    if (length > 0) {


                        for (let i = 0; i < length; i++) {

                            var S3Img = CatalogSubcategorList[i].subCategoryImage
                            const s3Images = {
                                url: S3Img.replace('https://europetuploads.s3.ap-south-1.amazonaws.com/', '')
                            }

                            var imageFile = await uploadS3.S3_getObject(s3Images)
                            // console.log("imageFile", imageFile)
                            if (imageFile.error || CatalogSubcategorList[i].subCategoryImage.length == 0 || s3Images.url == 'europet_images/-') {
                                // dummy image this one
                                // products[index].productImage = "https://europetuploads.uploadS3.ap-south-1.amazonaws.com/europet_images/download.png"
                                CatalogSubcategorList[i].subCategoryImage = process.env.NO_IMAGE

                            }
                        }



                        response.error = false
                        response.message = STRINGS.SuccessString
                        response.data = CatalogSubcategorList
                        return callback(response)

                    }
                    else {
                        response.error = false
                        response.message = STRINGS.SuccessString
                        response.data = []
                        return callback(response)

                    }
                }
            } catch (e) {
                console.log("getSubCategoryListService service error")
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
                callback(response)
            }
        }



        this.getUserCatgoryList = async (request, callback) => {
            try {
                var response = {}
                var params = request
                // console.log("auth",params.auth.catalogId)
                var data = {}
                data.catalogId = params.auth.catalogId
                var category = await catalogService(params)
                // console.log(category)
                if (category.error) {
                    esponse.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                } else {
                    response.error = false
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.SuccessString
                    response.categoryList = category
                }
            } catch (e) {
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
            }
            callback(response)
        }



        this.updateOrderStatus = async (request, callback) => {
            try {
                var response = {}
                // console.log("request auth ",request.auth)
                var orders = await salesRepProductModel.checkOrderIdModel(request.orderId)
                if (orders.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                } else {
                    if (orders.data.length > 0) {
                        var object = {
                            id: request.orderId,
                            orderStatus: request.status
                        }
                        var smsDeatils = {}
                        console.log("orders", orders.data[0].outletName)
                        if (request.status == 'ACCEPTED') {
                            smsDeatils.mobile_number = orders.data[0].mobileNumber
                            // smsDeatils.mobile_number = 917010942259

                            //  smsDeatils.message = `Fetch: The Order with ID ${orders.data[0].bookingId} for Manager ${orders.data[0].outletName} has been ACCEPTED`
                             
                            smsDeatils.message = `199884`
                 smsDeatils.variables_values=`${orders.data[0].bookingId}|${orders.data[0].outletName}`
                             

                            var SendSms = await utils.textLocalSendSms(smsDeatils)
                            console.log("SendSms", SendSms)
                        } else if (request.status === 'DELIVERED') {

                            var smsDeatils = {}
                            smsDeatils.mobile_number = orders.data[0].mobileNumber
                            // smsDeatils.mobile_number = 7010942259
                            // smsDeatils.message = `Fetch: Your Order with ID ${orders.data[0].bookingId} has been Delivered`
                             smsDeatils.message = `199923`
                 smsDeatils.variables_values=`${orders.data[0].bookingId}`
                            var SendSms = await utils.textLocalSendSms(smsDeatils)
                            console.log("SendSms", SendSms)
                            if (orders.data[0].paymentStatus == 'COMPLETE' && orders.data[0].onlinePaid == 1) {
                                object.balanceAmount = 0.0
                                object.orderStatus = 'PAID'
                            }
                        }
                        var update = await salesRepProductModel.updateOrderStatusModel(object)
                        if (update.error) {
                            response.error = true
                            response.statusCode = STRINGS.successStatusCode
                            response.message = STRINGS.commanErrorString
                        } else {
                            var notificationObject = {}
                            notificationObject.id = orders.data[0].id
                            notificationObject.orderId = orders.data[0].bookingId
                            notificationObject.salesRepId = orders.data[0].salesRepID
                            notificationObject.userIds = [orders.data[0].ownerId, orders.data[0].cartUserId]
                            notificationObject.orderStatus = request.status.toLowerCase()
                            notificationObject.notifyType = request.status
                            notificationsService.sendOrderStatusNotification(notificationObject, () => { })

                            var updateNotifications = {}
                            updateNotifications.orderId = orders.data[0].id
                            updateNotifications.ownerId = orders.data[0].ownerId
                            updateNotifications.managerId = orders.data[0].cartUserId
                            updateNotifications.salesRepId = orders.data[0].salesRepID
                            updateNotifications.type = request.status
                            updateNotifications.notifyType = JSON.stringify(['US', 'SR'])
                            updateNotifications.notifyDate = new Date()
                            salesRepProductModel.saveNotificationsModel(updateNotifications, () => { })

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


        var catalogService = function (data) {
            var response = {}
            return new Promise(async function (resolve, reject) {
                try {

                    var category = await salesRepProductModel.getCatalogCategoryModel(data)

                    if (category.error) {
                        console.log("catalog service error")
                        response.error = true
                        reject(response)
                    } else {
                        var categoryList = category.data
                        var length = categoryList.length
                        if (length > 0) {

                            resolve(categoryList)

                        } else {
                            categoryList = []
                            resolve(categoryList)
                        }
                    }
                } catch (e) {
                    console.log("catalog service error", e)
                    response.error = true
                    response.statusCode = STRINGS.errorStatusCode
                    response.message = STRINGS.oopsErrorMessage
                    resolve(response)
                }

            })
        }




        var shopVerification = function (data) {
            return new Promise(async function (resolve) {
                var response = {}
                var shopData = await salesRepProductModel.verifiedUserId(data.shopId)
                console.log("verifiedUserId", shopData)
                if (shopData.error) {
                    response.error = true
                } else {
                    data.auth.creditLimit = shopData.data.creditLimit
                    data.auth.ownerId = shopData.data.id
                    if (shopData.data.userType === 'MANAGER') {
                        var manager = await salesRepProductModel.verifiedUserId(shopData.data.ownerId)
                        if (manager.error) {
                            response.error = true
                            resolve(response)
                        }
                        data.auth.creditLimit = manager.data.creditLimit
                        data.auth.ownerId = shopData.data.ownerId
                    }
                    data.auth.shopName = shopData.data.shopName
                    data.auth.shopAddress = shopData.data.shopAddress
                    data.auth.catalogId = shopData.data.userCatalogId
                    data.auth.outletId = shopData.data.outletId
                    data.auth.discountId = shopData.data.userDiscountId
                    data.auth.customerID = shopData.data.customerID
                    data.auth.cashOnCarry = shopData.data.cashOnCarry
                    data.auth.latitude = shopData.data.latitude
                    data.auth.longitude = shopData.data.longitude
                    data.auth.creditFixedtLimit = shopData.data.creditFixedtLimit
                    data.auth.minOrderValue = shopData.data.minOrderValue

                    response.error = false
                    response.data = data
                }
                resolve(response)
            })
        }


        var salesRepCatalogService = function (data, shop) {
            var response = {}
            return new Promise(async function (resolve, reject) {
                try {
                    data.catalogId = shop.catalogId
                    var category = await salesRepProductModel.getCatalogCategoryModel(data)

                    if (category.error) {
                        console.log("catalog service error")
                        response.error = true
                        reject(response)
                    } else {
                        var categoryList = category.data
                        var length = categoryList.length
                        if (length > 0) {
                            resolve(categoryList)
                        } else {
                            categoryList = []
                            resolve(categoryList)
                        }
                    }

                } catch (e) {
                    console.log("catalog service error", e)
                    response.error = true
                    response.statusCode = STRINGS.errorStatusCode
                    response.message = STRINGS.oopsErrorMessage
                    resolve(response)
                }

            })
        }





        var salesRepNewArrivalService = function (data) {
            return new Promise(async function (resolve, reject) {
                var response = {}
                var result = await salesRepProductModel.newArrivals(data)
                if (result.error) {
                    response.error = true
                    reject(response)
                } else {
                    if (result.data.length > 0) {
                        var products = await productInfoService(result.data, data)
                        resolve(products)
                    } else {
                        response.error = false
                        response.data = result.data
                        resolve(response)
                    }
                }
            })
        }




        var exploreListService = function (data) {
            return new Promise(async function (resolve, reject) {
                try {
                    var response = {}
                    var list = await salesRepProductModel.getAllExploreList()
                    if (list.error) {
                        console.log("exploreListService error")
                        response.error = true
                        reject(response)
                    } else {
                        var exploreList = list.data
                        data.pageCount = 10
                        if (exploreList.length > 0) {
                            var count = await utils.pageCount(exploreList.length, 10)
                            var exploreResponse = await salesRepProductModel.getExploreListModel(data)
                            if (exploreResponse.error) {
                                console.log("exploreListService error")
                                response.error = true
                                reject(response)
                            } else {
                                response.error = false
                                response.explorePage = count
                                response.exploreList = exploreResponse.data
                                resolve(response)
                            }
                        } else {
                            response.error = false
                            response.explorePage = 0
                            response.exploreList = exploreList
                            resolve(response)
                        }
                    }
                } catch (e) {
                    console.log("exploreListService error")
                    response.error = true
                    response.statusCode = STRINGS.errorStatusCode
                    response.message = STRINGS.oopsErrorMessage
                    resolve(response)
                }


            })
        }


        var salesRepCartDetails = function (data) {
            return new Promise(async function (resolve, reject) {
                var response = {}
                var cart = await salesRepProductModel.salesRepCardItems(data)
                if (cart.error) {
                    response.error = true
                    reject(response)
                } else {
                    var cartItems = cart.data
                    console.log("cartItems in salesrep", cartItems)
                    if (cartItems.length > 0) {
                        var cartAmount = await salesRepProductModel.salesRepCardTotalSumValue(data)
                        if (cartAmount.error) {
                            response.error = true
                            reject(response)
                        } else {
                            response.error = false
                            response.cartCount = cartItems.length
                            response.isCartValue = 1
                            response.subtotal = cartAmount.data[0].finaltotal
                            response.cartAmount = cartAmount.data[0].finaltotal + cartAmount.data[0].gsttotal
                            resolve(response)
                        }
                    } else {
                        response.error = false
                        response.cartCount = 0
                        response.cartAmount = 0
                        resolve(response)
                    }
                }
            })
        }

        var productInfoService = function (productList, data) {
            return new Promise(async function (resolve) {
                var response = {}
                var products = productList
                var length = products.length
                products.forEach(async function (item, index) {
                    // Stock Status
                    products[index].stockStatus = STRINGS.inStockString
                    products[index].productStockCount = products[index].defaultQuantity > 0 ? products[index].defaultQuantity : products[index].productStockCount
                    if (item.productStockCount < item.finishingFast) {
                        products[index].stockStatus = STRINGS.finishingFastString
                    }

                    if (item.productStockCount < item.fewStocksLeft) {
                        products[index].stockStatus = STRINGS.fewStocksLeftString
                    }

                    if (item.productStockCount === 0) {
                        products[index].stockStatus = STRINGS.outOfStockString
                    }
                    if (item.productStockCount < item.MOQ) {
                        products[index].stockStatus = STRINGS.outOfStockString
                    }
                    var cart = await salesRepProductModel.checkSalesRepMycart(data.auth.id, item.id, data.shopId)
                    var cartCount = 0
                    var attribute = []
                    var options = []
                    if (cart.data.length > 0) {
                        var cartCount = cart.data[0].quantity
                        var attribute = JSON.parse(cart.data[0].attribute)
                        var options = JSON.parse(cart.data[0].options)
                    }
                    products[index].cartCount = cartCount
                    products[index].attributeIds = attribute
                    products[index].attributeOptionsIds = options
                    if (--length === 0) {
                        response.error = false
                        response.data = products
                        resolve(response)
                    }
                })
            })
        }

        var attributeSelectedOption = function (attributeIds, selectedOptionsIds) {
            return new Promise(function (resolve) {
                var length = attributeIds.length
                if (length > 0) {
                    attributeIds.forEach(async function (item, index) {
                        var optionsArray = item.options
                        var optionsLength = optionsArray.length
                        if (optionsLength > 0) {
                            optionsArray.forEach(async function (optionItem, optionIndex) {
                                optionsArray[optionIndex].selected = false
                                selectedOptionsIds.filter(function (optionId) {
                                    if (optionItem.id == optionId) {
                                        optionsArray[optionIndex].selected = true
                                    }
                                })
                                if (--optionsLength === 0) {
                                    if (--length === 0) {
                                        resolve(attributeIds)
                                    }
                                }
                            })
                        } else {
                            resolve(attributeIds)
                        }
                    })
                } else {
                    resolve(attributeIds)
                }
            })
        }


        var searchCategoryServivce = function (data) {
            return new Promise(async function (resolve) {
                var response = {}

                var search = await salesRepProductModel.searchCategoryModel(data)

                if (search.error) {
                    response.error = true
                    resolve(response)
                } else {
                    if (search.data.length > 0) {
                        var length = search.data.length
                        var categoryList = search.data
                        categoryList.forEach(async function (item, index) {
                            var subcategory = await salesRepProductModel.findSubcategory(item.id)
                            categoryList[index].subcategory = subcategory.data
                            if (--length === 0) {
                                response.error = false
                                response.data = categoryList
                                resolve(response)
                            }
                        })
                    } else {
                        response.error = false
                        response.data = []
                        resolve(response)
                    }
                }
            })
        }







    }
}



export default SalesRepHomeService;
