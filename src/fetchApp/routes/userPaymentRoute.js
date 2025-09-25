import express from "express";
import passport from 'passport'

import { check, validationResult } from "express-validator";
import UserPaymentService from "../service/userPaymentService";

const userPaymentService = new UserPaymentService





const failureRedirect = process.env.FAILUREREDIRECT
const router = express.Router();




router.post('/createOrderPayments', [
    // check('user_id').exists().isLength({ min: 1 }).withMessage('user_id is Empty'),
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
    userPaymentService.createOrderPaymentsService(request, function (results) {
        return response.send(results)
    })
})


router.post('/getOnePaymentStatus', [
    // check('user_id').exists().isLength({ min: 1 }).withMessage('user_id is Empty'),
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
    userPaymentService.getOnePaymentStatusService(request, function (results) {
        return response.send(results)
    })
})


router.post('/getPaymentPayloadWebhook', (request, response) => {
    const errors = validationResult(request)
    if (!errors.isEmpty()) {
        var errorArray = errors.array()
        var errorResponse = {}
        errorResponse.error = true
        errorResponse.message = errorArray[0].msg
        return response.send(errorResponse)
    }
    // request.body.auth = request.user
    userPaymentService.getPaymentPayloadWebhookService(request, function (results) {
        return response.send(results)
    })
})










export default router;