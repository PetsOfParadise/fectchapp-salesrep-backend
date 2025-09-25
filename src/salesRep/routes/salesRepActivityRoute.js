import express from "express";
import passport from 'passport'

import { check, validationResult } from "express-validator";
import SalesRepActivityService from "../service/salesRepActivityService";

const salesRepActivityService = new SalesRepActivityService





const failureRedirect = process.env.FAILUREREDIRECT
const router = express.Router();



router.post('/addActivity', [
  check('shopId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid shopId'),
  check('ownerId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid ownerId'),
  check('visitReasonId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid visitReasonId'),
  check('salesRepLongitude').optional({ checkFalsy: true }).isLength({ min: 1 }).withMessage('longitude is Empty'),
  check('salesRepLatitude').optional({ checkFalsy: true }).isLength({ min: 1 }).withMessage('latitude is Empty'),
  check('activityType').isIn(['VISIT', 'INTERACTION']).withMessage('Invalid activityType'),
  check('resson').trim().exists().isLength({ min: 1 }).withMessage('resson is empty')
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
  salesRepActivityService.addActivityService(request.body, function (results) {
    return response.send(results)
  })
})

router.post('/updateActivity', [
  check('shopId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid shopId'),
  check('ownerId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid ownerId'),
  check('visitReasonId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid visitReasonId'),
  check('salesRepLongitude').trim().exists().isLength({ min: 1 }).withMessage('longitude is Empty'),
  check('salesRepLatitude').trim().exists().isLength({ min: 1 }).withMessage('latitude is Empty'),
  check('resson').trim().exists().isLength({ min: 1 }).withMessage('resson is empty')
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
  salesRepActivityService.updateActivityService(request.body, function (results) {
    return response.send(results)
  })
})

router.post('/getActivityTracker', passport.authenticate('jwt', { session: false, failureRedirect: failureRedirect }), [
  check('month').trim().exists().isLength({ min: 1 }).withMessage('month is empty'),
  check('year').trim().exists().isLength({ min: 1 }).withMessage('year is empty')
], (request, response) => {
  const errors = validationResult(request)
  if (!errors.isEmpty()) {
    var errorArray = errors.array()
    var errorResponse = {}
    errorResponse.error = true
    errorResponse.message = errorArray[0].msg
    response.send(errorResponse)
  } else {
    // console.log("request1212",request.user);
    request.body.auth = request.user
    salesRepActivityService.getActivityTracker(request.body, function (results) {
      response.send(results)
    })
  }
})

router.post('/viewInteractionList', passport.authenticate('jwt', { session: false, failureRedirect: failureRedirect }), [
  // check('date').trim().exists().isLength({ min: 1 }).withMessage('date is empty'),
  check('type').isIn(['VISIT', 'INTERACTION']).withMessage('Invalid type')
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
  salesRepActivityService.viewInteractionList(request.body, function (results) {
    return response.send(results)
  })
})

router.post('/shopInformationList', passport.authenticate('jwt', { session: false, failureRedirect: failureRedirect }), [
  check('type').isIn(['NOORDERS', 'NOPAYMENTS', 'NOINTERACTION']).withMessage('Invalid type'),
  check('pageNumber').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid pageNumber'),
  check('month').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid month'),
  check('year').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid year')
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
  salesRepActivityService.shopInformationList(request.body, function (results) {
    return response.send(results)
  })
})

//Activity ReasonList
router.post('/getActivityReasonList', passport.authenticate('jwt', { session: false, failureRedirect: failureRedirect }), [
  check('isVisit').isIn(['0', '1']).withMessage('Invalid data'),
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
  salesRepActivityService.getActivityReasonList(request.body, function (results) {
    return response.send(results)
  })
})

router.post('/viewRemainders', passport.authenticate('jwt', { session: false, failureRedirect: failureRedirect }), [
  check('pageNumber').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid pageNumber'),
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
  salesRepActivityService.viewRemainderService(request.body, function (results) {
    return response.send(results)
  })
})



router.post('/addActivityMessage', passport.authenticate('jwt', { session: false, failureRedirect: failureRedirect }), [
  check('shopId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid shopId'),
  check('message').trim().exists().isLength({ min: 1 }).withMessage('Invalid message'),
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
  salesRepActivityService.addActivityMessageService(request.body, function (results) {
    return response.send(results)
  })
})


router.post('/activityChatMessageList', passport.authenticate('jwt', { session: false, failureRedirect: failureRedirect }), [
  check('shopId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid shopId'),
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
  salesRepActivityService.activityChatMessageListService(request.body, function (results) {
    return response.send(results)
  })
})
router.post('/updateTaskComplete', passport.authenticate('jwt', { session: false, failureRedirect: failureRedirect }), [
  check('taskId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid taskId'),
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
  salesRepActivityService.updateTaskCompleteService(request.body, function (results) {
    return response.send(results)
  })
})




export default router;