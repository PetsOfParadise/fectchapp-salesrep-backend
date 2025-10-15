import express from "express";
import passport from 'passport'

import { check, validationResult } from "express-validator";
import UserService from "../service/userService";

const userService = new UserService





const failureRedirect = process.env.FAILUREREDIRECT
const router = express.Router();




router.post('/QuickSearchNameList',
    [
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
        userService.userSearchNameListService(request, function (results) {
            return response.send(results)
        })
    })

router.get('/userActiveStatus', [
    // check('id').exists().isLength({ min: 1 }).withMessage('id is Empty'),
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
    userService.userActiveStatusService(request, function (results) {
        return response.send(results)
    })
})



router.post('/depotList', [
    // check('status').exists().isLength({ min: 1 }).withMessage('status is Empty'),
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
    userService.depotListService(request, function (results) {
        return response.send(results)
    })
})

router.post('/updateUserDepot', [
    // check('status').exists().isLength({ min: 1 }).withMessage('status is Empty'),
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
    userService.updateUserDepotService(request, function (results) {
        return response.send(results)
    })
})


router.post('/checkUserLogout', [
    // check('id').exists().isLength({ min: 1 }).withMessage('id is Empty'),

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
    userService.checkUserLogoutService(request, function (results) {
        return response.send(results)
    })
})



  router.post('/verificationCheck', [
    check('verificationCode').trim().exists().isLength({ min: 1 }).withMessage('code is Empty')
  ], (request, response) => {
    const errors = validationResult(request)
    if (!errors.isEmpty()) {
      var errorArray = errors.array()
      var errorResponse = {}
      errorResponse.error = true
      errorResponse.message = errorArray[0].msg
      return response.send(errorResponse)
    }
    userService.verificationCheck(request.body, function (results) {
      return response.send(results)
    })
  })

  router.post('/checkUserAvailablity', [
    check('mobileNumber').trim().isNumeric().exists().isLength({ min: 10, max: 10 }).withMessage('mobile number must be 10 digits')
  ], (request, response) => {alert(2);console.log(request,'------------request')
    const errors = validationResult(request)
    if (!errors.isEmpty()) {console.log('HIII')
      var errorArray = errors.array()
      var errorResponse = {}
      errorResponse.error = true
      errorResponse.message = errorArray[0].msg
      return response.send(errorResponse)
    }
    userService.checkUserAvailablity(request.body, function (results) {console.log(results,'00000res')
      return response.send(results)
    })
  })

  router.post('/resendOTP', [
    check('mobileNumber').trim().isNumeric().exists().isLength({ min: 10, max: 10 }).withMessage('mobile number must be 10 digits')
  ], (request, response) => {
    const errors = validationResult(request)
    if (!errors.isEmpty()) {
      var errorArray = errors.array()
      var errorResponse = {}
      errorResponse.error = true
      errorResponse.message = errorArray[0].msg
      return response.send(errorResponse)
    }
    userService.resendOTP(request.body, function (results) {
      return response.send(results)
    })
  })

  router.post('/checkOtpVerification', [
    check('mobileNumber').trim().isNumeric().exists().isLength({ min: 10, max: 10 }).withMessage('mobile number must be 10 digits'),
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
    userService.checkOtpVerification(request.body, function (results) {
      return response.send(results)
    })
  })

  router.post('/setPassword', [
    check('mobileNumber').trim().isNumeric().exists().isLength({ min: 10, max: 10 }).withMessage('mobile number must be 10 digits'),
    check('name').trim().exists().isLength({ min: 1 }).withMessage('name is Empty'),
    check('password').trim().exists().isLength({ min: 6, max: 15 }).withMessage('must be at least 6 chars long and can have maximum of 15 chars'),
    check('verificationCode').trim().exists().isLength({ min: 1 }).withMessage('verificationCode is Empty')
  ], (request, response) => {
    const errors = validationResult(request)
    if (!errors.isEmpty()) {
      var errorArray = errors.array()
      var errorResponse = {}
      errorResponse.error = true
      errorResponse.message = errorArray[0].msg
      return response.send(errorResponse)
    }
    userService.setPassword(request.body, function (results) {
      return response.send(results)
    })
  })

  router.post('/ownerRegister', [
    check('email').optional({ checkFalsy: true }).isLength({ min: 1 }).withMessage('email is Empty'),
    check('shopName').trim().exists().isLength({ min: 1 }).withMessage('shopName is Empty'),
    check('shopAddress').trim().exists().isLength({ min: 1 }).withMessage('shopAddress is Empty'),
    check('pincode').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('pincode is Empty'),
    check('city').trim().exists().isLength({ min: 1 }).withMessage('city is Empty'),
    check('longitude').exists().isLength({ min: 1 }).withMessage('longitude is Empty'),
    check('latitude').exists().isLength({ min: 1 }).withMessage('latitude is Empty'),
    check('state').trim().exists().isLength({ min: 1 }).withMessage('state is Empty'),
    check('gst').trim().optional({ checkFalsy: true }).isLength({ min: 1 }).withMessage('gst is Empty'),
    check('referralNumber').trim().optional({ checkFalsy: true }).isLength({ min: 1 }).withMessage('gst is Empty')
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
    userService.ownerRegister(request.body, function (results) {
      return response.send(results)
    })
  })

  router.post('/login', [
    check('mobileNumber').trim().isNumeric().exists().isLength({ min: 10, max: 10 }).withMessage('mobile number must be 10 digits'),
    check('password').trim().exists().isLength({ min: 6, max: 15 }).withMessage('must be at least 6 chars long and can have maximum of 15 chars'),
    check('osType').isIn(['WEB', 'MOBILE']).withMessage('Invalid osType')
  ], (request, response) => {
    const errors = validationResult(request)
    if (!errors.isEmpty()) {
      var errorArray = errors.array()
      var errorResponse = {}
      errorResponse.error = true
      errorResponse.message = errorArray[0].msg
      return response.send(errorResponse)
    }
    userService.ownerAuthentication(request.body, function (results) {
      return response.send(results)
    })
  })

  router.post('/forgotPassword', [
    check('mobileNumber').trim().isNumeric().exists().isLength({ min: 10, max: 10 }).withMessage('mobile number must be 10 digits')
  ], (request, response) => {
    const errors = validationResult(request)
    if (!errors.isEmpty()) {
      var errorArray = errors.array()
      var errorResponse = {}
      errorResponse.error = true
      errorResponse.message = errorArray[0].msg
      return response.send(errorResponse)
    }
    userService.forgotPassword(request.body, function (results) {
      return response.send(results)
    })
  })

  router.post('/updatePassword', [
    check('mobileNumber').trim().isNumeric().exists().isLength({ min: 10, max: 10 }).withMessage('mobile number must be 10 digits'),
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
    userService.updatePassword(request.body, function (results) {
      return response.send(results)
    })
  })

 
  // Get Profile Details
  router.get('/profileDetails', passport.authenticate('jwt', { session: false, failureRedirect: failureRedirect }), (request, response) => {
    const errors = validationResult(request)
    if (!errors.isEmpty()) {
      var errorArray = errors.array()
      var errorResponse = {}
      errorResponse.error = true
      errorResponse.message = errorArray[0].msg
      response.send(errorResponse)
    } else {
      request.body.auth = request.user
      userService.getProfileDetails(request.body, function (results) {
        response.send(results)
      })
    }
  })

  // googleMaps
  // router.post('/googleMaps', [
  //   check('url').trim().exists().isLength({ min: 1 }).withMessage('url is Empty'),
  // ], passport.authenticate('jwt', { session: false, failureRedirect: failureRedirect }), (request, response) => {
  //   const errors = validationResult(request)
  //   if (!errors.isEmpty()) {
  //     var errorArray = errors.array()
  //     var errorResponse = {}
  //     errorResponse.error = true
  //     errorResponse.message = errorArray[0].msg
  //     return response.send(errorResponse)
  //   }
  //   request.body.auth = request.user
  //   userService.googleMaps(request.body, function (results) {
  //     return response.send(results)
  //   })
  // })


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
      userService.userLogout(request.body, function (results) {
        response.send(results)
      })
    }
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
    userService.userNotificationService(request.body, function (results) {
      return response.send(results)
    })
  })


  router.post('/checkVersions', [
    check('type').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('type is empty'),
    check('version').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('version is empty'),
    check('name').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('name is empty')
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
    userService.checkVersionService(request.body, function (results) {
      return response.send(results)
    })
  })

  router.post('/userOpeningPage', [
    // check('type').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('type is empty'),
    // check('version').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('version is empty'),
    // check('name').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('name is empty')
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
    userService.userOpeningPageService(request.body, function (results) {
      return response.send(results)
    })
  })





export default router;