'use strict';

import knex from './../../../config/db.config'

class UserProductsModel {
  constructor() {



    this.getCategoryModel = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('category')
          .select('id', 'categoryName', 'categoryImage', 'categoryDescription', 'activeStatus')
          .where('activeStatus', 1)
          .orderBy('id', 'desc')
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }

    this.getCatalogCategoryModel = function (data) {
      var response = {}
      var params = data.auth
      return new Promise(function (resolve) {
        knex.db('category')
          .select('category.id', 'category.categoryName', 'category.categoryImage', 'category.categoryDescription',
            'categoryCatalog.activeStatus', 'categoryCatalog.sortingOrder',
            'categoryCatalog.catalogId')
          .innerJoin('categoryCatalog', 'categoryCatalog.categoryId', '=', 'category.id')
          .where('category.activeStatus', 1)
          .andWhere('categoryCatalog.catalogId', params.catalogId)
          .andWhere('categoryCatalog.activeStatus', 1)
          .orderBy('categoryCatalog.sortingOrder', 'asc')
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            console.log(error)
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }



    this.getCategoryModel1 = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('category')
          .select('id', 'categoryName', 'categoryImage', 'categoryDescription', 'activeStatus')
          .where('id', data)
          .andWhere('activeStatus', 1)
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }



    this.getOneCategoryModel = function (category_id) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('category')
          .select('id', 'categoryName', 'categoryImage', 'categoryDescription', 'activeStatus')
          .where('activeStatus', 1)
          .andWhere('id', category_id)
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }





