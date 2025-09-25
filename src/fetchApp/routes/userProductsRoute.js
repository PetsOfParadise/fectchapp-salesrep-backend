import express from "express";
import passport from 'passport'

import { check, validationResult } from "express-validator";
import UserProductsService from "../service/userProductsService";
import UploadConfigService from "../../../config/uploadConfig";

const userProductsService = new UserProductsService
const upload = new UploadConfigService

const failureRedirect = process.env.FAILUREREDIRECT
const router = express.Router();







router.post('/homePage', [
  check('pageNumber').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('invalid pageNumber')
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
  userProductsService.homePageService(request.body, function (results) {
    return response.send(results)
  })
})


router.post('/getSubCategoryList', [
  check('categoryId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('invalid pageNumber')
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
  userProductsService.getSubCategoryListService(request.body, function (results) {
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
    userProductsService.getUserCatgoryList(request.body, function (results) {
      response.send(results)
    })
  }
})

router.post('/viewNewsFeed', [
  check('pageNumber').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('invalid pageNumber')
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
  userProductsService.viewNewsFeed(request.body, function (results) {
    return response.send(results)
  })
})

router.post('/viewExplore', [
  check('pageNumber').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('invalid pageNumber')
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
  userProductsService.viewExplore(request.body, function (results) {
    return response.send(results)
  })
})

router.post('/viewNewArrival', [
  check('pageNumber').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('invalid pageNumber')
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
  userProductsService.viewNewArrival(request.body, function (results) {
    return response.send(results)
  })
})

router.post('/viewExploreProducts', [
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
  userProductsService.viewExploreProducts(request.body, function (results) {
    return response.send(results)
  })
})

router.post('/likeOrUnlikeFeeds', [
  check('feedId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('invalid feedId'),
  check('isLike').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('invalid feedId')
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
  userProductsService.likeOrUnlikeFeeds(request.body, function (results) {
    return response.send(results)
  })
})

// Product List
router.post('/productList', [
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
  userProductsService.productList(request.body, function (results) {
    return response.send(results)
  })
})



router.post('/SerchProductList', [
  check('optionsIds').trim().exists().withMessage('Invalid optionsIds'),
  check('pageNumber').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('invalid subcategoryId'),
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
  userProductsService.SerchProductListService(request.body, function (results) {
    return response.send(results)
  })
})




// Add Card
router.post('/addCart', [
  check('productId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('invalid productId'),
  check('quantity').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('invalid quantity'),
  check('userId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('invalid userId'),
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
  userProductsService.addCartService(request.body, function (results) {
    return response.send(results)
  })
})

// View cart
router.post('/viewCart', [
  check('userId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid userId'),
  check('isOfferApply').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid isOfferApply')
  // ,check('page').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid pageNumber'),

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
    userProductsService.viewCartDetails(request.body, function (results) {
      response.send(results)
    })
  }
})
router.post('/viewCartPage', [
  check('userId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid userId'),
  check('isOfferApply').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid isOfferApply')
  , check('page').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid pageNumber'),

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
    userProductsService.viewCartDetailsByPage(request.body, function (results) {
      response.send(results)
    })
  }
})


// Delete cart
router.post('/deleteCart', [
  check('cartId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid cartId'),
  check('userId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid userId')
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
    userProductsService.deleteCart(request.body, function (results) {
      response.send(results)
    })
  }
})

// Manager Cart
router.get('/managerCartList', passport.authenticate('jwt', { session: false, failureRedirect: failureRedirect }), (request, response) => {
  const errors = validationResult(request)
  if (!errors.isEmpty()) {
    var errorArray = errors.array()
    var errorResponse = {}
    errorResponse.error = true
    errorResponse.message = errorArray[0].msg
    response.send(errorResponse)
  } else {
    request.body.auth = request.user
    userProductsService.managerCartList(request.body, function (results) {
      response.send(results)
    })
  }
})

router.post('/viewFeatureProducts', [
  check('pageNumber').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('invalid pageNumber')
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
  userProductsService.viewFeatureProducts(request.body, function (results) {
    return response.send(results)
  })
})

router.post('/viewProduct', [
  check('productId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid productId')
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
  userProductsService.viewProductDeatils(request.body, function (results) {
    return response.send(results)
  })
})

router.post('/otherInstruction', [
  check('userId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid userId'),
  check('barCode').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid barCode'),
  check('PVCCovers').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid PVCCovers'),
  check('goodsInBulk').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid goodsInBulk'),
  check('MRPOnLabels').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid MRPOnLabels'),
  check('instruction').optional({ checkFalsy: true }).isLength({ min: 1 }).withMessage('instruction is Empty'),
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
  userProductsService.otherInstruction(request.body, function (results) {
    return response.send(results)
  })
})

router.post('/placeOrder', [
  check('userId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid userId'),
  check('managerId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid managerId'),
  check('paymentId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid paymentId'),
  check('isOfferApply').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid isOfferApply')
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
  userProductsService.placeOrder(request.body, function (results) {
    return response.send(results)
  })
})

router.post('/processOrder', [
  check('isProcess').isIn(['1']).withMessage('Invalid isProcess'),
  check('cartCount').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid cartCount'),
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
  userProductsService.processOrder(request.body, function (results) {
    return response.send(results)
  })
})

router.get('/getPaymentList', passport.authenticate('jwt', { session: false, failureRedirect: failureRedirect }), (request, response) => {
  const errors = validationResult(request)
  if (!errors.isEmpty()) {
    var errorArray = errors.array()
    var errorResponse = {}
    errorResponse.error = true
    errorResponse.message = errorArray[0].msg
    response.send(errorResponse)
  } else {
    request.body.auth = request.user
    userProductsService.getPaymentList(request.body, function (results) {
      response.send(results)
    })
  }
})

// Search Product
router.post('/searchProduct', [
  check('text').trim().exists().isLength({ min: 1 }).withMessage('Invalid text'),
  check('key').isIn(['PRODUCTS', 'SUBCATEGORY', 'CATEGORY', 'PRODUCTLIST', 'EXPLORE', 'EXPLOREPRODUCTS']).withMessage('Invalid key'),
  check('categoryId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid categoryId'),
  check('subcategoryId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid subcategoryId'),
  check('exploreId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid exploreId')
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
  userProductsService.searchProductService(request.body, function (results) {
    return response.send(results)
  })
})

// Product Filters


router.post('/frequentlyBoughtProducts', [
  check('userId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid userId')
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
  userProductsService.frequentlyBoughtProducts(request.body, function (results) {
    return response.send(results)
  })
})

router.post('/userQuickSearchNameList', [
  // check('name').exists().isLength({ min: 0 }).withMessage('name is Empty'),
], passport.authenticate('jwt', {
  session: false,
  failureRedirect: failureRedirect
}), (request, response) => {
  const errors = validationResult(request)
  if (!errors.isEmpty()) {
    var errorArray = errors.array()
    var errorResponse = {}
    errorResponse.error = true
    errorResponse.message = errorArray[0].msg
    return response.send(errorResponse)
  }
  request.body.auth = request.user
  userProductsService.userSearchNameListService(request, function (results) {
    return response.send(results)
  })
})


router.post('/userClearAllCartProducts', [
  // check('name').exists().isLength({ min: 0 }).withMessage('name is Empty'),
], passport.authenticate('jwt', {
  session: false,
  failureRedirect: failureRedirect
}), (request, response) => {
  const errors = validationResult(request)
  if (!errors.isEmpty()) {
    var errorArray = errors.array()
    var errorResponse = {}
    errorResponse.error = true
    errorResponse.message = errorArray[0].msg
    return response.send(errorResponse)
  }
  request.body.auth = request.user
  userProductsService.userClearAllCartProductsService(request, function (results) {
    return response.send(results)
  })
})


router.post('/addProductNotify', [
  // check('name').exists().isLength({ min: 0 }).withMessage('name is Empty'),
], passport.authenticate('jwt', {
  session: false,
  failureRedirect: failureRedirect
}), (request, response) => {
  const errors = validationResult(request)
  if (!errors.isEmpty()) {
    var errorArray = errors.array()
    var errorResponse = {}
    errorResponse.error = true
    errorResponse.message = errorArray[0].msg
    return response.send(errorResponse)
  }
  request.body.auth = request.user
  userProductsService.addProductNotifyService(request, function (results) {
    return response.send(results)
  })
})


router.post('/cancelProductNotify', [
  // check('name').exists().isLength({ min: 0 }).withMessage('name is Empty'),
], passport.authenticate('jwt', {
  session: false,
  failureRedirect: failureRedirect
}), (request, response) => {
  const errors = validationResult(request)
  if (!errors.isEmpty()) {
    var errorArray = errors.array()
    var errorResponse = {}
    errorResponse.error = true
    errorResponse.message = errorArray[0].msg
    return response.send(errorResponse)
  }
  request.body.auth = request.user
  userProductsService.cancelProductNotifyService(request, function (results) {
    return response.send(results)
  })
})



router.post('/productsCartBulkUpload', [
  // check('name').exists().isLength({ min: 0 }).withMessage('name is Empty'),
],
  passport.authenticate('jwt', {
    session: false,
    failureRedirect: failureRedirect
  }), upload.file_upload, (request, response) => {
    const errors = validationResult(request)
    if (!errors.isEmpty()) {
      var errorArray = errors.array()
      var errorResponse = {}
      errorResponse.error = true
      errorResponse.message = errorArray[0].msg
      return response.send(errorResponse)
    }
    request.body.auth = request.user
    userProductsService.productsCartBulkUploadService(request, function (results) {
      return response.send(results)
    })
  })



export default router;

