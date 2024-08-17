// import { AppStoreServerAPI, Environment, decodeRenewalInfo, decodeTransaction, decodeTransactions ,SendTestNotificationResponse } from "app-store-server-api";
// import { Request, Response } from 'express';
// import fs from 'fs';
// import { constants } from "../config";
// import { SUBSCRIPTION } from "../models/subscriptionModel";
// import { SUBSCRIPTION_WEBHOOK } from "../models/subscriptionWebhookModel";
// import { SUBSCRIPTION_WEBHOOK_ERROR } from "../models/subscriptionWebhookErrorModel";

// const KEY = fs.readFileSync("./AuthKey_VTDKPY779L.p8", "utf8") // Specific implementation may vary
// const KEY_ID = constants.KEY_ID
// const ISSUER_ID = constants.ISSUER_ID
// const APP_BUNDLE_ID = constants.APP_BUNDLE_ID

// const api = new AppStoreServerAPI(
//   KEY, KEY_ID, ISSUER_ID, APP_BUNDLE_ID, Environment.Sandbox
// )

// export const iosWebhookV2  = async (req : Request, res : Response) => {
//   try {

//         let { notificationPayload } = req.body;
           
//         if(!notificationPayload){
//              throw new Error('notificationPayload is required.');
//         }

//         const signedPayload = notificationPayload.signedPayload;
//         const verifiedNotification : any = await decodeTransaction(signedPayload);
//         verifiedNotification.data.signedTransactionInfo = await decodeTransaction(verifiedNotification.data.signedTransactionInfo)
//         verifiedNotification.data.signedRenewalInfo = await decodeRenewalInfo(verifiedNotification.data.signedRenewalInfo)

//         let { data } = verifiedNotification;

//         const { expiresDate : expiresDateMs, productId, originalTransactionId } = data.signedTransactionInfo;

//         let transactionData : any = {
//           "originalTransactionId": originalTransactionId,
//           "expiresAt": expiresDateMs,
//           "platformType": "ios",
//           "response": JSON.stringify(req.body),
//           "productId": productId,
//           "token": "",
//           "from": "AppleWebhook"
//         };
        
//         const isSubscription = await SUBSCRIPTION.findOne({ originalTransactionId })

//         if(isSubscription){

//           data.userId = isSubscription.userId;

//           if(expiresDateMs > Date.now()){

//             let webhookData = await SUBSCRIPTION_WEBHOOK.create(transactionData)
//             data.transactionRef = webhookData._id

//             await SUBSCRIPTION.findByIdAndUpdate(isSubscription._id,{ $set : transactionData })

//             return res.status(200).send({ 
//               "status": true, 
//               "message": "Receipt received.", 
//               "data": verifiedNotification 
//             });

//           } else {

//             data.reason = "Subsciption is expired"
//             data.receipt = JSON.stringify(req.body);

//             let transactionWebhookError = await SUBSCRIPTION_WEBHOOK_ERROR.create(transactionData);

//             return res.status(500).send({ 
//               "status": false, 
//               "message": "Subscription expired.", 
//               "data": verifiedNotification
//             });
//           }

//         } else {

//           // data.reason = "userId not found in parent subscription."
//           // data.receipt = JSON.stringify(verifiedNotification ?? req.body)

//           let transactionWebhookError = await SUBSCRIPTION_WEBHOOK_ERROR.create(transactionData)

//           console.log(transactionWebhookError,'transactionWebhookError')

//           return res.status(500).send({ 
//             "status": false, 
//             "message": "Receipt received but userId not found.", 
//             "data": verifiedNotification
//           });

//         }

//   } catch (error : any) {

//     res.status(400).json({
//       status: "Failed",
//       message: error.message,
//   });
//   }
// }

// export const subscriptionStatusCheck =  async (req : Request , res : Response) => {
//     try {
      
//       let { originalTransactionId } = req.body;

//       if(!originalTransactionId) throw new Error('originalTransactionId is required.');

//       const response = await api.getSubscriptionStatuses(originalTransactionId)

//       const item : any = response.data[0].lastTransactions.find(item => item.originalTransactionId === originalTransactionId);
//       if(!item) throw new Error('No matching transaction found.')
//       const transactionInfo = await decodeTransaction(item.signedTransactionInfo)
      
//       res.status(200).json({
//         message : "TransactionInfo Get Successfully.",
//         data : transactionInfo
//       })
  
//     } catch (error : any) {
  
//       res.status(400).json({
//         status: "Failed",
//         message: error.message,
//       });
      
//     }
// }

// export const subscriptionStatusCheck2 =  async (req : Request , res : Response) => {
//     try {

//       let { userId } = req.body;

//       if(!userId) throw new Error('userId is required.');

//       const subscription : any = await SUBSCRIPTION.findOne({ userId });

//       if(!subscription) throw new Error('No valid subscription found.');

//       const expiresDateMs : number = new Date(subscription.expireAt).getTime();

//       if(expiresDateMs > Date.now()){

//         return res.status(200).send({ 
//           status : 200, 
//           message : "Subscription is active.", 
//           data : subscription 
//         });

//       } else {

//         return res.status(200).send({ 
//           status : 403, 
//           message : "Subscription expired.", 
//           data : subscription 
//         });

//       }
//     } catch (error : any) {
  
//       res.status(400).json({
//         status: "Failed",
//         message: error.message,
//       });

//     }
// }

// export const check2 =  async (req : Request , res : Response) => {
//   try {

//     const response: SendTestNotificationResponse = await api.requestTestNotification()
//     console.log(response)
    
//     res.status(200).json({
//       message : "TransactionInfo Get Successfully.",
//       data : response
//     })

//   } catch (error : any) {

//     res.status(400).json({
//       status: "Failed",
//       message: error.message,
//   });
//   }
// }

// export const getTransactions = async (req : Request , res : Response) => {
//   try {

//     let { originalTransactionId } = req.body;

//     if(!originalTransactionId) throw new Error('originalTransactionId is required.');

//     const response = await api.getTransactionHistory(originalTransactionId);
//     const transactions = await decodeTransactions(response.signedTransactions)

//     res.status(200).json({
//       message : "Transaction Get Successfully.",
//       data : transactions
//     })

//   } catch (error : any) {

//     res.status(400).json({
//       status: "Failed",
//       message: error.message,
//   });
//   }
// }

