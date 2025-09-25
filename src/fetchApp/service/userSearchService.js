
import async from 'async'

import STRINGS from '../../../strings.json'
import Utils from '../../../utils/utils'
import UserSearchModel from '../models/userSearchModel'

require('dotenv').config();



const userSearchModel = new UserSearchModel
const utils = new Utils()


class UserSearchService {
  constructor() {

    
      
      
      
        this.getFilterAttributes = async (request, callback) => {
          try {
            var response = {}
            if(request.type === 'SUBCATEGORY'){
              var attributeResponse = await userSearchModel.getSubCategoryAttribute([request.subCategoryId])
            } else if(request.type === 'CATEGORY') {
              var attributeResponse = await getCategoryAttribute(request.categoryId)
            } else if(request.type === 'EXPLORE') {
              var attributeResponse = await getExploreAttribute(request.exploreId)
            }
            var subcategory = await userSearchModel.findSubcategory(request.categoryId)
            if (attributeResponse.error || subcategory.error) {
              response.error = true
              response.statusCode = STRINGS.successStatusCode
              response.message = STRINGS.commanErrorString
              callback(response)
            } else {
              if (attributeResponse.data.length > 0) {
                var Ids = []
                attributeResponse.data.map(item => {
                  Ids.push(item.attributeId)
                })
                var isShow = true
                var getAttribute = await userSearchModel.productAttribute(Ids, isShow)
                if (getAttribute.error) {
                  response.error = true
                  response.statusCode = STRINGS.successStatusCode
                  response.message = STRINGS.commanErrorString
                  callback(response)
                } else {
                  if (getAttribute.data.length > 0) {
                    var length = getAttribute.data.length
                    var attributeIds = getAttribute.data
                    attributeIds.forEach(async function (item, index) {
                      var options = await userSearchModel.findAttributeOptions(item.id)
                      attributeIds[index].options = options.data
                      if (--length === 0) {
                        response.error = false
                        response.statusCode = STRINGS.successStatusCode
                        response.message = STRINGS.SuccessString
                        response.subcategoryList = subcategory.data
                        response.attributeList = attributeIds
                        callback(response)
                      }
                    })
                  } else {
                    response.error = false
                    response.statusCode = STRINGS.successStatusCode
                    response.message = STRINGS.SuccessString
                    response.subcategoryList = subcategory.data
                    response.attributeList = []
                    callback(response)
                  }
                }
              } else {
                response.error = false
                response.statusCode = STRINGS.successStatusCode
                response.message = STRINGS.SuccessString
                response.subcategoryList = subcategory.data
                response.attributeList = []
                callback(response)
              }
            }
          } catch (e) {
            console.log(e)
            response.error = true
            response.statusCode = STRINGS.errorStatusCode
            response.message = STRINGS.oopsErrorMessage
            callback(response)
          }
        }
      


        this.productFilterService = async (request, callback) => {
          try {
            var response = {}
            request.optionsIds = JSON.parse(request.optionsIds)
            var filter = await userSearchModel.filterProductModel(request)
            if (filter.error) {
              response.error = true
              response.statusCode = STRINGS.successStatusCode
              response.message = STRINGS.commanErrorString
              callback(response)
            } else {
              if (filter.data.length > 0) {
                var products = filter.data
                var length = products.length
                if (length > 0) {
                  products.forEach(async function (item, index) {
                    var cart = await userSearchModel.checkMyCartProduct(request.auth.id, item.id)
                    var cartCount = 0
                    var attribute = []
                    var options = []
                    if (cart.data.length > 0) {
                      var cartCount = cart.data[0].quantity
                      var attribute = JSON.parse(cart.data[0].attribute)
                      var options = JSON.parse(cart.data[0].options)
                    }
                    products[index].cartCount = cartCount
                    products[index].attributeIds = attribute
                    products[index].attributeOptionsIds = options
                    if (--length === 0) {
                      response.error = false
                      response.statusCode = STRINGS.successStatusCode
                      response.message = STRINGS.SuccessString
                      response.products = products
                      callback(response)
                    }
                  })
                }
              } else {
                response.error = false
                response.statusCode = STRINGS.successStatusCode
                response.message = STRINGS.SuccessString
                response.products = filter.data
                callback(response)
              }
            }
          } catch (e) {
            response.error = true
            response.statusCode = STRINGS.errorStatusCode
            response.message = STRINGS.oopsErrorMessage
            callback(response)
          }
        }
      
     
      

        var getCategoryAttribute = function (data) {
          var response = {}
          return new Promise(async function (resolve) {
            var attributeResponse = await userSearchModel.categoryAttributeModel(data)
            if(attributeResponse.error) {
              response.error = true
              resolve(response)
            } else {
              if(attributeResponse.data.length > 0) {
                var Ids = []
                attributeResponse.data.map(item => {
                  Ids.push(item.subCategoryId)
                })
                var attribute = await userSearchModel.getSubCategoryAttribute(Ids)
                resolve(attribute)
              } else {
                response.error = false
                response.data = attributeResponse.data
                resolve(response)
              }
            }
          })
        }
      
        var getExploreAttribute = function (data) {
          var response = {}
          return new Promise(async function (resolve) {
            var explore = await userSearchModel.findExploreCategory(data)
            if(explore.error) {
              response.error = true
              resolve(response)
            } else {
              if(explore.data.length > 0) {
                var Ids = []
                explore.data.map(item => {
                  Ids.push(item.exploreCategory)
                })
                var attribute = await userSearchModel.getSubCategoryAttribute(Ids)
                resolve(attribute)
              } else {
                response.error = true
                response.data = explore.data
                resolve(response)
              }
            }
          })
        }
      
     
      








  }
}




export default UserSearchService;