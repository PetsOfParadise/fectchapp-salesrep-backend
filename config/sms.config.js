// module.exports.textLocalSendSms = (data) => {
//     return new Promise(function (resolve) {
//         var res = {}
//         var request = require('request');
//         var options = {
//             'method': 'POST',
//             'url': 'https://api.textlocal.in/send/',
//             'headers': {
//                 'Content-Type': 'application/x-www-form-urlencoded',
//                 'Cookie': 'PHPSESSID=9vge9vrcnuomchs4bep2s4adq4'
//             },
//             form: {
//                 'apikey': 'NTA1NTRmNmI0NTM5NzQ1MzYzNGM3NzU3NmQ3Nzc0Mzc=',
//                 'numbers': data.mobile_number,
//                 'sender': 'FETCHU',
//                 'message': data.message
//             }
//         };
//         request(options, function (error, response) {
//             if (error) {
//                 res.error = true
//                 resolve(res)
//                 console.log("error in sms integration", error.errors)
//             } else {
//                 var obj = JSON.parse(response.body)
//                 if (obj.errors) {
//                     res.error = true
//                     console.log("errors", obj)
//                     resolve(res)
//                 } else {
//                     res.error = false
//                     res.result = response.body
//                     resolve(res)
//                 }
//             }
//         });

//     })
// }
const axios = require('axios');

module.exports.textLocalSendSms = async (data) => {
  let res = {};
  try {
    const numbersStr = Array.isArray(data.mobile_number) 
      ? data.mobile_number.join(',') 
      : data.mobile_number;

    const response = await axios({
      method: 'POST',
      url: 'https://www.fast2sms.com/dev/bulkV2',
      headers: {
        'authorization': 'YeM750BEgowCuiIXLW638sdtj1rTDRGpVkcHlyZSvUqKfF4bnNaVcuQ0jBUiZFptxhrC243gMGE1oOYK',
        'Content-Type': 'application/json'
      },
      data: {
        sender_id: 'FETCHU',    
         message: data.message,
        route: 'dlt',
        language: 'english',
        numbers: numbersStr,
        flash: 0,
        schedule_time: '', // optional, leave empty for immediate send
            variables_values:data.variables_values
      }
    });

    res.error = !response.data.return;
    res.result = response.data;
  } catch (err) {
    console.log('Fast2SMS Error:', err.response ? err.response.data : err.message);
    res.error = true;
    res.result = err.response ? err.response.data : err.message;
  }

  return res;
};
