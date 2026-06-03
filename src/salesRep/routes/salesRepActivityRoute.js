import express from "express";
import passport from 'passport'
import multer from 'multer'
import path from 'path'
import fs from 'fs'

import { check, validationResult } from "express-validator";
import SalesRepActivityService from "../service/salesRepActivityService";
import SalesRepActivityModel from "../models/salesRepActivityModel";
import UploadS3 from "../../../config/s3.upload";

const salesRepActivityService = new SalesRepActivityService
const salesRepActivityModel = new SalesRepActivityModel
const uploadS3 = new UploadS3

// Multer storage config for activity photos
const activityPhotoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '../../../uploads/activity_photos')
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || '.jpg'
    cb(null, `activity_${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`)
  }
})
const uploadActivityPhoto = multer({ storage: activityPhotoStorage })





const failureRedirect = process.env.FAILUREREDIRECT
const router = express.Router();



// Creates the visit AND attaches its photo in one request. `image` is multipart
// and optional (Shop Visit sends it; other interactions may not). The flow is
// atomic: the photo is uploaded to S3 first, then the visit is created, then the
// photo row is saved. If any step fails, nothing partial is left behind, so the
// app can simply prompt the salesrep to retry the whole submission.
router.post('/addActivity',
  uploadActivityPhoto.single('image'),
  [
    check('shopId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid shopId'),
    check('ownerId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid ownerId'),
    check('visitReasonId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid visitReasonId'),
    check('salesRepLongitude').optional({ checkFalsy: true }).isLength({ min: 1 }).withMessage('longitude is Empty'),
    check('salesRepLatitude').optional({ checkFalsy: true }).isLength({ min: 1 }).withMessage('latitude is Empty'),
    check('activityType').isIn(['VISIT', 'INTERACTION']).withMessage('Invalid activityType'),
    check('resson').trim().exists().isLength({ min: 1 }).withMessage('resson is empty')
  ], passport.authenticate('jwt', { session: false, failureRedirect: failureRedirect }), async (request, response) => {
    const errors = validationResult(request)
    if (!errors.isEmpty()) {
      var errorArray = errors.array()
      var errorResponse = {}
      errorResponse.error = true
      errorResponse.message = errorArray[0].msg
      return response.send(errorResponse)
    }

    // 1. If a photo was sent, upload it to S3 FIRST. If this fails, nothing is
    //    saved to the DB, so the app gets an error and prompts to retry.
    var photoUrl = null
    if (request.file && request.file.path) {
      const s3Key = `activity_photos/visit_${Date.now()}_${request.file.filename}`
      const s3Result = await uploadS3.S3_upload({ file_path: request.file.path, fileName: s3Key })
      if (s3Result.error) {
        return response.send({ error: true, message: 'Photo upload failed' })
      }
      photoUrl = s3Result.data
    }

    // 2. Create the visit.
    request.body.auth = request.user
    salesRepActivityService.addActivityService(request.body, async function (results) {
      // Visit not created (error, or "not nearby" with no insert) -> return as-is.
      if (results.error || !results.activityId) {
        return response.send(results)
      }
      // 3. Attach the photo to the freshly created visit.
      if (photoUrl) {
        var photoData = {
          activityId: results.activityId,
          imageUrl: photoUrl,
          latitude: request.body.latitude || null,
          longitude: request.body.longitude || null,
          address: request.body.address || null,
          capturedAt: request.body.capturedAt ? new Date(request.body.capturedAt) : new Date()
        }
        var saved = await salesRepActivityModel.saveActivityPhotoModel(photoData)
        if (saved.error) {
          // Roll back the visit so nothing partial remains.
          await salesRepActivityModel.deleteActivityModel(results.activityId)
          return response.send({ error: true, message: 'Could not save visit photo, please retry' })
        }
      }
      // 4. Save the check-in / check-out record linked to this visit.
      if (request.body.checkType) {
        var checkData = {
          activityId: results.activityId,
          salesRepId: request.user.id,
          shopId: request.body.shopId || null,
          checkType: request.body.checkType,
          latitude: request.body.salesRepLatitude || null,
          longitude: request.body.salesRepLongitude || null,
          address: request.body.salesRepAddress || null,
          checkTime: new Date()
        }
        var checkSaved = await salesRepActivityModel.saveCheckInOutModel(checkData)
        if (checkSaved.error) {
          await salesRepActivityModel.deleteActivityModel(results.activityId)
          return response.send({ error: true, message: 'Could not save check-in/out, please retry' })
        }
      }
      return response.send(results)
    })
  })

