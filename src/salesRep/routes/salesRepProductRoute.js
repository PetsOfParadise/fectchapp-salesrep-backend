import express from "express";
import passport from 'passport'

import { check, validationResult } from "express-validator";
import SalesRepProductService from "../service/salesRepProductService";

const salesRepProductService = new SalesRepProductService





const failureRedirect = process.env.FAILUREREDIRECT
const router = express.Router();

router.post('/homeProducts', passport.authenticate('jwt', { session: false, failureRedirect: failureRedirect }), [
    check('shopId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('shopId is empty'),
    check('pageNumber').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('pageNumber is empty')
  ], (request, response) => {
    const errors = validationResult(request)
    if (!errors.isEmpty()) {
      var errorArray = errors.array()
      var errorResponse = {}
      errorResponse.error = true
      errorResponse.message = errorArray[0].msg
      return response.send(errorResponse)
    }
    request.body.auth = request.user
    salesRepProductService.homeProductService(request.body, function (results) {
      return response.send(results)
    })
  })

  router.post('/frequentlyBoughtProducts', passport.authenticate('jwt', { session: false, failureRedirect: failureRedirect }), [
    check('userId').trim().exists().isLength({ min: 1 }).withMessage('userId pageNumber'),
  ], (request, response) => {
    const errors = validationResult(request)
    if (!errors.isEmpty()) {
      var errorArray = errors.array()
      var errorResponse = {}
      errorResponse.error = true
      errorResponse.message = errorArray[0].msg
      return response.send(errorResponse)
    }
    request.body.auth = request.user
    salesRepProductService.frequentlyBoughtProductsService(request.body, function (results) {
      return response.send(results)
    })
  })


  router.post('/viewExplore', passport.authenticate('jwt', { session: false, failureRedirect: failureRedirect }), [
    check('pageNumber').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('pageNumber is empty')
  ], (request, response) => {
    const errors = validationResult(request)
    if (!errors.isEmpty()) {
      var errorArray = errors.array()
      var errorResponse = {}
      errorResponse.error = true
      errorResponse.message = errorArray[0].msg
      return response.send(errorResponse)
    }
    request.body.auth = request.user
    salesRepProductService.salesRepExploreList(request.body, function (results) {
      return response.send(results)
    })
  })


  router.post('/addCart', [
    check('productId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('invalid productId'),
    check('quantity').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('invalid quantity'),
    check('shopId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('invalid shopId'),
    check('key').isIn(['1', '0']).withMessage('Invalid key'),
    check('isEdit').isIn(['1', '0']).withMessage('Invalid key'),
    check('attribute').trim().exists().isLength({ min: 1 }).withMessage('invalid attribute'),
    check('options').trim().exists().isLength({ min: 1 }).withMessage('invalid options')
  ], passport.authenticate('jwt', { session: false, failureRedirect: failureRedirect }), (request, response) => {
    const errors = validationResult(request)
    if (!errors.isEmpty()) {
      var errorArray = errors.array()
      var errorResponse = {}
      errorResponse.error = true
      errorResponse.message = errorArray[0].msg
      return response.send(errorResponse)
    }
    request.body.auth = request.user
    salesRepProductService.salesRepAddCartService(request.body, function (results) {
      return response.send(results)
    })
  })



  router.post('/viewCart', [
    check('shopId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid shopId')
    // ,check('page').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid pageNumber')
  ], passport.authenticate('jwt', { session: false, failureRedirect: failureRedirect }), (request, response) => {
    const errors = validationResult(request)
    if (!errors.isEmpty()) {
      var errorArray = errors.array()
      var errorResponse = {}
      errorResponse.error = true
      errorResponse.message = errorArray[0].msg
      response.send(errorResponse)
    } else {
      request.body.auth = request.user
      salesRepProductService.salesRepviewCartDetails(request.body, function (results) {
        response.send(results)
      })
    }
  })


  router.post('/viewCartPage', [
    check('shopId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid shopId')
    , check('page').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid pageNumber')
  ], passport.authenticate('jwt', { session: false, failureRedirect: failureRedirect }), (request, response) => {
    const errors = validationResult(request)
    if (!errors.isEmpty()) {
      var errorArray = errors.array()
      var errorResponse = {}
      errorResponse.error = true
      errorResponse.message = errorArray[0].msg
      response.send(errorResponse)
    } else {
      request.body.auth = request.user
      salesRepProductService.salesRepviewCartByPageDetails(request.body, function (results) {
        response.send(results)
      })
    }
  })


  router.post('/deleteCart', [
    check('cartId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid cartId'),
    check('shopId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid shopId')
  ], passport.authenticate('jwt', { session: false, failureRedirect: failureRedirect }), (request, response) => {
    const errors = validationResult(request)
    if (!errors.isEmpty()) {
      var errorArray = errors.array()
      var errorResponse = {}
      errorResponse.error = true
      errorResponse.message = errorArray[0].msg
      response.send(errorResponse)
    } else {
      request.body.auth = request.user
      salesRepProductService.salesRepDeleteCart(request.body, function (results) {
        response.send(results)
      })
    }
  })


  router.post('/placeOrder', [
    check('shopId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid shopId'),
    check('managerId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid managerId'),
    check('paymentId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid paymentId')
  ], passport.authenticate('jwt', { session: false, failureRedirect: failureRedirect }), (request, response) => {
    const errors = validationResult(request)
    if (!errors.isEmpty()) {
      var errorArray = errors.array()
      var errorResponse = {}
      errorResponse.error = true
      errorResponse.message = errorArray[0].msg
      return response.send(errorResponse)
    }
    request.body.auth = request.user
    salesRepProductService.salesRepPlaceOrder(request.body, function (results) {
      return response.send(results)
    })
  })

  router.post('/productList', [
    check('shopId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid shopId'),
    check('sortBy').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid sortBy'),
    check('minPrice').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid minPrice'),
    check('maxPrice').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid maxPrice'),
    check('optionsIds').trim().exists().isLength({ min: 1 }).withMessage('Invalid optionsIds'),
    check('categoryId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('invalid categoryId'),
    check('subcategoryId').trim().exists().isLength({ min: 1 }).withMessage('invalid subcategoryId'),
    check('pageNumber').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('invalid subcategoryId'),
    check('isSubcategory').isIn(['1', '0']).withMessage('Invalid Status')
  ], passport.authenticate('jwt', { session: false, failureRedirect: failureRedirect }), (request, response) => {
    const errors = validationResult(request)
    if (!errors.isEmpty()) {
      var errorArray = errors.array()
      var errorResponse = {}
      errorResponse.error = true
      errorResponse.message = errorArray[0].msg
      return response.send(errorResponse)
    }
    request.body.auth = request.user
    salesRepProductService.salesRepProductList(request.body, function (results) {
      return response.send(results)
    })
  })

  router.post('/viewNewArrival', passport.authenticate('jwt', { session: false, failureRedirect: failureRedirect }), [
    check('pageNumber').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('pageNumber is empty'),
    check('shopId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('shopId is empty')
  ], (request, response) => {
    const errors = validationResult(request)
    if (!errors.isEmpty()) {
      var errorArray = errors.array()
      var errorResponse = {}
      errorResponse.error = true
      errorResponse.message = errorArray[0].msg
      return response.send(errorResponse)
    }
    request.body.auth = request.user
    salesRepProductService.salesRepViewNewArrival(request.body, function (results) {
      return response.send(results)
    })
  })

  router.post('/viewExploreProducts', [
    check('shopId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid shopId'),
    check('sortBy').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid sortBy'),
    check('minPrice').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid minPrice'),
    check('maxPrice').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid maxPrice'),
    check('optionsIds').trim().exists().isLength({ min: 1 }).withMessage('Invalid optionsIds'),
    check('pageNumber').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('invalid pageNumber'),
    check('exploreId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('invalid exploreId')
  ], passport.authenticate('jwt', { session: false, failureRedirect: failureRedirect }), (request, response) => {
    const errors = validationResult(request)
    if (!errors.isEmpty()) {
      var errorArray = errors.array()
      var errorResponse = {}
      errorResponse.error = true
      errorResponse.message = errorArray[0].msg
      return response.send(errorResponse)
    }
    request.body.auth = request.user
    salesRepProductService.salesRepExploreProducts(request.body, function (results) {
      return response.send(results)
    })
  })

  router.post('/viewFeatureProducts', passport.authenticate('jwt', { session: false, failureRedirect: failureRedirect }), [
    check('pageNumber').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('pageNumber is empty'),
    check('shopId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('shopId is empty')
  ], (request, response) => {
    const errors = validationResult(request)
    if (!errors.isEmpty()) {
      var errorArray = errors.array()
      var errorResponse = {}
      errorResponse.error = true
      errorResponse.message = errorArray[0].msg
      return response.send(errorResponse)
    }
    request.body.auth = request.user
    salesRepProductService.salesRepFeatureProducts(request.body, function (results) {
      return response.send(results)
    })
  })





  router.post('/viewProduct', passport.authenticate('jwt', { session: false, failureRedirect: failureRedirect }), [
    check('productId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('productId is empty'),
    check('shopId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('shopId is empty')
  ], (request, response) => {
    const errors = validationResult(request)
    if (!errors.isEmpty()) {
      var errorArray = errors.array()
      var errorResponse = {}
      errorResponse.error = true
      errorResponse.message = errorArray[0].msg
      return response.send(errorResponse)
    }
    request.body.auth = request.user
    salesRepProductService.salesRepViewProduct(request.body, function (results) {
      return response.send(results)
    })
  })



  router.post('/searchProduct', [
    check('text').trim().exists().isLength({ min: 1 }).withMessage('Invalid text'),
    check('key').isIn(['PRODUCTS', 'SUBCATEGORY', 'CATEGORY', 'PRODUCTLIST', 'EXPLORE', 'EXPLOREPRODUCTS']).withMessage('Invalid key'),
    check('categoryId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid categoryId'),
    check('subcategoryId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid subcategoryId'),
    check('exploreId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid exploreId'),
    check('shopId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('shopId is empty')
  ], passport.authenticate('jwt', { session: false, failureRedirect: failureRedirect }), (request, response) => {
    const errors = validationResult(request)
    if (!errors.isEmpty()) {
      var errorArray = errors.array()
      var errorResponse = {}
      errorResponse.error = true
      errorResponse.message = errorArray[0].msg
      return response.send(errorResponse)
    }
    request.body.auth = request.user
    salesRepProductService.salesRepSearchProductService(request.body, function (results) {
      return response.send(results)
    })
  })



  router.post('/userSettings', passport.authenticate('jwt', { session: false, failureRedirect: failureRedirect }), [
    check('shopId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('shopId is empty')
  ], (request, response) => {
    const errors = validationResult(request)
    if (!errors.isEmpty()) {
      var errorArray = errors.array()
      var errorResponse = {}
      errorResponse.error = true
      errorResponse.message = errorArray[0].msg
      return response.send(errorResponse)
    }
    request.body.auth = request.user
    salesRepProductService.salesRepUserSettings(request.body, function (results) {
      return response.send(results)
    })
  })



  router.post('/otherInstruction', [
    check('shopId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid shopId'),
    check('barCode').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid barCode'),
    check('PVCCovers').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid PVCCovers'),
    check('goodsInBulk').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid goodsInBulk'),
    check('MRPOnLabels').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid MRPOnLabels'),
    check('instruction').optional({ checkFalsy: true }).isLength({ min: 1 }).withMessage('instruction is Empty')
  ], passport.authenticate('jwt', { session: false, failureRedirect: failureRedirect }), (request, response) => {
    const errors = validationResult(request)
    if (!errors.isEmpty()) {
      var errorArray = errors.array()
      var errorResponse = {}
      errorResponse.error = true
      errorResponse.message = errorArray[0].msg
      return response.send(errorResponse)
    }
    request.body.auth = request.user
    salesRepProductService.salesRepOtherInstruction(request.body, function (results) {
      return response.send(results)
    })
  })



  router.post('/getPaymentList', passport.authenticate('jwt', { session: false, failureRedirect: failureRedirect }), [
    check('ownerId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('ownerId is empty')
  ], (request, response) => {
    const errors = validationResult(request)
    if (!errors.isEmpty()) {
      var errorArray = errors.array()
      var errorResponse = {}
      errorResponse.error = true
      errorResponse.message = errorArray[0].msg
      return response.send(errorResponse)
    }
    request.body.auth = request.user
    salesRepProductService.salesRepPaymentMode(request.body, function (results) {
      return response.send(results)
    })
  })

  router.post('/getSubCategoryList', [
    check('user_id').trim().exists().isLength({ min: 1 }).withMessage('user_id is Empty'),
    check('categoryId').trim().exists().isLength({ min: 1 }).withMessage('categoryId is Empty'),
  ], passport.authenticate('jwt', { session: false, failureRedirect: failureRedirect }), (request, response) => {
    const errors = validationResult(request)
    if (!errors.isEmpty()) {
      var errorArray = errors.array()
      var errorResponse = {}
      errorResponse.error = true
      errorResponse.message = errorArray[0].msg
      return response.send(errorResponse)
    }
    request.body.auth = request.user
    salesRepProductService.SalesRepGetSubCategoryList(request.body, function (results) {
      return response.send(results)
    })
  })


  router.get('/getCatgoryList', passport.authenticate('jwt', { session: false, failureRedirect: failureRedirect }), (request, response) => {
    const errors = validationResult(request)
    if (!errors.isEmpty()) {
      var errorArray = errors.array()
      var errorResponse = {}
      errorResponse.error = true
      errorResponse.message = errorArray[0].msg
      response.send(errorResponse)
    } else {
      request.body.auth = request.user
      salesRepProductService.getUserCatgoryList(request.body, function (results) {
        response.send(results)
      })
    }
  })


  router.post('/updateOrderStatus', [
    check('orderId').trim().exists().isLength({ min: 1 }).withMessage('orderId is Empty'),
    check('status').trim().exists().isLength({ min: 1 }).withMessage('status is Empty')
  ], passport.authenticate('jwt', { session: false, failureRedirect: failureRedirect }), (request, response) => {
    const errors = validationResult(request)
    if (!errors.isEmpty()) {
      var errorArray = errors.array()
      var errorResponse = {}
      errorResponse.error = true
      errorResponse.message = errorArray[0].msg
      return response.send(errorResponse)
    }
    request.body.auth = request.user
    salesRepProductService.updateOrderStatus(request.body, function (results) {
      return response.send(results)
    })
  })








export default router;