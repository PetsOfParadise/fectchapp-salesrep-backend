import express from "express";
import passport from 'passport'

import { check, validationResult } from "express-validator";
import SalesRepHomeService from "../service/salesRepHomeService";

const salesRepHomeService = new SalesRepHomeService





const failureRedirect = process.env.FAILUREREDIRECT
const router = express.Router();

router.post('/salesRepHome', [
    check('type').isIn(['MONTH', 'WEEK']).withMessage('Invalid type')
], passport.authenticate('jwt', { session: false, failureRedirect: failureRedirect }), (request, response) => {
    console.log("SalesRep called");
    const errors = validationResult(request)
    if (!errors.isEmpty()) {
        var errorArray = errors.array()
        var errorResponse = {}
        errorResponse.error = true
        errorResponse.message = errorArray[0].msg
        return response.send(errorResponse)
    }
    request.body.auth = request.user
    salesRepHomeService.salesRepHomeService(request.body, function (results) {
        return response.send(results)
    })
})



router.post('/viewTopProducts', passport.authenticate('jwt', { session: false, failureRedirect: failureRedirect }), [
    // check('pageNumber').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('pageNumber is empty'),
    check('type').isIn(['MONTH', 'WEEK']).withMessage('Invalid type')
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
    salesRepHomeService.viewTopProducts(request.body, function (results) {
        return response.send(results)
    })
})


router.post('/notificationList', [
    check('pageNumber').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('pageNumber is empty')
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
    salesRepHomeService.salesRepNotificationService(request.body, function (results) {
        return response.send(results)
    })
})





export default router;