    this.getCategoryByIdModel = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('catalogSortingOrder')
          .select('id', 'catalog_id', 'category_ids')
          .where('catalog_id', data.catalogId)
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }



    this.findOneSubCategorySortingModel = function (obj) {
      var response = {}
      // console.log("obj", obj)
      return new Promise(function (resolve, reject) {
        knex.db('catalogSubCategoryOrder')
          .select('id', 'catalog_id', 'category_id', 'subCategory_ids')
          .where('catalog_id', obj.catalogId)
          .andWhere('category_id', obj.category_id)
          .then((result) => {
            response.error = false
            response.data = result
            resolve(response)
          })
          .catch((error) => {
            console.log(error)
            reject(error)
          })
      })
    }









    this.findSortingSubcategory = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('subCategory')
          .select('subCategory.id', 'categoryId', 'subCategory.discount',
            'subCategoryName', 'subCategoryImage', 'subCategoryDescription', 'catalog_id',
            'subCategory.activeStatus')
          .where({
            categoryId: data.category_id,
            activeStatus: 1
          })
          // .andWhere('catalog_id', data.catalogId)
          .orderBy('sorting_order', 'asc')
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            console.log("err1", error)
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }





    this.findCatalogSubcategoryModel = function (data) {
      var response = {}
      var params = data.auth

      return new Promise(function (resolve) {
        knex.db('subCategory')
          .select('subCategory.id', 'subCategory.categoryId', 'subCategory.subCategoryName',
            'subCategory.discount', 'subCategory.subCategoryDescription',
            'subCategory.subcategoryImage as subCategoryImage', 'subCategoryCatalog.activeStatus'
            , 'subCategoryCatalog.catalogId'
          )
          .innerJoin('subCategoryCatalog', 'subCategoryCatalog.subCategoryId', '=', 'subCategory.id')
          .where('subCategory.activeStatus', 1)
          .andWhere('subCategory.categoryId', data.categoryId)
          .andWhere('subCategoryCatalog.catalogId', params.catalogId)
          .andWhere('subCategoryCatalog.activeStatus', 1)
          .orderBy('subCategoryCatalog.sortingOrder', 'asc')
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }

    this.getAllFeedModel = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('newsFeed')
          .select('id', 'feedName', 'feedDescription', 'feedImage', 'feedLink', 'createdAt')
          .orderBy('id', 'desc')
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }

    // NewsFeed
    this.getFeedModel = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        var pageNumber = data.pageNumber
        if (pageNumber == '0') {
          pageNumber = '0'
        } else {
          pageNumber = pageNumber - 1
        }
        var pageOffset = parseInt(pageNumber * data.pageCount)
        knex.db('newsFeed')
          .select('id', 'feedName', 'feedDescription', 'feedImage', 'feedType', 'feedLink', 'createdAt')
          .orderBy('id', 'desc')
          .offset(pageOffset).limit(data.pageCount)
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }

    this.checkLikeModel = function (userId, feedId) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('feedLikes')
          .where({
            feedId: feedId,
            userId: userId
          })
          .then((result) => {
            if (result.length > 0) {
              response.data = true
            } else {
              response.data = false
            }
          })
          .catch((error) => {
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }

    this.getLikesCount = function (feedId) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('feedLikes')
          .where({
            feedId: feedId
          })
          .count('feedId', {
            as: 'likesCount'
          })
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }

    this.checkNewsFeed = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('newsFeed')
          .select('id', 'feedName', 'feedDescription', 'feedImage', 'createdAt')
          .where('id', data)
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }

    this.unLikeFeed = function (userId, feedId) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('feedLikes')
          .where({
            feedId: feedId,
            userId: userId
          })
          .del()
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }

    this.likeFeed = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('feedLikes')
          .insert(data)
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }

    // New Arrival

    this.getTotalNewArrivalProducts = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('products')
          .select('products.id', 'productName', 'productImage', 'productCatalog.MRP', 'products.productCode',
            'weight', 'productGST', 'MOQ', 'maxQty', 'products.defaultQuantity', 'productStockCount',
            'productStatus	', 'subCategory.subCategoryName', 'discountValue as discount',
            knex.db.raw('(productCatalog.MRP - ( productCatalog.MRP * ( discountValue/100 ) )) as price'),
            'productOfferX', 'productOfferY')
          .innerJoin('subCategory', 'products.subcategoryId', '=', 'subCategory.id')
          .innerJoin('productCatalog', 'products.id', '=', 'productCatalog.productId')
          .innerJoin('disCountDetails', 'products.id', '=', 'disCountDetails.productId')
          .innerJoin('productInventory', 'products.id', '=', 'productInventory.productId')
          .where({
            'deleteProduct': 0,
            'products.newArrivals': 1,
            'products.activeStatus': 1,
            'productCatalog.catalogId': data.auth.catalogId,
            'disCountDetails.discountId': data.auth.discountId,
            'productInventory.outletId': data.auth.outletId
          })
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            console.log(error)
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }

    this.getNewArrivalProducts = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        var pageNumber = data.pageNumber
        if (pageNumber == '0') {
          pageNumber = '0'
        } else {
          pageNumber = pageNumber - 1
        }
        var pageOffset = parseInt(pageNumber * data.pageCount)
        //knex.db.raw('1 as productStatus')
        knex.db('products')
          .select('products.id', 'productName', 'productImage', 'productCatalog.MRP',
            'products.productCode', 'weight', 'productGST', 'MOQ', 'maxQty', 'productStockCount', 'products.defaultQuantity',
            'productStatus	', 'subCategory.subCategoryName', 'category.categoryName', 'discountValue as discount',
            knex.db.raw('(productCatalog.MRP - ( productCatalog.MRP * ( discountValue/100 ) )) as price'),
            'productOfferX', 'productOfferY')
          .innerJoin('subCategory', 'products.subcategoryId', '=', 'subCategory.id')
          .innerJoin('category', 'products.categoryId', '=', 'category.id')
          .innerJoin('productCatalog', 'products.id', '=', 'productCatalog.productId')
          .innerJoin('disCountDetails', 'products.id', '=', 'disCountDetails.productId')
          .innerJoin('productInventory', 'products.id', '=', 'productInventory.productId')
          .where({
            'deleteProduct': 0,
            'products.newArrivals': 1,
            'products.activeStatus': 1,
            'productCatalog.catalogId': data.auth.catalogId,
            'disCountDetails.discountId': data.auth.discountId,
            'productInventory.outletId': data.auth.outletId
          })
          .orderBy('products.id', 'desc')
          .offset(pageOffset).limit(data.pageCount)
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }

    // Category Products

    this.getTotalCategoryProducts = function (data, object) {
      var response = {}
      console.log("object.auth", object.auth)
      return new Promise(function (resolve) {
        var optionsArray = JSON.parse(object.optionsIds)
        knex.db('products')
          .select('products.id', 'productName', 'productImage', 'productCatalog.MRP', 'products.productCode',
            'products.finishingFast', 'products.fewStocksLeft', 'products.id', 'products.specialDiscount', 'products.specialDiscountValue',
            'weight', 'productGST', 'MOQ', 'maxQty', 'products.defaultQuantity', 'productStockCount', 'productCatalog.productStatus	',
            'subCategory.subCategoryName', 'discountValue as discount', 'productCatalog.sortingOrder',
            knex.db.raw('(productCatalog.MRP - ( productCatalog.MRP * ( discountValue/100 ) )) as price'),
            'productOfferX', 'productOfferY', 'attributeOptionsIds')
          .innerJoin('subCategory', 'products.subcategoryId', '=', 'subCategory.id')
          .innerJoin('productCatalog', 'products.id', '=', 'productCatalog.productId')
          .innerJoin('disCountDetails', 'products.id', '=', 'disCountDetails.productId')
          .innerJoin('productInventory', 'products.id', '=', 'productInventory.productId')
          .where({
            'deleteProduct': 0,
            'products.activeStatus': 1,
            'productCatalog.catalogId': object.auth.catalogId,
            'productCatalog.productStatus': 1,
            'disCountDetails.discountId': object.auth.discountId,
            'productInventory.outletId': object.auth.outletId
          })
          .distinct('products.id', 'products.productCode')
          // .where(data)
          // .whereIn('products.subcategoryId', [1])
          .modify(function (queryBuilder) {
            if (object.sortBy === '1') {
              // Sort by price low to high - 1
              queryBuilder.orderBy('price', 'asc')
            } else if (object.sortBy === '2') {
              // Sort by price high to low - 2
              queryBuilder.orderBy('price', 'desc')
            } else if (object.sortBy === '3') {
              // Sort by productCatalog.MRP low to high - 3
              queryBuilder.orderBy('productCatalog.MRP', 'asc')
            } else if (object.sortBy === '4') {
              // Sort by productCatalog.MRP high to low - 4
              queryBuilder.orderBy('productCatalog.MRP', 'desc')
            } else if (object.sortBy === '5') {
              // Sort by discount low to high - 5
              queryBuilder.orderBy('discount', 'asc')
            } else if (object.sortBy === '6') {
              // Sort by discount high to low - 7
              queryBuilder.orderBy('discount', 'desc')
            } else if (object.sortBy === '7') {
              // Sort by product name - 7
              queryBuilder.orderBy('productName')
            } else {
              queryBuilder.orderBy('productCatalog.sortingOrder', 'asc')
            }


            if (optionsArray.length > 0) {
              // Attribute options
              // var conv = optionsArray.toString().split(',')
              // var strValue = JSON.stringify(conv)
              // queryBuilder.whereRaw('(JSON_CONTAINS(attributeOptionsIds, ? ) AND products.categoryId = ? )', [strValue, object.categoryId])
              var queryFunction = optionsArray.map(function (item) {
                return "JSON_CONTAINS(attributeOptionsIds, '" + '"' + item + '"' + "')"
              }).join(' OR ')
              var build = '(' + queryFunction + ')' + ' AND ' + 'products.categoryId =' + object.categoryId
              queryBuilder.whereRaw(build)
            } else {
              queryBuilder.where(data)
            }

            var subCategoryArray = JSON.parse(object.subcategoryId)
            if (subCategoryArray.length > 0) {
              queryBuilder.whereIn('products.subcategoryId', subCategoryArray)
            }
            // Min and Mix price
            if (object.minPrice !== '0' && object.maxPrice !== '0') {
              queryBuilder.having('price', '>=', object.minPrice)
              queryBuilder.having('price', '<=', object.maxPrice)
            } else if (object.minPrice !== '0' && object.maxPrice == '0') {
              queryBuilder.having('price', '>=', object.minPrice)
            }
            if (object.minPrice == '0' && object.maxPrice !== '0') {
              queryBuilder.having('price', '>=', object.minPrice)
            }
          })
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            console.log(error)
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }

    this.getCategoryProductsList = function (data, req) {
      var response = {}
      return new Promise(function (resolve) {
        var pageNumber = req.pageNumber
        if (pageNumber == '0') {
          pageNumber = '0'
        } else {
          pageNumber = pageNumber - 1
        }
        var pageOffset = parseInt(pageNumber * req.pageCount)
        var optionsArray = JSON.parse(req.optionsIds)
        knex.db('products')
          .select('products.id', 'productName', 'productImage', 'productCatalog.MRP', 'products.productCode',
            'weight', 'productGST', 'MOQ', 'maxQty', 'products.defaultQuantity', 'productStockCount', 'productCatalog.productStatus',
            'finishingFast', 'fewStocksLeft', 'subCategory.subCategoryName', 'categoryName', 'productCatalog.sortingOrder',
            'discountValue as discount', knex.db.raw('(productCatalog.MRP - ( productCatalog.MRP * ( discountValue/100 ) )) as price'),
            'productOfferX', 'productOfferY')
          .innerJoin('subCategory', 'products.subcategoryId', '=', 'subCategory.id')
          .innerJoin('category', 'products.categoryId', '=', 'category.id')
          .innerJoin('productCatalog', 'products.id', '=', 'productCatalog.productId')
          .innerJoin('disCountDetails', 'products.id', '=', 'disCountDetails.productId')
          .innerJoin('productInventory', 'products.id', '=', 'productInventory.productId')
          .whereRaw('(productInventory.productStockCount > 0 OR products.defaultQuantity > 0)')
          .andWhere({
            // .where({
            'deleteProduct': 0,
            'products.activeStatus': 1,
            'productCatalog.catalogId': req.auth.catalogId,
            'productCatalog.productStatus': 1,
            'disCountDetails.discountId': req.auth.discountId,
            'productInventory.outletId': req.auth.outletId
          })
          // .where(data)
          .distinct('products.id', 'products.productCode')
          .modify(function (queryBuilder) {
            if (req.sortBy === '1') {
              // Sort by price low to high - 1
              queryBuilder.orderBy('price', 'asc')
            } else if (req.sortBy === '2') {
              // Sort by price high to low - 2
              queryBuilder.orderBy('price', 'desc')
            } else if (req.sortBy === '3') {
              // Sort by productCatalog.MRP low to high - 3
              queryBuilder.orderBy('productCatalog.MRP', 'asc')
            } else if (req.sortBy === '4') {
              queryBuilder.orderBy('productCatalog.MRP', 'desc')
            } else if (req.sortBy === '5') {
              // Sort by discount low to high - 5
              queryBuilder.orderBy('discount', 'asc')
            } else if (req.sortBy === '6') {
              // Sort by discount high to low - 7
              queryBuilder.orderBy('discount', 'desc')
            } else if (req.sortBy === '7') {
              // Sort by product name A-Z - 7
              queryBuilder.orderBy('productName', 'asc')
            } else if (req.sortBy === '8') {
              // Sort by product name Z-A- 8
              queryBuilder.orderBy('productName', 'desc')
            } else {
              queryBuilder.orderBy('productCatalog.sortingOrder', 'asc')
            }

            if (optionsArray.length > 0) {
              // Attribute options
              // var conv = optionsArray.toString().split(',')
              // var strValue = JSON.stringify(conv)
              // queryBuilder.whereRaw('(JSON_CONTAINS(attributeOptionsIds, ? ) AND products.categoryId = ? )', [strValue, req.categoryId])
              var queryFunction = optionsArray.map(function (item) {
                return "JSON_CONTAINS(attributeOptionsIds, '" + '"' + item + '"' + "')"
              }).join(' OR ')
              var build = '(' + queryFunction + ')' + ' AND ' + 'products.categoryId =' + req.categoryId
              queryBuilder.whereRaw(build)
            } else {
              queryBuilder.where(data)
            }
            var subCategoryArray = JSON.parse(req.subcategoryId)
            if (subCategoryArray.length > 0) {
              queryBuilder.whereIn('products.subcategoryId', subCategoryArray)
            }
            // Min and Mix price
            if (req.minPrice !== '0' && req.maxPrice !== '0') {
              queryBuilder.having('price', '>=', req.minPrice)
              queryBuilder.having('price', '<=', req.maxPrice)
            } else if (req.minPrice !== '0') {
              queryBuilder.having('price', '>=', req.minPrice)
            } else if (req.minPrice == '0' && req.maxPrice !== '0') {
              queryBuilder.having('price', '>=', req.minPrice)
              queryBuilder.having('price', '<=', req.maxPrice)
            }
          })
          // .orderBy('products.id', 'desc')
          .offset(pageOffset).limit(req.pageCount)
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            console.log(error)
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }



    this.getTotalCategoryProducts1 = function (request) {
      var response = {}
      return new Promise(function (resolve) {
        // var optionsArray = JSON.parse(request.optionsIds)
        knex.db('products')
          .select('products.id', 'productName', 'productImage', 'productCatalog.MRP', 'products.productCode', 'finishingFast',
            'fewStocksLeft', 'weight', 'productGST', 'MOQ', 'maxQty', 'products.defaultQuantity',
            'productStockCount', 'productCatalog.productStatus	',
            'products.specialDiscount', 'products.specialDiscountValue',
            'subCategory.subCategoryName', 'discountValue as discount', 'productCatalog.sortingOrder',
            knex.db.raw('(productCatalog.MRP - ( productCatalog.MRP * ( discountValue/100 ) )) as price'),
            'productOfferX', 'productOfferY', 'attributeOptionsIds')
          .innerJoin('subCategory', 'products.subcategoryId', '=', 'subCategory.id')
          .innerJoin('category', 'products.categoryId', '=', 'category.id')
          .innerJoin('productCatalog', 'products.id', '=', 'productCatalog.productId')
          .innerJoin('disCountDetails', 'products.id', '=', 'disCountDetails.productId')
          .innerJoin('productInventory', 'products.id', '=', 'productInventory.productId')
          .where({
            'deleteProduct': 0,
            'products.activeStatus': 1,
            'productCatalog.catalogId': request.auth.catalogId,
            'productCatalog.productStatus': 1,
            'disCountDetails.discountId': request.auth.discountId,
            'productInventory.outletId': request.auth.outletId
          })
          // .where('productName', 'like', '%' + request.text + '%')
          .andWhere(knex.db.raw(`(products.productName like '%${request.text}%'
                  or products.productCode like '%${request.text}%'
                  or category.categoryName like '%${request.text}%'
                  or subCategory.subCategoryName like '%${request.text}%'
                  )`))
          // .orWhere('products.productCode', 'like', '%' + request.text + '%')
          // .orWhere('category.categoryName', 'like', '%' + request.text + '%')
          // .orWhere('subCategory.subCategoryName', 'like', '%' + request.text + '%')
          .groupBy('products.id')
          // .distinct('products.id', 'products.productCode')
          .orderBy('productCatalog.sortingOrder', 'desc')
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            console.log("getTotalCategoryProducts1", error)
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }

    this.getCategoryProductsList1 = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        var pageNumber = data.pageNumber
        if (pageNumber == '0') {
          pageNumber = '0'
        } else {
          pageNumber = pageNumber - 1
        }
        var pageOffset = parseInt(pageNumber * data.pageCount)
        // var optionsArray = JSON.parse(data.optionsIds)
        knex.db('products')
          .select('products.id', 'productName', 'productImage', 'productCatalog.MRP', 'products.productCode',
            'weight', 'productGST', 'MOQ', 'maxQty', 'products.defaultQuantity', 'productStockCount', 'productCatalog.productStatus',
            'finishingFast', 'fewStocksLeft', 'subCategory.subCategoryName', 'categoryName', 'productCatalog.sortingOrder',
            'discountValue as discount', knex.db.raw('(productCatalog.MRP - ( productCatalog.MRP * ( discountValue/100 ) )) as price'),
            'productOfferX', 'productOfferY')
          .innerJoin('subCategory', 'products.subcategoryId', '=', 'subCategory.id')
          .innerJoin('category', 'products.categoryId', '=', 'category.id')
          .innerJoin('productCatalog', 'products.id', '=', 'productCatalog.productId')
          .innerJoin('disCountDetails', 'products.id', '=', 'disCountDetails.productId')
          .innerJoin('productInventory', 'products.id', '=', 'productInventory.productId')
          .where({
            'deleteProduct': 0,
            'products.activeStatus': 1,
            'productCatalog.catalogId': data.auth.catalogId,
            'productCatalog.productStatus': 1,
            'disCountDetails.discountId': data.auth.discountId,
            'productInventory.outletId': data.auth.outletId
          })
          // .where('productName', 'like', '%' + data.text + '%')
          .andWhere(knex.db.raw(`(products.productName like '%${data.text}%'
                  or products.productCode like '%${data.text}%'
                  or category.categoryName like '%${data.text}%'
                  or subCategory.subCategoryName like '%${data.text}%'
                  )`))
          // .orWhere('products.productCode', 'like', '%' + data.text + '%')
          // .orWhere('category.categoryName', 'like', '%' + data.text + '%')
          // .orWhere('subCategory.subCategoryName', 'like', '%' + data.text + '%')
          // .distinct('products.id', 'products.productCode')
          .groupBy('products.id')
          .orderBy('productCatalog.sortingOrder', 'asc')
          .offset(pageOffset).limit(data.pageCount)
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            console.log(error)
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }






    this.TotalnewArrivalsModel = function (data) {
      var response = {}
      return new Promise(function (resolve, reject) {
        knex.db('products')
          .select('products.id', 'productName', 'productImage', 'productCatalog.MRP', 'products.productCode', 'weight',
            'productGST', 'MOQ', 'maxQty', 'products.defaultQuantity', 'productInventory.productStockCount',
            'productCatalog.productStatus	', 'subCategory.subCategoryName', 'productCatalog.catalogId',
            'products.fewStocksLeft', 'products.finishingFast',
            'category.categoryName', 'discountValue as discount',
            knex.db.raw('(productCatalog.MRP - ( productCatalog.MRP * ( discountValue/100 ) )) as price'),
            'productOfferX', 'productOfferY')
          .innerJoin('subCategory', 'products.subcategoryId', '=', 'subCategory.id')
          .innerJoin('category', 'products.categoryId', '=', 'category.id')
          .innerJoin('productCatalog', 'products.id', '=', 'productCatalog.productId')
          .innerJoin('disCountDetails', 'products.id', '=', 'disCountDetails.productId')
          .innerJoin('productInventory', 'products.id', '=', 'productInventory.productId')
          .where({
            'deleteProduct': 0,
            'productInventory.new_arrivals': 1,
            'products.activeStatus': 1,
            'productCatalog.catalogId': data.auth.catalogId,
            'productCatalog.productStatus': 1,
            'disCountDetails.discountId': data.auth.discountId,
            'productInventory.outletId': data.auth.outletId
          })
          .groupBy('products.id')
          // .limit(6)
          .orderBy('productInventory.updatedAt', 'desc')
          .then((result) => {
            response.error = false
            response.data = result
            //  console.log("NewArrivals***",result)
            resolve(response)
          })
          .catch((error) => {
            console.log("NewArrivals error", error)
            response.error = true
            reject(response)
          })
      })
    }




    this.newArrivalsModel = function (data) {
      var response = {}

      var pageNumber = data.pageNumber
      if (pageNumber == '0') {
        pageNumber = '0'
      } else {
        pageNumber = pageNumber - 1
      }
      var pageOffset = parseInt(pageNumber * data.pageCount)


      return new Promise(function (resolve, reject) {
        knex.db('products')
          .select('products.id', 'productName', 'productImage', 'productCatalog.MRP', 'products.productCode', 'weight',
            'productGST', 'MOQ', 'maxQty', 'products.defaultQuantity', 'productInventory.productStockCount',
            'productCatalog.productStatus	', 'subCategory.subCategoryName', 'productCatalog.catalogId',
            'products.fewStocksLeft', 'products.finishingFast',
            'category.categoryName', 'discountValue as discount',
            knex.db.raw('(productCatalog.MRP - ( productCatalog.MRP * ( discountValue/100 ) )) as price'),
            'productOfferX', 'productOfferY')
          .innerJoin('subCategory', 'products.subcategoryId', '=', 'subCategory.id')
          .innerJoin('category', 'products.categoryId', '=', 'category.id')
          .innerJoin('productCatalog', 'products.id', '=', 'productCatalog.productId')
          .innerJoin('disCountDetails', 'products.id', '=', 'disCountDetails.productId')
          .innerJoin('productInventory', 'products.id', '=', 'productInventory.productId')
          .where({
            'deleteProduct': 0,
            'productInventory.new_arrivals': 1,
            'products.activeStatus': 1,
            'productCatalog.catalogId': data.auth.catalogId,
            'productCatalog.productStatus': 1,
            'disCountDetails.discountId': data.auth.discountId,
            'productInventory.outletId': data.auth.outletId
          })
          .groupBy('products.id')
          .offset(pageOffset).limit(data.pageCount)
          .orderBy('productInventory.updatedAt', 'desc')
          .then((result) => {
            response.error = false
            response.data = result
            //  console.log("NewArrivals***",result)
            resolve(response)
          })
          .catch((error) => {
            console.log("NewArrivals error", error)
            response.error = true
            reject(response)
          })
      })
    }

    this.newArrivals = function (data) {
      var response = {}
      return new Promise(function (resolve, reject) {
        knex.db('products')
          .select('products.id', 'productName', 'productImage', 'productCatalog.MRP', 'products.productCode', 'weight',
            'productGST', 'MOQ', 'maxQty', 'products.defaultQuantity', 'productInventory.productStockCount',
            'productCatalog.productStatus	', 'subCategory.subCategoryName', 'productCatalog.catalogId',
            'products.fewStocksLeft', 'products.finishingFast', 'products.specialDiscount', 'products.specialDiscountValue',
            'category.categoryName', 'discountValue as discount',
            knex.db.raw('(productCatalog.MRP - ( productCatalog.MRP * ( discountValue/100 ) )) as price'),
            'productOfferX', 'productOfferY')
          .innerJoin('subCategory', 'products.subcategoryId', '=', 'subCategory.id')
          .innerJoin('category', 'products.categoryId', '=', 'category.id')
          .innerJoin('productCatalog', 'products.id', '=', 'productCatalog.productId')
          .innerJoin('disCountDetails', 'products.id', '=', 'disCountDetails.productId')
          .innerJoin('productInventory', 'products.id', '=', 'productInventory.productId')
          .where({
            'deleteProduct': 0,
            'productInventory.new_arrivals': 1,
            'products.activeStatus': 1,
            'productCatalog.catalogId': data.auth.catalogId,
            'productCatalog.productStatus': 1,
            'disCountDetails.discountId': data.auth.discountId,
            'productInventory.outletId': data.auth.outletId
          })
          .groupBy('products.id')
          .limit(12)
          .orderBy('productInventory.updatedAt', 'desc')
          .then((result) => {
            response.error = false
            response.data = result
            //  console.log("NewArrivals***",result)
            resolve(response)
          })
          .catch((error) => {
            console.log("NewArrivals error", error)
            response.error = true
            reject(response)
          })
      })
    }




    this.userProductDiscountOption = function (data) {
      var response = {}
      return new Promise(function (resolve, reject) {
        knex.db('productDiscount')
          .where({
            discountType: 'USER',
            userId: data.userId,
            productId: data.productId
          })
          .then((result) => {
            response.error = false
            response.data = result[0]
          })
          .catch((error) => {
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }

    this.checkProductId = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('products')
          .select('products.id', 'productName', 'productImage', 'productCatalog.MRP', 'products.productCode', 'weight',
            'productGST', 'MOQ', 'maxQty', 'products.defaultQuantity', 'productStockCount', 'finishingFast', 'fewStocksLeft',
            'subCategory.subCategoryName', 'category.categoryName', 'description', 'specifications', 'productOfferX', 'productOfferY',
            'discountValue as discount', 'products.specialDiscount', 'products.specialDiscountValue',
            knex.db.raw('(productCatalog.MRP - ( productCatalog.MRP * ( discountValue/100 ) )) as price'),
            'productOfferX', 'productOfferY', 'attributeOptionsIds', 'attributeIds')
          .leftJoin('subCategory', 'products.subcategoryId', '=', 'subCategory.id')
          .leftJoin('category', 'products.categoryId', '=', 'category.id')
          .innerJoin('disCountDetails', 'products.id', '=', 'disCountDetails.productId')
          .innerJoin('productInventory', 'products.id', '=', 'productInventory.productId')
          .innerJoin('productCatalog', 'products.id', '=', 'productCatalog.productId')
          .where({
            'deleteProduct': 0,
            'productCatalog.productStatus': 1,
            'products.id': data.productId,
            'disCountDetails.discountId': data.auth.discountId,
            'productInventory.outletId': data.auth.outletId,
            'productCatalog.catalogId': data.auth.catalogId
          })
          .groupBy('products.id')
          .then((result) => {
            response.error = false
            response.data = result
            resolve(response)
            // console.log("result", result)
          })
          .catch((error) => {
            console.log(error)
            response.error = true
            resolve(response)
          })
        // .finally(() => {
        //   resolve(response)
        // })
      })
    }

    this.checkProductCodeModel = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('products')
          .select('products.id', 'productName', 'productImage', 'productCatalog.MRP', 'products.productCode', 'weight',
            'productGST', 'MOQ', 'maxQty', 'products.defaultQuantity', 'productStockCount', 'finishingFast', 'fewStocksLeft',
            'subCategory.subCategoryName', 'category.categoryName', 'description', 'specifications', 'productOfferX', 'productOfferY',
            'discountValue as discount', 'products.specialDiscount', 'products.specialDiscountValue',
            knex.db.raw('(productCatalog.MRP - ( productCatalog.MRP * ( discountValue/100 ) )) as price'),
            'productOfferX', 'productOfferY', 'attributeOptionsIds', 'attributeIds')
          .leftJoin('subCategory', 'products.subcategoryId', '=', 'subCategory.id')
          .leftJoin('category', 'products.categoryId', '=', 'category.id')
          .innerJoin('disCountDetails', 'products.id', '=', 'disCountDetails.productId')
          .innerJoin('productInventory', 'products.id', '=', 'productInventory.productId')
          .innerJoin('productCatalog', 'products.id', '=', 'productCatalog.productId')
          .where({
            'deleteProduct': 0,
            'productCatalog.productStatus': 1,
            'products.productCode': data.productCode,
            'disCountDetails.discountId': data.auth.discountId,
            'productInventory.outletId': data.auth.outletId,
            'productCatalog.catalogId': data.auth.catalogId
          })
          .groupBy('products.id')
          .then((result) => {
            response.error = false
            response.data = result
            resolve(response)
            // console.log("result", result)
          })
          .catch((error) => {
            console.log(error)
            response.error = true
            resolve(response)
          })
        // .finally(() => {
        //   resolve(response)
        // })
      })
    }



    // Cart Deatils
    this.checkProductId2 = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('products')
          .select('products.id')
          .where({
            'deleteProduct': 0,
            'products.id': data.productId,
            'disCountDetails.discountId': data.auth.discountId,
            'productInventory.outletId': data.auth.outletId
          })
          .then((result) => {
            response.error = false
            response.data = result
            resolve(response)
            console.log("result", result)
          })
          .catch((error) => {
            response.error = true
            resolve(response)
          })
        // .finally(() => {
        //   resolve(response)
        // })
      })
    }
    this.checkMyCartProduct = function (userId, productId) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('cartItems')
          .select('cartItems.*', 'productCatalog.MRP')
          .innerJoin('products', 'products.id', '=', 'cartItems.productId')
          .innerJoin('productCatalog', 'cartItems.productId', '=', 'productCatalog.productId')
          .where({
            'userId': userId,
            'cartItems.productId': productId,
            'cartType': 'USER'
          })
          .groupBy('products.id')
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            console.log("checkMyCartProduct", error)
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }

    this.insertCartItems = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('cartItems')
          .insert(data)
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }

    this.updateCartItems = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('cartItems')
          .where('id', data.id)
          .update(data)
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            console.log("updateCartItems", error)
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }

    this.getCardItems = function (userId, auth) {
      var response = {}
      //   var limit = 10
      // var page = data.page
      //  var page=1;
      //  var offset = (page - 1) * limit
      // console.log(data)
      return new Promise(function (resolve) {
        // knex.db.raw('SELECT cartItems.id, productCatalog.MRP, products.productName, products.productCode, products.productImage, products.productGST, cartItems.productId, cartItems.quantity, subCategory.discount, SUM(productCatalog.MRP * cartItems.quantity) AS totalamt ,SUM(productCatalog.MRP * cartItems.quantity - ( productCatalog.MRP * cartItems.quantity * ( subCategory.discount/100))) AS dicountAmount FROM `cartItems` INNER JOIN products ON cartItems.productId = products.id INNER JOIN subCategory ON products.subcategoryId = subCategory.id WHERE userId=? GROUP BY cartItems.quantity, productCatalog.MRP, cartItems.id', [data])
        knex.db('cartItems')
          .select('cartItems.id', 'cartItems.productId', 'products.productCode', 'cartItems.userId',
            'cartItems.quantity', 'productName', 'productImage', 'productCatalog.MRP', 'MOQ', 'maxQty','productCatalog.productStatus',
            'productStockCount', 'finishingFast', 'fewStocksLeft', 'productGST', 'productOfferX','products.remarks',
            'products.defaultQuantity', 'products.specialDiscount', 'products.specialDiscountValue',
            'productOfferY', 'attribute', 'options', 'discountValue as discount', 'products.deleteProduct',
            knex.db.raw('SUM( productCatalog.MRP - (productCatalog.MRP * ( discountValue/100))) as supplyPrice'),
            knex.db.raw(`SUM(productCatalog.MRP * cartItems.quantity - ( productCatalog.MRP * cartItems.quantity * ( discountValue/100))) as totalPrice, 
                    SUM((productCatalog.MRP * cartItems.quantity - ( productCatalog.MRP * cartItems.quantity * ( discountValue/100))) * ( products.productGST/100) ) AS gstAmount`)
            , 'attribute', 'options')
          .innerJoin('products', 'cartItems.productId', '=', 'products.id')
          .leftJoin('subCategory', 'products.subcategoryId', '=', 'subCategory.id')
          .innerJoin('disCountDetails', 'products.id', '=', 'disCountDetails.productId')
          .innerJoin('productInventory', 'products.id', '=', 'productInventory.productId')
          .innerJoin('productCatalog', 'products.id', '=', 'productCatalog.productId')

          .where({
            'cartItems.userId': userId,
            'disCountDetails.discountId': auth.discountId,
            'productInventory.outletId': auth.outletId,
            'productCatalog.catalogId': auth.catalogId,
            cartType: 'USER'
          })
          .groupBy('cartItems.id', 'cartItems.productId', 'products.id', 'cartItems.quantity', 'productCatalog.productId')
          .orderBy('cartItems.id', 'asc')
          // .limit(limit).offset(offset)
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            console.log(error)
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }



    this.updateCartItemsModel = function (id, quantity) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('cartItems')
          .update({
            quantity: quantity
          })
          .where('id', id)
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }









    this.getCardItemsByPage = function (req, auth) {
      var response = {}
      var limit = 10
      var page = req.page
      var offset = (page - 1) * limit

      return new Promise(function (resolve) {
        // knex.db.raw('SELECT cartItems.id, productCatalog.MRP, products.productName, products.productCode, products.productImage, products.productGST, cartItems.productId, cartItems.quantity, subCategory.discount, SUM(productCatalog.MRP * cartItems.quantity) AS totalamt ,SUM(productCatalog.MRP * cartItems.quantity - ( productCatalog.MRP * cartItems.quantity * ( subCategory.discount/100))) AS dicountAmount FROM `cartItems` INNER JOIN products ON cartItems.productId = products.id INNER JOIN subCategory ON products.subcategoryId = subCategory.id WHERE userId=? GROUP BY cartItems.quantity, productCatalog.MRP, cartItems.id', [data])
        knex.db('cartItems')
          .select('cartItems.id', 'cartItems.productId', 'cartItems.userId', 'cartItems.quantity', 'productName',
            'products.productCode', 'productImage', 'MOQ', 'maxQty', 'products.defaultQuantity',
            'finishingFast', 'fewStocksLeft', 'productGST', 'productOfferX', 'discountValue as discount',
            'productOfferY', 'attribute', 'options', 'products.deleteProduct', 'productStockCount',
            'products.specialDiscount', 'products.specialDiscountValue',
            'productCatalog.MRP',
            knex.db.raw('SUM( productCatalog.MRP - (productCatalog.MRP * ( discountValue/100))) as supplyPrice'),
            knex.db.raw('SUM(productCatalog.MRP * cartItems.quantity - ( productCatalog.MRP * cartItems.quantity * ( discountValue/100))) as totalPrice, SUM((productCatalog.MRP * cartItems.quantity - ( productCatalog.MRP * cartItems.quantity * ( discountValue/100))) * ( products.productGST/100) ) AS gstAmount'), 'attribute', 'options')

          .innerJoin('products', 'cartItems.productId', '=', 'products.id')
          .innerJoin('subCategory', 'products.subcategoryId', '=', 'subCategory.id')
          .innerJoin('disCountDetails', 'cartItems.productId', '=', 'disCountDetails.productId')
          .innerJoin('productInventory', 'products.id', '=', 'productInventory.productId')
          .innerJoin('productCatalog', 'products.id', '=', 'productCatalog.productId')

          .where({
            'cartItems.userId': req.userId,
            'disCountDetails.discountId': auth.discountId,
            'productInventory.outletId': auth.outletId,
            'productCatalog.catalogId': auth.catalogId,
            cartType: 'USER'
          })
          .groupBy('cartItems.id', 'cartItems.productId', 'products.id', 'cartItems.quantity', 'productCatalog.productId',
            //  'productStockCount' ,'discountValue'
          )
          .orderBy('cartItems.id', 'asc')
          // .limit(limit).offset(offset)
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            console.log(error)
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }

    this.getCardTotalSumValue = function (userId, auth) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db.raw(`SELECT SUM(discountAmount) as finaltotal, SUM(gstAmount) as gsttotal 
                FROM (SELECT cartItems.id, products.productGST, cartItems.productId, cartItems.quantity, 
                  subCategory.discount, SUM(productCatalog.MRP * cartItems.quantity) AS totalamt ,
                  SUM(productCatalog.MRP * cartItems.quantity - ( productCatalog.MRP * cartItems.quantity * ( discountValue/100))) AS discountAmount,
                   SUM((productCatalog.MRP * cartItems.quantity - ( productCatalog.MRP * cartItems.quantity * ( discountValue/100))) * ( products.productGST/100) ) AS gstAmount 
                   FROM cartItems 
                  INNER JOIN products ON cartItems.productId = products.id 
                  INNER JOIN subCategory ON products.subcategoryId = subCategory.id 
                  INNER JOIN disCountDetails ON products.id = disCountDetails.productId 
                  INNER JOIN productCatalog ON cartItems.productId = productCatalog.productId 
                  WHERE userId=? AND disCountDetails.discountId=? AND cartType=? And 
                  productCatalog.catalogId = ?
                  GROUP BY cartItems.quantity,products.id, productCatalog.MRP, cartItems.id) t1`, [userId, auth.discountId, 'USER', auth.catalogId])
          .then((result) => {
            response.error = false
            response.data = result[0]
          })
          .catch((error) => {
            console.log(error)
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }

    this.deleteCartModel = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('cartItems')
          .where('id', data)
          .del()
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }

    this.getOneBannerImageModel = function (data) {
      var response = {}
      data.type = 'web'
      return new Promise(function (resolve) {
        knex.db('featureProductBanner')
          .select('*')
          .where('title', data.title)
          .andWhere('outlet_id', data.auth.outletId)
          .andWhere('type', data.type)
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }


    // Feature Products
    this.totalFeatureProduct = function (data) {
      var response = {}
      return new Promise(function (resolve, reject) {
        knex.db('products')
          .select('products.id', 'productName', 'productImage', 'productCatalog.MRP', 'products.productCode',
            'weight', 'productGST', 'MOQ', 'maxQty', 'products.defaultQuantity', 'productStockCount', 'productStatus	',
            'products.fewStocksLeft', 'products.finishingFast',
            'subCategory.subCategoryName', 'discountValue as discount',
            'products.specialDiscount', 'products.specialDiscountValue',
            knex.db.raw('(productCatalog.MRP - ( productCatalog.MRP * ( discountValue/100 ) )) as price'),
            'productOfferX', 'productOfferY')
          .innerJoin('subCategory', 'products.subcategoryId', '=', 'subCategory.id')
          .innerJoin('productCatalog', 'products.id', '=', 'productCatalog.productId')
          .innerJoin('disCountDetails', 'products.id', '=', 'disCountDetails.productId')
          .innerJoin('productInventory', 'products.id', '=', 'productInventory.productId')
          .innerJoin('featureProducts', 'products.id', '=', 'featureProducts.productId')
          .where({
            'deleteProduct': 0,
            // 'products.featureProduct': 1,
            'products.activeStatus': 1,
            'productCatalog.catalogId': data.auth.catalogId,
            'disCountDetails.discountId': data.auth.discountId,
            'productInventory.outletId': data.auth.outletId,
            'featureProducts.title': data.title,
            'featureProducts.outlet_id': data.auth.outletId,
            'featureProducts.activeStatus': 1

          })
          .orderBy('featureProducts.id', 'desc')
          .distinct('products.id', 'products.productCode')
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            console.log(error)
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }

    this.listFeatureProduct = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        var pageNumber = data.pageNumber
        if (pageNumber == '0') {
          pageNumber = '0'
        } else {
          pageNumber = pageNumber - 1
        }
        var pageOffset = parseInt(pageNumber * data.pageCount)
        knex.db('products')
          .select('products.id', 'productName', 'productImage', 'productCatalog.MRP', 'products.productCode', 'weight',
            'productGST', 'MOQ', 'maxQty', 'products.defaultQuantity', 'productStockCount', 'productStatus', 'FeatuteTitle as featuteTitle',
            'FeatuteDescription as featuteDescription', 'subCategory.subCategoryName', 'category.categoryName',
            'discountValue as discount', knex.db.raw('(productCatalog.MRP - ( productCatalog.MRP * ( discountValue/100 ) )) as price'), 'productOfferX',
            'productOfferY')
          .innerJoin('subCategory', 'products.subcategoryId', '=', 'subCategory.id')
          .innerJoin('category', 'products.categoryId', '=', 'category.id')
          .innerJoin('productCatalog', 'products.id', '=', 'productCatalog.productId')
          .innerJoin('disCountDetails', 'products.id', '=', 'disCountDetails.productId')
          .innerJoin('productInventory', 'products.id', '=', 'productInventory.productId')
          .innerJoin('featureProducts', 'products.id', '=', 'featureProducts.productId')
          .where({
            'deleteProduct': 0,
            // 'products.featureProduct': 1,
            'products.activeStatus': 1,
            'productCatalog.catalogId': data.auth.catalogId,
            'disCountDetails.discountId': data.auth.discountId,
            'productInventory.outletId': data.auth.outletId,
            'featureProducts.title': data.title,
            'featureProducts.activeStatus': 1
          })
          // .orderBy('products.id', 'desc')
          .orderBy('featureProducts.id', 'desc')
          .distinct('products.id', 'products.productCode')
          .offset(pageOffset).limit(data.pageCount)
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }

    // Banners
    this.featureBannerModel = function (data) {
      var response = {}
      return new Promise(function (resolve, reject) {
        knex.db('featureProductBanner')
          .select('*')
          .where('outlet_id', data.auth.outletId)
          .andWhere('type', data.type)
          .orderBy('featureProductBanner.id', 'desc')
          .then((result) => {
            response.error = false
            response.data = result
            resolve(response)
          })
          .catch((error) => {
            console.log("featureProductBanner error")
            reject(error)
          })
      })
    }

    // Order placed
    this.productImages = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('productImages')
          .select('id', 'productId', 'imageURL', 'type', 'imageURL as name', 'id as fileId')
          .whereNot('imageURL', "")
          .andWhere('productId', data)
          .orderBy('id', 'asc')
          .then((result) => {
            response.error = false
            response.data = result
            // console.log("productImages",result)

          })
          .catch((error) => {
            console.log("productImages", error)
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }

    this.productAttribute = function (data, show) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('attribute')
          .select('id', 'attributeName')
          .whereIn('id', data)
          .modify(function (queryBuilder) {
            if (show) {
              queryBuilder.where('activeStatus', 1)
            }
          })
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }

    this.attOptions = function (id, data, show) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('attributeOptions')
          .select('id', 'optionName', 'attributeId')
          .where('attributeId', id)
          .whereIn('id', data)
          .modify(function (queryBuilder) {
            if (show) {
              queryBuilder.where('activeStatus', 1)
            }
          })
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }

    this.getCartQuantity = function (id) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('cartItems')
          .where('userId', id)
          .where('cartType', 'USER')
          .sum('quantity as totalQty')
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }

    this.saveOrderDetails = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('orders')
          .insert(data)
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }
    this.saveOrderItems = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('orderItems')
          .insert(data)
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }

    this.updateOrderOty = function (orderID, totalOty, offerItems) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('orders')
          .where('id', orderID)
          .update({
            totalQuantity: totalOty,
            offerOty: offerItems
          })
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }

    this.removeCartItems = function (id) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('cartItems')
          .where('userId', id)
          .where('cartType', 'USER')
          .del()
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }

    this.RemoveCartItemsModel = function (id) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('cartItems')
          .where('id', id)
          .del()
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }












    // Explore
    this.getAllExploreList = function () {
      var response = {}
      return new Promise(function (resolve, reject) {
        knex.db('explore')
          .select('id', 'exploreName', 'exploreImage')
          .where('activeStatus', 1)
          .orderBy('id', 'desc')
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }

    this.getExploreListModel = function (data) {
      var response = {}
      return new Promise(function (resolve, reject) {
        var pageNumber = data.pageNumber
        if (pageNumber == '0') {
          pageNumber = '0'
        } else {
          pageNumber = pageNumber - 1
        }
        var pageOffset = parseInt(pageNumber * data.pageCount)
        knex.db('explore')
          .select('id', 'exploreName', 'exploreImage')
          .where('activeStatus', 1)
          .orderBy('id', 'desc')
          .offset(pageOffset).limit(data.pageCount)
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }

    this.getProductIDs = function (id) {
      var response = {}
      return new Promise(function (resolve, reject) {
        knex.db('exploreProducts')
          .select('id', 'exploreId', 'productId')
          .where('exploreId', id)
          .where('activeStatus', 1)
          .orderBy('id', 'desc')
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }

    this.expolreProductCount = function (Ids, data) {
      var response = {}
      return new Promise(function (resolve, reject) {
        var optionsArray = JSON.parse(data.optionsIds)
        knex.db('products')
          .select('products.id', 'productName', 'productImage', 'productCatalog.MRP',
            'products.fewStocksLeft', 'products.finishingFast',
            'products.productCode', 'weight', 'productGST', 'MOQ', 'maxQty', 'products.defaultQuantity', 'productStockCount',
            'productStatus	', 'subCategory.subCategoryName', 'discountValue as discount',
            'products.specialDiscount', 'products.specialDiscountValue',
            knex.db.raw('(productCatalog.MRP - ( productCatalog.MRP * ( discountValue/100 ) )) as price'),
            'productOfferX', 'productOfferY')
          .innerJoin('subCategory', 'products.subcategoryId', '=', 'subCategory.id')
          .innerJoin('productCatalog', 'products.id', '=', 'productCatalog.productId')
          .innerJoin('disCountDetails', 'products.id', '=', 'disCountDetails.productId')
          .innerJoin('productInventory', 'products.id', '=', 'productInventory.productId')
          .where({
            'deleteProduct': 0,
            'products.activeStatus': 1,
            'productCatalog.catalogId': data.auth.catalogId,
            'disCountDetails.discountId': data.auth.discountId,
            'productInventory.outletId': data.auth.outletId
          })
          // .whereIn('products.id', Ids)
          .modify(function (queryBuilder) {
            if (data.sortBy === '1') {
              // Sort by price low to high - 1
              queryBuilder.orderBy('price', 'asc')
            } else if (data.sortBy === '2') {
              // Sort by price high to low - 2
              queryBuilder.orderBy('price', 'desc')
            } else if (data.sortBy === '3') {
              // Sort by productCatalog.MRP low to high - 3
              queryBuilder.orderBy('productCatalog.MRP', 'asc')
            } else if (data.sortBy === '4') {
              queryBuilder.orderBy('productCatalog.MRP', 'desc')
            } else if (data.sortBy === '5') {
              // Sort by discount low to high - 5
              queryBuilder.orderBy('discount', 'asc')
            } else if (data.sortBy === '6') {
              // Sort by discount high to low - 7
              queryBuilder.orderBy('discount', 'desc')
            } else if (data.sortBy === '7') {
              // Sort by product name A-Z - 7
              queryBuilder.orderBy('productName', 'asc')
            } else if (data.sortBy === '8') {
              // Sort by product name Z-A- 8
              queryBuilder.orderBy('productName', 'desc')
            } else {
              queryBuilder.orderBy('products.id', 'desc')
            }

            // if (optionsArray.length > 0) {
            //   // Attribute options
            //   var stringValue = JSON.stringify(optionsArray)
            //   queryBuilder.whereRaw('JSON_CONTAINS(attributeOptionsIds, ? )', [stringValue])
            // }

            if (optionsArray.length > 0) {
              // Attribute options
              // var conv = optionsArray.toString().split(',')
              // var strValue = JSON.stringify(conv)
              // queryBuilder.whereRaw('(JSON_CONTAINS(attributeOptionsIds, ? ))', [strValue])
              var queryFunction = optionsArray.map(function (item) {
                return "JSON_CONTAINS(attributeOptionsIds, '" + '"' + item + '"' + "')"
              }).join(' OR ')
              var build = '(' + queryFunction + ')'
              queryBuilder.whereRaw(build)
            }
            queryBuilder.whereIn('products.id', Ids)
            // Min and Mix price
            if (data.minPrice !== '0' && data.maxPrice !== '0') {
              queryBuilder.having('price', '>=', data.minPrice)
              queryBuilder.having('price', '<=', data.maxPrice)
            } else if (data.minPrice !== '0') {
              queryBuilder.having('price', '>=', data.minPrice)
            } else if (data.minPrice == '0' && data.maxPrice !== '0') {
              queryBuilder.having('price', '>=', data.minPrice)
              queryBuilder.having('price', '<=', data.maxPrice)
            }
          })
          // .orderBy('products.id', 'desc')
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }

    this.exploreProductListModel = function (data) {
      var response = {}
      return new Promise(function (resolve, reject) {
        var optionsArray = JSON.parse(data.optionsIds)
        var pageNumber = data.pageNumber
        if (pageNumber == '0') {
          pageNumber = '0'
        } else {
          pageNumber = pageNumber - 1
        }
        var pageOffset = parseInt(pageNumber * data.pageCount)
        knex.db('products')
          .select('products.id', 'productName', 'productImage', 'productCatalog.MRP', 'products.productCode', 'weight',
            'productGST', 'MOQ', 'maxQty', 'products.defaultQuantity',
            'productStockCount', 'finishingFast', 'fewStocksLeft', 'productStatus	', 'subCategory.subCategoryName', 'categoryName', 'discountValue as discount', knex.db.raw('(productCatalog.MRP - ( productCatalog.MRP * ( discountValue/100 ) )) as price'), 'productOfferX', 'productOfferY')
          .innerJoin('subCategory', 'products.subcategoryId', '=', 'subCategory.id')
          .innerJoin('category', 'products.categoryId', '=', 'category.id')
          .innerJoin('productCatalog', 'products.id', '=', 'productCatalog.productId')
          .innerJoin('disCountDetails', 'products.id', '=', 'disCountDetails.productId')
          .innerJoin('productInventory', 'products.id', '=', 'productInventory.productId')
          .where({
            'deleteProduct': 0,
            'products.activeStatus': 1,
            'productCatalog.catalogId': data.auth.catalogId,
            'disCountDetails.discountId': data.auth.discountId,
            'productInventory.outletId': data.auth.outletId
          })
          // .whereIn('products.id', data.productIds)
          .modify(function (queryBuilder) {
            if (data.sortBy === '1') {
              // Sort by price low to high - 1
              queryBuilder.orderBy('price', 'asc')
            } else if (data.sortBy === '2') {
              // Sort by price high to low - 2
              queryBuilder.orderBy('price', 'desc')
            } else if (data.sortBy === '3') {
              // Sort by productCatalog.MRP low to high - 3
              queryBuilder.orderBy('productCatalog.MRP', 'asc')
            } else if (data.sortBy === '4') {
              queryBuilder.orderBy('productCatalog.MRP', 'desc')
            } else if (data.sortBy === '5') {
              // Sort by discount low to high - 5
              queryBuilder.orderBy('discount', 'asc')
            } else if (data.sortBy === '6') {
              // Sort by discount high to low - 7
              queryBuilder.orderBy('discount', 'desc')
            } else if (data.sortBy === '7') {
              // Sort by product name A-Z - 7
              queryBuilder.orderBy('productName', 'asc')
            } else if (data.sortBy === '8') {
              // Sort by product name Z-A- 8
              queryBuilder.orderBy('productName', 'desc')
            } else {
              queryBuilder.orderBy('products.id', 'desc')
            }

            // if (optionsArray.length > 0) {
            //   // Attribute options
            //   var stringValue = JSON.stringify(optionsArray)
            //   queryBuilder.whereRaw('JSON_CONTAINS(attributeOptionsIds, ? )', [stringValue])
            // }
            if (optionsArray.length > 0) {
              // Attribute options
              // var conv = optionsArray.toString().split(',')
              // var strValue = JSON.stringify(conv)
              // queryBuilder.whereRaw('(JSON_CONTAINS(attributeOptionsIds, ? ) )', [strValue])
              var queryFunction = optionsArray.map(function (item) {
                return "JSON_CONTAINS(attributeOptionsIds, '" + '"' + item + '"' + "')"
              }).join(' OR ')
              var build = '(' + queryFunction + ')'
              queryBuilder.whereRaw(build)
            }
            queryBuilder.whereIn('products.id', data.productIds)
            // Min and Mix price
            if (data.minPrice !== '0' && data.maxPrice !== '0') {
              queryBuilder.having('price', '>=', data.minPrice)
              queryBuilder.having('price', '<=', data.maxPrice)
            } else if (data.minPrice !== '0') {
              queryBuilder.having('price', '>=', data.minPrice)
            } else if (data.minPrice == '0' && data.maxPrice !== '0') {
              queryBuilder.having('price', '>=', data.minPrice)
              queryBuilder.having('price', '<=', data.maxPrice)
            }
          })
          // .orderBy('products.id', 'desc')
          .offset(pageOffset).limit(data.pageCount)
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }

    this.getManagerCartModel = function (id) {
      var response = {}
      return new Promise(function (resolve) {
        // knex.db('cartItems')
        //   .whereIn('userId', id)
        knex.db.raw('SELECT DISTINCT userId as id, name, mobileNumber, email, longitude, latitude, shopName, shopAddress, pincode, city, state, processOrder FROM cartItems INNER JOIN users on cartItems.userId = users.id where userId IN(?) AND cartType=?', [id, 'USER'])
          .then((result) => {
            response.error = false
            response.data = result[0]
          })
          .catch((error) => {
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }

    this.updateOtherInstruction = function (data) {
      var response = {}
      return new Promise(function (resolve, reject) {
        knex.db('ordersInstructions')
          .where('userId', data.userId)
          .where('type', data.type)
          .update(data)
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }

    this.checkInstructionModel = function (id) {
      var response = {}
      return new Promise(function (resolve, reject) {
        knex.db('ordersInstructions')
          .where('userId', id)
          .where('type', 'USER')
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }

    this.addOtherInstruction = function (data) {
      var response = {}
      return new Promise(function (resolve, reject) {
        knex.db('ordersInstructions')
          .insert(data)
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }

    this.getInstructionsModel = function (id) {
      var response = {}
      return new Promise(function (resolve, reject) {
        knex.db('ordersInstructions')
          .select('id', 'barCode', 'PVCCovers', 'goodsInBulk', 'MRPOnLabels', 'instruction')
          .where('userId', id)
          .where('type', 'USER')
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }

    this.removeInstructions = function (id) {
      var response = {}
      return new Promise(function (resolve, reject) {
        knex.db('ordersInstructions')
          .where('userId', id)
          .del()
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }

    this.updateOrderProfile = (data) => {
      knex.db('users')
        .whereIn('id', data)
        .update({
          isOfferApply: 0,
          processOrder: 0,
          managerCart: 0
        })
        .then((result) => {
          console.log(result)
        })
        .catch((error) => {
          console.log(error)
        })
    }
    this.updateCartaddedDate = (data) => {
      knex.db('users')
        .where('id', data.userId)
        .update({
          cartUpdated: data.cartDate
        })
        .then((result) => {
          console.log(result)
        })
        .catch((error) => {
          console.log(error)
        })
    }

    this.getPaymentListModel = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('paymentTypes')
          .select('id', 'type', 'payDescription', 'id as value')
          .where('activeStatus', 1)
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            console.log(error)
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }

    // Search Products
    this.searchAllProductModel = function (data) {
      var response = {}
      return new Promise(function (resolve, reject) {
        knex.db('products')
          .select('products.id', 'productName', 'productImage', 'productCatalog.MRP', 'products.productCode',
            'weight', 'productGST', 'MOQ', 'maxQty', 'productStockCount', 'products.defaultQuantity',
            'productCatalog.productStatus',
            'finishingFast', 'fewStocksLeft', 'subCategory.subCategoryName', 'categoryName', 'productCatalog.sortingOrder',
            'discountValue as discount', knex.db.raw('(productCatalog.MRP - ( productCatalog.MRP * ( discountValue/100 ) )) as price'),
            'productOfferX', 'productOfferY')
          .innerJoin('subCategory', 'products.subcategoryId', '=', 'subCategory.id')
          .innerJoin('category', 'products.categoryId', '=', 'category.id')
          .innerJoin('productCatalog', 'products.id', '=', 'productCatalog.productId')
          .innerJoin('disCountDetails', 'products.id', '=', 'disCountDetails.productId')
          .innerJoin('productInventory', 'products.id', '=', 'productInventory.productId')
          .where('productName', 'like', '%' + data.text + '%')
          .orWhere('products.productCode', 'like', '%' + data.text + '%')
          .orWhere('category.categoryName', 'like', '%' + data.text + '%')
          .orWhere('subCategory.subCategoryName', 'like', '%' + data.text + '%')
          .where({
            'deleteProduct': 0,
            'products.activeStatus': 1,
            'productCatalog.catalogId': data.auth.catalogId,
            'productCatalog.productStatus': 1,
            'disCountDetails.discountId': data.auth.discountId,
            'productInventory.outletId': data.auth.outletId
          })
          .groupBy('products.id')
          .orderBy('products.id', 'desc')
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }

    this.searchProductModel = function (data) {
      var response = {}
      return new Promise(function (resolve, reject) {
        console.log("request", data)
        console.log("data.auth.outletId", data.auth.outletId)

        var pageNumber = data.pageNumber
        if (pageNumber == '0') {
          pageNumber = '0'
        } else {
          pageNumber = pageNumber - 1
        }
        var pageOffset = parseInt(pageNumber * 20)
        knex.db('products')
          .select('products.id', 'productName', 'productImage', 'productCatalog.MRP', 'products.productCode',
            'weight', 'productGST', 'MOQ', 'maxQty', 'products.defaultQuantity', 'productInventory.productStockCount',
            'productCatalog.productStatus', 'productInventory.outletId',
            'finishingFast', 'fewStocksLeft', 'subCategory.subCategoryName', 'categoryName', 'productCatalog.sortingOrder',
            'discountValue as discount', knex.db.raw('(productCatalog.MRP - ( productCatalog.MRP * ( discountValue/100 ) )) as price'),
            'productOfferX', 'productOfferY')
          .innerJoin('subCategory', 'products.subcategoryId', '=', 'subCategory.id')
          .innerJoin('category', 'products.categoryId', '=', 'category.id')
          .innerJoin('disCountDetails', 'products.id', '=', 'disCountDetails.productId')
          .innerJoin('productInventory', 'products.id', '=', 'productInventory.productId')
          .innerJoin('productCatalog', 'products.id', '=', 'productCatalog.productId')
          .where('productName', 'like', '%' + data.text + '%')
          .orWhere('products.productCode', 'like', '%' + data.text + '%')
          .orWhere('category.categoryName', 'like', '%' + data.text + '%')
          .orWhere('subCategory.subCategoryName', 'like', '%' + data.text + '%')
          .where({
            'deleteProduct': 0,
            'products.activeStatus': 1,
            'productCatalog.catalogId': data.auth.catalogId,
            'productCatalog.productStatus': 1,
            'disCountDetails.discountId': data.auth.discountId,
            'productInventory.outletId': data.auth.outletId
            // 'productInventory.outletId': 1

          })
          .groupBy('products.id')
          .orderBy('products.id', 'desc')
          .offset(pageOffset).limit(20)
          .then((result) => {
            console.log("result", result)
            response.error = false
            response.data = result
          })
          .catch((error) => {
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }



    this.totalAcceptWaitingAmountModel = function (id) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('orders')
          .select(knex.db.raw("sum(case when  orderStatus IN ('WAITING', 'ACCEPTED') then totalAmount + totalGST - referralDiscount - orders.cashDiscountAmount - orders.additionalDiscountAmount - orders.specialDiscountAmount else 0 end) AS totalAcceptWaitingAmount"))
          .where('ownerId', id)
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }











    this.referralOfferApply = function (id, status) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('users')
          .where('id', id)
          .update('isOfferApply', status)
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }



    this.searchAllCategoryModel = function (data) {
      var response = {}
      return new Promise(function (resolve, reject) {
        knex.db('category')
          .select('category.id', 'categoryName', 'categoryDescription', 'categoryImage')
          // .innerJoin('subCategory', 'category.id', '=', 'subCategory.categoryId')
          .where('categoryName', 'like', '%' + data.text + '%')
          .where('category.activeStatus', 1)
          .orderBy('category.id', 'desc')
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }

    this.searchCategoryModel = function (data) {
      var response = {}
      return new Promise(function (resolve, reject) {
        var pageNumber = data.pageNumber
        if (pageNumber == '0') {
          pageNumber = '0'
        } else {
          pageNumber = pageNumber - 1
        }
        var pageOffset = parseInt(pageNumber * 20)

        knex.db('category')
          .select('category.id', 'categoryName', 'categoryDescription', 'categoryImage')
          // .innerJoin('subCategory', 'category.id', '=', 'subCategory.categoryId')
          .where('categoryName', 'like', '%' + data.text + '%')
          .where('category.activeStatus', 1)
          .orderBy('category.id', 'desc')
          .offset(pageOffset).limit(20)
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }




    this.searchAllSubcategoryModel = function (data) {
      var response = {}
      return new Promise(function (resolve, reject) {
        knex.db('subCategory')
          .select('subCategory.id', 'subCategoryName', 'subCategoryImage', 'subCategoryName',
            'subCategoryDescription', 'categoryId')
          .where('subCategoryName', 'like', '%' + data.text + '%')
          .where({
            activeStatus: 1,
            categoryId: data.categoryId
          })
          .orderBy('subCategory.id', 'desc')
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }


    this.searchSubcategoryModel = function (data) {
      var response = {}
      return new Promise(function (resolve, reject) {

        var pageNumber = data.pageNumber
        if (pageNumber == '0') {
          pageNumber = '0'
        } else {
          pageNumber = pageNumber - 1
        }
        var pageOffset = parseInt(pageNumber * 20)

        knex.db('subCategory')
          .select('subCategory.id', 'subCategoryName', 'subCategoryImage',
            'subCategoryName', 'subCategoryDescription', 'categoryId')
          .where('subCategoryName', 'like', '%' + data.text + '%')
          .where({
            activeStatus: 1,
            categoryId: data.categoryId
          })
          .orderBy('subCategory.id', 'desc')
          .offset(pageOffset).limit(20)
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }





    this.searchAllProductListModel = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('products')
          .select('products.id', 'productName', 'productImage', 'productCatalog.MRP', 'products.productCode', 'products.defaultQuantity',
            'weight', 'productGST', 'MOQ', 'maxQty', 'productStockCount', 'productStatus', 'finishingFast', 'fewStocksLeft', 'subCategory.subCategoryName', 'discountValue as discount', knex.db.raw('(productCatalog.MRP - ( productCatalog.MRP * ( discountValue/100 ) )) as price'), 'productOfferX', 'productOfferY')
          .innerJoin('subCategory', 'products.subcategoryId', '=', 'subCategory.id')
          .innerJoin('productCatalog', 'products.id', '=', 'productCatalog.productId')
          .innerJoin('disCountDetails', 'products.id', '=', 'disCountDetails.productId')
          .innerJoin('productInventory', 'products.id', '=', 'productInventory.productId')
          .where('productName', 'like', '%' + data.text + '%')
          .where({
            'productCatalog.catalogId': data.auth.catalogId,
            'disCountDetails.discountId': data.auth.discountId
          })
          .where({
            'deleteProduct': 0,
            'products.activeStatus': 1,
            'products.subcategoryId': data.subcategoryId,
            'products.categoryId': data.categoryId,
            'productInventory.outletId': data.auth.outletId
          })
          .orderBy('products.id', 'desc')
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }

    this.searchProductListModel = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        console.log("request", data)
        var pageNumber = data.pageNumber
        if (pageNumber == '0') {
          pageNumber = '0'
        } else {
          pageNumber = pageNumber - 1
        }
        var pageOffset = parseInt(pageNumber * 20)


        knex.db('products')
          .select('products.id', 'productName', 'productImage', 'productCatalog.MRP', 'products.productCode', 'products.defaultQuantity',
            'weight', 'productGST', 'MOQ', 'maxQty', 'productStockCount', 'productStatus', 'finishingFast', 'fewStocksLeft', 'subCategory.subCategoryName', 'discountValue as discount', knex.db.raw('(productCatalog.MRP - ( productCatalog.MRP * ( discountValue/100 ) )) as price'), 'productOfferX', 'productOfferY')
          .innerJoin('subCategory', 'products.subcategoryId', '=', 'subCategory.id')
          .innerJoin('productCatalog', 'products.id', '=', 'productCatalog.productId')
          .innerJoin('disCountDetails', 'products.id', '=', 'disCountDetails.productId')
          .innerJoin('productInventory', 'products.id', '=', 'productInventory.productId')
          .where('productName', 'like', '%' + data.text + '%')
          .where({
            'productCatalog.catalogId': data.auth.catalogId,
            'disCountDetails.discountId': data.auth.discountId
          })
          .where({
            'deleteProduct': 0,
            'products.activeStatus': 1,
            'products.subcategoryId': data.subcategoryId,
            'products.categoryId': data.categoryId,
            'productInventory.outletId': data.auth.outletId
          })
          .orderBy('products.id', 'desc')
          .offset(pageOffset).limit(20)
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }



    this.searchAllExploreListModel = function (data) {
      var response = {}
      // console.log("ExploreData****************",data)
      return new Promise(function (resolve) {
        var k = knex.db('products')
          .select(knex.db.raw(' distinct products.id as id'), 'productName', 'productImage', 'productCatalog.MRP', 'products.productCode', 'weight', 'productGST',
            'MOQ', 'maxQty', 'products.defaultQuantity', 'productStockCount', 'productStatus	',
            'subCategory.subCategoryName', 'discountValue as discount',
            knex.db.raw('(productCatalog.MRP - ( productCatalog.MRP * ( discountValue/100 ) )) as price'),
            'productOfferX', 'productOfferY')
          .innerJoin('subCategory', 'products.subcategoryId', '=', 'subCategory.id')
          .innerJoin('productCatalog', 'products.id', '=', 'productCatalog.productId')
          .innerJoin('disCountDetails', 'products.id', '=', 'disCountDetails.productId')
          .innerJoin('productInventory', 'products.id', '=', 'productInventory.productId')
          .where({
            'deleteProduct': 0,
            'products.activeStatus': 1,
            'productCatalog.catalogId': data.auth.catalogId,
            'productInventory.outletId': data.auth.outletId
          })
          .whereIn('products.id', data.productIds)
          .where('productName', 'like', '%' + data.text + '%')
          .orderBy('products.id', 'desc')
          .distinct('products.id', 'products.productCode')
        // console.log("Query************",k.toString())
        k.then((result) => {
          response.error = false
          response.data = result
        })
          .catch((error) => {
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }


    this.searchExploreListModel = function (data) {
      var response = {}
      // console.log("ExploreData****************",data)
      return new Promise(function (resolve) {
        var pageNumber = data.pageNumber
        if (pageNumber == '0') {
          pageNumber = '0'
        } else {
          pageNumber = pageNumber - 1
        }
        var pageOffset = parseInt(pageNumber * 20)


        var k = knex.db('products')
          .select(knex.db.raw(' distinct products.id as id'), 'productName', 'productImage', 'productCatalog.MRP',
            'products.productCode', 'weight', 'productGST', 'MOQ', 'maxQty',
            'products.defaultQuantity', 'productStockCount', 'productStatus	', 'subCategory.subCategoryName', 'discountValue as discount', knex.db.raw('(productCatalog.MRP - ( productCatalog.MRP * ( discountValue/100 ) )) as price'), 'productOfferX', 'productOfferY')
          .innerJoin('subCategory', 'products.subcategoryId', '=', 'subCategory.id')
          .innerJoin('productCatalog', 'products.id', '=', 'productCatalog.productId')
          .innerJoin('disCountDetails', 'products.id', '=', 'disCountDetails.productId')
          .innerJoin('productInventory', 'products.id', '=', 'productInventory.productId')
          .where({
            'deleteProduct': 0,
            'products.activeStatus': 1,
            'productCatalog.catalogId': data.auth.catalogId,
            'productInventory.outletId': data.auth.outletId
          })
          .whereIn('products.id', data.productIds)
          .where('productName', 'like', '%' + data.text + '%')
          .orderBy('products.id', 'desc')
          .distinct('products.id', 'products.productCode')
          .offset(pageOffset).limit(20)
        // console.log("Query************",k.toString())
        k.then((result) => {
          response.error = false
          response.data = result
        })
          .catch((error) => {
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }



    // Explore
    this.searchAllExploreModel = function (data) {
      var response = {}
      return new Promise(function (resolve, reject) {
        knex.db('explore')
          .select('id', 'exploreName', 'exploreImage')
          .where('activeStatus', 1)
          .where('exploreName', 'like', '%' + data.text + '%')
          .orderBy('id', 'desc')
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }




    this.searchExploreModel = function (data) {
      var response = {}
      return new Promise(function (resolve, reject) {
        var pageNumber = data.pageNumber
        if (pageNumber == '0') {
          pageNumber = '0'
        } else {
          pageNumber = pageNumber - 1
        }
        var pageOffset = parseInt(pageNumber * 20)



        knex.db('explore')
          .select('id', 'exploreName', 'exploreImage')
          .where('activeStatus', 1)
          .where('exploreName', 'like', '%' + data.text + '%')
          .orderBy('id', 'desc')
          .offset(pageOffset).limit(20)
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }






    // Frequently Bought Products
    this.getBoughtProducts = function (data) {
      var response = {}
      var userId = data.userId
      return new Promise(function (resolve, reject) {
        knex.db('orderItems')
          .select('products.id', 'orderItems.productId', 'cartShopId',
            knex.db.raw('SUM(quantity) as qty, COUNT(orderItems.productId) as productCount'),
            'subCategory.subCategoryName', 'productName', 'productImage', 'productCatalog.MRP', 'products.productCode',
            'categoryName', 'weight', 'productGST', 'MOQ', 'maxQty', 'products.defaultQuantity', 'productStockCount', 'finishingFast',
            'fewStocksLeft', 'productStatus', 'discountValue as discount',
            'products.specialDiscount', 'products.specialDiscountValue',
            knex.db.raw('(productCatalog.MRP - ( productCatalog.MRP * ( discountValue/100 ) )) as price'),
            'productOfferX', 'productOfferY')
          .innerJoin('products', 'orderItems.productId', '=', 'products.id')
          .innerJoin('subCategory', 'products.subcategoryId', '=', 'subCategory.id')
          .innerJoin('category', 'products.categoryId', '=', 'category.id')
          .innerJoin('productInventory', 'products.id', '=', 'productInventory.productId')
          .innerJoin('productCatalog', 'products.id', '=', 'productCatalog.productId')
          // .innerJoin('orders', 'orderItems.orderId', '=', 'orders.id')
          .innerJoin('disCountDetails', 'products.id', '=', 'disCountDetails.productId')
          .where('orderItems.cartShopId', data.auth.id)
          // .where('orders.cartUserId', data.auth.id)
          .where('orderItems.orderCost', '!=', 0)
          .where({
            'products.activeStatus': 1,
            'productCatalog.catalogId': data.auth.catalogId,
            'disCountDetails.discountId': data.auth.discountId,
            'productInventory.outletId': data.auth.outletId,
            'productCatalog.productStatus':1
          })
          .groupBy('orderItems.productId', 'orderItems.cartShopId', 'discountValue', 'productStatus', 'productStockCount')
          .orderBy('productCount', 'desc')
          .orderBy('qty', 'desc')
          .orderBy('products.id', 'desc')
          .limit(25)
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            console.log(error)
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }

    this.updateProductStockCount = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db.raw('Update productInventory set productStockCount = productStockCount - ? where productId=? AND 	outletId=?', [data.quantity, data.productId, data.outletId])
          .then((result) => {
            response.error = false
            response.data = result[0]
          })
          .catch((error) => {
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }

    this.getFeatureProductColor = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('appSettings')
          .select('id', 'featureProductColor')
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }

    // this.updateWalletTransaction = function (data, callback) {
    //   var response = {}
    //   knex.db('walletTransaction')
    //     .insert(data)
    //     .then((result) => {
    //       response.error = false
    //       response.data = result
    //     })
    //     .catch((error) => {
    //       response.error = true
    //     })
    //     .finally(() => {
    //       callback(response)
    //     })
    // }


    this.updateWalletTransaction = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('walletTransaction')
          .insert(data)
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }










    this.referralAmountModel = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db.raw("Update users set bonusPoint = bonusPoint - ? where id=? AND userType='OWNER'", [data.bonusPoint, data.id])
          .then((result) => {
            response.error = false
            response.data = result[0]
          })
          .catch((error) => {
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }


    this.updateCreditValueModel = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db.raw("Update users set creditLimit = creditLimit - ? where id=? AND userType='OWNER'", [data.creditLimit, data.id])
          .then((result) => {
            response.error = false
            response.data = result[0]
          })
          .catch((error) => {
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }


    this.findSubcategory = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('subCategory')
          .select('subCategory.id', 'categoryId', 'subCategory.discount',
            'subCategoryName', 'subCategoryImage', 'subCategoryDescription',
            'subCategory.activeStatus')
          .where({
            categoryId: data,
            activeStatus: 1
          })
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            console.log(error)
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }








    this.saveNotificationsModel = function (data, callback) {
      var response = {}
      knex.db('notifications')
        .insert(data)
        .then((result) => {
          response.error = false
          response.data = result
        })
        .catch((error) => {
          console.log(error)
          response.error = true
        })
        .finally(() => {
          callback(response)
        })
    }

    this.updateOwnerProfileModel = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('users')
          .where('id', data.id)
          .update(data)
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }





    this.getOrdersForBookindIdModel = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('orders')
          .orderBy('id', 'desc')
          .limit(2)
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }




    this.managerListModel = function (id) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('users')
          .select('id', 'name', 'mobileNumber', 'email', 'userType', 'activeStatus', 'shopName', 'shopAddress', 'city', 'state', 'pincode', 'latitude', 'longitude', 'isPriceVisible')
          .where({ ownerId: id, userType: 'MANAGER', activeStatus: 1 })
          .orderBy('id', 'desc')
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }



    this.profileModel = function (id) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('users')
          .select('id', 'name', 'customerID', 'mobileNumber', 'email', 'userType', 'users.cashDiscount',
            'ownerId', 'outletId', 'userDiscountId', 'isProfileCompleted', 'activeStatus', 'users.isNonGst',
            'primarySalesRepId', 'secondarySalesRepIds', 'tertiarySalesRepIds',
            'isProfileCompleted', 'shopName', 'shopAddress', 'pincode', 'city', 'state', 'users.cashOnCarry',
            'longitude', 'latitude', 'bonusPoint', 'creditLimit', 'creditFixedtLimit', 'creditPeriod', 'paymentTypeIds',
            'gst', 'isOfferApply', 'activeStatus', 'isPriceVisible', 'salesRepIds', 'managerCart', 'rating', 'userCatalogId')
          .where('id', id)
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            console.log("profileModel error", error)
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }

    this.getOnesalesRepForSms = function (id) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('salesRep')
          .select('id', 'repID', 'name', 'email', 'mobile', 'userType', 'totalAmount',
            'totalOrders', 'totalPayments', 'totalAmountCollected')
          .where('id', id)
          .andWhere('activeStatus', 1)
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }



    this.saveNotificationsDao = function (data, callback) {
      var response = {}
      knex.db('notifications')
        .insert(data)
        .then((result) => {
          response.error = false
          response.data = result
        })
        .catch((error) => {
          console.log(error)
          response.error = true
        })
        .finally(() => {
          callback(response)
        })
    }




    this.notificationCountModel = function (data) {
      var response = {}
      return new Promise(function (resolve, reject) {
        if (data.auth.userType === 'OWNER') {
          var query = { ownerId: data.auth.id, ownerSeen: 0 }
        } else {
          var query = { managerId: data.auth.id, managerSeen: 0 }
        }
        var type = ['US']
        var striingData = JSON.stringify(type)
        knex.db('notifications')
          .where(query)
          .whereRaw('JSON_CONTAINS(notifyType, ? )', [striingData])
          .count('id as count')
          .modify(function (queryBuilder) {
            if (data.auth.userType === 'MANAGER') {
              queryBuilder.where('notifications.type', '!=', 'ADDCART')
              queryBuilder.where('notifications.type', '!=', 'MANAGER_PAY_PROCESSING')
              queryBuilder.where('notifications.type', '!=', 'ADMIN_NOTIFY_OWNER')
              queryBuilder.where('notifications.type', '!=', 'MANAGER_ORDER_DELIERED')
            }
            if (data.auth.userType === 'OWNER') {
              queryBuilder.where('notifications.type', '!=', 'ADMIN_NOTIFY_MANAGER')
              queryBuilder.where('notifications.type', '!=', 'ORDER_DELIERED')
            }
          })
          .then((result) => {
            response.error = false
            response.data = result
            resolve(response)
          })
          .catch((error) => {
            console.log("notificationCountModel error")
            reject(error)
          })
      })
    }


    this.userSearchNameListSModel = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('searchNames')
          .select('name', 'depot_id', 'outlet.outletName', 'searchNames.activeStatus')
          .innerJoin('outlet', 'outlet.id', '=', 'searchNames.depot_id')
          .where('searchNames.activeStatus', 1)
          .modify(function (queryBuilder) {
            if (data.depot_id.length > 0) {
              queryBuilder.where('searchNames.depot_id', data.depot_id)
            }
          })
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            console.log(error)
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }



    this.creditDaysForOrderModel = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('orders')
          .select('orders.id', 'bookingId', 'orders.orderStatus', 'orders.ownerId', 'orders.shippedDate',
            'ow.creditPeriod', knex.db.raw('DATE_FORMAT(shippedDate + INTERVAL ow.creditPeriod DAY, "%d/%m/%Y") as dueDate, DATE_FORMAT(shippedDate, "%d/%m/%Y") AS shippedDate'),
            knex.db.raw('SUM(totalAmount + totalGST - referralDiscount) as totalAmount'), 'paidAmount', 'balanceAmount')
          .innerJoin('paymentTypes', 'orders.paymentId', '=', 'paymentTypes.id')
          .leftJoin('users as au', 'orders.cartUserId', '=', 'au.id')
          .leftJoin('users as ow', 'orders.ownerId', '=', 'ow.id')
          .whereIn('orders.orderStatus', ['SHIPPED', 'DELIVERED', 'PAID'])
          .where('orders.cartUserId', data)
          .andWhere('orders.balanceAmount', '!=', 0)
          .orderBy('orders.shippedDate', 'asc')
          .groupBy('orders.id')
          .limit(1)
          .then((result) => {
            // console.log("result",result)
            if (result.length > 0) {
              response.error = false
              const hasNullValues = Object.values(result[0]).includes(null);
              var resp = hasNullValues == true && result[0].dueDate == null ? [] : result
              response.data = resp
            } else {
              response.error = false
              response.data = result
            }
          })
          .catch((error) => {
            console.log("error", error)
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }



    this.updateOrderItemsPdfModel = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('orders')
          .update({
            orderItemsPdf: data.orderItemsPdf,
          })
          .where('bookingId', data.bookingId)
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            console.log(error)
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }



    //write a function for clear cartItems for user
    this.userClearAllCartProductsModel = function (request) {
      var response = {}
      var params = request.body

      return new Promise(function (resolve, reject) {
        var transac = knex.db.transaction(function (trx) {
          var cartItems = knex.db('cartItems')
            .where({
              'userId': params.userId,
              'cartType': 'USER'
            }).del()
            .transacting(trx)
          return Promise.all([cartItems])
        })
        transac.then(function (result) {
          console.log("result", result)
          response.error = false
          response.data = result
        })
          .catch((error) => {
            console.log(error)
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }



    this.addProductNotifyModel = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('notifyProducts')
          .insert(data)
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            console.log(error)
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }


    this.cancelProductNotifyModel = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('notifyProducts')
          .update(
            {
              isCancelled: 1
            }
          )
          .where('customerID', data.customerID)
          .andWhere('productCode', data.productCode)
          .andWhere('productUpdated', 0)
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            console.log(error)
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }



    this.checkProductNoyifyModel = function (customerID, productCode) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('notifyProducts')
          .select('*')
          .where('notifyProducts.productCode', productCode)
          .andWhere('notifyProducts.customerID', customerID)
          .andWhere('notifyProducts.productUpdated', 0)
          .andWhere('notifyProducts.isCancelled', 0)
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            console.log(error)
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }



    this.checkProductAlreadyNotify = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('notifyProducts')
          .select('*')
          .where('notifyProducts.productCode', data.productCode)
          .andWhere('notifyProducts.customerID', data.customerID)
          .andWhere('notifyProducts.productUpdated', 0)
          .then((result) => {
            response.error = false
            response.data = result
          }
          )
          .catch((error) => {
            console.log(error)
            response.error = true
          }
          )
          .finally(() => {
            resolve(response)
          })
      })
    }


    this.updateProductNotifyModel = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('notifyProducts')
          .update({
            isCancelled: 0,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
          })
          .where('customerID', data.customerID)
          .andWhere('productCode', data.productCode)
          .andWhere('productUpdated', 0)
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            console.log(error)
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })

      })
    }


    this.bulkInsertCartItems = function (data) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db
          .batchInsert('cartItems', data)
          .then((result) => {
            response.error = false
            response.data = result
            console.log("result", result)
          })
          .catch((error) => {
            console.log("error", error)
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }

    this.allProductsExcelFileLinkModel = function () {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('productsDownload')
          .select('*')
          .where('id', 1)
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            console.log(error)
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }

    this.getOnesalesRepForNotification = function (id) {
      var response = {}
      return new Promise(function (resolve) {
        knex.db('salesRep')
          .select('id', 'repID', 'name', 'email', 'mobile', 'userType', 'totalAmount',
            'totalOrders', 'totalPayments', 'totalAmountCollected')
          .where('id', id)
          .andWhere('activeStatus', 1)
          .then((result) => {
            response.error = false
            response.data = result
          })
          .catch((error) => {
            response.error = true
          })
          .finally(() => {
            resolve(response)
          })
      })
    }







  }
}








export default UserProductsModel;