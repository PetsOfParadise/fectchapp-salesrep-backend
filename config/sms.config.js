module.exports.textLocalSendSms = (data) => {
    return new Promise(function (resolve) {
        var res = {}
        var request = require('request');
        var options = {
            'method': 'POST',
            'url': 'https://api.textlocal.in/send/',
            'headers': {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cookie': 'PHPSESSID=9vge9vrcnuomchs4bep2s4adq4'
            },
            form: {
                'apikey': 'NTA1NTRmNmI0NTM5NzQ1MzYzNGM3NzU3NmQ3Nzc0Mzc=',
                'numbers': data.mobile_number,
                'sender': 'FETCHU',
                'message': data.message
            }
        };
        request(options, function (error, response) {
            if (error) {
                res.error = true
                resolve(res)
                console.log("error in sms integration", error.errors)
            } else {
                var obj = JSON.parse(response.body)
                if (obj.errors) {
                    res.error = true
                    console.log("errors", obj)
                    resolve(res)
                } else {
                    res.error = false
                    res.result = response.body
                    resolve(res)
                }
            }
        });

    })
}