
import bcrypt from 'bcryptjs'
import httpRequest from 'request'
import fs from 'fs'
import axios from 'axios'
import path from 'path'
import parser from 'xml2json'




require('dotenv').config()


class Utils {
  constructor() {

    this.generateOTP = function () {
      return new Promise(function (resolve) {
        var val = Math.floor(1000 + Math.random() * 9000)
        resolve(val)
      })
    }

    this.hashPassword = function (password) {
      var passwordResponse = {}
      return new Promise(function (resolve) {
        bcrypt.genSalt(10, function (err, salt) {
          if (err) {
            passwordResponse.error = true
            resolve(passwordResponse)
          } else {
            bcrypt.hash(password, salt, function (err, hash) {
              if (err) {
                passwordResponse.error = true
                resolve(passwordResponse)
              } else {
                passwordResponse.error = false
                passwordResponse.hashPassword = hash
                resolve(passwordResponse)
              }
            })
          }
        })
      })
    }

    this.comparePassword = function (password, hash) {
      return new Promise(function (resolve) {
        bcrypt.compare(password, hash, function (err, result) {
          if (err) {
            err = false
            resolve(err)
          } else {
            resolve(result)
          }
        })
      })
    }
    this.pageCount = (data) => {
      return new Promise(function (resolve) {
        var total = data / 10
        if (total % 1 != 0) {
          total++
          total = Math.trunc(total)
          resolve(total)
        } else {
          resolve(0)
        }
      })
    }
    this.googleMapService = (data) => {
      return new Promise(function (resolve) {
        var postURL = data + process.env.GOOGLE_API_KEY
        var httpresponse = {}
        axios.get(postURL)
          .then(resp => {
            console.log("map response", resp.data)

            //basice address check after the checck will hit another time with diff url to get full address
            var check_address;

            if (data.includes("https://maps.googleapis.com/maps/api/place/details/")) {
              check_address = 'placeApi'
            } else if (data.includes("https://maps.googleapis.com/maps/api/geocode/")) {
              check_address = 'geocodeApi'
              console.log("resp.data", resp.data.results[0].address_components)
            }


            if (check_address == 'placeApi') {
              var address = resp.data.result.address_components != undefined ? resp.data.result.address_components : []

              address.forEach((item, index) => {

                var locationType = item.types
                locationType.forEach((value) => {
                  if (value == 'administrative_area_level_3') {
                    var obj = item
                    obj.types[0] = 'administrative_area_level_2'
                    address.push(item)
                  }
                })
              });
              resp.data.result.address_components = address
            }
            else if (check_address == 'geocodeApi') {
              var address = resp.data.results[0].address_components != undefined ? resp.data.results[0].address_components : []

              address.forEach((item, index) => {

                var locationType = item.types
                locationType.forEach((value) => {
                  if (value == 'administrative_area_level_3') {
                    var obj = item
                    obj.types[0] = 'administrative_area_level_2'
                    address.push(item)
                  }
                })
              });
              resp.data.results[0].address_components = address
            }
            httpresponse.error = false
            httpresponse.data = resp.data
          })
          .catch(error => {
            console.log("error", error)
            httpresponse.error = true
            httpresponse.data = error
          })
          .finally(() => {
            resolve(httpresponse)
          })
        // httpRequest({ url: postURL, method: 'POST' }, function (error, response, body) {
        //   if(error){
        //     httpresponse.error = true
        //   } else {
        //     httpresponse.error = false
        //     httpresponse.data = body
        //   }
        //   resolve(httpresponse)
        // })
      })
    }
    this.pageCount = (count, pages) => {
      return new Promise(function (resolve) {
        var total = count / pages
        if (total % 1 !== 0) {
          total++
          total = Math.trunc(total)
        }
        resolve(total)
      })
    }

    this.alphaNumericString = (count, pages) => {
      return new Promise(function (resolve) {
        var result = Math.random().toString(36).slice(5)
        resolve(result)
      })
    }

    this.dateDifferenceInDay = (date1, date2) => {
      return new Promise(function (resolve) {
        let dt1 = new Date(date1);
        let dt2 = new Date(date2);
        var result = Math.floor((Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) - Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate())) / (1000 * 60 * 60 * 24));
        resolve(result)
      })
    }



    // this.textLocalSendSms = (data) => {
    //   return new Promise(function (resolve) {
    //     var res = {}
    //     var request = require('request');
    //     var options = {
    //       'method': 'POST',
    //       'url': 'https://api.textlocal.in/send/',
    //       'headers': {
    //         'Content-Type': 'application/x-www-form-urlencoded',
    //         'Cookie': 'PHPSESSID=9vge9vrcnuomchs4bep2s4adq4'
    //       },
    //       form: {
    //         'apikey': 'NTA1NTRmNmI0NTM5NzQ1MzYzNGM3NzU3NmQ3Nzc0Mzc=',
    //         'numbers': data.mobile_number,
    //         'sender': 'FETCHU',
    //         'message': data.message
    //       }
    //     };
    //     request(options, function (error, response) {
    //       if (error) {
    //         res.error = true
    //         resolve(res)
    //         console.log("error in sms integration", error.errors)
    //       } else {
    //         var obj = JSON.parse(response.body)
    //         if (obj.errors) {
    //           res.error = true
    //           console.log("errors", obj)
    //           resolve(res)
    //         } else {
    //           res.error = false
    //           res.result = response.body
    //           resolve(res)
    //         }
    //       }
    //     });
    //     // res.error = false
    //     // res.result =[]
    //     // resolve(res)
    //   })
    // }


