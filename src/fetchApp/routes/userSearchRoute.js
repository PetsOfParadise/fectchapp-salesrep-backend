import express from "express";
import passport from 'passport'

import { check, validationResult } from "express-validator";
import UserSearchService from "../service/userSearchService";

const userSearchService = new UserSearchService

const failureRedirect = process.env.FAILUREREDIRECT
const router = express.Router();








// Product Filters
router.post('/getFilterAttributes', [
  check('subCategoryId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid subCategoryId'),
  check('exploreId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid exploreId'),
  check('categoryId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid categoryId'),
  check('type').isIn(['CATEGORY', 'SUBCATEGORY', 'EXPLORE']).withMessage('Invalid type')
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
  userSearchService.getFilterAttributes(request.body, function (results) {
    return response.send(results)
  })
})

router.post('/productFilter', [
  check('sortBy').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid sortBy'),
  check('minPrice').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid minPrice'),
  check('maxPrice').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid maxPrice'),
  check('optionsIds').trim().exists().isLength({ min: 1 }).withMessage('Invalid optionsIds'),
  check('subcategoryId').trim().isNumeric().exists().isLength({ min: 1 }).withMessage('Invalid subcategoryId'),
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
  userSearchService.productFilterService(request.body, function (results) {
    return response.send(results)
  })
})




export default router;

