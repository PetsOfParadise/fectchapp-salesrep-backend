import request from 'request'
require('dotenv').config();


// test credentials
// const gateway_credentials = {
//     appId: process.env.PAYMENT_GATEWAY_APPID,
//     secret_key: process.env.PAYMENT_GATEWAY_SECRET_KEY,
//     x_api_version: '2022-01-01',
//     payment_url: process.env.PAYMENT_GATEWAY_TESTING_URL

// }


// live credentillas
const gateway_credentials = {
    appId: process.env.LIVE_PAYMENT_GATEWAY_APPID,
    secret_key: process.env.LIVE_PAYMENT_GATEWAY_SECRET_KEY,
    x_api_version: process.env.API_VERSION,
    payment_url: process.env.LIVE_PAYMENT_GATEWAY__URL
}

class PaymentGateWay {
    constructor() {
      
        this.createOrder = (data) => {
            var res = {}

            return new Promise(function (resolve) {
                const d = new Date();
                const d1 = d.getMinutes()
                d.setMinutes(d1 + 30);
                var orderId = `ORDER_ID${data.orderId}_${(new Date).getTime().toString()}`
                const options = {
                    method: 'POST',
                    // url: process.env.PAYMENT_GATEWAY_TESTING_URL,
                    url: gateway_credentials.payment_url,
                    headers: {
                        Accept: 'application/json',
                        'x-api-version': gateway_credentials.x_api_version,
                        'x-client-id': gateway_credentials.appId,
                        'x-client-secret': gateway_credentials.secret_key,
                        'Content-Type': 'application/json'
                    },
                    body: {
                        customer_details: {
                            customer_id: data.customerId,
                            customer_email: data.email,
                            customer_name: data.name,
                            customer_phone: data.mobileNumber,
                            // customer_bank_account_number: '1518121112',
                            // customer_bank_ifsc: 'CITI0000001',
                            // customer_bank_code: 3333
                        },
                        order_meta: {
                            return_url: `${process.env.RETURN_URL}/#/verification?order_id={order_id}`,
                            // notify_url: 'https://b8af79f41056.eu.ngrok.io/webhook.php'
                            notify_url: `${process.env.NOTIFY_URL}/user/getPaymentPayloadWebhook`

                        },
                        order_tags: {
                            order_id: data.orderId,
                            type: data.type,
                            orderStatus: data.orderStatus,
                            userId: data.userId
                        },
                        // order_splits: [{ vendor_id: 'Vendor01', amount: '100.1' }],
                        order_id: orderId,
                        order_amount: data.totalAmount.toString(),
                        // order_amount: '2',
                        order_currency: 'INR',
                        order_expiry_time: d,
                        order_note: 'Live order'
                    },
                    json: true
                };

                request(options, function (error, response, body) {
                    if (error) {
                        console.log(error);
                        res.error = true
                        resolve(res)
                    } else {
                        console.log(body);
                        res.error = false
                        res.data = body
                        resolve(res)
                    }

                });

            })

        }

        this.getorderStatus = (data) => {
            var res = {}

            return new Promise(function (resolve) {
                var options = {
                    'method': 'GET',
                    'url': `${gateway_credentials.payment_url}/${data.orderId}`,
                    headers: {
                        Accept: 'application/json',
                        'x-api-version': gateway_credentials.x_api_version,
                        'x-client-id': gateway_credentials.appId,
                        'x-client-secret': gateway_credentials.secret_key,
                        'Content-Type': 'application/json'
                    },
                    json: true

                };
                request(options, function (error, response, body) {
                    if (error) {
                        console.log(error);
                        res.error = true
                        resolve(res)
                    } else {
                        console.log(body);
                        res.error = false
                        res.data = body
                        resolve(res)
                    }

                });
            })
        }



    }
}




export default PaymentGateWay;