const request = require('request');

this.textLocalSendSms = (data) => {console.log('HHTUI')
  return new Promise(function (resolve) {
    var res = {};
    const numbersStr = Array.isArray(data.mobile_number) 
      ? data.mobile_number.join(',') 
      : data.mobile_number;

    const options = {
      method: 'POST',
      url: 'https://www.fast2sms.com/dev/bulkV2',
      headers: {
        'authorization': 'YeM750BEgowCuiIXLW638sdtj1rTDRGpVkcHlyZSvUqKfF4bnNaVcuQ0jBUiZFptxhrC243gMGE1oOYK',
        'Content-Type': 'application/json'
      },
      json: {
        sender_id: 'FETCHU',
        message: data.message,
        route: 'dlt',
        language: 'english',
        numbers: numbersStr,
        flash: 0,
        schedule_time: '',
        variables_values: data.variables_values
      }
    };

    request(options, function (error, response, body) {
      if (error) {
        res.error = true;
        console.log('Fast2SMS Error:', error);
        resolve(res);
      } else if (!body.return) {
        res.error = true;
        console.log('Fast2SMS Response Error:', body);
        resolve(res);
      } else {
        res.error = false;
        res.result = body;
        resolve(res);
      }
    });
  });
};


    


    this.UserLedger = (customerID) => {
      try {
console.log('HIIIII',__dirname)
        return new Promise(function (resolve) {
          var resp = {}
          var rawdata = fs.readFileSync(path.resolve(__dirname, `../../html/${process.env.USER_LEDGER}`))
          var result = []
          var ledgerData = JSON.parse(parser.toJson(rawdata, {
            reversible: true
          }));
          var newrawdata = ledgerData['ENVELOPE']['LEDGERS']
          if (newrawdata.length > 0) {

            var filterLedger = newrawdata.filter(function (item) {
              // console.log("datas",item)
              return item.LEDGERCODE.$t == customerID
            })
            // console.log("filterLedger",filterLedger[0].HISTORY)
            if (filterLedger.length > 0) {
              result = filterLedger
            }
            resp.error = false
            resolve(result)
          }
        })
      } catch (e) {
        console.log("error", e)
        resp.error = true
        resolve(result)
      }
    }



  }
}

export default Utils;