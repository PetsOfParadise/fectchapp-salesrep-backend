import express from "express";
import passport from 'passport'

import { check, validationResult } from "express-validator";
import SalesRepProfileService from "../service/salesRepProfileService";

const salesRepProfileService = new SalesRepProfileService





const failureRedirect = process.env.FAILUREREDIRECT
const router = express.Router();


router.post('/updateOnline', passport.authenticate('jwt', { session: false, failureRedirect: failureRedirect }), [
    check('status').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('status is empty')
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
    salesRepProfileService.updateSalesRepOnlineService(request.body, function (results) {
      return response.send(results)
    })
  })

  router.get('/getProfileDetails', passport.authenticate('jwt', { session: false, failureRedirect: failureRedirect }), (request, response) => {
    const errors = validationResult(request)
    if (!errors.isEmpty()) {
      var errorArray = errors.array()
      var errorResponse = {}
      errorResponse.error = true
      errorResponse.message = errorArray[0].msg
      response.send(errorResponse)
    } else {
      request.body.auth = request.user
      salesRepProfileService.salesRepProfileDetails(request.body, function (results) {
        response.send(results)
      })
    }
  })



  router.post('/changePassword', [
    check('oldPassword').trim().exists().isLength({ min: 1 }).withMessage('oldPassword is Empty'),
    check('newPassword').trim().exists().isLength({ min: 1 }).withMessage('newPassword is Empty')
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
    salesRepProfileService.salesRepChangePassword(request.body, function (results) {
      return response.send(results)
    })
  })



  router.post('/logout', passport.authenticate('jwt', { session: false, failureRedirect: failureRedirect }), (request, response) => {
    const errors = validationResult(request)
    if (!errors.isEmpty()) {
      var errorArray = errors.array()
      var errorResponse = {}
      errorResponse.error = true
      errorResponse.message = errorArray[0].msg
      response.send(errorResponse)
    } else {
      request.body.auth = request.user
      salesRepProfileService.salesRepLogout(request.body, function (results) {
        response.send(results)
      })
    }
  })



  router.post('/updateDeviceToken', [
    check('deviceToken').trim().exists().isLength({ min: 1 }).withMessage('deviceToken is empty')
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
    salesRepProfileService.salesRepUpdateDeviceToken(request.body, function (results) {
      return response.send(results)
    })
  })


  router.post('/updateNotificationCount', passport.authenticate('jwt', { session: false, failureRedirect: failureRedirect }), (request, response) => {
    const errors = validationResult(request)
    if (!errors.isEmpty()) {
      var errorArray = errors.array()
      var errorResponse = {}
      errorResponse.error = true
      errorResponse.message = errorArray[0].msg
      response.send(errorResponse)
    } else {
      request.body.auth = request.user
      salesRepProfileService.updateSalesRepNotificationCount(request.body, function (results) {
        response.send(results)
      })
    }
  })







export default router;