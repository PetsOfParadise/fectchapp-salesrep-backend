import express from "express";
import passport from 'passport'

import { check, validationResult } from "express-validator";
import UserProfileService from "../service/userProfileService";

const userProfileService = new UserProfileService

const failureRedirect = process.env.FAILUREREDIRECT
const router = express.Router();




router.post('/updateOwnerProfile', [
    check('name').trim().exists().isLength({ min: 1 }).withMessage('name is Empty'),
    check('shopName').trim().exists().isLength({ min: 1 }).withMessage('shopName is Empty'),
    check('email').optional({ checkFalsy: true }).isLength({ min: 1 }).withMessage('email is Empty'),
    check('shopAddress').trim().exists().isLength({ min: 1 }).withMessage('shopAddress is Empty'),
    check('pincode').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('pincode is Empty'),
    check('city').trim().exists().isLength({ min: 1 }).withMessage('city is Empty'),
    check('longitude').optional({ checkFalsy: true }).isLength({ min: 1 }).withMessage('longitude is Empty'),
    check('latitude').optional({ checkFalsy: true }).isLength({ min: 1 }).withMessage('latitude is Empty'),
    check('state').trim().exists().isLength({ min: 1 }).withMessage('state is Empty'),
    check('gst').trim().optional({ checkFalsy: true }).isLength({ min: 1 }).withMessage('gst is Empty')
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
    userProfileService.updateOwnerProfile(request.body, function (results) {
        return response.send(results)
    })
})

router.post('/userSettings', passport.authenticate('jwt', { session: false, failureRedirect: failureRedirect }), (request, response) => {
    const errors = validationResult(request)
    if (!errors.isEmpty()) {
        var errorArray = errors.array()
        var errorResponse = {}
        errorResponse.error = true
        errorResponse.message = errorArray[0].msg
        response.send(errorResponse)
    } else {
        request.body.auth = request.user
        userProfileService.userSettings(request.body, function (results) {
            response.send(results)
        })
    }
})

router.post('/userChangePassword', [
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
    userProfileService.userChangePassword(request.body, function (results) {
        return response.send(results)
    })
})

router.post('/updateDeviceToken', [
    check('deviceToken').trim().exists().isLength({ min: 1 }).withMessage('deviceToken is Empty')
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
    userProfileService.updateDeviceToken(request.body, function (results) {
        return response.send(results)
    })
})

router.post('/changeMobileNumber', [
    check('mobileNumber').trim().exists().isLength({ min: 1 }).withMessage('mobileNumber is Empty')
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
    userProfileService.userChangeMobileNumber(request.body, function (results) {
        return response.send(results)
    })
})

router.post('/updateMobileNumber', [
    check('mobileNumber').trim().exists().isLength({ min: 1 }).withMessage('mobileNumber is Empty')
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
    userProfileService.userUpdateMobileNumber(request.body, function (results) {
        return response.send(results)
    })
})

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
    userProfileService.updateOnlineService(request.body, function (results) {
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
        userProfileService.updateNotificationCount(request.body, function (results) {
            response.send(results)
        })
    }
})


router.post('/userOldLedgers', [
    check('shopId').exists().isLength({ min: 1 }).withMessage('shopId is Empty'),
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
    userProfileService.userOldLedgersService(request, function (results) {
        return response.send(results)
    })
})

router.post('/UserPaymentLedgerDownload', [
    check('fromDate').trim().exists().isLength({ min: 1 }).withMessage('fromDate is empty'),
    check('toDate').trim().exists().isLength({ min: 1 }).withMessage('month is empty'),
    // check('shopId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('toDate is empty'),
    // check('ownerId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('ownerId is empty')
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
    userProfileService.userPaymentLedgerDownloadService(request, function (results) {
        return response.send(results)
    })
})




export default router;

