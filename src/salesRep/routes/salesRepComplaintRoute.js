import express from "express";
import passport from 'passport'

import { check, validationResult } from "express-validator";
import SalesRepComplaintService from "../service/salesRepComplaintService";

const salesRepComplaintService = new SalesRepComplaintService





const failureRedirect = process.env.FAILUREREDIRECT
const router = express.Router();

router.post('/viewComplaintList', passport.authenticate('jwt', { session: false, failureRedirect: failureRedirect }), [
    check('pageNumber').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid pageNumber'),
    check('type').isIn(['LIST', 'OPEN', 'CLOSE', 'REOPENED', 'ACKNOWLEDGED']).withMessage('Invalid type'),
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
    salesRepComplaintService.viewComplaintListService(request.body, function (results) {
        return response.send(results)
    })
})

router.post('/viewComplaintDetails', passport.authenticate('jwt', { session: false, failureRedirect: failureRedirect }), [
    check('complaintId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid complaintId')
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
    salesRepComplaintService.viewComplaintDetailService(request.body, function (results) {
        return response.send(results)
    })
})

router.post('/complaintResolved', passport.authenticate('jwt', { session: false, failureRedirect: failureRedirect }), [
    check('complaintId').trim().exists().isLength({ min: 1 }).withMessage('Invalid complaintId')
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
    salesRepComplaintService.complaintResolvedService(request.body, function (results) {
        return response.send(results)
    })
})

router.post('/updateOrRemoveComplaintFile', passport.authenticate('jwt', { session: false, failureRedirect: failureRedirect }), [
    check('complaintId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid complaintId'),
    check('isUpdate').isIn(['0', '1']).withMessage('Invalid type'),
    check('file').optional({ checkFalsy: true }).isLength({ min: 1 }).withMessage('file is Empty')
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
    salesRepComplaintService.updateOrRemoveComplaintFile(request.body, function (results) {
        return response.send(results)
    })
})



router.post('/addComplaint', [
  check('orderId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('orderId is Empty'),
  // check('shopOwnerId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('shopOwnerId is Empty'),
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
  salesRepComplaintService.addComplaint(request.body, function (results) {
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
  salesRepComplaintService.viewOneComplaintService(request.body, function (results) {
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
  salesRepComplaintService.searchOrderProductService(request.body, function (results) {
    return response.send(results)
  })
})



router.post('/getIssueType', passport.authenticate('jwt', { session: false, failureRedirect: failureRedirect }), (request, response) => {
  const errors = validationResult(request)
  if (!errors.isEmpty()) {
    var errorArray = errors.array()
    var errorResponse = {}
    errorResponse.error = true
    errorResponse.message = errorArray[0].msg
    return response.send(errorResponse)
  }
  request.body.auth = request.user
  salesRepComplaintService.getIssueType(request.body, function (results) {
    return response.send(results)
  })
})




export default router;