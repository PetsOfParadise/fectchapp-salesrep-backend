'use strict';

import knex from './../../../config/db.config'

class UserSearchModel {
 constructor(){



    this.getSubCategoryAttribute = function (ids) {
        var response = {}
        return new Promise(function (resolve) {
          knex.db('attributeCategory')
            .select('id', 'attributeId', 'subCategoryId')
            .whereIn('subCategoryId', ids)
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
    
      this.categoryAttributeModel = function (id) {
        var response = {}
        return new Promise(function (resolve) {
          knex.db('category')
            .select('category.id', 'categoryId', 'subCategory.id as subCategoryId')
            .innerJoin('subCategory', 'category.id', '=', 'subCategory.categoryId')
            .where({'category.activeStatus': 1, 'subCategory.activeStatus': 1})
            .where('category.id', id)
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
    
      this.findAttributeOptions = function (id) {
        var response = {}
        return new Promise(function (resolve) {
          knex.db('attributeOptions')
            .select('id', 'optionName', 'attributeId')
            .where('attributeId', id)
            .where('activeStatus', 1)
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
    
      this.filterProductModel = function (data) {
        var response = {}
        return new Promise(function (resolve) {
          knex.db('products')
            .select('products.id', 'productName', 'productImage', 'MRP', 'productCode', 'weight', 'productGST', 'MOQ', 'maxQty', 'stockCount', 'productStatus	', 'subCategory.subCategoryName', 'discountValue as discount', knex.db.raw('(MRP - ( MRP * ( discountValue/100 ) )) as price'), 'productOfferX', 'productOfferY')
            .innerJoin('subCategory', 'products.subcategoryId', '=', 'subCategory.id')
            .innerJoin('productCatalog', 'products.id', '=', 'productCatalog.productId')
            .innerJoin('disCountDetails', 'products.id', '=', 'disCountDetails.productId')
            .where({ 'productCatalog.catalogId': data.auth.catalogId, 'disCountDetails.discountId': data.auth.discountId, 'products.subcategoryId': data.subcategoryId })
            .modify(function (queryBuilder) {
              if (data.sortBy === '1') {
                // Sort by price low to high - 1
                queryBuilder.orderBy('price', 'asc')
              } else if (data.sortBy === '2') {
                // Sort by price high to low - 2
                queryBuilder.orderBy('price', 'desc')
              }
              if (data.optionsIds.length > 0) {
                // Attribute options
                var stringValue = JSON.stringify(data.optionsIds)
                queryBuilder.whereRaw('JSON_CONTAINS(attributeOptionsIds, ? )', [stringValue])
              }
              // Min and Mix price
              if(data.minPrice !== '0' && data.maxPrice !== '0') {
                queryBuilder.having('price', '>=', data.minPrice )
                queryBuilder.having('price', '<=', data.maxPrice )
              } else if(data.minPrice !== '0') {
                queryBuilder.having('price', '>=', data.minPrice )
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
    
      this.findExploreCategory = function (id) {
        var response = {}
        return new Promise(function (resolve) {
          knex.db.raw('SELECT DISTINCT(exploreCategory) FROM exploreProducts WHERE exploreId=?', [id])
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
    
      this.updateSearchProductCount = function (data) {
        var response = {}
        return new Promise(function (resolve) {
          knex.db('searchProductDetails')
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


 }
}








export default UserSearchModel;