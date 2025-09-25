import Utils from './utils/utils'
const utils = new Utils()



class SmsTemplates {
    constructor() {

        this.shopOwnerPlaceOrderSmsForShopOwner = function (data) {
            try {
                var response = {}

                return new Promise(async function (resolve) {

                    //==> user/placeOrder api
                    var smsDeatils = {}
                    smsDeatils.mobile_number = data.mobileNumber

                    smsDeatils.message = `Fetch: You have placed an order for ${data.totalAmount} at ${data.orderTime} with order ID ${data.orderId}.`

                    var SendSms = await utils.textLocalSendSms(smsDeatils)
                    // console.log("SendSms", SendSms)
                    if (SendSms.error) {
                        response.error = true
                        resolve(response)
                    } else {
                        response.error = false
                        response.data = SendSms.result
                        resolve(response)

                    }

                })
            } catch (e) {
                console.log("error ", e)
                response.error = true
                resolve(response)
            }
        }



        this.shopOwnerPlaceOrderSmsForSalesRep = function (data) {
            try {
                var response = {}

                return new Promise(async function (resolve) {

                    //==> user/placeOrder api
                    var smsDeatils = {}
                    smsDeatils.mobile_number = data.mobileNumber

                    smsDeatils.message = `Fetch: ${data.shopName} has placed an order for ${data.totalAmount} at ${data.orderTime} with order ID ${data.orderId}.`

                    var SendSms = await utils.textLocalSendSms(smsDeatils)
                    console.log("SendSms", SendSms)
                    if (SendSms.error) {
                        response.error = true
                        resolve(response)
                    } else {
                        response.error = false
                        response.data = SendSms.result
                        resolve(response)
                    }

                })
            } catch (e) {
                response.error = true
                console.log("error ", e)
                resolve(response)

            }
        }




        this.SalesRepPlaceOrderSmsForShopOwner = function (data) {
            try {
                var response = {}

                return new Promise(async function (resolve) {

                    //==> salesRep/placeOrder api
                    var smsDeatils = {}
                    smsDeatils.mobile_number = data.mobileNumber

                    smsDeatils.message = `Fetch: ${data.salesRepName} has placed an order with ID ${data.orderId}. Please check My Orders section.`

                    var SendSms = await utils.textLocalSendSms(smsDeatils)
                    console.log("SendSms", SendSms)
                    if (SendSms.error) {
                        response.error = true
                        resolve(response)
                    } else {
                        response.error = false
                        response.data = SendSms.result
                        resolve(response)
                    }

                })
            } catch (e) {
                console.log("error ", e)
                response.error = false
                resolve(response)

            }
        }


        this.adminUpdateOrderStatusAccepted = function (data) {
            try {
                var response = {}

                return new Promise(async function (resolve) {

                    //=> admin/updateOrderStatus api
                    var smsDeatils = {}
                    smsDeatils.mobile_number = data.mobileNumber

                    smsDeatils.message = `Fetch: Your Order with ID ${data.orderId} has been ACCEPTED`

                    var SendSms = await utils.textLocalSendSms(smsDeatils)
                    console.log("SendSms", SendSms)
                    if (SendSms.error) {
                        response.error = true
                    } else {
                        response.error = false
                        response.data = SendSms.result
                    }

                })
            } catch (e) {
                console.log("error ", e)
                response.error = false
                resolve(response)
            }
        }

        this.adminUpdateOrderStatusPackaged = function (data) {
            try {
                var response = {}

                return new Promise(async function (resolve) {

                    //=> admin/updateOrderStatus api
                    var smsDeatils = {}
                    smsDeatils.mobile_number = data.mobileNumber

                    smsDeatils.message = `Fetch: Your Order with ID ${data.orderId} has been PACKAGED. You can view the Packing List in My Orders section.`

                    var SendSms = await utils.textLocalSendSms(smsDeatils)
                    console.log("SendSms", SendSms)
                    if (SendSms.error) {
                        response.error = true
                    } else {
                        response.error = false
                        response.data = SendSms.result
                    }

                })
            } catch (e) {
                console.log("error ", e)
            }
        }





        this.adminUpdateOrderStatusShipped = function (data) {
            try {
                var response = {}

                return new Promise(async function (resolve) {

                    //=> admin/updateOrderStatus api
                    var smsDeatils = {}
                    smsDeatils.mobile_number = data.mobileNumber

                    smsDeatils.message = `Fetch: Your Order with ID ${data.orderId} has been SHIPPED. You can view the LR copy in My Orders section.`

                    var SendSms = await utils.textLocalSendSms(smsDeatils)
                    console.log("SendSms", SendSms)
                    if (SendSms.error) {
                        response.error = true
                    } else {
                        response.error = false
                        response.data = SendSms.result
                    }

                })
            } catch (e) {
                console.log("error ", e)
            }
        }

        this.adminUpdateOrderStatusDelivered = function (data) {
            try {
                var response = {}

                return new Promise(async function (resolve) {

                    //=> admin/updateOrderStatus api
                    var smsDeatils = {}
                    smsDeatils.mobile_number = data.mobileNumber

                    smsDeatils.message = `Fetch: Your Order with ID ${data.orderId} has been DELIVERED`

                    var SendSms = await utils.textLocalSendSms(smsDeatils)
                    console.log("SendSms", SendSms)
                    if (SendSms.error) {
                        response.error = true
                    } else {
                        response.error = false
                        response.data = SendSms.result
                    }

                })
            } catch (e) {
                console.log("error ", e)
            }
        }

        this.adminUpdateOrderStatusCancelled = function (data) {
            try {
                var response = {}

                return new Promise(async function (resolve) {

                    //=> admin/updateOrderStatus api
                    var smsDeatils = {}
                    smsDeatils.mobile_number = data.mobileNumber

                    smsDeatils.message = `Fetch: Your Order with ID ${data.orderId} has been CANCELLED`

                    var SendSms = await utils.textLocalSendSms(smsDeatils)
                    console.log("SendSms", SendSms)
                    if (SendSms.error) {
                        response.error = true
                    } else {
                        response.error = false
                        response.data = SendSms.result
                    }

                })
            } catch (e) {
                console.log("error ", e)
            }
        }

        this.adminUpdateOrderPaidAmount = function (data) {
            try {
                var response = {}

                return new Promise(async function (resolve) {

                    //=> /admin/orderPaidAmount api
                    var smsDeatils = {}
                    smsDeatils.mobile_number = data.mobileNumber

                    smsDeatils.message = `Fetch: The payment of ${data.amount} paid by ${data.paymentMethod} for Order ID ${data.orderId} has been Marked as Paid.`

                    var SendSms = await utils.textLocalSendSms(smsDeatils)
                    console.log("SendSms", SendSms)
                    if (SendSms.error) {
                        response.error = true
                    } else {
                        response.error = false
                        response.data = SendSms.result
                    }

                })
            } catch (e) {
                console.log("error ", e)
            }
        }


        this.adminAcceptPayment = function (data) {
            try {
                var response = {}

                return new Promise(async function (resolve) {

                    //=> admin accept payment check once
                    var smsDeatils = {}
                    smsDeatils.mobile_number = data.mobileNumber

                    smsDeatils.message = `Fetch: The payment of ${data.amount} paid by ${data.paymentMethod} for Order ID ${data.orderId} has been notified to the Admin and awaiting Confirmation from Accounts. 
                    `

                    var SendSms = await utils.textLocalSendSms(smsDeatils)
                    console.log("SendSms", SendSms)
                    if (SendSms.error) {
                        response.error = true
                    } else {
                        response.error = false
                        response.data = SendSms.result
                    }

                })
            } catch (e) {
                console.log("error ", e)
            }
        }


        this.adminRejectedPayment = function (data) {
            try {
                var response = {}

                return new Promise(async function (resolve) {

                    //=> admin reject payment check once
                    var smsDeatils = {}
                    smsDeatils.mobile_number = data.mobileNumber

                    smsDeatils.message = `Fetch: The payment of ${data.amount} paid by ${data.paymentMethod} for Order ID ${data.orderId} has been Declined.`

                    var SendSms = await utils.textLocalSendSms(smsDeatils)
                    console.log("SendSms", SendSms)
                    if (SendSms.error) {
                        response.error = true
                    } else {
                        response.error = false
                        response.data = SendSms.result
                    }

                })
            } catch (e) {
                console.log("error ", e)
            }
        }








        this.shopOwnerOrderPaid = function (data) {
            try {
                var response = {}

                return new Promise(async function (resolve) {

                    //=> webhook  might check
                    var smsDeatils = {}
                    smsDeatils.mobile_number = data.mobileNumber

                    smsDeatils.message = `Fetch: The payment of ${data.amount} paid by ${data.paymentMethod} for Order ID ${data.orderId} has been notified to the Admin and awaiting Confirmation from Accounts.`

                    var SendSms = await utils.textLocalSendSms(smsDeatils)
                    console.log("SendSms", SendSms)
                    if (SendSms.error) {
                        response.error = true
                    } else {
                        response.error = false
                        response.data = SendSms.result
                    }

                })
            } catch (e) {
                console.log("error ", e)
            }
        }



        this.shopOwnerComplaintReopened = function (data) {
            try {
                var response = {}

                return new Promise(async function (resolve) {

                    //=>   might check this one
                    var smsDeatils = {}
                    smsDeatils.mobile_number = data.mobileNumber

                    smsDeatils.message = `Fetch: The Complaint on Order ID ${data.orderId} for the product ${data.productCode} has been REOPENED by ${data.shopName}.`

                    var SendSms = await utils.textLocalSendSms(smsDeatils)
                    console.log("SendSms", SendSms)
                    if (SendSms.error) {
                        response.error = true
                    } else {
                        response.error = false
                        response.data = SendSms.result
                    }

                })
            } catch (e) {
                console.log("error ", e)
            }
        }


        this.shopOwnerComplaintOpened = function (data) {
            try {
                var response = {}

                return new Promise(async function (resolve) {

                    //=>   might check this one
                    var smsDeatils = {}
                    smsDeatils.mobile_number = data.mobileNumber

                    smsDeatils.message = `Fetch: ${data.shopName} has OPENED a complaint on Order ID ${data.orderId} for the product ${data.productCode}.`


                    var SendSms = await utils.textLocalSendSms(smsDeatils)
                    console.log("SendSms", SendSms)
                    if (SendSms.error) {
                        response.error = true
                    } else {
                        response.error = false
                        response.data = SendSms.result
                    }

                })
            } catch (e) {
                console.log("error ", e)
            }
        }






        this.shopOwnerVerificationCode = function (data) {
            try {
                var response = {}

                return new Promise(async function (resolve) {

                    //=>   might check this one
                    var smsDeatils = {}
                    smsDeatils.mobile_number = data.mobileNumber

                    smsDeatils.message = `Fetch: Please use the code ${data.otp} to verify your mobile number. If you did not register for an account, please ignore this message.`


                    var SendSms = await utils.textLocalSendSms(smsDeatils)
                    console.log("SendSms", SendSms)
                    if (SendSms.error) {
                        response.error = true
                    } else {
                        response.error = false
                        response.data = SendSms.result
                    }

                })
            } catch (e) {
                console.log("error ", e)
            }
        }




        this.shopOwnerForgotPasswordCode = function (data) {
            try {
                var response = {}

                return new Promise(async function (resolve) {

                    //=>   might check this one
                    var smsDeatils = {}
                    smsDeatils.mobile_number = data.mobileNumber

                    smsDeatils.message = `Fetch: Please use the code ${data.otp} to reset your password.If you did not request for your password to be reset, ignore this message`


                    var SendSms = await utils.textLocalSendSms(smsDeatils)
                    console.log("SendSms", SendSms)
                    if (SendSms.error) {
                        response.error = true
                    } else {
                        response.error = false
                        response.data = SendSms.result
                    }

                })
            } catch (e) {
                console.log("error ", e)
            }
        }




        this.shopOwnerPlaceOrderSmsForWalletDebit = function (data) {
            try {
                var response = {}

                return new Promise(async function (resolve) {

                    //==> user/placeOrder api
                    var smsDeatils = {}
                    smsDeatils.mobile_number = data.mobileNumber

                    smsDeatils.message = `Fetch: Rs. ${data.amount} has been debited from your wallet against Order ID ${data.orderID}.`

                    var SendSms = await utils.textLocalSendSms(smsDeatils)
                    console.log("SendSms", SendSms)
                    if (SendSms.error) {
                        response.error = true
                    } else {
                        response.error = false
                        response.data = SendSms.result
                    }

                })
            } catch (e) {
                console.log("error ", e)
            }
        }



        this.adminAddWalletForShopOwner = function (data) {
            try {
                var response = {}

                return new Promise(async function (resolve) {

                    //==> admin/adminAddWallet api
                    var smsDeatils = {}
                    smsDeatils.mobile_number = data.mobileNumber

                    smsDeatils.message = `Fetch: Hurray!! Rs. ${data.amount} has been credited to your wallet.`

                    var SendSms = await utils.textLocalSendSms(smsDeatils)
                    console.log("SendSms", SendSms)
                    if (SendSms.error) {
                        response.error = true
                    } else {
                        response.error = false
                        response.data = SendSms.result
                    }

                })
            } catch (e) {
                console.log("error ", e)
            }
        }




        this.shopOwnerMobileNumberChangeVerificationCode = function (data) {
            try {
                var response = {}

                return new Promise(async function (resolve) {

                    //==> check this one
                    var smsDeatils = {}
                    smsDeatils.mobile_number = data.mobileNumber

                    smsDeatils.message = `Fetch: Please use the code ${data.otp} to verify your mobile number. If you did not request to change the mobile number, please ignore this message`

                    var SendSms = await utils.textLocalSendSms(smsDeatils)
                    console.log("SendSms", SendSms)
                    if (SendSms.error) {
                        response.error = true
                    } else {
                        response.error = false
                        response.data = SendSms.result
                    }

                })
            } catch (e) {
                console.log("error ", e)
            }
        }


        this.salesRepForgotPasswordVerificationCode = function (data) {
            try {
                var response = {}

                return new Promise(async function (resolve) {

                    //==> check this one
                    var smsDeatils = {}
                    smsDeatils.mobile_number = data.mobileNumber

                    smsDeatils.message = `Fetch: Please use the code ${data.otp} to reset your password. If you did not request for your password to be reset, ignore this message.`

                    var SendSms = await utils.textLocalSendSms(smsDeatils)
                    console.log("SendSms", SendSms)
                    if (SendSms.error) {
                        response.error = true
                    } else {
                        response.error = false
                        response.data = SendSms.result
                    }

                })
            } catch (e) {
                console.log("error ", e)
            }
        }



        this.salesRepMobileNumberChangeVerificationCode = function (data) {
            try {
                var response = {}

                return new Promise(async function (resolve) {

                    //==> check this one
                    var smsDeatils = {}
                    smsDeatils.mobile_number = data.mobileNumber

                    smsDeatils.message = `Fetch: Please use the code ${data.otp} to verify your mobile number. If you did not request to change the mobile number, please ignore this message.`

                    var SendSms = await utils.textLocalSendSms(smsDeatils)
                    console.log("SendSms", SendSms)
                    if (SendSms.error) {
                        response.error = true
                    } else {
                        response.error = false
                        response.data = SendSms.result
                    }

                })
            } catch (e) {
                console.log("error ", e)
            }
        }


        this.salesRepActivityShopVisitOrderTaken = function (data) {
            try {
                var response = {}

                return new Promise(async function (resolve) {

                    //==> check this one
                    var smsDeatils = {}
                    smsDeatils.mobile_number = data.mobileNumber

                    smsDeatils.message = `Fetch: ${data.salesRepName} has logged a shop visit at ${data.orderTime} to collect an order from your shop.`

                    var SendSms = await utils.textLocalSendSms(smsDeatils)
                    console.log("SendSms", SendSms)
                    if (SendSms.error) {
                        response.error = true
                        resolve(response)
                    } else {
                        response.error = false
                        response.data = SendSms.result
                        resolve(response)
                    }

                })
            } catch (e) {
                console.log("error ", e)
                response.error = false
                resolve(response)
            }
        }





        this.salesRepActivityShopVisitCollectPayment = function (data) {
            try {
                var response = {}

                return new Promise(async function (resolve) {

                    //==> check this one
                    var smsDeatils = {}
                    smsDeatils.mobile_number = data.mobileNumber

                    smsDeatils.message = `Fetch: ${data.salesRepName} has updated a shop visit at ${data.orderTime} to receive payment from you.`

                    var SendSms = await utils.textLocalSendSms(smsDeatils)
                    console.log("SendSms", SendSms)
                    if (SendSms.error) {
                        response.error = true
                        resolve(response)
                    } else {
                        response.error = false
                        response.data = SendSms.result
                        resolve(response)
                    }

                })
            } catch (e) {
                console.log("error ", e)
                response.error = false
                resolve(response)
            }
        }



        this.salesRepActivityShopVisitPromoteProduct = function (data) {
            try {
                var response = {}

                return new Promise(async function (resolve) {

                    //==> check this one
                    var smsDeatils = {}
                    smsDeatils.mobile_number = data.mobileNumber

                    smsDeatils.message = `Fetch: ${data.salesRepName} has logged a shop visit at ${data.orderTime} to promote products in your shop.`


                    var SendSms = await utils.textLocalSendSms(smsDeatils)
                    console.log("SendSms", SendSms)
                    if (SendSms.error) {
                        response.error = true
                        resolve(response)
                    } else {
                        response.error = false
                        response.data = SendSms.result
                        resolve(response)
                    }

                })
            } catch (e) {
                console.log("error ", e)
                response.error = false
                resolve(response)
            }
        }




        this.salesRepActivityShopVisitReturnsComplaints = function (data) {
            try {
                var response = {}

                return new Promise(async function (resolve) {

                    //==> check this one
                    var smsDeatils = {}
                    smsDeatils.mobile_number = data.mobileNumber

                    smsDeatils.message = `Fetch: ${data.salesRepName} has updated his activity that he visited your shop at ${data.orderTime} to resolve Returns or Complaints.`


                    var SendSms = await utils.textLocalSendSms(smsDeatils)
                    console.log("SendSms", SendSms)
                    if (SendSms.error) {
                        response.error = true
                        resolve(response)
                    } else {
                        response.error = false
                        response.data = SendSms.result
                        resolve(response)
                    }

                })
            } catch (e) {
                console.log("error ", e)
                response.error = false
                resolve(response)
            }
        }







        this.salesRepActivityShopVisitUrgentDelivery = function (data) {
            try {
                var response = {}

                return new Promise(async function (resolve) {

                    //==> check this one
                    var smsDeatils = {}
                    smsDeatils.mobile_number = data.mobileNumber

                    smsDeatils.message = `Fetch: ${data.salesRepName} has updated a shop visit at ${data.orderTime} to deliver products on urgent basis.`



                    var SendSms = await utils.textLocalSendSms(smsDeatils)
                    console.log("SendSms", SendSms)
                    if (SendSms.error) {
                        response.error = true
                        resolve(response)

                    } else {
                        response.error = false
                        response.data = SendSms.result
                        resolve(response)
                    }

                })
            } catch (e) {
                console.log("error ", e)
                response.error = false
                resolve(response)
            }
        }




        this.salesRepActivityShopVisitOtherOfficeWork = function (data) {
            try {
                var response = {}

                return new Promise(async function (resolve) {

                    //==> check this one
                    var smsDeatils = {}
                    smsDeatils.mobile_number = data.mobileNumber

                    smsDeatils.message = `Fetch: ${data.shopName} has logged a shop visit at ${data.orderTime} to Reconcile Ledgers/ Office work.`

                    var SendSms = await utils.textLocalSendSms(smsDeatils)
                    console.log("SendSms", SendSms)
                    if (SendSms.error) {
                        response.error = true
                        resolve(response)

                    } else {
                        response.error = false
                        response.data = SendSms.result
                        resolve(response)
                    }

                })
            } catch (e) {
                console.log("error ", e)
                response.error = false
                resolve(response)
            }
        }



        this.salesRepActivityShopOtherInteractionOrderTaken = function (data) {
            try {
                var response = {}

                return new Promise(async function (resolve) {

                    //==> check this one
                    var smsDeatils = {}
                    smsDeatils.mobile_number = data.mobileNumber

                    smsDeatils.message = `Fetch: ${data.salesRepName} has logged a Telephonic Call with you at ${data.orderTime} to collect an order from your shop.`


                    var SendSms = await utils.textLocalSendSms(smsDeatils)
                    console.log("SendSms", SendSms)
                    if (SendSms.error) {
                        response.error = true
                        resolve(response)
                    } else {
                        response.error = false
                        response.data = SendSms.result
                        resolve(response)
                    }

                })
            } catch (e) {
                console.log("error ", e)
                response.error = false
                resolve(response)
            }
        }



        this.salesRepActivityShopOtherInteractionCollectPayment = function (data) {
            try {
                var response = {}

                return new Promise(async function (resolve) {

                    //==> check this one
                    var smsDeatils = {}
                    smsDeatils.mobile_number = data.mobileNumber

                    smsDeatils.message = `Fetch: ${data.salesRepName} has updated a Phone call with you at ${data.orderTime} to collect payment from you.`



                    var SendSms = await utils.textLocalSendSms(smsDeatils)
                    console.log("SendSms", SendSms)
                    if (SendSms.error) {
                        response.error = true
                        resolve(response)
                    } else {
                        response.error = false
                        response.data = SendSms.result
                        resolve(response)
                    }

                })
            } catch (e) {
                console.log("error ", e)
                response.error = false
                resolve(response)
            }
        }

        this.salesRepActivityShopOtherInteractionProductPromotion = function (data) {
            try {
                var response = {}

                return new Promise(async function (resolve) {

                    //==> check this one
                    var smsDeatils = {}
                    smsDeatils.mobile_number = data.mobileNumber

                    smsDeatils.message = `Fetch: ${data.salesRepName} has updated his activity on the shop interaction for the reason Product promotion.`
                    smsDeatils.message = `Fetch: ${data.salesRepName} has updated his activity on the shop interaction for the reason Product Promotion. This message is from Europet Products Private Limited. 
                    If you have any questions or need further details, please contact us at support@fetchapp.in.`


                    var SendSms = await utils.textLocalSendSms(smsDeatils)
                    console.log("SendSms", SendSms)
                    if (SendSms.error) {
                        response.error = true
                        resolve(response)
                    } else {
                        response.error = false
                        response.data = SendSms.result
                        resolve(response)
                    }

                })
            } catch (e) {
                console.log("error ", e)
                response.error = false
                resolve(response)
            }
        }




        this.salesRepActivityShopOtherInteractionResolveComplaints = function (data) {
            try {
                var response = {}

                return new Promise(async function (resolve) {

                    //==> check this one
                    var smsDeatils = {}
                    smsDeatils.mobile_number = data.mobileNumber

                    smsDeatils.message = `Fetch: ${data.salesRepName} has updated his activity that he spoke to you by a phone call at ${data.orderTime} to resolve Returns or Complaints.`


                    var SendSms = await utils.textLocalSendSms(smsDeatils)
                    console.log("SendSms", SendSms)
                    if (SendSms.error) {
                        response.error = true
                        resolve(response)
                    } else {
                        response.error = false
                        response.data = SendSms.result
                        resolve(response)
                    }

                })
            } catch (e) {
                console.log("error ", e)
                response.error = false
                resolve(response)
            }
        }




        this.paymentFailedSms = function (data) {
            try {
                var response = {}

                return new Promise(async function (resolve) {

                    //==> check this one
                    var smsDeatils = {}
                    smsDeatils.mobile_number = data.mobileNumber

                    smsDeatils.message = `Fetch :OOPS!! We Regret to inform you that your Payment for Order ID ${data.orderId} has Failed , Please verify your payment details or Try another Payment method`


                    var SendSms = await utils.textLocalSendSms(smsDeatils)
                    console.log("SendSms", SendSms)
                    if (SendSms.error) {
                        response.error = true
                        resolve(response)
                    } else {
                        response.error = false
                        response.data = SendSms.result
                        resolve(response)
                    }

                })
            } catch (e) {
                console.log("error ", e)
                response.error = false
                resolve(response)
            }
        }


        this.shopOwnerOpenComplaint = function (data) {
            try {
                var response = {}

                return new Promise(async function (resolve) {

                    //==> user/placeOrder api
                    var smsDeatils = {}
                    smsDeatils.mobile_number = data.mobileNumber

                    smsDeatils.message = `Fetch: You have OPENED a complaint with Ticket ID ${data.ticketId} for Order ID ${data.orderId} related to pet products from Europet Products Private Limited. If you need any further assistance or have questions, please contact us at support@fetchapp.in.`

                    var SendSms = await utils.textLocalSendSms(smsDeatils)
                    // console.log("SendSms", SendSms)
                    if (SendSms.error) {
                        response.error = true
                        resolve(response)
                    } else {
                        response.error = false
                        response.data = SendSms.result
                        resolve(response)

                    }

                })
            } catch (e) {
                console.log("error ", e)
                response.error = true
                resolve(response)
            }
        }

        this.shopOwnerOpenComplaintForSalesRep = function (data) {
            try {
                var response = {}

                return new Promise(async function (resolve) {

                    //==> user/placeOrder api
                    var smsDeatils = {}
                    smsDeatils.mobile_number = data.mobileNumber

                    smsDeatils.message = `Fetch: ${data.shopName} has OPENED a complaint with Ticket ID ${data.ticketId} for Order ID ${data.orderId} related to pet products from Europet Products Private Limited. If you need any further assistance or have questions, please contact us at support@fetchapp.in.`

                    var SendSms = await utils.textLocalSendSms(smsDeatils)
                    // console.log("SendSms", SendSms)
                    if (SendSms.error) {
                        response.error = true
                        resolve(response)
                    } else {
                        response.error = false
                        response.data = SendSms.result
                        resolve(response)

                    }

                })
            } catch (e) {
                console.log("error ", e)
                response.error = true
                resolve(response)
            }
        }

        this.salesRepOpenComplaintForShopOwner = function (data) {
            try {
                var response = {}

                return new Promise(async function (resolve) {

                    //==> user/placeOrder api
                    var smsDeatils = {}
                    smsDeatils.mobile_number = data.mobileNumber

                    smsDeatils.message = `Fetch: A complaint has been OPENED by ${data.salesRepName} on behalf of your shop ${data.shopName} for Order ID ${data.orderId} related to pet products from Europet Products Private Limited. If you need any further assistance or have questions, please contact us at support@fetchapp.in.`

                    var SendSms = await utils.textLocalSendSms(smsDeatils)
                    console.log("SendSms", SendSms)
                    if (SendSms.error) {
                        response.error = true
                        resolve(response)
                    } else {
                        response.error = false
                        response.data = SendSms.result
                        resolve(response)

                    }

                })
            } catch (e) {
                console.log("error ", e)
                response.error = true
                resolve(response)
            }
        }

        this.salesRepOpenComplaintForSales = function (data) {
            try {
                var response = {}

                return new Promise(async function (resolve) {

                    //==> user/placeOrder api
                    var smsDeatils = {}
                    smsDeatils.mobile_number = data.mobileNumber

                    smsDeatils.message = `Fetch: ${data.salesRepName} on behalf of ${data.shopName} has OPENED a complaint for Order ID ${data.orderId} related to pet products from Europet Products Private Limited. If you need any further assistance or have questions, please contact us at support@fetchapp.in.`

                    var SendSms = await utils.textLocalSendSms(smsDeatils)
                    console.log("SendSms", SendSms)
                    if (SendSms.error) {
                        response.error = true
                        resolve(response)
                    } else {
                        response.error = false
                        response.data = SendSms.result
                        resolve(response)

                    }

                })
            } catch (e) {
                console.log("error ", e)
                response.error = true
                resolve(response)
            }
        }


        this.shopOwnerOpenComplaintForSalesRep = function (data) {
            try {
                var response = {}

                return new Promise(async function (resolve) {

                    //==> user/placeOrder api
                    var smsDeatils = {}
                    smsDeatils.mobile_number = data.mobileNumber

                    smsDeatils.message = `Fetch: ${data.shopName} has OPENED a complaint with Ticket ID ${data.ticketId} for Order ID ${data.orderId} related to pet products from Europet Products Private Limited. If you need any further assistance or have questions, please contact us at support@fetchapp.in.`

                    var SendSms = await utils.textLocalSendSms(smsDeatils)
                    // console.log("SendSms", SendSms)
                    if (SendSms.error) {
                        response.error = true
                        resolve(response)
                    } else {
                        response.error = false
                        response.data = SendSms.result
                        resolve(response)

                    }

                })
            } catch (e) {
                console.log("error ", e)
                response.error = true
                resolve(response)
            }
        }











    }
}


export default SmsTemplates;






