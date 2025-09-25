import express from "express";
import passport from 'passport'

import { check, validationResult } from "express-validator";
import UserAddressService from "../service/userAddressService";

const userAddressService = new UserAddressService




const failureRedirect = process.env.FAILUREREDIRECT
const router = express.Router();



  // Manage Address
  router.post('/addAddress', [
    check('address').trim().exists().isLength({ min: 1 }).withMessage('shopAddress is Empty'),
    check('pincode').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('pincode is Empty'),
    check('shopName').trim().exists().isLength({ min: 1 }).withMessage('shopName is Empty'),
    check('locality').trim().exists().isLength({ min: 1 }).withMessage('locality is Empty'),
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
    userAddressService.addAddress(request.body, function (results) {
      return response.send(results)
    })
  })

  router.get('/getUserAddress', passport.authenticate('jwt', { session: false, failureRedirect: failureRedirect }), (request, response) => {
    const errors = validationResult(request)
    if (!errors.isEmpty()) {
      var errorArray = errors.array()
      var errorResponse = {}
      errorResponse.error = true
      errorResponse.message = errorArray[0].msg
      response.send(errorResponse)
    } else {
      request.body.auth = request.user
      userAddressService.getUserAddress(request.body, function (results) {
        response.send(results)
      })
    }
  })

  router.post('/editAddress', [
    check('address').trim().exists().isLength({ min: 1 }).withMessage('shopAddress is Empty'),
    check('pincode').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('pincode is Empty'),
    check('shopName').trim().exists().isLength({ min: 1 }).withMessage('shopName is Empty'),
    check('locality').trim().exists().isLength({ min: 1 }).withMessage('locality is Empty'),
    check('addressId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('state is addressId')
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
    userAddressService.editAddress(request.body, function (results) {
      return response.send(results)
    })
  })

  router.post('/deleteAddress', [
    check('addressId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('state is addressId')
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
    userAddressService.deleteAddress(request.body, function (results) {
      return response.send(results)
    })
  })





export default router;