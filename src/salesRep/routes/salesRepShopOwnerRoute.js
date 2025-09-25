import express from "express";
import passport from 'passport'

import { check, validationResult } from "express-validator";
import SalesRepShopOwnerService from "../service/salesRepShopOwnerService";

const salesRepShopOwnerService = new SalesRepShopOwnerService



const failureRedirect = process.env.FAILUREREDIRECT
const router = express.Router();



router.post('/shopOwnerList', passport.authenticate('jwt', { session: false, failureRedirect: failureRedirect }), [
    check('pageNumber').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('pageNumber is empty')
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
    salesRepShopOwnerService.shopOwnerListService(request.body, function (results) {
        return response.send(results)
    })
})

router.post('/searchShopName', passport.authenticate('jwt', { session: false, failureRedirect: failureRedirect }), [
    check('name').trim().exists().isLength({ min: 1 }).withMessage('name is empty'),
    check('type').isIn(['OWNER', 'SHOP']).withMessage('Invalid type'),
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
    salesRepShopOwnerService.searchShopNameService(request.body, function (results) {
        return response.send(results)
    })
})



router.post('/viewShopDetails', passport.authenticate('jwt', { session: false, failureRedirect: failureRedirect }), [
    check('shopId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('shopId is empty')
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
    salesRepShopOwnerService.viewShopDetails(request.body, function (results) {
        return response.send(results)
    })
})



router.post('/shopOrderHistory',
    passport.authenticate('jwt', { session: false, failureRedirect: failureRedirect }), [
    check('month').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('month is empty'),
    check('year').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('year is empty'),
    check('shopId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('shopId is empty'),
    check('ownerId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('ownerId is empty')
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
    salesRepShopOwnerService.shopOrderHistory(request.body, function (results) {
        return response.send(results)
    })
})



router.post('/shopOwnerReport',
    passport.authenticate('jwt', { session: false, failureRedirect: failureRedirect }), [
    check('year').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('year is empty'),
    check('startMonth').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('startMonth is empty'),
    check('endMonth').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('endMonth is empty'),
    check('shopId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('shopId is empty'),
    check('ownerId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('ownerId is empty')
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
    salesRepShopOwnerService.shopOwnerReportHistoryService(request.body, function (results) {
        return response.send(results)
    })
})


router.post('/shopOwnerPaymentLedger',
    passport.authenticate('jwt', { session: false, failureRedirect: failureRedirect }), [
    // check('year').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('year is empty'),
    check('fromDate').trim().exists().isLength({ min: 1 }).withMessage('fromDate is empty'),
    check('toDate').trim().exists().isLength({ min: 1 }).withMessage('month is empty'),
    check('shopId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('toDate is empty'),
    check('ownerId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('ownerId is empty')
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
    salesRepShopOwnerService.shopOwnerPaymentLedgerService(request.body, function (results) {
        return response.send(results)
    })
})


router.post('/shopOwnerPendingPaymentLedger',
    passport.authenticate('jwt', { session: false, failureRedirect: failureRedirect }), [
    // check('year').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('year is empty'),
    check('shopId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('toDate is empty'),
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
    salesRepShopOwnerService.shopOwnerPendingPaymentLedgerService(request.body, function (results) {
        return response.send(results)
    })
})








router.post('/orderDetails', passport.authenticate('jwt', { session: false, failureRedirect: failureRedirect }), [
    check('orderId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('orderId is empty')
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
    salesRepShopOwnerService.salesRepOrderDetails(request.body, function (results) {
        return response.send(results)
    })
})



router.post('/allOrders', passport.authenticate('jwt', { session: false, failureRedirect: failureRedirect }), [
    check('pageNumber').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('pageNumber is empty'),
    check('status').trim().exists().isLength({ min: 1 }).withMessage('status is empty')
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
    salesRepShopOwnerService.allOrderService(request.body, function (results) {
        return response.send(results)
    })
})

router.post('/paymentCollected', passport.authenticate('jwt', { session: false, failureRedirect: failureRedirect }), [
    check('pageNumber').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('pageNumber is empty'),
    check('type').trim().exists().isLength({ min: 1 }).withMessage('type is empty'),
    check('sortBy').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('sortBy is empty')
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
    salesRepShopOwnerService.paymentCollectedService(request.body, function (results) {
        return response.send(results)
    })
})

router.get('/paymentAndComplaintCount', passport.authenticate('jwt', { session: false, failureRedirect: failureRedirect }), (request, response) => {
    const errors = validationResult(request)
    if (!errors.isEmpty()) {
        var errorArray = errors.array()
        var errorResponse = {}
        errorResponse.error = true
        errorResponse.message = errorArray[0].msg
        return response.send(errorResponse)
    }
    request.body.auth = request.user
    salesRepShopOwnerService.paymentAndComplaintCount(request.body, function (results) {
        return response.send(results)
    })
})


router.post('/collectPayment', [
    check('orderId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid orderId'),
    check('payTypeID').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid payTypeID'),
    check('amount').trim().exists().isLength({ min: 1 }).withMessage('longitude is Empty'),
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
    salesRepShopOwnerService.collectPaymentService(request.body, function (results) {
        return response.send(results)
    })
})



router.post('/salesRepDepotList', [
    check('user_id').exists().isLength({ min: 1 }).withMessage('status is Empty'),
    // check('type').exists().isLength({ min: 1 }).withMessage('type is Empty'),
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
    salesRepShopOwnerService.salesRepDepotListService(request, function (results) {
        return response.send(results)
    })
})

router.post('/salesRepUpdateUserDepot', [
    check('user_id').exists().isLength({ min: 1 }).withMessage('user_id is Empty'),
    check('depot_id').exists().isLength({ min: 1 }).withMessage('depot_id is Empty'),
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
    salesRepShopOwnerService.salesRepUpdateUserDepotService(request, function (results) {
        return response.send(results)
    })
})

router.post('/setRemindersList', passport.authenticate('jwt', {
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
    salesRepShopOwnerService.setRemindersListService(request, function (results) {
        return response.send(results)
    })
})


router.post('/setOneReminder', [
    check('date').exists().isLength({ min: 1 }).withMessage('date is Empty'),
    check('title').exists().isLength({ min: 1 }).withMessage('title is Empty'),
    check('description').exists().isLength({ min: 1 }).withMessage('description is Empty'),
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
    request.body.db = router.db
    request.body.auth = request.user
    salesRepShopOwnerService.setOneReminderService(request, function (results) {
        return response.send(results)
    })
})

router.post('/getOneShopSalesRepList', [
    check('user_id').exists().isLength({ min: 1 }).withMessage('user_id is Empty'),
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
    request.body.db = router.db
    request.body.auth = request.user
    salesRepShopOwnerService.getOneShopSalesRepListService(request, function (results) {
        return response.send(results)
    })
})

router.post('/salesRepUserPaymentLedgerDownload', [
    check('fromDate').trim().exists().isLength({ min: 1 }).withMessage('fromDate is empty'),
    check('toDate').trim().exists().isLength({ min: 1 }).withMessage('month is empty'),
    check('shopId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('toDate is empty'),
    check('ownerId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('ownerId is empty')
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
    salesRepShopOwnerService.salesRepUserPaymentLedgerDownloadService(request, function (results) {
        return response.send(results)
    })
})



router.post('/salesRepUserOldLedgers', [
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
    salesRepShopOwnerService.salesRepUserOldLedgersService(request, function (results) {
        return response.send(results)
    })
})



router.post('/shopPendingPaymentLedgerDownload', [
    check('shopId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('toDate is empty'),
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
    salesRepShopOwnerService.shopPendingPaymentLedgerDownloadService(request, function (results) {
        return response.send(results)
    })
})



router.post('/salesRepClearAllCartProducts', [
    // check('name').exists().isLength({ min: 0 }).withMessage('name is Empty'),
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
    salesRepShopOwnerService.salesRepClearAllCartProductService(request, function (results) {
      return response.send(results)
    })
  })





export default router;