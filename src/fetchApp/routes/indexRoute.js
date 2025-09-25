import express from "express";

import userRoutes from './userRoute'
import userPaymentRoute from './userPaymentRoute'
import usersOrdersRoute from './usersOrdersRoute'
import userProductsRoute from './userProductsRoute'
import userSearchRoute from './userSearchRoute'
import userProfileRoute from './userProfileRoute'
import userAddressRoute from './userAddressRoute'
import userManagerRoute from './userManagerRoute'

import userVersionRoute from './userVersionRoute'



require('dotenv').config();
const router = express.Router();



router.use("/user", userRoutes);
router.use("/user", userPaymentRoute);
router.use("/user", usersOrdersRoute);
router.use("/user", userProductsRoute);
router.use("/user", userSearchRoute);
router.use("/user", userProfileRoute);
router.use("/user", userAddressRoute);
router.use("/user", userManagerRoute);
router.use("/admin", userVersionRoute);


const failureRedirect = process.env.FAILUREREDIRECT

//not need to removve this and seperate for future
import UserService from "../service/userService";

const userService = new UserService
import { check, validationResult } from "express-validator";
import passport from 'passport'

router.post('/googleMaps', [
    check('url').trim().exists().isLength({ min: 1 }).withMessage('url is Empty'),
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
    userService.googleMaps(request.body, function (results) {
      return response.send(results)
    })
  })




export default router;

