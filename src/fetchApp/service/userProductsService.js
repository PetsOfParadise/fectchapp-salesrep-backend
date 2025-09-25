
import async from 'async'
import pdf from 'pdf-creator-node'
import path from 'path'

import fs from 'fs'
import util from 'util'

const unlinkFile = util.promisify(fs.unlink)

import STRINGS from '../../../strings.json'
import Utils from '../../../utils/utils'
import UserProductsModel from '../models/userProductsModel'
import NotificationsService from '../../../utils/notificationsService'
import UploadS3 from '../../../config/s3.upload'
import SmsTemplates from '../../../smsTemplates'
import reader from 'xlsx'



require('dotenv').config();




const userProductsModel = new UserProductsModel
const notificationsService = new NotificationsService
const uploadS3 = new UploadS3
const smsTemplates = new SmsTemplates


const utils = new Utils()


class UserProductsService {
    constructor() {



        // Home Page Listing
        this.homePageService = async (request, callback) => {
            try {
                console.log("auth request1", request.auth)
                var response = {}
                // request.outletId1 = request.auth.outletId

                Promise.all([
                    catalogService(request),
                    newsFeedService(request),
                    newArrivalService(request),
                    userProductsModel.featureBannerModel(request),
                    exploreListService(request),
                    myCartInfo(request.auth.id, request.auth),
                    userProductsModel.profileModel(request.auth.id),
                    userProductsModel.notificationCountModel(request)
                ])
                    .then(result => {
                        // console.log("homePageService**", result)
                        response.error = false
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.SuccessString
                        response.outletId = request.auth.outletId

                        response.isPriceVisible = request.auth.isPriceVisible
                        response.cartDeatils = result[5]
                        response.isOfferApply = result[6].data[0].isOfferApply
                        response.notificationCount = result[7].data[0].count

                        // console.log(result[6])
                        // response.cartAmount = result[5].cartAmount

                        response.catalog = result[0]
                        response.featureProducts = result[3].data
                        response.exploreProducts = result[4].exploreList
                        response.newArrivals = result[2].data
                        response.feed = result[1].feedList
                        callback(response)
                    })
                    .catch(error => {
                        console.log(error)
                        console.log('Promise Error')
                        response.error = true
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.commanErrorString
                        callback(response)
                    })
            } catch (e) {
                console.log("home page error", error)
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

        this.viewNewsFeed = async (request, callback) => {
            try {
                var response = {}
                var feed = await newsFeedService(request)
                if (feed.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                } else {
                    response.error = false
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.SuccessString
                    response.pages = feed.feedPage
                    response.feed = feed.feedList
                }
            } catch (e) {
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
            }
            callback(response)
        }

        // Get Catalogs


        this.getSubCategoryListService = async function (request, callback) {
            var response = {}
            try {

                var CatalogSubcategoryModel = await userProductsModel.findCatalogSubcategoryModel(request)

                if (CatalogSubcategoryModel.error) {
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
                            if (imageFile.error || CatalogSubcategorList[i].subCategoryImage.length == 0) {
                                // dummy image this one
                                // products[index].productImage = "https://europetuploads.s3.ap-south-1.amazonaws.com/europet_images/download.png"
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
                resolve(response)
            }


        }


        // New Arrivals


        // Explore
        this.viewExplore = async (request, callback) => {
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


        //old explore products
        // this.viewExploreProducts = async (request, callback) => {
        //     try {
        //         var response = {};
        //         console.log("request.auth", request.auth)
        //         var productIDResponse = await userProductsModel.getProductIDs(request.exploreId)
        //         console.log("productIDResponse", productIDResponse)
        //         if (productIDResponse.error) {
        //             response.error = true
        //             response.statusCode = STRINGS.successStatusCode
        //             response.message = STRINGS.commanErrorString
        //             callback(response)
        //         } else {
        //             if (productIDResponse.data.length > 0) {
        //                 var Ids = []
        //                 productIDResponse.data.map(item => {
        //                     Ids.push(item.productId)
        //                 })
        //                 request.productIds = Ids
        //                 var expProductCount = await userProductsModel.expolreProductCount(Ids, request)
        //                 console.log("expProductCount", expProductCount)
        //                 if (expProductCount.error) {
        //                     response.error = true
        //                     response.statusCode = STRINGS.successStatusCode
        //                     response.message = STRINGS.commanErrorString
        //                     callback(response)
        //                 } else {
        //                     var count = await utils.pageCount(expProductCount.data.length, 10)
        //                     request.pageCount = 10
        //                     var expProductList = await userProductsModel.exploreProductListModel(request)
        //                     if (expProductList.error) {
        //                         response.error = true
        //                         response.statusCode = STRINGS.successStatusCode
        //                         response.message = STRINGS.commanErrorString
        //                         callback(response)
        //                     } else {
        //                         var products = expProductList.data
        //                         var length = products.length
        //                         if (length > 0) {
        //                             products.forEach(async function (item, index) {
        //                                 var cart = await userProductsModel.checkMyCartProduct(request.auth.id, item.id)
        //                                 // User discount calculation
        //                                 // if (request.auth.isEnableDiscount === 1) {
        //                                 //   var discountObject = { userId: request.auth.id, productId: item.id }
        //                                 //   var discountValue = await userProductsModel.userProductDiscountOption(discountObject)
        //                                 //   if (discountValue.data) {
        //                                 //     products[index].discount = discountValue.data.discount
        //                                 //     products[index].price = item.MRP - (item.MRP * (discountValue.data.discount / 100))
        //                                 //   }
        //                                 // }
        //                                 var cartCount = 0
        //                                 var attribute = []
        //                                 var options = []
        //                                 if (cart.data.length > 0) {
        //                                     var cartCount = cart.data[0].quantity
        //                                     var attribute = JSON.parse(cart.data[0].attribute)
        //                                     var options = JSON.parse(cart.data[0].options)
        //                                 }
        //                                 // Stock Status
        //                                 products[index].stockStatus = STRINGS.inStockString
        //                                 item.productStockCount = item.defaultQuantity > 0 ? item.defaultQuantity : item.productStockCount
        //                                 if (item.productStockCount < item.finishingFast) {
        //                                     products[index].stockStatus = STRINGS.finishingFastString
        //                                 }

        //                                 if (item.productStockCount < item.fewStocksLeft) {
        //                                     products[index].stockStatus = STRINGS.fewStocksLeftString
        //                                 }

        //                                 if (item.productStockCount === 0) {
        //                                     products[index].stockStatus = STRINGS.outOfStockString
        //                                 }
        //                                 if (item.productStockCount < item.MOQ) {
        //                                     products[index].stockStatus = STRINGS.outOfStockString
        //                                 }
        //                                 products[index].cartCount = cartCount
        //                                 products[index].attributeIds = attribute
        //                                 products[index].attributeOptionsIds = options
        //                                 if (--length === 0) {
        //                                     response.error = false
        //                                     response.message = STRINGS.SuccessString
        //                                     response.isPriceVisible = request.auth.isPriceVisible
        //                                     response.pages = count
        //                                     response.exploreProduct = products
        //                                     callback(response)
        //                                 }
        //                             })
        //                         } else {
        //                             response.error = false
        //                             response.message = STRINGS.SuccessString
        //                             response.isPriceVisible = request.auth.isPriceVisible
        //                             response.pages = count
        //                             response.exploreProduct = products
        //                             callback(response)
        //                         }
        //                     }
        //                 }
        //             } else {
        //                 response.error = false
        //                 response.message = STRINGS.SuccessString
        //                 response.isPriceVisible = request.auth.isPriceVisible
        //                 response.pages = 0
        //                 response.exploreProduct = []
        //                 callback(response)
        //             }
        //         }
        //     } catch (e) {
        //         response.error = true
        //         response.statusCode = STRINGS.errorStatusCode
        //         response.message = STRINGS.oopsErrorMessage
        //         console.log("error", e)
        //         callback(response)
        //     }
        // }


        this.viewExploreProducts = async (request, callback) => {
            try {
                var response = {};
                console.log("request.auth", request.auth)
                var productIDResponse = await userProductsModel.getProductIDs(request.exploreId)
                console.log("productIDResponse", productIDResponse)
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
                        var productResponse = await userProductsModel.expolreProductCount(Ids, request)
                        // console.log("productResponse", productResponse)
                        if (productResponse.error) {
                            response.error = true
                            response.statusCode = STRINGS.successStatusCode
                            response.message = STRINGS.commanErrorString
                            callback(response)
                        } else {

                            if (productResponse.data.length > 0) {
                                var count = await utils.pageCount(productResponse.data.length, 10)
                                request.pageCount = 10
                                // var product = await userProductsModel.getCategoryProductsList(object, request)
                                // console.log("total products", productResponse.data)

                                var products = productResponse.data
                                var sortingProduct = [];
                                var zeroStockProduct = [];

                                products.forEach((val, ind) => {
                                    // if (val.productStockCount == 0 && val.defaultQuantity == 0 && val.productStockCount < val.MOQ && val.defaultQuantity < val.MOQ ) {
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





                                //if its last page then only add zero quantity products
                                // console.log("products", products)
                                var length = products.length

                                // products = sortingProduct
                                for (let i = 0; i < products.length; i++) {
                                    var index = i
                                    var item = products[i]

                                    var cart = await userProductsModel.checkMyCartProduct(request.auth.id, item.id)

                                    var productNotify = 0;

                                    var checkProductNoyifyModel = await userProductsModel.checkProductNoyifyModel(request.auth.customerID, item.productCode)
                                    if (checkProductNoyifyModel.error) {
                                        response.error = true
                                        response.statusCode = STRINGS.successStatusCode
                                        response.message = STRINGS.commanErrorString
                                        callback(response)
                                    } else if (checkProductNoyifyModel.data.length > 0) {
                                        productNotify = checkProductNoyifyModel.data[0].productUpdated == 1 ? 0 : 1
                                    }
                                    products[index].productNotify = productNotify








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

                                    var imageFile = await uploadS3.S3_getObject(s3Images)
                                    // console.log("imageFile", imageFile)
                                    if (imageFile.error || products[index].productImage.length == 0) {
                                        // dummy image this one
                                        // products[index].productImage = "https://europetuploads.s3.ap-south-1.amazonaws.com/europet_images/download.png"
                                        products[index].productImage = process.env.NO_IMAGE

                                    }






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
                                        response.exploreProduct = products
                                        callback(response)
                                    }
                                }

                            } else {
                                response.error = false
                                response.statusCode = STRINGS.successStatusCode
                                response.message = STRINGS.SuccessString
                                response.pages = 0
                                response.isPriceVisible = request.auth.isPriceVisible
                                response.exploreProduct = productResponse.data
                                callback(response)
                            }
                        }
                    } else {
                        response.error = false
                        response.message = STRINGS.SuccessString
                        response.isPriceVisible = request.auth.isPriceVisible
                        response.pages = 0
                        response.exploreProduct = []
                        callback(response)
                    }
                }
            } catch (e) {
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
                console.log("error", e)
                callback(response)
            }
        }










        // View New Arrival

        this.viewNewArrival = async (request, callback) => {
            try {
                var response = {}
                var productResponse = await userProductsModel.TotalnewArrivalsModel(request)
                if (productResponse.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                    callback(response)
                } else {
                    if (productResponse.data.length > 0) {
                        var count = await utils.pageCount(productResponse.data.length, 10)
                        request.pageCount = 10
                        var product = await userProductsModel.newArrivalsModel(request)
                        var products = product.data
                        var length = products.length
                        if (length > 0) {
                            products.forEach(async function (item, index) {
                                // User discount calculation
                                // if (request.auth.isEnableDiscount === 1) {
                                //   var discountObject = { userId: request.auth.id, productId: item.id }
                                //   var discountValue = await userProductsModel.userProductDiscountOption(discountObject)
                                //   if (discountValue.data) {
                                //     products[index].discount = discountValue.data.discount
                                //     products[index].price = item.MRP - (item.MRP * (discountValue.data.discount / 100))
                                //   }
                                // }
                                var cart = await userProductsModel.checkMyCartProduct(request.auth.id, item.id)
                                var cartCount = 0
                                var options = []
                                var attribute = []
                                if (cart.data.length > 0) {
                                    var cartCount = cart.data[0].quantity
                                    var attribute = JSON.parse(cart.data[0].attribute)
                                    var options = JSON.parse(cart.data[0].options)
                                }

                                // Stock Status
                                products[index].stockStatus = STRINGS.inStockString
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

                                var productNotify = 0;

                                var checkProductNoyifyModel = await userProductsModel.checkProductNoyifyModel(request.auth.customerID, item.productCode)
                                if (checkProductNoyifyModel.error) {
                                    response.error = true
                                    response.statusCode = STRINGS.successStatusCode
                                    response.message = STRINGS.commanErrorString
                                    callback(response)
                                } else if (checkProductNoyifyModel.data.length > 0) {
                                    productNotify = checkProductNoyifyModel.data[0].productUpdated == 1 ? 0 : 1
                                }
                                products[index].productNotify = productNotify


                                if (--length === 0) {
                                    response.error = false
                                    response.statusCode = STRINGS.successStatusCode
                                    response.isPriceVisible = request.auth.isPriceVisible
                                    response.pages = count
                                    response.message = STRINGS.SuccessString
                                    response.products = products
                                    callback(response)
                                }
                            })
                        } else {
                            response.error = false
                            response.statusCode = STRINGS.successStatusCode
                            response.isPriceVisible = request.auth.isPriceVisible
                            response.pages = 0
                            response.message = STRINGS.SuccessString
                            response.products = products
                            callback(response)
                        }
                    } else {
                        response.error = false
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.SuccessString
                        response.isPriceVisible = request.auth.isPriceVisible
                        response.pages = 0
                        response.products = productResponse.data
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

        // Like Feeds
        this.likeOrUnlikeFeeds = async (request, callback) => {
            try {
                var response = {}
                var checkFeed = await userProductsModel.checkNewsFeed(request.feedId)
                if (checkFeed.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                } else {
                    if (checkFeed.data.length > 0) {
                        var userId = request.auth.id
                        var isFeedLike = await userProductsModel.checkLikeModel(userId, request.feedId)
                        if (isFeedLike.data) {
                            if (request.isLike == 0) {
                                await userProductsModel.unLikeFeed(userId, request.feedId)
                            }
                        } else {
                            if (request.isLike == 1) {
                                const object = {
                                    feedId: request.feedId,
                                    userId: userId
                                }
                                await userProductsModel.likeFeed(object)
                            }
                        }
                        response.error = false
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.SuccessString
                        response.feedId = request.feedId
                        response.isLike = request.isLike
                    } else {
                        response.error = true
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.invalidFeedErrorString
                    }
                }
            } catch (e) {
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
            }
            callback(response)
        }

        this.productList = async (request, callback) => {
            try {
                var response = {}
                // if (request.isSubcategory == '1') {
                //   var object = { 'products.subcategoryId': request.subcategoryId, 'products.categoryId': request.categoryId }
                // } else {
                //   var object = { 'products.categoryId': request.categoryId }
                // }
                // console.log(request)
                var object = {
                    'products.categoryId': request.categoryId
                }
                // console.log("req***", request)


                var productResponse = await userProductsModel.getTotalCategoryProducts(object, request)
                console.log("productResponse", productResponse)
                if (productResponse.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                    callback(response)
                } else {
                    // console.log("ProductResponse****", productResponse)
                    if (productResponse.data.length > 0) {
                        var count = await utils.pageCount(productResponse.data.length, 10)
                        request.pageCount = 10
                        // var product = await userProductsModel.getCategoryProductsList(object, request)
                        // console.log("total products", productResponse.data)
                        if (count >= request.pageNumber) {
                            var products = productResponse.data
                            var sortingProduct = [];
                            var zeroStockProduct = [];

                            products.forEach((val, ind) => {
                                // if (val.productStockCount == 0 && val.defaultQuantity == 0 && val.productStockCount < val.MOQ && val.defaultQuantity < val.MOQ ) {
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

                                var cart = await userProductsModel.checkMyCartProduct(request.auth.id, item.id)
                                var productNotify = 0;

                                var checkProductNoyifyModel = await userProductsModel.checkProductNoyifyModel(request.auth.customerID, item.productCode)
                                if (checkProductNoyifyModel.error) {
                                    response.error = true
                                    response.statusCode = STRINGS.successStatusCode
                                    response.message = STRINGS.commanErrorString
                                    callback(response)
                                } else if (checkProductNoyifyModel.data.length > 0) {
                                    productNotify = checkProductNoyifyModel.data[0].productUpdated == 1 ? 0 : 1
                                }
                                products[index].productNotify = productNotify




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

                                } else {
                                    const dateObj = new Date(imageFile.lastModified);
                                    const timestamp = dateObj.getTime()
                                    products[index].productImage = products[index].productImage + '?' + timestamp
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

                                // products[index].speacialDiscount =0
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
                            response.products = []
                            callback(response)
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
            } catch (e) {
                console.log(e)
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
                callback(response)
            }
        }


        this.SerchProductListService = async (request, callback) => {
            try {
                var response = {}

                if (request.text.length == 0) {
                    response.error = false
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.SuccessString
                    response.pages = 0
                    response.isPriceVisible = request.auth.isPriceVisible
                    response.products = []
                    return callback(response)
                } else {
                    var productResponse = await userProductsModel.getTotalCategoryProducts1(request)
                    // console.log("productResponse",productResponse)
                    if (productResponse.error) {
                        response.error = true
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.commanErrorString
                        callback(response)
                    } else {
                        // console.log("ProductResponse****", productResponse)
                        if (productResponse.data.length > 0) {




                            var count = await utils.pageCount(productResponse.data.length, 10)
                            request.pageCount = 10
                            // console.log("products", product)

                            var products = productResponse.data
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
                            // console.log("sortingProduct",sortingProduct)
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

                            // console.log("products", products)
                            for (let i = 0; i < products.length; i++) {
                                var index = i
                                var item = products[i]

                                var cart = await userProductsModel.checkMyCartProduct(request.auth.id, item.id)


                                var productNotify = 0;

                                var checkProductNoyifyModel = await userProductsModel.checkProductNoyifyModel(request.auth.customerID, item.productCode)
                                if (checkProductNoyifyModel.error) {
                                    response.error = true
                                    response.statusCode = STRINGS.successStatusCode
                                    response.message = STRINGS.commanErrorString
                                    callback(response)
                                } else if (checkProductNoyifyModel.data.length > 0) {
                                    productNotify = checkProductNoyifyModel.data[0].productUpdated == 1 ? 0 : 1
                                }
                                products[index].productNotify = productNotify




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
                            response.products = []
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


        // Add Cart
        this.addCartService = async (request, callback) => {
            try {
                var response = {}
                var product = await userProductsModel.checkProductId(request)
                console.log("cart product", product)
                if (product.error) {
                    response.error = true
                    response.statusCode = STRINGS.errorStatusCode
                    response.message = STRINGS.commanErrorString
                } else {
                    if (product.data.length > 0) {
                        var stockCount = product.data[0].productStockCount
                        var defaultQuantity = product.data[0].defaultQuantity
                        stockCount = defaultQuantity > 0 ? defaultQuantity : stockCount
                        var maxQty = product.data[0].maxQty
                        // request.quantity = request.quantity > 0 ? request.quantity :
                        var cart = await userProductsModel.checkMyCartProduct(request.userId, request.productId)
                        // console.log("length**", cart);
                        if (cart.data.length > 0) {
                            var cartId = cart.data[0].id
                            var cartQuantity = Math.abs(cart.data[0].quantity)
                            request.quantity = Math.abs(request.quantity)
                            var addQty;
                            if (request.isEdit == 0) {
                                if (request.key == 1) {
                                    addQty = parseInt(cartQuantity) + parseInt(request.quantity)
                                } else {
                                    if (cartQuantity == request.quantity) {
                                        await userProductsModel.deleteCartModel(cartId)
                                        await userProductsModel.removeInstructions(request.userId)

                                        userProductsModel.updateOrderProfile([request.userId])
                                        var mycart = await myCartDetails(request.userId, request.auth)
                                        var cartAfter = await userProductsModel.checkMyCartProduct(request.userId, request.productId)
                                        // console.log("cartAfter***", cartAfter)
                                        if (cartAfter.data.length > 0) {
                                            var itemCount = cartAfter.data[0].quantity;
                                            var itemAmount = cartAfter.data[0].quantity * cartAfter.data[0].MRP;
                                        }
                                        response.error = false
                                        response.statusCode = STRINGS.successStatusCode
                                        response.message = STRINGS.cartUpdateString
                                        response.cartCount = mycart.cartCount
                                        response.cartAmount = mycart.cartAmount
                                        response.subtotal = mycart.subtotal
                                        response.itemCount = itemCount
                                        response.itemAmount = itemAmount
                                        callback(response)
                                        return
                                    } else {
                                        addQty = parseInt(cartQuantity) - parseInt(request.quantity)
                                    }
                                }
                                var object = {
                                    id: cartId,
                                    userId: request.userId,
                                    productId: request.productId,
                                    quantity: Math.abs(addQty),
                                    attribute: request.attribute,
                                    options: request.options
                                }
                                // await userProductsModel.updateCartItems(object)
                            } else {
                                addQty = request.quantity
                                var object = {
                                    id: cartId,
                                    userId: request.userId,
                                    productId: request.productId,
                                    quantity: Math.abs(addQty),
                                    attribute: request.attribute,
                                    options: request.options
                                }
                                // await userProductsModel.updateCartItems(object)
                            }


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
                                    await userProductsModel.updateCartItems(object)
                                    request.cartDate = new Date()
                                    userProductsModel.updateCartaddedDate(request, () => { })
                                }
                            } else {
                                if (addQuantity > stockCount) {
                                    response.error = true
                                    response.statusCode = STRINGS.successStatusCode
                                    response.message = STRINGS.quantityNotAvaiableString
                                    callback(response)
                                    return
                                } else {
                                    await userProductsModel.updateCartItems(object)
                                    request.cartDate = new Date()
                                    userProductsModel.updateCartaddedDate(request, () => { })
                                }
                            }
                        } else {
                            if (request.key == 1) {
                                var object = {
                                    userId: request.userId,
                                    productId: request.productId,
                                    quantity: Math.abs(request.quantity),
                                    attribute: request.attribute,
                                    options: request.options,
                                    cartType: 'USER'
                                }
                                await userProductsModel.insertCartItems(object)
                                request.cartDate = new Date()
                                userProductsModel.updateCartaddedDate(request, () => { })
                            }
                        }
                        var mycart = await myCartDetails(request.userId, request.auth)
                        var cartAfter = await userProductsModel.checkMyCartProduct(request.userId, request.productId)
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


                            console.log("mycartDetails**", mycart);
                            response.error = false
                            response.statusCode = STRINGS.successStatusCode
                            response.message = STRINGS.cartUpdateString
                            response.cartCount = mycart.cartCount
                            response.cartAmount = mycart.cartAmount
                            response.subtotal = mycart.subtotal
                            response.itemCount = itemCount
                            response.gstAmount = gstAmount
                            response.freeQty = freeQty
                            response.productName = product.data[0].productName
                            response.itemAmount = itemAmount

                        }
                    } else {
                        console.log("invalidProductString", invalidProductString)
                        response.error = true
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.invalidProductString
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







        this.viewCartDetails = async (request, callback) => {
            try {
                var response = {}
                var cartItems = await userProductsModel.getCardItems(request.userId, request.auth)
                var cartAll = await userProductsModel.getCardItems(request.userId, request.auth)

                var arr = []
                // console.log("cartItems from database", cartItems)
                cartItems.data.forEach(async (val, ind) => {
                    val.productStockCount = parseInt(val.defaultQuantity) > 0 ? parseInt(val.defaultQuantity) : parseInt(val.productStockCount)
                    // if (val.productStockCount == 0) {
                    //     var RemoveCartItemsModel = await userProductsModel.RemoveCartItemsModel(val.id)
                    //     if (RemoveCartItemsModel.error) {
                    //         response.error = true
                    //         response.statusCode = STRINGS.successStatusCode
                    //         response.message = STRINGS.commanErrorString
                    //         return callback(response)
                    //     }
                    // } else 
                    if (val.quantity > val.productStockCount) {
                        val.quantity = val.productStockCount
                        var updateCartItemsModel = await userProductsModel.updateCartItemsModel(val.id, val.quantity)
                        if (updateCartItemsModel.error) {
                            response.error = true
                            response.statusCode = STRINGS.successStatusCode
                            response.message = STRINGS.commanErrorString
                            return callback(response)
                        }
                        arr.push(val)
                    } else {
                        arr.push(val)
                    }
                    if (ind == cartItems.length - 1) {
                        cartItems = arr
                    }

                })
                cartAll.data.forEach(async (val, ind) => {
                    val.productStockCount = parseInt(val.defaultQuantity) > 0 ? parseInt(val.defaultQuantity) : parseInt(val.productStockCount)
                    // if (val.productStockCount == 0) {
                    //     var RemoveCartItemsModel = await userProductsModel.RemoveCartItemsModel(val.id)
                    //     if (RemoveCartItemsModel.error) {
                    //         response.error = true
                    //         response.statusCode = STRINGS.successStatusCode
                    //         response.message = STRINGS.commanErrorString
                    //         return callback(response)
                    //     }
                    // } else
                    if (val.quantity > val.productStockCount && val.quantity > 0) {
                        val.quantity = val.productStockCount
                        var updateCartItemsModel = await userProductsModel.updateCartItemsModel(val.id, val.quantity)
                        if (updateCartItemsModel.error) {
                            response.error = true
                            response.statusCode = STRINGS.successStatusCode
                            response.message = STRINGS.commanErrorString
                            return callback(response)
                        }
                        arr.push(val)
                    } else {
                        arr.push(val)
                    }
                    if (ind == cartItems.length - 1) {
                        cartItems = arr
                    }

                })

                // console.log("cartItems", cartItems)
                console.log("request auth", request.auth)

                // console.log("cartItems after", cartItems.data)
                let allProductsExcelFileLink;
                let allProductsExcelFileLinkModel = await userProductsModel.allProductsExcelFileLinkModel()
                console.log("allProductsExcelFileLinkModel", allProductsExcelFileLinkModel)
                if (allProductsExcelFileLinkModel.error) {
                    allProductsExcelFileLink.data = []
                } else {
                    allProductsExcelFileLink = allProductsExcelFileLinkModel.data
                }
                // console.log("allProductsExcelFileLink", allProductsExcelFileLink)
                // var cartItems = await userProductsModel.getCardItemsByPage(request, request.auth)
                if (cartItems.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                } else {
                    if (cartItems.data.length > 0) {
                        var total = await userProductsModel.getCardTotalSumValue(request.userId, request.auth)
                        console.log("total", total)
                        var instructions = await userProductsModel.getInstructionsModel(request.userId)
                        if (total.error || instructions.error) {
                            response.error = true
                            response.statusCode = STRINGS.successStatusCode
                            response.message = STRINGS.commanErrorString
                        } else {
                            const orderItemsList = cartItems.data.map(item => {
                                if (item.deleteProduct == 1) {
                                    response.error = true
                                    response.statusCode = STRINGS.errorStatusCode
                                    response.message = `${item.productName} This Product Was Deleted Please Remove From Cart`
                                    return callback(response)
                                }
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
                                orderObject.defaultQuantity = item.defaultQuantity
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

                            const allOrderItemsList = cartAll.data.map(item => {
                                if (item.deleteProduct == 1) {
                                    response.error = true
                                    response.statusCode = STRINGS.errorStatusCode
                                    response.message = `${item.productName} This Product Was Deleted Please Remove From Cart`
                                    return callback(response)
                                }
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
                                orderObject.defaultQuantity = item.defaultQuantity
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




                            var specialTotalAmountValue = allOrderItemsList.reduce((acc, val) => {
                                let totalSpecialAmount = val.quantity * val.specialAmountValue
                                return acc + totalSpecialAmount
                            }, 0)



                            // Other instructions
                            // var falg = cartItems.data.length - 1
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
                            var profile = await userProductsModel.profileModel(request.auth.id)

                            var referral = await referralCalculation(request.auth.id, total.data[0].finaltotal)
                            // console.log("referral",referral)
                            if (referral.error) {
                                response.error = true
                                response.statusCode = STRINGS.successStatusCode
                                response.message = STRINGS.commanErrorString
                            } else {
                                var subtotal = total.data[0].finaltotal
                                var referralDiscount = 0
                                await userProductsModel.referralOfferApply(request.auth.id, request.isOfferApply)
                                if (referral.referral && request.isOfferApply == 1) {
                                    var referralDiscount = referral.discount
                                }

                                var priceArray = []
                                var subTotalObject = {}
                                var refDiscountObject = {}
                                var GSTObject = {}
                                var grandTotalObject = {}

                                var subtotalValue = subtotal
                                var cashDiscountCashonCarry = false
                                var additional_Discount = false

                                var cashDiscountValue = 0
                                var additionalDiscountValue = 0


                                profile.data[0].cashDiscount = profile.data[0].cashDiscount == null ? 0 : profile.data[0].cashDiscount
                                // if (profile.data[0].cashOnCarry == 1 && profile.data[0].cashDiscount > 0) {
                                if (profile.data[0].cashOnCarry == 1) {

                                    console.log("cashOnCarry customer")
                                    // subtotalValue = subtotalValue * profile.data[0].cashDiscount / 100

                                    // const discountedPrice = subTotalObject.value - (subTotalObject.value * (profile.data[0].cashDiscount / 100));
                                    subTotalObject.value = +subtotalValue.toFixed(2)
                                    subTotalObject.value = parseFloat(subTotalObject.value)
                                    subTotalObject.type = 'Sub Total'
                                    subTotalObject.isDiscount = false
                                    console.log("subtotalValue", subTotalObject)

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


                                    let cashDiscount = {}
                                    cashDiscount.value = (subTotalObject.value * (profile.data[0].cashDiscount / 100)).toFixed(2)
                                    cashDiscount.value = parseFloat(cashDiscount.value)

                                    cashDiscount.type = 'Cash Discount'
                                    cashDiscount.isDiscount = true
                                    console.log("subtotalValue", cashDiscount)
                                    priceArray.push(cashDiscount)
                                    cashDiscountCashonCarry = true
                                    cashDiscountValue = cashDiscount.value
                                } else {
                                    subTotalObject.value = +subtotalValue.toFixed(2)
                                    subTotalObject.value = parseFloat(subTotalObject.value)

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

                                }
                                if (profile.data[0].isNonGst == 1) {
                                    console.log("cashOnCarry customer")



                                    let additionalDiscount = {}
                                    additionalDiscount.value = +total.data[0].gsttotal.toFixed(2)
                                    additionalDiscount.value = parseFloat(additionalDiscount.value)
                                    additionalDiscount.type = 'Additional Discount '
                                    additionalDiscount.isDiscount = true
                                    console.log("subtotalValue", additionalDiscount)
                                    priceArray.push(additionalDiscount)
                                    additional_Discount = true
                                    additionalDiscountValue = additionalDiscount.value
                                }


                                if (referral.referral && request.isOfferApply == 1) {
                                    refDiscountObject.value = referral.discount
                                    refDiscountObject.value = parseFloat(refDiscountObject.value)
                                    refDiscountObject.type = 'Wallet Discount'
                                    refDiscountObject.isDiscount = true
                                }

                                GSTObject.value = +total.data[0].gsttotal.toFixed(2)
                                GSTObject.value = parseFloat(GSTObject.value)

                                GSTObject.type = 'GST Amount'
                                GSTObject.isDiscount = false
                                var grandTotal = subtotalValue + total.data[0].gsttotal - referralDiscount
                                grandTotal = cashDiscountCashonCarry == true ? grandTotal - cashDiscountValue
                                    : grandTotal
                                grandTotal = additional_Discount == true ? grandTotal - additionalDiscountValue
                                    : grandTotal

                                grandTotal = specialTotalAmountValue > 1 ? grandTotal - specialTotalAmountValue : grandTotal
                                grandTotalObject.value = +grandTotal.toFixed(2)
                                grandTotalObject.value = parseFloat(grandTotalObject.value)
                                grandTotalObject.type = 'Grand Total'
                                grandTotalObject.isDiscount = false

                                // priceArray.push(subTotalObject)
                                if (referral.referral && request.isOfferApply == 1) {
                                    priceArray.push(refDiscountObject)
                                }
                                priceArray.push(GSTObject)

                                priceArray.push(grandTotalObject)



                                response.error = false
                                response.statusCode = STRINGS.successStatusCode
                                response.message = STRINGS.SuccessString
                                response.isPriceVisible = request.auth.isPriceVisible
                                response.creditLimit = referral.creditLimit
                                response.availableCreditAmount = referral.availableCreditAmount
                                response.cashoncarry = referral.cashOnCarry
                                // response.isOfferApply = profile.data[0].isOfferApply
                                response.isOfferApply = request.isOfferApply
                                response.isOfferApply = parseInt(request.isOfferApply)
                                response.managerCart = profile.data[0].managerCart
                                response.isreferral = referral
                                response.otherInstruction = instructionObject
                                // response.grandTotal = subtotalValue + total.data[0].gsttotal - referralDiscount
                                response.grandTotal = grandTotal

                                response.priceList = priceArray
                                response.count = cartItems.data.length
                                // console.log("response view cart ", response)
                                // response.cartItems = orderItemsList
                                response.allProductsExcelFileLink = allProductsExcelFileLink.length > 0 ? allProductsExcelFileLink[0].allProductsFileLink : ''

                            }
                        }
                    } else {
                        response.error = false
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.emptyCartString
                        response.isPriceVisible = request.auth.isPriceVisible
                        response.managerCart = 0
                        response.creditLimit = 0
                        response.availableCreditAmount = 0
                        response.pages = 0
                        response.cartItems = cartItems.data
                        response.count = cartItems.data.length
                        response.allProductsExcelFileLink = allProductsExcelFileLink.length > 0 ? allProductsExcelFileLink[0].allProductsFileLink : ''

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






        this.viewCartDetailsByPage = async (request, callback) => {
            try {
                var response = {}
                console.log("request", request.auth)
                var cartAll = await userProductsModel.getCardItems(request.userId, request.auth)
                var arr = []

                var unique = {};
                let cartItemsData = []
                for (var i = 0; i < cartAll.data.length; i++) {
                    var val = cartAll.data[i]
                    let ind = i
                    // console.log("values products", val)

                    if (unique.hasOwnProperty(val.productCode)) {
                        // console.log("cartItems.data[i].productCode", val)
                        var RemoveCartItemsModel = await userProductsModel.RemoveCartItemsModel(val.id)
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
                    if (val.productStatus == 0) {
                        var RemoveCartItemsModel = await userProductsModel.RemoveCartItemsModel(val.id)
                        if (RemoveCartItemsModel.error) {
                            response.error = true
                            response.statusCode = STRINGS.successStatusCode
                            response.message = STRINGS.commanErrorString
                            return callback(response)
                        }
                    }


                }




                // cartAll.data.forEach(async (val, ind) => {
                for (var i = 0; i < cartAll.data.length; i++) {
                    var val = cartAll.data[i]
                    let ind = i
                    // console.log("values products", val)
                    val.productStockCount = parseInt(val.defaultQuantity) > 0 ? parseInt(val.defaultQuantity) : parseInt(val.productStockCount)
                    // if (val.productStockCount == 0) {
                    //     var RemoveCartItemsModel = await userProductsModel.RemoveCartItemsModel(val.id)
                    //     if (RemoveCartItemsModel.error) {
                    //         response.error = true
                    //         response.statusCode = STRINGS.successStatusCode
                    //         response.message = STRINGS.commanErrorString
                    //         return callback(response)
                    //     }
                    // } else 
                    if (val.quantity > val.productStockCount && val.quantity > 0) {
                        val.quantity = val.productStockCount
                        var updateCartItemsModel = await userProductsModel.updateCartItemsModel(val.id, val.quantity)
                        if (updateCartItemsModel.error) {
                            response.error = true
                            response.statusCode = STRINGS.successStatusCode
                            response.message = STRINGS.commanErrorString
                            return callback(response)
                        }
                        arr.push(val)
                    } else if (val.quantity == 0 || val.quantity < 0) {
                        val.quantity = parseInt(val.MOQ)
                        var updateCartItemsModel = await userProductsModel.updateCartItemsModel(val.id, val.quantity)
                        if (updateCartItemsModel.error) {
                            response.error = true
                            response.statusCode = STRINGS.successStatusCode
                            response.message = STRINGS.commanErrorString
                            return callback(response)
                        }
                    }
                    else {
                        arr.push(val)
                    }
                }






                var cartItems = await userProductsModel.getCardItemsByPage(request, request.auth)

                // console.log("cartItems before", cartItems)
                cartItems.data.forEach(async (val, ind) => {
                    val.productStockCount = parseInt(val.defaultQuantity) > 0 ? parseInt(val.defaultQuantity) : parseInt(val.productStockCount)
                    // if (val.productStockCount == 0) {
                    //     var RemoveCartItemsModel = await userProductsModel.RemoveCartItemsModel(val.id)
                    //     if (RemoveCartItemsModel.error) {
                    //         response.error = true
                    //         response.statusCode = STRINGS.successStatusCode
                    //         response.message = STRINGS.commanErrorString
                    //         return callback(response)
                    //     }
                    // } else 

                    if (val.quantity > val.productStockCount) {
                        val.quantity = val.productStockCount
                        var updateCartItemsModel = await userProductsModel.updateCartItemsModel(val.id, val.quantity)
                        if (updateCartItemsModel.error) {
                            response.error = true
                            response.statusCode = STRINGS.successStatusCode
                            response.message = STRINGS.commanErrorString
                            return callback(response)
                        }
                        arr.push(val)
                    }
                    // else if (val.quantity == 0 || val.quantity < 0) {
                    //     val.quantity = parseInt(val.MOQ)
                    // } 
                    else {
                        arr.push(val)
                    }
                    if (ind == cartItems.length - 1) {
                        cartItems = arr
                    }

                })


                let allProductsExcelFileLink;
                let allProductsExcelFileLinkModel = await userProductsModel.allProductsExcelFileLinkModel()
                // console.log("allProductsExcelFileLinkModel", allProductsExcelFileLinkModel)
                if (allProductsExcelFileLinkModel.error) {
                    allProductsExcelFileLink.data = []
                } else {
                    allProductsExcelFileLink = allProductsExcelFileLinkModel.data
                }
                // console.log("allProductsExcelFileLink", allProductsExcelFileLink)
                // console.log("cartItems after", cartItems)
                if (cartItems.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                } else {
                    if (cartItems.data.length > 0) {
                        var total = await userProductsModel.getCardTotalSumValue(request.userId, request.auth)
                        var instructions = await userProductsModel.getInstructionsModel(request.userId)
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
                                // orderObject.deleteProdduct = item.deleteProduct
                                orderObject.productStockCount = item.productStockCount
                                orderObject.defaultQuantity = item.defaultQuantity
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
                                orderObject.productDelete = item.deleteProduct
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

                            const allOrderItemsList = cartAll.data.map(item => {
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
                                // orderObject.deleteProdduct = item.deleteProduct
                                orderObject.productStockCount = item.productStockCount
                                orderObject.defaultQuantity = item.defaultQuantity
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
                                orderObject.productDelete = item.deleteProduct
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



                            //write reduce method for orderItemsList array and get specialAmountValue
                            var specialTotalAmountValue = allOrderItemsList.reduce((acc, val) => {
                                let totalSpecialAmount = val.quantity * val.specialAmountValue
                                return acc + totalSpecialAmount
                            }, 0)



                            // Other instructions
                            // var falg = cartItems.data.length - 1
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
                            var profile = await userProductsModel.profileModel(request.auth.id)

                            var referral = await referralCalculation(request.auth.id, total.data[0].finaltotal)
                            if (referral.error) {
                                response.error = true
                                response.statusCode = STRINGS.successStatusCode
                                response.message = STRINGS.commanErrorString
                            } else {
                                var subtotal = total.data[0].finaltotal
                                var referralDiscount = 0
                                await userProductsModel.referralOfferApply(request.auth.id, request.isOfferApply)
                                if (referral.referral && request.isOfferApply == 1) {
                                    var referralDiscount = referral.discount
                                }

                                var priceArray = []
                                var subTotalObject = {}
                                var refDiscountObject = {}
                                var GSTObject = {}
                                var grandTotalObject = {}
                                var subtotalValue = subtotal
                                var cashDiscountCashonCarry = false
                                var cashDiscountValue = 0

                                var additional_Discount = false
                                var additionalDiscountValue = 0


                                profile.data[0].cashDiscount = profile.data[0].cashDiscount == null ? 0 : profile.data[0].cashDiscount
                                if (profile.data[0].cashOnCarry == 1) {
                                    // if (profile.data[0].cashOnCarry == 1 && profile.data[0].cashDiscount > 0) {

                                    // console.log("cashOnCarry customer")
                                    // subtotalValue = subtotalValue * profile.data[0].cashDiscount / 100
                                    // console.log("subtotalValue", subtotalValue)

                                    // const discountedPrice = subTotalObject.value - (subTotalObject.value * (profile.data[0].cashDiscount / 100));
                                    subTotalObject.value = +subtotalValue.toFixed(2)
                                    subTotalObject.value = parseFloat(subTotalObject.value)
                                    subTotalObject.type = 'Sub Total'
                                    subTotalObject.isDiscount = false
                                    // console.log("subtotalValue", subTotalObject)

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

                                    let cashDiscount = {}
                                    cashDiscount.value = (subTotalObject.value * (profile.data[0].cashDiscount / 100)).toFixed(2)
                                    cashDiscount.value = parseFloat(cashDiscount.value)

                                    cashDiscount.type = 'Cash Discount'
                                    cashDiscount.isDiscount = true
                                    // console.log("subtotalValue", cashDiscount)
                                    priceArray.push(cashDiscount)
                                    cashDiscountCashonCarry = true
                                    cashDiscountValue = cashDiscount.value


                                } else {

                                    subTotalObject.value = +subtotalValue.toFixed(2)
                                    subTotalObject.value = parseFloat(subTotalObject.value)

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
                                }

                                if (profile.data[0].isNonGst == 1) {
                                    // console.log("cashOnCarry customer")
                                    let additionalDiscount = {}
                                    additionalDiscount.value = +total.data[0].gsttotal.toFixed(2)
                                    additionalDiscount.value = parseFloat(additionalDiscount.value)

                                    additionalDiscount.type = 'Additional Discount '
                                    additionalDiscount.isDiscount = true
                                    // console.log("subtotalValue", additionalDiscount)
                                    priceArray.push(additionalDiscount)
                                    additional_Discount = true
                                    additionalDiscountValue = additionalDiscount.value
                                }


                                if (referral.referral && request.isOfferApply == 1) {
                                    refDiscountObject.value = referral.discount
                                    refDiscountObject.value = parseFloat(refDiscountObject.value)
                                    refDiscountObject.type = 'Wallet Discount'
                                    refDiscountObject.isDiscount = true
                                }

                                GSTObject.value = +total.data[0].gsttotal.toFixed(2)
                                GSTObject.value = parseFloat(GSTObject.value)

                                GSTObject.type = 'GST Amount'
                                GSTObject.isDiscount = false
                                var globalData = subtotalValue + total.data[0].gsttotal - referralDiscount
                                globalData = cashDiscountCashonCarry == true ? globalData - cashDiscountValue
                                    : globalData

                                globalData = additional_Discount == true ? globalData - additionalDiscountValue
                                    : globalData
                                globalData = specialTotalAmountValue > 1 ? globalData - specialTotalAmountValue : globalData

                                grandTotalObject.value = +globalData.toFixed(2)
                                grandTotalObject.value = parseFloat(grandTotalObject.value)
                                grandTotalObject.type = 'Grand Total'
                                grandTotalObject.isDiscount = false

                                // priceArray.push(subTotalObject)
                                if (referral.referral && request.isOfferApply == 1) {
                                    priceArray.push(refDiscountObject)
                                }
                                priceArray.push(GSTObject)

                                priceArray.push(grandTotalObject)

                                var UserLedger = await utils.UserLedger(request.auth.customerID)
                                if (UserLedger.error) {
                                    response.error = true
                                    response.statusCode = STRINGS.errorStatusCode
                                    response.message = STRINGS.commanErrorString
                                } else {
                                    var userLedgerAmount = 0;
                                    // console.log("UserLedger", UserLedger)
                                    if (UserLedger.length > 0) {
                                        userLedgerAmount = UserLedger.length > 0 ? parseFloat(UserLedger[0].CLOSINGBALANCE.$t) : 0
                                        // var closingBalance = parseFloat(UserLedger[0].TOTALDEBIT.$t) >= parseFloat(UserLedger[0].TOTALCREDIT.$t) ? 1 : -1
                                        // var closingBalance = UserLedger[0].TYPE.$t == 'Debit' ? 1 : -1
                                        var closingBalance;
                                        if (UserLedger && UserLedger[0] && UserLedger[0].TYPE && typeof UserLedger[0].TYPE.$t !== 'undefined' && UserLedger[0].TYPE.$t !== null) {
                                            closingBalance = UserLedger[0].TYPE.$t == 'Debit' ? 1 : -1;
                                        } else {
                                            closingBalance = 0; // or any other default value you prefer
                                        }
                                        userLedgerAmount = userLedgerAmount * closingBalance
                                    }
                                    var totalAmount = await userProductsModel.totalAcceptWaitingAmountModel(request.auth.id)
                                    // console.log("totalAmount", totalAmount)
                                    let accept_waiting_amount = parseFloat(totalAmount.data[0].totalAcceptWaitingAmount == null ? 0 :
                                        totalAmount.data[0].totalAcceptWaitingAmount)


                                    let availableCredit = parseFloat(userLedgerAmount) + (accept_waiting_amount)
                                    console.log("userLedgerAmount", userLedgerAmount, availableCredit)

                                    response.error = false
                                    response.statusCode = STRINGS.successStatusCode
                                    response.message = STRINGS.SuccessString
                                    response.isPriceVisible = request.auth.isPriceVisible
                                    response.creditLimit = referral.creditLimit

                                    var creditDaysForOrderModel = await userProductsModel.creditDaysForOrderModel(request.auth.id)
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
                                            response.isOverdue = 0
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

                                    // response.isOfferApply = profile.data[0].isOfferApply
                                    // response.isOfferApply = request.isOfferApply
                                    response.isOfferApply = parseInt(request.isOfferApply)
                                    response.managerCart = profile.data[0].managerCart
                                    response.isreferral = referral
                                    response.otherInstruction = instructionObject
                                    // response.grandTotal = subtotalValue + total.data[0].gsttotal - referralDiscount
                                    response.grandTotal = globalData
                                    response.priceList = priceArray
                                    response.availableCreditAmount = parseFloat((parseFloat(profile.data[0].creditFixedtLimit) - availableCredit).toFixed(1))
                                    response.minOrderValue = request.auth.minOrderValue
                                    response.pages = await utils.pageCount(cartAll.data.length, 10)
                                    response.count = cartAll.data.length
                                    response.cartItems = orderItemsList
                                    response.allProductsExcelFileLink = allProductsExcelFileLink.length > 0 ? allProductsExcelFileLink[0].allProductsFileLink : ''

                                }
                            }
                        }
                    } else {
                        response.error = false
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.emptyCartString
                        response.isPriceVisible = request.auth.isPriceVisible
                        response.managerCart = 0
                        response.creditLimit = 0
                        response.availableCreditAmount = 0
                        response.creditPeriod = 0
                        response.isOverdue = 0
                        response.pages = 0
                        response.cartItems = cartItems.data
                        response.count = cartItems.data.length
                        response.allProductsExcelFileLink = allProductsExcelFileLink.length > 0 ? allProductsExcelFileLink[0].allProductsFileLink : ''

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



        this.deleteCart = async (request, callback) => {
            try {
                var response = {}
                var cartItems = await userProductsModel.getCardItems(request.userId, request.auth)
                if (cartItems.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                } else {
                    if (cartItems.data.length > 0) {
                        if (cartItems.data.length == 1) {
                            await userProductsModel.removeInstructions(request.userId)
                            userProductsModel.updateOrderProfile([request.userId], () => { })
                        }
                        var cart = await userProductsModel.deleteCartModel(request.cartId)
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
            } catch (e) {
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
            }
            callback(response)
        }

        // View Feature product
        this.viewFeatureProducts = async (request, callback) => {
            try {
                var response = {}
                var color = await userProductsModel.getFeatureProductColor()
                var productResponse = await userProductsModel.totalFeatureProduct(request)
                var bannerModel = await userProductsModel.getOneBannerImageModel(request)
                console.log("bannerModel", bannerModel)


                if (productResponse.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                    callback(response)
                } else {
                    console.log("ProductResponse****", productResponse)
                    if (productResponse.data.length > 0) {
                        var count = await utils.pageCount(productResponse.data.length, 10)
                        request.pageCount = 10
                        // var product = await this.getCategoryProductsList(object, request)
                        // console.log("total products", productResponse.data)

                        var products = productResponse.data
                        var sortingProduct = [];
                        var zeroStockProduct = [];

                        products.forEach((val, ind) => {
                            // if (val.productStockCount == 0 && val.defaultQuantity == 0) {
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





                        //if its last page then only add zero quantity products
                        // console.log("products", products)
                        var length = products.length

                        // products = sortingProduct
                        for (let i = 0; i < products.length; i++) {
                            var index = i
                            var item = products[i]

                            var cart = await userProductsModel.checkMyCartProduct(request.auth.id, item.id)

                            var productNotify = 0;

                            var checkProductNoyifyModel = await userProductsModel.checkProductNoyifyModel(request.auth.customerID, item.productCode)
                            if (checkProductNoyifyModel.error) {
                                response.error = true
                                response.statusCode = STRINGS.successStatusCode
                                response.message = STRINGS.commanErrorString
                                callback(response)
                            } else if (checkProductNoyifyModel.data.length > 0) {
                                productNotify = checkProductNoyifyModel.data[0].productUpdated == 1 ? 0 : 1
                            }
                            products[index].productNotify = productNotify



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
                            //   var discountValue = await this.userProductDiscountOption(discountObject)
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

                            var imageFile = await uploadS3.S3_getObject(s3Images)
                            // console.log("imageFile", imageFile)
                            if (imageFile.error || products[index].productImage.length == 0) {
                                // dummy image this one
                                // products[index].productImage = "https://europetuploads.s3.ap-south-1.amazonaws.com/europet_images/download.png"
                                products[index].productImage = process.env.NO_IMAGE

                            }


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
                                response.color = color.data[0].featureProductColor
                                response.isPriceVisible = request.auth.isPriceVisible
                                response.featureProducts = products
                                callback(response)
                            }
                        }

                    } else {
                        response.error = false
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.SuccessString
                        response.pages = 0
                        response.color = color.data[0].featureProductColor
                        response.isPriceVisible = request.auth.isPriceVisible
                        response.featureProducts = products
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




        // View Product
        this.viewProductDeatils = async (request, callback) => {
            try {
                var response = {}
                // console.log("request auth", request.auth)
                var checkProduct = await userProductsModel.checkProductId(request)
                console.log("checkProductId", checkProduct)
                if (checkProduct.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                    callback(response)
                } else {
                    if (checkProduct.data.length > 0) {
                        var imageResponse = await userProductsModel.productImages(request.productId)
                        if (imageResponse.error) {
                            response.error = true
                            response.statusCode = STRINGS.successStatusCode
                            response.message = STRINGS.commanErrorString
                            callback(response)
                        } else {
                            var productDetails = checkProduct.data[0]
                            var isShow = true
                            var attValues = checkProduct.data[0].attributeIds != null ? await userProductsModel.productAttribute(JSON.parse(checkProduct.data[0].attributeIds), isShow)
                                : null
                            var optionsValue = checkProduct.data[0].attributeOptionsIds != null ? JSON.parse(checkProduct.data[0].attributeOptionsIds)
                                : null
                            var attributeIds = attValues != null ? attValues.data : null
                            var length = attributeIds != null ? attributeIds.length : 0
                            var cart = await userProductsModel.checkMyCartProduct(request.auth.id, request.productId)

                            var productNotify = 0;

                            var checkProductNoyifyModel = await userProductsModel.checkProductNoyifyModel(request.auth.customerID, productDetails.productCode)
                            if (checkProductNoyifyModel.error) {
                                response.error = true
                                response.statusCode = STRINGS.successStatusCode
                                response.message = STRINGS.commanErrorString
                                callback(response)
                            } else if (checkProductNoyifyModel.data.length > 0) {
                                productNotify = checkProductNoyifyModel.data[0].productUpdated == 1 ? 0 : 1
                            }
                            productDetails.productNotify = productNotify











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
                            // var productImagesList = [imageObject].concat(productImagesArray)
                            var productImagesList = imageResponse.data


                            productDetails.cartCount = cartCount
                            productDetails.attributeOptionsIds = selectedOptions
                            productDetails.attributeIds = selectedAttribute
                            productDetails.productImages = productImagesList
                            // User discount calculation
                            // if (request.auth.isEnableDiscount === 1) {
                            //   var discountObject = { userId: request.auth.id, productId: request.productId }
                            //   var discountValue = await userProductsModel.userProductDiscountOption(discountObject)
                            //   if (discountValue.data) {
                            //     productDetails.discount = discountValue.data.discount
                            //     productDetails.price = productDetails.MRP - (productDetails.MRP * (discountValue.data.discount / 100))
                            //   }
                            // }

                            // Stock Status
                            productDetails.stockStatus = STRINGS.inStockString
                            productDetails.productStockCount = productDetails.defaultQuantity > 0 ? productDetails.defaultQuantity : productDetails.productStockCount
                            console.log("productDetails.productStockCount", productDetails.productStockCount, productDetails.finishingFast)
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
                            if (imageFile.error || productDetails.productImage.length == 0) {
                                // dummy image this one
                                // products[index].productImage = "https://europetuploads.uploadS3.ap-south-1.amazonaws.com/europet_images/download.png"
                                productDetails.productImage = process.env.NO_IMAGE

                            }



                            if (length > 0) {
                                attributeIds.forEach(async function (item, index) {
                                    var isShow = true
                                    var options = await userProductsModel.attOptions(item.id, optionsValue, isShow)
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
                                        // console.log("optionsfilters",optionsfilters)
                                        productDetails.attribute = optionsfilters == null ? [] : optionsfilters
                                        response.error = false
                                        response.statusCode = STRINGS.successStatusCode
                                        response.message = STRINGS.SuccessString
                                        response.isPriceVisible = request.auth.isPriceVisible
                                        response.productDetails = productDetails
                                        callback(response)
                                    }
                                })
                            } else {
                                productDetails.attribute = attributeIds == null ? [] : attributeIds
                                response.error = false
                                response.statusCode = STRINGS.successStatusCode
                                response.message = STRINGS.SuccessString
                                response.isPriceVisible = request.auth.isPriceVisible
                                response.productDetails = productDetails
                                callback(response)
                            }
                        }
                    } else {
                        response.error = true
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.invalidProductString
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



        // Place Order
        this.placeOrder = async (request, callback) => {
            try {
                var response = {}
                // console.log("request.auth",request.auth)
                var cartItems = await userProductsModel.getCardItems(request.managerId, request.auth)
                console.log("cartItems", cartItems)
                if (cartItems.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                    callback(response)
                } else {

                    var unique = {};
                    // var distinct = [];
                    // for (var i in cartItems.data) {
                    //     if (typeof (unique[cartItems.data[i].productCode]) == "undefined") {
                    //         distinct.push(cartItems.data[i].productCode);
                    //     }
                    //     unique[cartItems.data[i].productCode] = 0;
                    // }
                    // console.log("distinct", distinct)
                    let cartItemsData = []
                    for (var i = 0; i < cartItems.data.length; i++) {
                        var val = cartItems.data[i]
                        let ind = i
                        // console.log("values products", val)

                        if (unique.hasOwnProperty(cartItems.data[i].productCode)) {
                            console.log("cartItems.data[i].productCode", cartItems.data[i])
                            var RemoveCartItemsModel = await userProductsModel.RemoveCartItemsModel(val.id)
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

                            var RemoveCartItemsModel = await userProductsModel.RemoveCartItemsModel(val.id)
                            if (RemoveCartItemsModel.error) {
                                response.error = true
                                response.statusCode = STRINGS.successStatusCode
                                response.message = STRINGS.commanErrorString
                                return callback(response)
                            }
                        } else if (val.quantity > val.productStockCount && val.quantity > 0) {
                            val.quantity = val.productStockCount
                            var updateCartItemsModel = await userProductsModel.updateCartItemsModel(val.id, val.quantity)
                            if (updateCartItemsModel.error) {
                                response.error = true
                                response.statusCode = STRINGS.successStatusCode
                                response.message = STRINGS.commanErrorString
                                return callback(response)
                            }
                            arr.push(val)
                        } else if (val.quantity == 0 || val.quantity < 0) {

                            val.quantity = parseInt(val.MOQ)
                            var updateCartItemsModel = await userProductsModel.updateCartItemsModel(val.id, val.quantity)
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

                    //remove duplicate values from cartItems.data array using productCode






                    if (cartItems.data.length > 0) {

                        var cartItemsList = cartItems.data

                        //write reduce method for cartItemsList and calculate supplyPrice with specialDiscountValue  percentage
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
                        console.log("arrayFilter", arrayFilter)
                        if (arrayFilter.length === 0) {
                            var itemLength = cartItemsList.length
                            var instructions = await userProductsModel.getInstructionsModel(request.managerId)
                            var total = await userProductsModel.getCardTotalSumValue(request.managerId, request.auth)
                            if (!total.error || !instructions.error) {
                                var orderObject = {}

                                var getOrdersForBookindIdModel = await userProductsModel.getOrdersForBookindIdModel()
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
                                    var localTime = new Date().toLocaleString(undefined, { timeZone: 'Asia/Kolkata' });

                                    orderObject.ownerId = request.auth.id
                                    orderObject.bookingId = bookingId
                                    orderObject.cartUserId = request.managerId
                                    orderObject.managerId = request.userId
                                    orderObject.orderDate = new Date(localTime)
                                    orderObject.orderStatus = 'WAITING'
                                    orderObject.totalAmount = total.data[0].finaltotal
                                    orderObject.totalGST = total.data[0].gsttotal
                                    orderObject.paymentId = request.paymentId
                                    orderObject.orderBy = 'USER'
                                    orderObject.salesRepID = request.auth.salesRepId
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
                                    // request.paymentId = 5
                                    if (request.paymentId == 3) {
                                        orderObject.orderStatus = 'PENDING'
                                    }


                                    // console.log("requestAuth***", request.auth)
                                    let availableCredit;
                                    var UserLedger = await utils.UserLedger(request.auth.customerID)
                                    if (UserLedger.error) {
                                        response.error = true
                                        response.statusCode = STRINGS.errorStatusCode
                                        response.message = STRINGS.commanErrorString
                                    } else {
                                        console.log("UserLedger", UserLedger)

                                        var totalAmount = await userProductsModel.totalAcceptWaitingAmountModel(request.auth.id)
                                        console.log("totalAmount", totalAmount)

                                        var userLedgerAmount = 0;
                                        if (UserLedger.length > 0) {
                                            userLedgerAmount = UserLedger.length > 0 ? parseFloat(UserLedger[0].CLOSINGBALANCE.$t) : 0
                                            // var closingBalance = parseFloat(UserLedger[0].TOTALDEBIT.$t) >= parseFloat(UserLedger[0].TOTALCREDIT.$t) ? 1 : -1
                                            // var closingBalance = UserLedger[0].TYPE.$t == 'Debit' ? 1 : -1
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

                                        availableCredit = parseFloat(userLedgerAmount) + (accept_waiting_amount)
                                        console.log("availableCreditLimit", userLedgerAmount, availableCredit)

                                    }
                                    var availableCreditLimit = (parseFloat(request.auth.creditFixedtLimit) - availableCredit).toFixed(1)
                                    console.log("availableCreditLimit", availableCreditLimit)
                                    var balanceAmount = parseFloat((total.data[0].finaltotal + total.data[0].gsttotal))

                                    // console.log("balanceAmount", balanceAmount)
                                    // if (availableCreditLimit < balanceAmount &&
                                    //   request.auth.cashOnCarry == 0
                                    // ) {
                                    //   response.error = true
                                    //   response.statusCode = STRINGS.successStatusCode
                                    //   response.message = STRINGS.creditErrorString
                                    //   // console.log("response", response)
                                    //   return callback(response)
                                    // } else


                                    var creditDaysForOrderModel = await userProductsModel.creditDaysForOrderModel(request.auth.id)
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
                                            response.message = "Sorry,You have bills overdue beyond your credit period"
                                            // console.log("response", response)
                                            return callback(response)
                                        }
                                    }
                                    request.auth.minOrderValue = request.auth.minOrderValue == undefined || null ? 0 : request.auth.minOrderValue
                                    var profile = await userProductsModel.profileModel(request.auth.id)

                                    profile.data[0].cashDiscount = profile.data[0].cashDiscount == null || 0 ? 0 : profile.data[0].cashDiscount

                                    let cashDiscountAmount = profile.data[0].cashOnCarry == 1 ?
                                        (orderObject.totalAmount * (profile.data[0].cashDiscount / 100)).toFixed(2) : 0
                                    let additionalDiscountAmount = profile.data[0].isNonGst == 1 ? total.data[0].gsttotal.toFixed(2) : 0

                                    balanceAmount = balanceAmount - cashDiscountAmount
                                    balanceAmount = balanceAmount - additionalDiscountAmount
                                    balanceAmount = balanceAmount - specialTotalAmountValue.toFixed(2)


                                    if (availableCreditLimit < balanceAmount &&
                                        request.auth.cashOnCarry == 0) {
                                        response.error = true
                                        response.statusCode = STRINGS.errorStatusCode
                                        response.message = "Sorry,you have exceeded your credit limit,please clear your previous bill to continue"
                                        // console.log("response", response)
                                        return callback(response)
                                    }
                                    if (request.auth.minOrderValue > balanceAmount) {
                                        response.error = true
                                        response.statusCode = STRINGS.errorStatusCode
                                        response.message = "Total Amount is Less Than Minimum Order Value"
                                        // console.log("response", response)
                                        return callback(response)
                                    }

                                    var profile = await userProductsModel.profileModel(request.auth.id)
                                    console.log("profile", profile)
                                    var referralCheck = await referralCalculation(request.auth.id, total.data[0].finaltotal)
                                    orderObject.referralDiscount = 0
                                    if (referralCheck.referral && request.isOfferApply == 1) {
                                        orderObject.referralDiscount = referralCheck.discount
                                    }
                                    var Qty = await userProductsModel.getCartQuantity(request.managerId)
                                    orderObject.totalQuantity = Qty.data[0].totalQty
                                    orderObject.balanceAmount = (total.data[0].finaltotal + total.data[0].gsttotal) - orderObject.referralDiscount
                                    // console.log(orderObject.balanceAmount)
                                    orderObject.outletId = request.auth.outletId
                                    profile.data[0].cashDiscount = profile.data[0].cashDiscount == null || 0 ? 0 : profile.data[0].cashDiscount

                                    orderObject.cashDiscountAmount = profile.data[0].cashOnCarry == 1 ?
                                        (orderObject.totalAmount * (profile.data[0].cashDiscount / 100)).toFixed(2) : 0
                                    orderObject.additionalDiscountAmount = profile.data[0].isNonGst == 1 ? total.data[0].gsttotal.toFixed(2) : 0

                                    orderObject.balanceAmount = orderObject.balanceAmount - orderObject.cashDiscountAmount
                                    orderObject.balanceAmount = orderObject.balanceAmount - orderObject.additionalDiscountAmount
                                    orderObject.balanceAmount = orderObject.balanceAmount - specialTotalAmountValue.toFixed(2)
                                    orderObject.specialDiscountAmount = specialTotalAmountValue.toFixed(2)

                                    orderObject.orderPrimarySalesRepId = profile.data.length > 0 ? profile.data[0].primarySalesRepId : null

                                    var saveOrder = await userProductsModel.saveOrderDetails(orderObject)
                                    if (saveOrder.error) {
                                        response.error = true
                                        response.statusCode = STRINGS.successStatusCode
                                        response.message = STRINGS.commanErrorString
                                        callback(response)
                                    } else {
                                        var orderID = saveOrder.data[0]
                                        var totalOty = 0
                                        var offerOty = 0
                                        var wallet = {}
                                        if (orderObject.balanceAmount && request.isOfferApply == 1) {
                                            // if (request.auth.bonusPoint > orderObject.balanceAmount && request.isOfferApply == 1) {

                                            console.log("wallet applied", orderObject.balanceAmount, request.auth.bonusPoint)
                                            wallet.userId = request.userId;
                                            wallet.type = 'debit';
                                            wallet.amount = referralCheck.discount;
                                            wallet.orderId = orderID;
                                            wallet.balanceAmount = request.auth.bonusPoint - referralCheck.discount
                                            wallet.status = 'ACCEPTED'
                                            await userProductsModel.updateWalletTransaction(wallet);
                                        }
                                        var orderItemsArray = []
                                        // cartItemsList.forEach(async function (item, ind) {

                                        for (let i = 0; i < cartItemsList.length; i++) {



                                            let item = cartItemsList[i]
                                            let ind = i
                                            var orderItems = {}
                                            var offerItems = {}
                                            var fullQuantity = 0
                                            var freeQty = 0

                                            var cartManagerId = item.userId
                                            if (item.productOfferX != 0) {
                                                if (item.quantity >= item.productOfferX) {
                                                    let freeQty = Math.floor(item.quantity / item.productOfferX) * item.productOfferY
                                                    orderItems.freeQuantity = freeQty
                                                    fullQuantity = parseInt(item.quantity) + parseInt(freeQty)

                                                    orderItems.fullQuantity = fullQuantity
                                                    offerOty += (item.quantity / item.productOfferX) * item.productOfferY
                                                    offerOty.toFixed(1)
                                                    offerItems.orderId = orderID
                                                    offerItems.customerUserId = request.auth.customerID
                                                    offerItems.orderProductId = item.productCode
                                                    offerItems.bookingOrderId = bookingId
                                                    offerItems.productId = item.productId
                                                    offerItems.quantity = freeQty
                                                    offerItems.price = item.MRP
                                                    offerItems.orderCost = 0
                                                    offerItems.supplyPrice = 0
                                                    offerItems.productDiscount = 100.00
                                                    offerItems.cartShopId = item.userId
                                                    // offerItems.ownerUserId = request.auth.id
                                                    offerItems.orderAttribute = item.attribute
                                                    offerItems.orderOptions = item.options

                                                    // await userProductsModel.saveOrderItems(offerItems)
                                                    // console.log("order items 111", offerItems)
                                                    if (item.defaultQuantity == 0) {
                                                        var stockObject = {}
                                                        stockObject.productId = item.productId
                                                        stockObject.quantity = freeQty
                                                        stockObject.outletId = request.auth.outletId
                                                        await userProductsModel.updateProductStockCount(stockObject)
                                                    }
                                                } else {
                                                    fullQuantity = parseInt(item.quantity) + parseInt(freeQty)

                                                    orderItems.fullQuantity = fullQuantity
                                                }
                                            }
                                            totalOty += item.quantity
                                            orderItems.orderId = orderID
                                            orderItems.bookingOrderId = bookingId
                                            orderItems.productId = item.productId
                                            orderItems.customerUserId = request.auth.customerID
                                            orderItems.orderProductId = item.productCode
                                            orderItems.quantity = item.quantity
                                            orderItems.fullQuantity = fullQuantity > 0 ? fullQuantity : item.quantity
                                            orderItems.price = item.MRP
                                            let totalCost = parseFloat(item.supplyPrice) * parseInt(item.quantity)
                                            // orderItems.orderCost = item.totalPrice
                                            orderItems.orderCost = totalCost > 0 ? totalCost : item.totalPrice
                                            orderItems.supplyPrice = item.supplyPrice
                                            let specialDiscountAmount = 0
                                            let specialAmountValue = 0


                                            if (item.specialDiscount == 1) {
                                                specialAmountValue = (item.totalPrice * item.specialDiscountValue) / 100
                                                specialDiscountAmount = item.totalPrice - specialAmountValue
                                            }
                                            // orderItems.specialDiscountAmount = specialDiscountAmount
                                            orderItems.othertDiscountAmount = specialAmountValue.toFixed(1)

                                            orderItems.GSTAmount = item.gstAmount
                                            orderItems.productDiscount = item.discount
                                            // orderItems.ownerUserId = request.auth.id
                                            orderItems.cartShopId = item.userId
                                            orderItems.orderAttribute = item.attribute
                                            orderItems.orderOptions = item.options
                                            // if (item.quantity >= item.productOfferX) {

                                            //   for (var i = 0; i < item.productOfferY; i++) {
                                            //     var orderItems1 = {}
                                            //     orderItems1.orderId = orderID
                                            //     orderItems1.bookingOrderId = bookingId
                                            //     orderItems1.productId = item.productId
                                            //     orderItems1.customerUserId = request.auth.customerID
                                            //     orderItems1.orderProductId = item.productCode
                                            //     orderItems1.quantity = 1
                                            //     orderItems1.price = item.MRP
                                            //     orderItems1.orderCost = 0
                                            //     orderItems1.supplyPrice = 0
                                            //     orderItems1.GSTAmount = 0
                                            //     orderItems1.productDiscount = 100.00
                                            //     // orderItems.ownerUserId = request.auth.id
                                            //     orderItems1.cartShopId = item.userId
                                            //     orderItems1.orderAttribute = item.attribute
                                            //     orderItems1.orderOptions = item.options
                                            //     await userProductsModel.saveOrderItems(orderItems1)
                                            // console.log("order items 111",orderItems1)

                                            //   }
                                            // }

                                            let orderItemsObject = Object.assign("", orderItems)
                                            orderItemsObject.no = ind + 1
                                            orderItemsObject.productName = item.productName
                                            orderItemsObject.freeQuantity = orderItemsObject.freeQuantity == null ? 0 : orderItemsObject.freeQuantity

                                            orderItemsArray.push(orderItemsObject)

                                            orderItems.remarks = item.remarks
                                            console.log("order orderItems", orderItems)
                                            await userProductsModel.saveOrderItems(orderItems)
                                            // Update stock count
                                            if (item.defaultQuantity == 0) {

                                                var stockObject = {}
                                                stockObject.productId = item.productId
                                                stockObject.quantity = item.quantity
                                                stockObject.outletId = request.auth.outletId
                                                await userProductsModel.updateProductStockCount(stockObject)
                                            }
                                            // console.log("ind sdasdasd", ind)
                                            if (ind == cartItemsList.length - 1) {
                                                var Ids = [cartManagerId, request.auth.id]
                                                var discountAmountValue = 0
                                                if (referralCheck.referral && request.isOfferApply == 1) {
                                                    var discountAmountValue = referralCheck.discount
                                                    var referralObject = {
                                                        id: request.auth.id,
                                                        bonusPoint: discountAmountValue
                                                    }
                                                    await userProductsModel.referralAmountModel(referralObject)
                                                }
                                                userProductsModel.updateOrderProfile(Ids, () => { })
                                                await userProductsModel.updateOrderOty(orderID, totalOty, offerOty)
                                                if (request.paymentId != 3) {
                                                    await userProductsModel.removeCartItems(request.managerId)
                                                }
                                                await userProductsModel.removeInstructions(request.managerId)
                                                var finalAmount = total.data[0].finaltotal + total.data[0].gsttotal - discountAmountValue
                                                var creditObject = {
                                                    id: request.auth.id,
                                                    creditLimit: finalAmount
                                                }
                                                if (request.auth.cashOnCarry == 0) {
                                                    await userProductsModel.updateCreditValueModel(creditObject)
                                                }



                                                var orderItemsPDfLink = ''
                                                let pdfFileName = process.env.ORDERITEMS_FILE_NAME == undefined || process.env.ORDERITEMS_FILE_NAME == null ? 'UserOrderItems' : process.env.ORDERITEMS_FILE_NAME

                                                try {

                                                    var options = {
                                                        format: "A2",
                                                        orientation: "portrait",
                                                        border: "10mm",
                                                        margin: {
                                                            top: '30mm', // Add 20mm of margin on the top
                                                            // right: '15mm',
                                                            bottom: '30mm',
                                                            // left: '15mm'
                                                        },

                                                    }



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
                                                    orderItemsPDfLink = s3PdfUpload.data
                                                    var updateOrderItemsPdfModel = await userProductsModel.updateOrderItemsPdfModel(updateOrderItemsPdfObj)
                                                    // console.log('updateOrderItemsPdfModel', updateOrderItemsPdfModel)

                                                    if (request.paymentId != 3) {


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


                                                        let orderTimeHours = new Date(localTime).getHours()
                                                        let orderTimeMin = new Date(localTime).getMinutes()

                                                        let notificationObject1 = {}
                                                        // notificationObject.id = "56"
                                                        notificationObject1.orderId = bookingId
                                                        // notificationObject.salesRepIds = JSON.stringify(salesRepIdsData)
                                                        notificationObject1.customerID = profile.data[0].customerID
                                                        // notificationObject.orderStatus = "ACCEPTED"
                                                        // notificationObject.notifyType =  "ACCEPTED"
                                                        notificationObject1.shopName = profile.data[0].shopName
                                                        notificationObject1.totalAmount = orderObject.balanceAmount.toFixed(1)
                                                        notificationObject1.orderTime = `${orderTimeHours}:${orderTimeMin}`
                                                        notificationsService.sendOwnerPlaceOrderPushNotification(notificationObject1, () => { })



                                                        var notificationObject = {}
                                                        notificationObject.id = "56"
                                                        notificationObject.orderId = bookingId
                                                        notificationObject.salesRepIds = JSON.stringify(salesRepIdsData)
                                                        notificationObject.customerID = profile.data[0].customerID
                                                        // notificationObject.orderStatus = "ACCEPTED"
                                                        // notificationObject.notifyType =  "ACCEPTED"
                                                        notificationObject.shopName = profile.data[0].shopName
                                                        notificationsService.sendPlaceOrderPushNotification(notificationObject, () => { })


                                                        let smsObj = {}
                                                        smsObj.mobileNumber = profile.data[0].mobileNumber
                                                        smsObj.totalAmount = orderObject.balanceAmount.toFixed(1)
                                                        smsObj.orderId = bookingId
                                                        smsObj.orderTime = `${orderTimeHours}:${orderTimeMin}`
                                                        console.log("smsObj", smsObj)
                                                        var sendShopOwnerSms = await smsTemplates.shopOwnerPlaceOrderSmsForShopOwner(smsObj)
                                                        // console.log("sendShopOwnerSms", sendShopOwnerSms)


                                                        var updateNotifications = {}
                                                        updateNotifications.orderId = orderID
                                                        updateNotifications.ownerId = request.auth.id
                                                        updateNotifications.managerId = request.auth.id
                                                        updateNotifications.salesRepId = ''
                                                        updateNotifications.type = "ORDER PLACED"
                                                        updateNotifications.notifyType = JSON.stringify(['US'])
                                                        updateNotifications.notifyDate = new Date(localTime)
                                                        updateNotifications.activeStatus = 1
                                                        updateNotifications.color = '#aaffa9'
                                                        // updateNotifications.color ='#1FA2FF,#12D8FA,#A6FFCB'
                                                        updateNotifications.notificationMsg = `<p style="font-size: 14px;">Fetch: You have placed an order for <b>${smsObj.totalAmount}</b> at <b>${smsObj.orderTime}</b> with order ID <b>${bookingId}</b>.</p>`
                                                        userProductsModel.saveNotificationsModel(updateNotifications, () => { })




                                                        for (let j = 0; j < salesRepIdsData.length; j++) {
                                                            let balanceAmountForNotification = orderObject.balanceAmount.toFixed(1)
                                                            let orderTimeForNotification = `${orderTimeHours}:${orderTimeMin}`

                                                            var getOnesalesRepForNotification = await userProductsModel.getOnesalesRepForNotification(salesRepIdsData[j])
                                                            console.log("getOnesalesRepForNotification", getOnesalesRepForNotification)
                                                            if (getOnesalesRepForNotification.data.length > 0) {
                                                                var updateNotifications = {}
                                                                updateNotifications.orderId = orderID
                                                                updateNotifications.ownerId = request.auth.id
                                                                updateNotifications.managerId = request.auth.id
                                                                updateNotifications.salesRepId = salesRepIdsData[j]
                                                                updateNotifications.type = "ORDER PLACED"
                                                                updateNotifications.notifyType = JSON.stringify(['SR'])
                                                                updateNotifications.notifyDate = new Date(localTime)
                                                                updateNotifications.activeStatus = 1
                                                                updateNotifications.color = '#f7797d'
                                                                updateNotifications.notificationMsg = `<p style="font-size: 14px;">Fetch: <b>${profile.data[0].shopName}</b> has placed an order for <b>${balanceAmountForNotification}</b> at <b>${orderTimeForNotification}</b> with order ID <b>${bookingId}</b>.</p>`
                                                                userProductsModel.saveNotificationsModel(updateNotifications, () => { })



                                                                var getOnesalesRepForSms = await userProductsModel.getOnesalesRepForSms(salesRepIdsData[j])
                                                                console.log("getOnesalesRepForSms", getOnesalesRepForSms)
                                                                if (getOnesalesRepForSms.error == false) {

                                                                    if (getOnesalesRepForSms.data.length > 0) {
                                                                        let smsObj = {}
                                                                        smsObj.mobileNumber = getOnesalesRepForSms.data[0].mobile
                                                                        smsObj.totalAmount = orderObject.balanceAmount.toFixed(1)
                                                                        smsObj.orderId = bookingId
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
                                                response.orderItemsPDfLink = orderItemsPDfLink
                                                return callback(response)

                                            }
                                        }


                                        // console.log("orderItemsArray", orderItemsArray)

                                    }
                                }
                            } else {
                                response.error = true
                                response.statusCode = STRINGS.successStatusCode
                                response.message = STRINGS.commanErrorString
                                callback(response)
                            }
                        } else {
                            response.error = true
                            response.statusCode = STRINGS.successStatusCode
                            response.message = STRINGS.productOutofStockString
                            callback(response)
                        }
                    } else {
                        response.error = true
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.emptyCartString
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

        this.managerCartList = async (request, callback) => {
            try {
                var response = {}
                var manager = await userProductsModel.managerListModel(request.auth.id)
                var profile = await userProductsModel.profileModel(request.auth.id)
                if (manager.error || profile.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                } else {
                    var Owneraddress = {}
                    Owneraddress.id = profile.data[0].id
                    Owneraddress.name = profile.data[0].name
                    Owneraddress.mobileNumber = profile.data[0].mobileNumber
                    Owneraddress.email = profile.data[0].email
                    Owneraddress.shopName = profile.data[0].shopName
                    Owneraddress.shopAddress = profile.data[0].shopAddress
                    Owneraddress.pincode = profile.data[0].pincode
                    Owneraddress.city = profile.data[0].city
                    Owneraddress.state = profile.data[0].state
                    Owneraddress.longitude = profile.data[0].longitude
                    Owneraddress.latitude = profile.data[0].latitude
                    if (manager.data.length > 0) {
                        var Ids = []
                        manager.data.map(item => {
                            Ids.push(item.id)
                        })
                        var cartList = await userProductsModel.getManagerCartModel(Ids)

                        if (cartList.error) {
                            response.error = true
                            response.statusCode = STRINGS.successStatusCode
                            response.message = STRINGS.commanErrorString
                        } else {
                            response.error = false
                            response.statusCode = STRINGS.successStatusCode
                            response.message = STRINGS.SuccessString
                            response.owneraddress = Owneraddress
                            response.managerCartList = cartList.data
                        }
                    } else {
                        response.error = false
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.SuccessString
                        response.owneraddress = Owneraddress
                        response.managerCartList = []
                    }
                }
            } catch (e) {
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
            }
            callback(response)
        }

        this.otherInstruction = async (request, callback) => {
            try {
                var response = {}
                var Ids = [request.userId]
                var checkCart = await userProductsModel.getManagerCartModel(Ids)
                if (checkCart.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                } else {
                    if (checkCart.data.length > 0) {
                        var update = {}
                        update.userId = request.userId
                        update.barCode = request.barCode
                        update.PVCCovers = request.PVCCovers
                        update.goodsInBulk = request.goodsInBulk
                        update.MRPOnLabels = request.MRPOnLabels
                        update.instruction = request.instruction
                        update.type = 'USER'
                        var checkInstruction = await userProductsModel.checkInstructionModel(request.userId)
                        if (checkInstruction.error) {
                            response.error = true
                            response.statusCode = STRINGS.successStatusCode
                            response.message = STRINGS.commanErrorString
                        } else {
                            if (checkInstruction.data.length > 0) {
                                var save = await userProductsModel.updateOtherInstruction(update)
                            } else {
                                var save = await userProductsModel.addOtherInstruction(update)
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
                console.log(e)
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
            }
            callback(response)
        }

        this.processOrder = async (request, callback) => {
            try {
                var response = {}
                var object = {
                    id: request.auth.id,
                    processOrder: request.isProcess,
                    managerCart: request.cartCount
                }
                var order = await userProductsModel.updateOwnerProfileModel(object)
                if (order.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                } else {
                    var notificationObject = {}
                    notificationObject.notifyType = 'ADDCART'
                    notificationObject.userIds = [request.auth.ownerId]
                    notificationObject.message = 'Manager ' + request.auth.name + ' had added ' + request.cartCount + ' items in the cart'
                    notificationsService.sendProcessOrderNotification(notificationObject, () => { })

                    var updateNotifications = {}
                    updateNotifications.managerId = request.auth.id
                    updateNotifications.ownerId = request.auth.ownerId
                    updateNotifications.cartCount = request.cartCount
                    updateNotifications.type = 'ADDCART'
                    updateNotifications.notifyDate = new Date()
                    updateNotifications.notifyType = JSON.stringify(['US'])

                    userProductsModel.saveNotificationsModel(updateNotifications, () => { })

                    response.error = false
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.updateProcessOrderString
                }
            } catch (e) {
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
            }
            callback(response)
        }

        this.getPaymentList = async (request, callback) => {
            try {
                // console.log("getPaymentList",request.auth)
                var response = {}
                var payment = await userProductsModel.getPaymentListModel()
                var user = await userProductsModel.profileModel(request.auth.ownerId)
                // console.log("user",user)
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
                        console.log("payment", payment)
                        console.log("paymentIds", paymentIds)


                        paymentData.forEach((item, index) => {
                            paymentData[index].isEnable = false
                            if (paymentIds.length > 0) {
                                paymentIds.forEach((pay) => {
                                    if (item.id == pay) {
                                        paymentData[index].isEnable = true
                                    }
                                })
                            }
                            if (index == length - 1) {
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
                console.log("error", e)
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
                callback(response)
            }
        }

        // Search Products
        this.searchProductService = async (request, callback) => {
            try {
                var response = {}
                var count;
                if (request.key === 'PRODUCTS') {
                    var searchAllProductModel = await userProductsModel.searchAllProductModel(request)
                    if (searchAllProductModel.error) {
                        response.error = true
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.commanErrorString
                        callback(response)
                    }
                    count = await utils.pageCount(searchAllProductModel.data.length, 20)
                    var search = await userProductsModel.searchProductModel(request)
                    for (let i = 0; i < search.data.length; i++) {
                        var index = i
                        var item = search.data[i]

                        // Stock Status
                        search.data[index].stockStatus = STRINGS.inStockString
                        search.data[index].productStockCount = search.data[index].defaultQuantity > 0 ? search.data[index].defaultQuantity : search.data[index].productStockCount

                        if (item.productStockCount < item.finishingFast) {
                            search.data[index].stockStatus = STRINGS.finishingFastString
                        }

                        if (item.productStockCount < item.fewStocksLeft) {
                            search.data[index].stockStatus = STRINGS.fewStocksLeftString
                        }

                        if (item.productStockCount == 0 && item.defaultQuantity == 0) {
                            search.data[index].stockStatus = STRINGS.outOfStockString
                        }
                        if (item.productStockCount < item.MOQ && item.defaultQuantity < item.MOQ) {
                            search.data[index].stockStatus = STRINGS.outOfStockString
                        }

                        search.data[index].price = parseInt(search.data[index].price)
                    }
                    console.log("search", search.data)

                } else if (request.key === 'CATEGORY') {
                    var searchAllCategoryModel = await userProductsModel.searchAllCategoryModel(request)

                    if (searchAllCategoryModel.error) {
                        response.error = true
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.commanErrorString
                        callback(response)
                    }
                    count = await utils.pageCount(searchAllCategoryModel.data.length, 20)

                    var search = await searchCategoryServivce(request)
                } else if (request.key === 'SUBCATEGORY') {
                    var searchAllSubcategoryModel = await userProductsModel.searchAllSubcategoryModel(request)
                    if (searchAllSubcategoryModel.error) {
                        response.error = true
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.commanErrorString
                        callback(response)
                    }
                    // console.log("searchSubcategoryModel")
                    count = await utils.pageCount(searchAllSubcategoryModel.data.length, 20)

                    var search = await userProductsModel.searchSubcategoryModel(request)
                } else if (request.key === 'PRODUCTLIST') {
                    var searchAllProductListModel = await userProductsModel.searchAllProductListModel(request)
                    if (searchAllProductListModel.error) {
                        response.error = true
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.commanErrorString
                        callback(response)
                    }



                    count = await utils.pageCount(searchAllProductListModel.data.length, 20)
                    var search = await userProductsModel.searchProductListService(request)
                } else if (request.key === 'EXPLOREPRODUCTS') {
                    var search = await userProductsModel.searchExploreProductService(request)
                    console.log("search", search)
                    count = search.count
                } else if (request.key === 'EXPLORE') {

                    var searchAllExploreModel = await userProductsModel.searchAllExploreModel(request)
                    if (searchAllExploreModel.error) {
                        response.error = true
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.commanErrorString
                        callback(response)
                    }
                    count = await utils.pageCount(searchAllExploreModel.data.length, 20)
                    var search = await userProductsModel.searchExploreModel(request)
                }
                if (search.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                } else {
                    response.error = false
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.SuccessString
                    response.isPriceVisible = request.auth.isPriceVisible
                    response.pageCount = count
                    response.searchData = search.data
                }
            } catch (e) {
                console.log(e)
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
            }
            callback(response)
        }


        // Search Explore
        this.searchExploreProductService = function (data) {
            return new Promise(async function (resolve) {
                var response = {}
                var productIDResponse = await userProductsModel.getProductIDs(data.exploreId)
                if (productIDResponse.error) {
                    response.error = true
                    resolve(response)
                } else if (productIDResponse.data.length > 0) {

                    var Ids = []
                    console.log("productIDResponse***********", productIDResponse)
                    productIDResponse.data.map(item => {
                        Ids.push(item.productId)
                    })
                    data.productIds = Ids
                    var searchAllExploreListModel = await userProductsModel.searchAllExploreListModel(data)
                    if (searchAllExploreListModel.error) {
                        response.error = true
                        resolve(response)
                    }
                    var count = await utils.pageCount(searchAllExploreListModel.data.length, 20)

                    var result = await userProductsModel.searchExploreListModel(data)
                    if (result.error) {
                        response.error = true
                        resolve(response)
                    } else {
                        if (result.data.length > 0) {
                            var products = result.data
                            var length = products.length
                            products.forEach(async function (item, index) {
                                var cart = await userProductsModel.checkMyCartProduct(data.auth.id, item.id)

                                var cartCount = 0
                                var attribute = []
                                var options = []
                                if (cart.data.length > 0) {
                                    var cartCount = cart.data[0].quantity
                                    var attribute = JSON.parse(cart.data[0].attribute)
                                    var options = JSON.parse(cart.data[0].options)
                                }

                                products[index].stockStatus = STRINGS.inStockString
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
                                    response.data = products
                                    response.count = count
                                    resolve(response)
                                }
                            })
                        } else {
                            response.error = false
                            response.data = result.data
                            response.count = 0
                            resolve(response)
                        }
                    }
                } else {
                    response.error = false
                    response.data = []
                    response.count = 0
                    resolve(response)
                }
            })
        }

        // Search product
        this.searchProductListService = function (data) {
            return new Promise(async function (resolve) {
                var response = {}
                var productResponse = await userProductsModel.searchProductListModel(data)
                if (productResponse.error) {
                    response.error = true
                    resolve(response)
                } else {
                    var products = productResponse.data
                    var length = products.length
                    if (length > 0) {
                        products.forEach(async function (item, index) {
                            var cart = await userProductsModel.checkMyCartProduct(data.auth.id, item.id)

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
                                response.data = products
                                resolve(response)
                            }
                        })
                    } else {
                        response.error = false
                        response.data = products
                        resolve(response)
                    }
                }
            })
        }

        // Frequently Bought Products
        this.frequentlyBoughtProducts = async (request, callback) => {
            try {
                var response = {}
                var productResponse = await userProductsModel.getBoughtProducts(request)
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
                            var cart = await userProductsModel.checkMyCartProduct(request.auth.id, item.id)

                            var productNotify = 0;

                            var checkProductNoyifyModel = await userProductsModel.checkProductNoyifyModel(request.auth.customerID, item.productCode)
                            if (checkProductNoyifyModel.error) {
                                response.error = true
                                response.statusCode = STRINGS.successStatusCode
                                response.message = STRINGS.commanErrorString
                                callback(response)
                            } else if (checkProductNoyifyModel.data.length > 0) {
                                productNotify = checkProductNoyifyModel.data[0].productUpdated == 1 ? 0 : 1
                            }
                            products[index].productNotify = productNotify












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

        this.userSearchNameListService = async (request, callback) => {
            try {
                var response = {}
                var params = request.body
                // console.log("request.body.auth",request.body.auth)
                var obj = {
                    depot_id: params.auth.outletId
                }
                var userSearchNameListSModel = await userProductsModel.userSearchNameListSModel(obj)
                if (userSearchNameListSModel.error) {
                    response.error = true
                    response.statusCode = STRINGS.errorStatusCode
                    response.message = STRINGS.commanErrorString
                    callback(response)
                } else {
                    response.error = false
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.SuccessString
                    response.result = userSearchNameListSModel.data
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



        var catalogService = function (data) {
            var response = {}
            return new Promise(async function (resolve, reject) {
                try {

                    var category = await userProductsModel.getCatalogCategoryModel(data)

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
                    // }
                } catch (e) {
                    console.log("catalog service error", e)
                    response.error = true
                    response.statusCode = STRINGS.errorStatusCode
                    response.message = STRINGS.oopsErrorMessage
                    resolve(response)
                }

            })
        }


        var newsFeedService = function (data) {
            return new Promise(async function (resolve, reject) {
                var response = {}
                var userId = data.auth.id
                var feed = await userProductsModel.getAllFeedModel()
                if (feed.error) {
                    console.log("newsFeedService service error")
                    response.error = true
                    reject(response)
                } else {
                    var feedList = feed.data
                    var length = feedList.length
                    data.pageCount = 10
                    var pageCount = await utils.pageCount(length, 10)
                    var feedPage = await userProductsModel.getFeedModel(data)
                    if (length > 0) {
                        var myfeed = feedPage.data
                        var feedLength = myfeed.length
                        if (feedLength > 0) {
                            myfeed.forEach(async function (item, index) {
                                var isLike = await userProductsModel.checkLikeModel(userId, item.id)
                                var isCount = await userProductsModel.getLikesCount(item.id)
                                myfeed[index].isLike = isLike.data
                                myfeed[index].isLikeCount = isCount.data[0].likesCount
                                if (--feedLength === 0) {
                                    response.error = false
                                    response.feedPage = pageCount
                                    response.feedList = myfeed
                                    resolve(response)
                                }
                            })
                        } else {
                            response.error = false
                            response.feedPage = 0
                            response.feedList = myfeed
                            resolve(response)
                        }
                    } else {
                        response.error = false
                        response.feedPage = 0
                        response.feedList = feedList
                        resolve(response)
                    }
                }
            })
        }


        var newArrivalService = function (data) {
            return new Promise(async function (resolve, reject) {
                try {
                    var response = {}
                    // console.log("products new arrivals data", data.auth)
                    var result = await userProductsModel.newArrivals(data)
                    // console.log("newArrivalService",result)
                    if (result.error) {
                        console.log("newArrivalService service error")
                        response.error = true
                        reject(response)
                    } else {
                        if (result.data.length > 0) {
                            var products = result.data
                            var length = products.length
                            products.forEach(async function (item, index) {
                                // User discount calculation
                                // if (data.auth.isEnableDiscount === 1) {
                                //   var discountObject = { userId: data.auth.id, productId: item.id }
                                //   var discountValue = await userProductsModel.userProductDiscountOption(discountObject)
                                //   if (discountValue.data) {
                                //     products[index].discount = discountValue.data.discount
                                //     products[index].price = item.MRP - (item.MRP * (discountValue.data.discount / 100))
                                //   }
                                // }

                                // Stock Status
                                products[index].stockStatus = STRINGS.inStockString
                                item.productStockCount = item.defaultQuantity > 0 ? item.defaultQuantity : item.productStockCount


                                if (item.productStockCount < item.finishingFast) {
                                    products[index].stockStatus = STRINGS.finishingFastString
                                }

                                if (item.productStockCount < item.fewStocksLeft) {
                                    products[index].stockStatus = STRINGS.fewStocksLeftString
                                }

                                if (item.productStockCount == 0) {
                                    products[index].stockStatus = STRINGS.outOfStockString
                                }
                                if (item.productStockCount < item.MOQ) {
                                    products[index].stockStatus = STRINGS.outOfStockString
                                }
                                var cart = await userProductsModel.checkMyCartProduct(data.auth.id, item.id)

                                var productNotify = 0;

                                var checkProductNoyifyModel = await userProductsModel.checkProductNoyifyModel(data.auth.customerID, item.productCode)
                                if (checkProductNoyifyModel.error) {
                                    response.error = true
                                    response.statusCode = STRINGS.successStatusCode
                                    response.message = STRINGS.commanErrorString
                                    callback(response)
                                } else if (checkProductNoyifyModel.data.length > 0) {
                                    productNotify = checkProductNoyifyModel.data[0].productUpdated == 1 ? 0 : 1
                                }
                                products[index].productNotify = productNotify






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
                        } else {
                            response.error = false
                            response.data = result.data
                            resolve(response)
                        }
                    }
                } catch (e) {
                    console.log("newArrivalService service error", e)
                    response.error = true
                    response.statusCode = STRINGS.errorStatusCode
                    response.message = STRINGS.oopsErrorMessage
                    resolve(response)
                }
            })
        }


        var exploreListService = function (data) {
            return new Promise(async function (resolve, reject) {
                try {
                    var response = {}
                    var list = await userProductsModel.getAllExploreList()
                    if (list.error) {
                        console.log("exploreListService error")
                        response.error = true
                        reject(response)
                    } else {
                        var exploreList = list.data
                        data.pageCount = 10
                        if (exploreList.length > 0) {
                            var count = await utils.pageCount(exploreList.length, 10)
                            var exploreResponse = await userProductsModel.getExploreListModel(data)
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



        var myCartInfo = function (userId, auth) {
            return new Promise(async function (resolve, reject) {
                var response = {}
                var cart = await userProductsModel.getCardItems(userId, auth)
                if (cart.error) {
                    console.log("myCartInfo error")
                    response.error = true
                    reject(response)
                } else {
                    // 1 - ownerCart
                    // 2 - managerCart
                    // 3 - managerCart empty
                    var cartItems = cart.data
                    console.log("cartItems", cartItems)
                    if (cartItems.length > 0) {
                        var cartAmount = await userProductsModel.getCardTotalSumValue(userId, auth)
                        if (cartAmount.error) {
                            console.log("myCartInfo error")
                            response.error = true
                            reject(response)
                        } else {
                            console.log("cartAmount", cartAmount)
                            response.error = false
                            response.isCartValue = 1
                            response.cartCount = cartItems.length
                            response.cartAmount = cartAmount.data[0].finaltotal + cartAmount.data[0].gsttotal
                            resolve(response)
                        }
                    } else {
                        var manager = await userProductsModel.managerListModel(userId)
                        if (manager.error) {
                            console.log("myCartInfo error")
                            response.error = true
                            reject(response)
                        } else {
                            if (manager.data.length > 0) {
                                var Ids = []
                                manager.data.map(item => {
                                    Ids.push(item.id)
                                })
                                var checkManager = await userProductsModel.getManagerCartModel(Ids)
                                if (checkManager.error) {
                                    console.log("myCartInfo error")
                                    response.error = true
                                    reject(response)
                                } else {
                                    if (checkManager.data.length > 0) {
                                        response.error = false
                                        response.isCartValue = 2
                                        response.cartCount = checkManager.data.length
                                        response.cartAmount = 0
                                        resolve(response)
                                    } else {
                                        response.error = false
                                        response.isCartValue = 3
                                        response.cartCount = checkManager.data.length
                                        response.cartAmount = 0
                                        resolve(response)
                                    }
                                }
                            } else {
                                response.error = false
                                response.isCartValue = 3
                                response.cartCount = 0
                                response.cartAmount = 0
                                resolve(response)
                            }
                        }
                    }
                }
            })
        }


        var myCartDetails = function (userId, auth) {
            return new Promise(async function (resolve, reject) {
                var response = {}
                var cart = await userProductsModel.getCardItems(userId, auth)
                console.log("getCardItems", cart)
                if (cart.error) {
                    response.error = true
                    reject(response)
                } else {
                    var cartItems = cart.data
                    if (cartItems.length > 0) {
                        var cartAmount = await userProductsModel.getCardTotalSumValue(userId, auth)
                        console.log("cartAmount", cartAmount)

                        if (cartAmount.error) {
                            response.error = true
                            reject(response)
                        } else {
                            response.error = false
                            response.cartCount = cartItems.length
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



        // Referral Calculation
        var referralCalculation = function (userId, total) {
            return new Promise(async function (resolve) {
                var response = {}
                var user = await userProductsModel.profileModel(userId)
                if (user.error) {
                    response.error = true
                    resolve(response)
                } else {
                    var referralamt = user.data[0].bonusPoint
                    var isreferral = false
                    var amount = 0
                    if (referralamt !== 0) {
                        var isreferral = true
                        var amount = total * 15 / 100
                        if (amount >= referralamt) {
                            var amount = referralamt
                            // var isreferral = true
                        }
                    }
                    response.error = false
                    response.referral = isreferral
                    response.discount = amount
                    response.referralAmount = referralamt
                    response.cashOnCarry = user.data[0].cashOnCarry
                    response.creditLimit = user.data[0].creditFixedtLimit
                    // response.availableCreditAmount = user.data[0].creditLimit
                    resolve(response)
                }
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

                var search = await userProductsModel.searchCategoryModel(data)

                if (search.error) {
                    response.error = true
                    resolve(response)
                } else {
                    if (search.data.length > 0) {
                        var length = search.data.length
                        var categoryList = search.data
                        categoryList.forEach(async function (item, index) {
                            var subcategory = await userProductsModel.findSubcategory(item.id)
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

        this.userClearAllCartProductsService = async (request, callback) => {
            try {
                var response = {}
                var params = request.body
                // console.log("request auth ", params.auth)



                request.body.userId = params.auth.id
                // console.log("request.body.user_id ", request.body.user_id)
                var userClearAllCartProductsModel = await userProductsModel.userClearAllCartProductsModel(request)
                // var updateUserDepotModel = {}
                let removeInstructions = await userProductsModel.removeInstructions(request.body.userId)

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

        //notifyme flow apis
        this.addProductNotifyService = async (request, callback) => {
            try {
                var response = {}
                var obj = {
                    customerID: request.body.auth.customerID,
                    productCode: request.body.productCode,
                    productUpdated: 0
                }
                let checkProductAlreadyNotify = await userProductsModel.checkProductAlreadyNotify(obj)
                if (checkProductAlreadyNotify.error) {
                    response.error = true
                    response.statusCode = STRINGS.errorStatusCode
                    response.message = STRINGS.commanErrorString
                    callback(response)
                } else {
                    if (checkProductAlreadyNotify.data.length == 0) {

                        var addProductNotifyModel = await userProductsModel.addProductNotifyModel(obj)
                        // console.log(addProductNotifyModel)
                        if (addProductNotifyModel.error) {
                            response.error = true
                            response.statusCode = STRINGS.successStatusCode
                            response.message = STRINGS.commanErrorString
                            callback(response)
                        } else {

                            response.error = false
                            response.statusCode = STRINGS.successStatusCode
                            response.message = STRINGS.SuccessString
                            // response.data = addProductNotifyModel.data
                            callback(response)
                        }
                    } else if (checkProductAlreadyNotify.data[0].isCancelled == 1) {

                        var localTime = new Date().toLocaleString(undefined, { timeZone: 'Asia/Kolkata' });
                        obj.createdAt = new Date(localTime)
                        obj.updatedAt = new Date(localTime)

                        let updateProductNotifyModel = await userProductsModel.updateProductNotifyModel(obj)
                        // console.log(addProductNotifyModel)
                        if (updateProductNotifyModel.error) {
                            response.error = true
                            response.statusCode = STRINGS.successStatusCode
                            response.message = STRINGS.commanErrorString
                            callback(response)
                        }
                        else {
                            response.error = false
                            response.statusCode = STRINGS.successStatusCode
                            response.message = STRINGS.SuccessString
                            // response.data = addProductNotifyModel.data
                            callback(response)
                        }
                    } else {
                        response.error = true
                        response.statusCode = STRINGS.successStatusCode
                        response.message = "Product already added in notify list"
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




        this.cancelProductNotifyService = async (request, callback) => {

            try {
                var response = {}
                var obj = {
                    customerID: request.body.auth.customerID,
                    productCode: request.body.productCode,
                    productUpdated: 0
                }
                var cancelProductNotifyModel = await userProductsModel.cancelProductNotifyModel(obj)
                // console.log(addProductNotifyModel)
                if (cancelProductNotifyModel.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                    callback(response)
                } else {

                    response.error = false
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.SuccessString
                    // response.data = addProductNotifyModel.data
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



        this.productsCartBulkUploadService = async (request, callback) => {
            try {
                var localTime = new Date().toLocaleString(undefined, { timeZone: 'Asia/Kolkata' });

                var response = {}
                var params = request.body
                // console.log("request auth ", params.auth)
                // var rawdata = fs.readFileSync(`/var/www/europet_backend/${request.body.file_path}`)

                // Reading our test file
                // const file = reader.readFile('./fetch.xlsx')
                const file = reader.readFile(`${process.env.UPLOAD_PATH}${request.body.file_path}`)
                console.log("file path", request.body.file_path)

                request.body.userId = params.auth.id
                // console.log("request.body.user_id ", request.body.user_id)
                var userClearAllCartProductsModel = await userProductsModel.userClearAllCartProductsModel(request)
                let removeInstructions = await userProductsModel.removeInstructions(request.body.userId)

                if (userClearAllCartProductsModel.error || removeInstructions.error) {
                    response.error = true
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.commanErrorString
                    return callback(response)
                }

                let data = []
                const sheets = file.SheetNames
                var temp = reader.utils.sheet_to_json(file.Sheets[file.SheetNames[0]])
                console.log("temp", temp)
                if (temp.length > 0) {

                    var failedColumns = [];
                    let failedProducts = [];

                    var addCartItems = []

                    //ned to remvoe duplicate products using productCode in temp array and then add products in cart
                    var temp1 = []
                    for (let i = 0; i < temp.length; i++) {
                        var item = temp[i]
                        console.log("item", item)
                        // item.orderQty = item.orderQty == 0 || item.orderQty == undefined  ? 0 : item.orderQty
                        if (item.productCode && item.productName && item.orderQty && item.minOrderQty) {
                            if (temp1.length == 0) {
                                temp1.push(item)
                            } else {
                                var found = false
                                for (let j = 0; j < temp1.length; j++) {
                                    var item1 = temp1[j]
                                    if (item.productCode == item1.productCode) {
                                        found = true
                                        break
                                    }
                                }
                                if (!found) {
                                    temp1.push(item)
                                }
                            }
                        }
                    }
                    console.log("temp1", temp1)

                    temp = temp1

                    for (let i = 0; i < temp.length; i++) {
                        var item = temp[i]

                        if (
                            item.productCode &&
                            item.productName &&
                            item.orderQty &&
                            item.minOrderQty
                        ) {

                            request.body.productCode = item.productCode
                            var product = await userProductsModel.checkProductCodeModel(request.body)
                            // console.log("product", product)
                            if (product.error) {
                                response.error = true
                                response.statusCode = STRINGS.successStatusCode
                                response.message = STRINGS.commanErrorString
                                return callback(response)
                            } else if (product.data.length == 0 || typeof item.orderQty != "number" || typeof item.orderQty == "string" || item.productCode == 0 || item.productCode == null
                                || item.orderQty < 0) {

                                if (typeof item.orderQty != "number" || typeof item.orderQty == "string" || item.orderQty < 0) {
                                    // console.log(item.orderQty, "MOQ", typeof item.orderQty)
                                    let obj = {}
                                    obj.columnName = 'orderQty'
                                    obj.productCode = item.productCode
                                    obj['Sl_No'] = item['Sl.No']
                                    obj.reason = `${obj.columnName} Should be Number.Special Characters or Symbols Not Allowed`
                                    failedColumns.push(obj)
                                }
                                if (product.data.length == 0) {
                                    var obj = {}
                                    obj.columnName = 'productCode'
                                    obj['Sl_No'] = item['Sl.No']
                                    obj.productCode = item.productCode
                                    obj.reason = `invalid ProductCode ${item.productCode}`
                                    failedColumns.push(obj)
                                }
                                //   if (typeof item.orderQty != "string") {
                                //     console.log(item.orderQty, "string", typeof item.orderQty)
                                //     var obj = {}
                                //     obj.columnName = 'orderQty'
                                //     obj.reason = `${obj.columnName} Should be Number.Special Characters or Symbols Not Allowed`
                                //     failedColumns.push(obj)
                                //   }
                                //   if (item.productCode == 0) {
                                //     // console.log(item.productCode, "productCode", typeof item.productCode)
                                //     var obj = {}
                                //     obj.columnName = 'productCode'
                                //     obj.reason = `${obj.columnName} Should be Correct Value`
                                //     failedColumns.push(obj)
                                //   }
                                //   if (item.productCode == null) {
                                //     // console.log(item.productCode, "maxQty", typeof item.maxQty)
                                //     var obj = {}
                                //     obj.columnName = 'productCode'
                                //     obj.reason = `${obj.columnName} Should be Correct Value`
                                //     failedColumns.push(obj)
                                //   }



                                if (temp.length - 1 == i) {
                                    console.log("addCartItems", addCartItems)

                                    if (addCartItems.length > 0) {
                                        await userProductsModel.bulkInsertCartItems(addCartItems)
                                        request.body.cartDate = new Date(localTime)
                                        userProductsModel.updateCartaddedDate(request.body, () => { })

                                        await unlinkFile(`${process.env.UPLOAD_PATH}${request.body.file_path}`)
                                        response.error = false
                                        response.statusCode = STRINGS.successStatusCode
                                        response.message = STRINGS.SuccessString
                                        response.failedColumns = failedColumns
                                        return callback(response)
                                    } else {
                                        await unlinkFile(`${process.env.UPLOAD_PATH}${request.body.file_path}`)
                                        response.error = false
                                        response.statusCode = STRINGS.successStatusCode
                                        response.message = STRINGS.SuccessString
                                        response.failedColumns = failedColumns
                                        return callback(response)
                                    }

                                }


                            } else {
                                let stockCount = product.data[0].productStockCount
                                let defaultQuantity = product.data[0].defaultQuantity
                                stockCount = defaultQuantity > 0 ? defaultQuantity : stockCount


                                let orderQuantity;

                                let minOrderQty = parseInt(product.data[0].MOQ)
                                let maxQty = parseInt(product.data[0].maxQty)
                                request.body.quantity = item.orderQty
                                let addQty = parseInt(request.body.quantity)
                                console.log("addQty", addQty)

                                let nearestQuantity = Math.round(addQty / minOrderQty) * minOrderQty;
                                console.log("nearestQuantity", nearestQuantity)

                                let freeQty = 0
                                // let add_extra_quantity = parseInt(addQty) + parseInt()
                                if (product.data[0].productOfferX != 0) {
                                    if (nearestQuantity >= product.data[0].productOfferX) {
                                        freeQty = Math.floor(nearestQuantity / product.data[0].productOfferX) * product.data[0].productOfferY - 1
                                    }
                                }
                                var addQuantity;
                                console.log("freeQty1", freeQty)
                                addQuantity = parseInt(nearestQuantity) + parseInt(freeQty)
                                console.log("addQuantity", addQuantity, nearestQuantity, freeQty, stockCount, maxQty)
                                orderQuantity = addQuantity
                                if (maxQty != 0) {
                                    if (addQuantity > stockCount || addQuantity > maxQty) {
                                        orderQuantity = maxQty < addQuantity ? maxQty : addQuantity
                                        orderQuantity = orderQuantity > stockCount ? stockCount : orderQuantity
                                        let freeQty = 0
                                        if (product.data[0].productOfferX != 0) {
                                            if (orderQuantity >= product.data[0].productOfferX) {
                                                freeQty = Math.floor(orderQuantity / product.data[0].productOfferX) * product.data[0].productOfferY - 1
                                            }
                                        }
                                        //write code for adding quantity to free quantity
                                        console.log("final quantity", orderQuantity, freeQty)
                                        orderQuantity = parseInt(orderQuantity) - parseInt(freeQty)

                                    } else {
                                        orderQuantity = parseInt(nearestQuantity)
                                    }
                                } else {
                                    console.log("addQuantity and stock")
                                    if (addQuantity > stockCount) {

                                        let freeQty = 0
                                        if (product.data[0].productOfferX != 0) {
                                            if (orderQuantity >= product.data[0].productOfferX) {
                                                freeQty = Math.floor(orderQuantity / product.data[0].productOfferX) * product.data[0].productOfferY - 1
                                            }
                                        }
                                        orderQuantity = parseInt(orderQuantity) - parseInt(freeQty)

                                    } else {
                                        console.log("normal quantity")
                                        orderQuantity = parseInt(nearestQuantity)
                                    }
                                }




                                let object = {
                                    userId: request.body.userId,
                                    productId: product.data[0].id,
                                    quantity: Math.abs(orderQuantity),
                                    attribute: '[]',
                                    options: '[]',
                                    cartType: 'USER'
                                }
                                addCartItems.push(object)
                                // response.error = true
                                // response.statusCode = STRINGS.errorStatusCode
                                // response.message = `invalid ProductCode ${res.product_code}`
                                // return callback(response)


                                if (temp.length - 1 == i) {

                                    console.log("success addCartItems", addCartItems)
                                    await userProductsModel.bulkInsertCartItems(addCartItems)
                                    request.body.cartDate = new Date(localTime)
                                    userProductsModel.updateCartaddedDate(request.body, () => { })

                                    await unlinkFile(`${process.env.UPLOAD_PATH}${request.body.file_path}`)
                                    response.error = false
                                    response.statusCode = STRINGS.successStatusCode
                                    response.message = STRINGS.SuccessString
                                    response.failedColumns = failedColumns
                                    return callback(response)
                                }
                            }

                        } else {

                            if (!item.productCode) {
                                var obj = {}
                                obj.columnName = 'productCode'
                                obj['Sl_No'] = item['Sl.No']
                                obj.productCode = item.productCode
                                obj.reason = `${obj.columnName} is Empty Or Invalid`
                                failedColumns.push(obj)
                            }
                            if (!item.productName) {
                                var obj = {}
                                obj.columnName = 'productName'
                                obj['Sl_No'] = item['Sl.No']
                                obj.productCode = item.productCode
                                obj.reason = `${obj.columnName} is Empty Or Invalid`
                                failedColumns.push(obj)
                            }
                            if (!item.orderQty) {
                                var obj = {}
                                obj.columnName = 'orderQty'
                                obj['Sl_No'] = item['Sl.No']
                                obj.productCode = item.productCode
                                obj.reason = `${obj.columnName} is Empty Or Invalid`
                                failedColumns.push(obj)
                            }
                            if (!item.minOrderQty) {
                                var obj = {}
                                obj.columnName = 'minOrderQty'
                                obj['Sl_No'] = item['Sl.No']
                                obj.productCode = item.productCode
                                obj.reason = `${obj.columnName} is Empty Or Invalid`
                                failedColumns.push(obj)
                            }
                            // console.log("failedColumns", failedColumns)



                            await unlinkFile(`${process.env.UPLOAD_PATH}${request.body.file_path}`)
                            response.error = false
                            response.statusCode = STRINGS.successStatusCode
                            response.message = STRINGS.SuccessString
                            response.failedColumns = failedColumns
                            return callback(response)



                        }

                    }


                } else {
                    response.error = false
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.SuccessString
                    // response.data = InsertAllUsersDao
                    return callback(response)
                }

            } catch (e) {
                console.log(e)
                response.error = true
                response.statusCode = STRINGS.errorStatusCode
                response.message = STRINGS.oopsErrorMessage
                return callback(response)
            }
        }


     
      



    }
}




export default UserProductsService;