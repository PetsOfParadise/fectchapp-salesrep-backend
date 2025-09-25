import express from "express";
import passport from 'passport'

import { check, validationResult } from "express-validator";
import UserOrdersService from "../service/userOrdersService";

const userOrdersService = new UserOrdersService

const failureRedirect = process.env.FAILUREREDIRECT
const router = express.Router();





router.post('/myOrders', [
  check('pageNumber').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('pageNumber is Empty')
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
  userOrdersService.shopMyOrdersList(request.body, function (results) {
    return response.send(results)
  })
})


router.post('/getAllsalesrepList', [
  // check('pageNumber').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('pageNumber is Empty')
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
  userOrdersService.getAllsalesrepListServiceShopOwner(request.body, function (results) {
    return response.send(results)
  })
})






router.post('/viewMyorderDetails', [
  check('orderId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('orderId is Empty'),
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
  userOrdersService.viewMyorderDetails(request.body, function (results) {
    return response.send(results)
  })
})

router.post('/addComplaint', [
  check('orderId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('orderId is Empty'),
  check('shopOwnerId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('shopOwnerId is Empty'),
  // check('prodctId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('productId is Empty'),
  // check('issueType').trim().exists().isLength({ min: 1 }).withMessage('issueType is Empty'),
  // check('uploadImage').optional({ checkFalsy: true }).isLength({ min: 1 }).withMessage('uploadImage is Empty'),
  // check('reason').optional({ checkFalsy: true }).isLength({ min: 1 }).withMessage('reason is Empty')
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
  userOrdersService.addComplaint(request.body, function (results) {
    return response.send(results)
  })
})

router.get('/getIssueType', passport.authenticate('jwt', { session: false, failureRedirect: failureRedirect }), (request, response) => {
  const errors = validationResult(request)
  if (!errors.isEmpty()) {
    var errorArray = errors.array()
    var errorResponse = {}
    errorResponse.error = true
    errorResponse.message = errorArray[0].msg
    response.send(errorResponse)
  } else {
    request.body.auth = request.user
    userOrdersService.getIssueType(request.body, function (results) {
      response.send(results)
    })
  }
})

router.post('/getComplaintList', [
  check('pageNumber').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('pageNumber is Empty'),
  check('orderId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('orderId is Empty')
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
  userOrdersService.getComplaintList(request.body, function (results) {
    return response.send(results)
  })
})
router.post('/getAllComplaintList', [
  check('pageNumber').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('pageNumber is Empty'),
  check('userId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('userId is Empty')
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
  userOrdersService.getAllComplaintList(request.body, function (results) {
    return response.send(results)
  })
})
router.post('/addProductEnquiry', [
  check('uploadImage').trim().exists().isLength({ min: 1 }).withMessage('uploadImage is Empty'),
  check('description').trim().exists().isLength({ min: 1 }).withMessage('description is Empty')
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
  userOrdersService.addProductEnquiry(request.body, function (results) {
    return response.send(results)
  })
})

router.post('/updateUserDeliveryStatus', [
  check('orderId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('orderId is Empty')
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
  userOrdersService.updateUserDeliveryStatus(request.body, function (results) {
    return response.send(results)
  })
})

router.post('/userPayRequest', [
  check('ownerId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('orderId is Empty'),
  check('requestAmount').trim().exists().isLength({ min: 1 }).withMessage('issueType is Empty'),
  check('payTypeID').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('payTypeID is Empty'),
  check('chequeNumber').optional({ checkFalsy: true }).isLength({ min: 1 }).withMessage('chequeNumber is Empty'),
  check('chequeImage').optional({ checkFalsy: true }).isLength({ min: 1 }).withMessage('chequeImage is Empty')
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
  userOrdersService.userPayRequest(request.body, function (results) {
    return response.send(results)
  })
})

router.post('/complaintReopen', [
  check('complaintId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('complaintId is Empty')
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
  userOrdersService.userComplaintReopen(request.body, function (results) {
    return response.send(results)
  })
})

router.post('/paymenthistory', [
  check('ownerId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('ownerId is Empty')
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
  userOrdersService.userPaymenthistory(request.body, function (results) {
    return response.send(results)
  })
})

router.post('/userPaymentRequestList', [
  check('pageNumber').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('pageNumber is Empty')
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
  userOrdersService.userPaymentRequestList(request.body, function (results) {
    return response.send(results)
  })
})

router.post('/searchProductCount', [
  check('productId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('productId is Empty')
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
  userOrdersService.searchProductCountService(request.body, function (results) {
    return response.send(results)
  })
})

router.post('/myWallet', [
  check('userId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('userId is Empty'),
  check('fromDate').trim().exists().isLength({ min: 1 }).withMessage('fromDate is Empty'),
  check('toDate').trim().exists().isLength({ min: 1 }).withMessage('toDate is Empty'),
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
  userOrdersService.myWalletService(request.body, function (results) {
    return response.send(results)
  })
})


router.post('/searchOrderProduct', [
  check('bookingId').trim().exists().isLength({ min: 1 }).withMessage('bookingId is Empty'),
  check('search').trim().exists().isLength({ min: 0}).withMessage('search is Empty'),
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
  userOrdersService.searchOrderProductService(request.body, function (results) {
    return response.send(results)
  })
})




router.post('/viewOneComplaint', [
  check('ticketId').trim().exists().isLength({ min: 1 }).withMessage('ticketId is Empty'),
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
  userOrdersService.viewOneComplaintService(request.body, function (results) {
    return response.send(results)
  })
})


router.post('/viewOneOrderComplaint', [
  check('orderId').trim().exists().isLength({ min: 1 }).withMessage('orderId is Empty'),
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
  userOrdersService.viewOneOrderComplaintService(request.body, function (results) {
    return response.send(results)
  })
})







export default router;

