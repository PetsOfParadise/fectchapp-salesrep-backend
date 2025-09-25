import express from "express";
import passport from 'passport'

import { check, validationResult } from "express-validator";
import UserService from "../service/userService";

const userService = new UserService





const failureRedirect = process.env.FAILUREREDIRECT
const router = express.Router();






  router.post('/checkVersions', [
    check('type').trim().exists().isLength({ min: 1 }).withMessage('type is empty'),
    check('version').trim().exists().isLength({ min: 1 }).withMessage('version is empty'),
    check('name').trim().exists().isLength({ min: 1 }).withMessage('name is empty')
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
    userService.checkVersionService(request, function (results) {
      return response.send(results)
    })
  })






export default router;