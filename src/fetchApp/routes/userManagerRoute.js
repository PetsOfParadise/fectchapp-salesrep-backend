import express from "express";
import passport from 'passport'

import { check, validationResult } from "express-validator";
import UserManagerService from "../service/userManagerService";

const userManagerService = new UserManagerService





const failureRedirect = process.env.FAILUREREDIRECT
const router = express.Router();





  // Manage Shop Manager
  router.post('/createManager', [
    check('name').trim().exists().isLength({ min: 1 }).withMessage('name is Empty'),
    check('mobileNumber').trim().isNumeric().exists().isLength({ min: 10, max: 10 }).withMessage('mobile number must be 10 digits'),
    check('email').optional({ checkFalsy: true }).isLength({ min: 1 }).withMessage('email is Empty'),
    check('shopName').trim().exists().isLength({ min: 1 }).withMessage('shopName is Empty'),
    check('shopAddress').trim().exists().isLength({ min: 1 }).withMessage('shopAddress is Empty'),
    check('pincode').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('pincode is Empty'),
    check('city').trim().exists().isLength({ min: 1 }).withMessage('city is Empty'),
    check('longitude').trim().exists().isLength({ min: 1 }).withMessage('longitude is Empty'),
    check('latitude').trim().exists().isLength({ min: 1 }).withMessage('latitude is Empty'),
    check('state').trim().exists().isLength({ min: 1 }).withMessage('state is Empty'),
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
    userManagerService.createManager(request.body, function (results) {
      return response.send(results)
    })
  })

  router.post('/editManager', [
    check('name').trim().exists().isLength({ min: 1 }).withMessage('name is Empty'),
    check('mobileNumber').trim().isNumeric().exists().isLength({ min: 10, max: 10 }).withMessage('mobile number must be 10 digits'),
    check('email').optional({ checkFalsy: true }).isLength({ min: 1 }).withMessage('email is Empty'),
    check('shopName').trim().exists().isLength({ min: 1 }).withMessage('shopName is Empty'),
    check('shopAddress').trim().exists().isLength({ min: 1 }).withMessage('shopAddress is Empty'),
    check('pincode').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('pincode is Empty'),
    check('city').trim().exists().isLength({ min: 1 }).withMessage('city is Empty'),
    check('longitude').trim().exists().isLength({ min: 1 }).withMessage('longitude is Empty'),
    check('latitude').trim().exists().isLength({ min: 1 }).withMessage('latitude is Empty'),
    check('state').trim().exists().isLength({ min: 1 }).withMessage('state is Empty'),
    check('managerId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('invalid managerId')
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
    userManagerService.editManager(request.body, function (results) {
      return response.send(results)
    })
  })

  router.get('/getManagerList', passport.authenticate('jwt', { session: false, failureRedirect: failureRedirect }), (request, response) => {
    const errors = validationResult(request)
    if (!errors.isEmpty()) {
      var errorArray = errors.array()
      var errorResponse = {}
      errorResponse.error = true
      errorResponse.message = errorArray[0].msg
      response.send(errorResponse)
    } else {
      request.body.auth = request.user
      userManagerService.getManagerList(request.body, function (results) {
        response.send(results)
      })
    }
  })

  router.post('/updateVisibleStatus', [
    check('managerId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('invalid managerId'),
    check('status').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('invalid status')
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
    userManagerService.updateManagerVisibleStatus(request.body, function (results) {
      return response.send(results)
    })
  })

  router.post('/managerActiveStatus', [
    check('activeStatus').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('invalid activeStatus'),
    check('userId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('invalid userID')
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
    userManagerService.managerActiveStatus(request.body, function (results) {
      return response.send(results)
    })
  })

  router.post('/updateMangerPassword', [
    check('password').trim().exists().isLength({ min: 6, max: 15 }).withMessage('must be at least 6 chars long and can have maximum of 15 chars'),
    check('userId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('invalid userID')
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
    userManagerService.updateMangerPassword(request.body, function (results) {
      return response.send(results)
    })
  })


  





export default router;