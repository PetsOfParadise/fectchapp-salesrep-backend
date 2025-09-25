'use strict';
import passport from 'passport'
import passportJwt from 'passport-jwt'
import jwt from 'jsonwebtoken'
import UserModel from '../src/fetchApp/models/userModel'
import SalesRepModel from '../src/salesRep/models/salesRepModel'

require('dotenv').config();

var JwtStrategy = passportJwt.Strategy
var ExtractJwt = passportJwt.ExtractJwt
const userModel = new UserModel
const salesRepModel = new SalesRepModel

var opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt')
opts.secretOrKey = process.env.JWT_SECRET_KEY

// module.exports = function () {
passport.use(new JwtStrategy(opts, function (jwt_payload, done) {
  // console.log("jwt_payload",jwt_payload)
  return verifyUser(jwt_payload, function (results) {
    console.log("results", results)
    if (results.err) {
      return done(null, false)
    } else {
      if (jwt_payload.userType === 'OWNER' || jwt_payload.userType === 'MANAGER') {
        jwt_payload.name = results.name
        jwt_payload.customerID = results.customerID
        jwt_payload.catalogId = results.catalogId
        jwt_payload.isEnableDiscount = results.isEnableDiscount
        jwt_payload.discountId = results.userDiscountId
        jwt_payload.outletId = results.outletId
        jwt_payload.salesRepIds = results.salesRepIds
        jwt_payload.creditLimit = results.creditLimit
        jwt_payload.ownerId = results.ownerId
        jwt_payload.isPriceVisible = results.isPriceVisible
        jwt_payload.creditPeriod = results.creditPeriod
        jwt_payload.bonusPoint = results.bonusPoint
        jwt_payload.cashOnCarry = results.cashOnCarry
        jwt_payload.userDepotId = results.userDepotId
        jwt_payload.creditFixedtLimit = results.creditFixedtLimit
        jwt_payload.minOrderValue = results.minOrderValue


      } else if (jwt_payload.userType === 'SUPERADMIN' || jwt_payload.userType === 'ADMIN' ||
        jwt_payload.userType === 'SUBADMIN') {
        jwt_payload.outletIds = JSON.parse(results.outletIds)
      } else if (jwt_payload.userType === 'SALESREP') {
        jwt_payload.outletId = results.outletId
        jwt_payload.name = results.name
      }
      return done(null, jwt_payload)
    }
  })
}))

var verifyUser = async (data, callback) => {
  var user = {}
  user.err = false
  if (data.userType === 'OWNER' || data.userType === 'MANAGER') {
    var useresult = await userModel.verifiedUserIdModel(data)
    // console.log("useresult", useresult)
    if (!useresult.error) {
      user.name = useresult.data.name
      user.customerID = useresult.data.customerID
      user.catalogId = useresult.data.userCatalogId
      user.isEnableDiscount = useresult.data.isEnableDiscount
      user.userDiscountId = useresult.data.userDiscountId
      user.outletId = useresult.data.outletId
      user.salesRepIds = useresult.data.salesRepIds
      user.creditLimit = useresult.data.creditLimit
      user.bonusPoint = useresult.data.bonusPoint
      user.isPriceVisible = useresult.data.isPriceVisible
      user.cashOnCarry = useresult.data.cashOnCarry
      user.userDepotId = useresult.data.userDepotId
      user.creditFixedtLimit = useresult.data.creditFixedtLimit
      user.minOrderValue = useresult.data.minOrderValue


      if (useresult.data.userType === 'OWNER') {
        user.creditPeriod = useresult.data.creditPeriod
        user.ownerId = useresult.data.id
      } else {
        user.creditPeriod = useresult.data.creditPeriod
        user.ownerId = useresult.data.ownerId
      }
      user.err = false
    } else {
      user.err = true
    }
  } else if (data.userType === 'SALESREP') {
    var salesRepresult = await salesRepModel.verifiedSalesRepId(data.id)
    if (!salesRepresult.error) {
      user.err = false
      user.outletId = salesRepresult.data.outletId
      user.name = salesRepresult.data.name
    } else {
      user.err = true
    }
  }
  // else {
  //   var adminResult = await this.verifiedAdminId(data.id)
  //   if (!adminResult.error) {
  //     user.outletIds = adminResult.data.outletIds
  //     user.userType = adminResult.data.userType
  //     user.err = false
  //   } else {
  //     user.err = true
  //   }
  // }
  callback(user)
}

const tokenVerification = async (token) => {
  var data = {}
  return new Promise(function (resolve) {
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, payload) => {
      if (err) {
        data.error = true
        data.data = null
        resolve(data)
      } else {
        data.error = false
        data.data = payload
        resolve(data)
      }
    })
  })
}

const generateToken = function (data) {
  return new Promise(function (resolve) {
    jwt.sign(data, process.env.JWT_SECRET_KEY, (err, token) => {
      if (err) {
        resolve(err)
      } else {
        resolve(token)
      }
    })
  })
}


// }
const object = {
  tokenVerification: tokenVerification,
  generateToken: generateToken
}

export default object;