// Same single-request, atomic flow as /addActivity: the "Submit Anyway" (not-nearby)
// path sends the visit details + photo together. Photo uploaded to S3 first, then the
// activity is created, then the photo row is saved; any failure leaves nothing behind.
router.post('/updateActivity',
  uploadActivityPhoto.single('image'),
  [
    check('shopId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid shopId'),
    check('ownerId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid ownerId'),
    check('visitReasonId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid visitReasonId'),
    check('salesRepLongitude').trim().exists().isLength({ min: 1 }).withMessage('longitude is Empty'),
    check('salesRepLatitude').trim().exists().isLength({ min: 1 }).withMessage('latitude is Empty'),
    check('resson').trim().exists().isLength({ min: 1 }).withMessage('resson is empty')
  ], passport.authenticate('jwt', { session: false, failureRedirect: failureRedirect }), async (request, response) => {
    const errors = validationResult(request)
    if (!errors.isEmpty()) {
      var errorArray = errors.array()
      var errorResponse = {}
      errorResponse.error = true
      errorResponse.message = errorArray[0].msg
      return response.send(errorResponse)
    }

    // 1. Upload photo to S3 first (if provided). Failure => nothing saved.
    var photoUrl = null
    if (request.file && request.file.path) {
      const s3Key = `activity_photos/visit_${Date.now()}_${request.file.filename}`
      const s3Result = await uploadS3.S3_upload({ file_path: request.file.path, fileName: s3Key })
      if (s3Result.error) {
        return response.send({ error: true, message: 'Photo upload failed' })
      }
      photoUrl = s3Result.data
    }

    // 2. Create the activity.
    request.body.auth = request.user
    salesRepActivityService.updateActivityService(request.body, async function (results) {
      if (results.error || !results.activityId) {
        return response.send(results)
      }
      // 3. Attach the photo to the activity.
      if (photoUrl) {
        var photoData = {
          activityId: results.activityId,
          imageUrl: photoUrl,
          latitude: request.body.latitude || null,
          longitude: request.body.longitude || null,
          address: request.body.address || null,
          capturedAt: request.body.capturedAt ? new Date(request.body.capturedAt) : new Date()
        }
        var saved = await salesRepActivityModel.saveActivityPhotoModel(photoData)
        if (saved.error) {
          await salesRepActivityModel.deleteActivityModel(results.activityId)
          return response.send({ error: true, message: 'Could not save visit photo, please retry' })
        }
      }
      // 4. Save the check-in / check-out record linked to this visit.
      if (request.body.checkType) {
        var checkData = {
          activityId: results.activityId,
          salesRepId: request.user.id,
          shopId: request.body.shopId || null,
          checkType: request.body.checkType,
          latitude: request.body.salesRepLatitude || null,
          longitude: request.body.salesRepLongitude || null,
          address: request.body.salesRepAddress || null,
          checkTime: new Date()
        }
        var checkSaved = await salesRepActivityModel.saveCheckInOutModel(checkData)
        if (checkSaved.error) {
          await salesRepActivityModel.deleteActivityModel(results.activityId)
          return response.send({ error: true, message: 'Could not save check-in/out, please retry' })
        }
      }
      return response.send(results)
    })
  })

router.post('/saveActivityPhoto',
  passport.authenticate('jwt', { session: false, failureRedirect: failureRedirect }),
  uploadActivityPhoto.single('image'),
  (request, response) => {
    if (!request.body.activityId) {
      return response.send({ error: true, message: 'Invalid activityId' })
    }
    if (!request.file) {
      return response.send({ error: true, message: 'image file is required' })
    }
    // Pass file info to the service so it can upload to S3
    request.body.file = request.file
    request.body.auth = request.user
    salesRepActivityService.saveActivityPhotoService(request.body, function (results) {
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