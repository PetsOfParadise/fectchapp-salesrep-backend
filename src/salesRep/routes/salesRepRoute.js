import express from "express";
import passport from 'passport'

import { check, validationResult } from "express-validator";
import SalesRepService from "../service/salesRepService";

const salesRepService = new SalesRepService





const failureRedirect = process.env.FAILUREREDIRECT
const router = express.Router();




router.post('/login', [
    check('mobile').trim().isNumeric().exists().isLength({ min: 10, max: 10 }).withMessage('mobile number must be 10 digits'),
    check('password').trim().exists().isLength({ min: 6, max: 15 }).withMessage('must be at least 6 chars long and can have maximum of 15 chars')
  ], (request, response) => {
    const errors = validationResult(request)
    if (!errors.isEmpty()) {
      var errorArray = errors.array()
      var errorResponse = {}
      errorResponse.error = true
      errorResponse.message = errorArray[0].msg
      return response.send(errorResponse)
    }
    salesRepService.salesRepAuthentication(request.body, function (results) {
      return response.send(results)
    })
  })


  router.post('/forgotPassword', [
    check('mobile').trim().isNumeric().exists().isLength({ min: 10, max: 10 }).withMessage('mobile number must be 10 digits')
  ], (request, response) => {
    const errors = validationResult(request)
    if (!errors.isEmpty()) {
      var errorArray = errors.array()
      var errorResponse = {}
      errorResponse.error = true
      errorResponse.message = errorArray[0].msg
      return response.send(errorResponse)
    }
    salesRepService.salesRepforgotPassword(request.body, function (results) {
      return response.send(results)
    })
  })


  router.post('/otpCheck', [
    check('mobile').trim().isNumeric().exists().isLength({ min: 10, max: 10 }).withMessage('mobile number must be 10 digits'),
    check('otp').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('otp is Empty')
  ], (request, response) => {
    const errors = validationResult(request)
    if (!errors.isEmpty()) {
      var errorArray = errors.array()
      var errorResponse = {}
      errorResponse.error = true
      errorResponse.message = errorArray[0].msg
      return response.send(errorResponse)
    }
    salesRepService.salesRepOtpCheck(request.body, function (results) {
      return response.send(results)
    })
  })

  router.post('/resendOTP', [
    check('mobile').trim().isNumeric().exists().isLength({ min: 10, max: 10 }).withMessage('mobile number must be 10 digits')
  ], (request, response) => {
    const errors = validationResult(request)
    if (!errors.isEmpty()) {
      var errorArray = errors.array()
      var errorResponse = {}
      errorResponse.error = true
      errorResponse.message = errorArray[0].msg
      return response.send(errorResponse)
    }
    salesRepService.salesRepResendOTP(request.body, function (results) {
      return response.send(results)
    })
  })


  router.post('/updatePassword', [
    check('mobile').trim().isNumeric().exists().isLength({ min: 10, max: 10 }).withMessage('mobile number must be 10 digits'),
    check('password').trim().exists().isLength({ min: 6, max: 15 }).withMessage('must be at least 6 chars long and can have maximum of 15 chars')
  ], (request, response) => {
    const errors = validationResult(request)
    if (!errors.isEmpty()) {
      var errorArray = errors.array()
      var errorResponse = {}
      errorResponse.error = true
      errorResponse.message = errorArray[0].msg
      return response.send(errorResponse)
    }
    salesRepService.salesRepupdatePassword(request.body, function (results) {
      return response.send(results)
    })
  })


  router.get('/salesRepActiveStatus', [
    // check('id').exists().isLength({ min: 1 }).withMessage('id is Empty'),
    // check('type').exists().isLength({ min: 1 }).withMessage('type is Empty'),
],passport.authenticate('jwt', {
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
    salesRepService.salesRepActiveStatusService(request, function (results) {
        return response.send(results)
    })
})


export default router;