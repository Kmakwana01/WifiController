// import { AppStoreServerAPIClient, Environment, ReceiptUtility,Order, ProductType, HistoryResponse , TransactionHistoryRequest,  SendTestNotificationResponse , SignedDataVerifier , PromotionalOfferSignatureCreator } from "@apple/app-store-server-library"
// import fs from 'fs';
// import { Request, Response } from 'express';
// import path from "path";
// import { constants } from "../config";
// import jwt from 'jsonwebtoken';

// const issuerId = constants.ISSUER_ID
// const keyId = constants.KEY_ID; // done
// const bundleId = constants.APP_BUNDLE_ID; // done
// const encodedKey = fs.readFileSync("./AuthKey_VTDKPY779L.p8", "utf8") // Specific implementation may vary
// const environment = Environment.SANDBOX;
// const client = new AppStoreServerAPIClient(encodedKey, keyId, issuerId, bundleId, environment)
// const applePassword = 'cd72731f425e40c39dc41f3603b37f26';

// const loadRootCAs = (): Buffer[] => {
//     const caFilePath = path.resolve(__dirname, '../AppleIncRootCertificate.cer');
//     if (!fs.existsSync(caFilePath)) {
//         throw new Error(`Root CA file not found at ${caFilePath}`);
//     }
//     return [fs.readFileSync(caFilePath)];
// };


// export const verifier = async (req : Request , res : Response) => {
//     try {

//             let { notificationPayload } = req.body;
           
//             if(!notificationPayload){
//                 throw new Error('notificationPayload is required.');
//             }
           
//             const appleRootCAs: Buffer[] = loadRootCAs();
//             const enableOnlineChecks = true;
//             const appAppleId = 6504862633; // appAppleId is required when the environment is Production
//             const signedPayload = notificationPayload.signedPayload;
//             const verifier = new SignedDataVerifier(appleRootCAs, enableOnlineChecks, environment, bundleId, appAppleId);
//             const verifiedNotification = await verifier.verifyAndDecodeNotification(notificationPayload);
//             console.log('Verified Notification:', verifiedNotification);

//             res.status(200).json({
//                 message : "Transaction Get Successfully.",
//                 data : verifiedNotification
//             })
      
//         } catch (error : any) {
      
//             res.status(400).json({
//                 status: "Failed",
//                 message: error.message,
//             });

//         }
// }


// export const check = async (req: Request, res: Response) => {
//     try {
        
//         const response: any = await client.getAllSubscriptionStatuses('2000000653906381');
//         console.log(response);

//         res.status(200).json({
//             message: "Transaction Get Successfully.",
//             data: response
//         });

//     } catch (error: any) {
//         // Log the entire error object for better debugging
//         console.error("Error requesting test notification:", error);

//         // Provide a more meaningful error message to the response
//         res.status(400).json({
//             status: "Failed",
//             message: error.message || "An error occurred while requesting the test notification."
//         });
//     }
// };




// // export const receiptUsage = async (req : Request , res : Response) => {
// //     try {

// //         const appReceipt = "MI..."
// //         const receiptUtil = new ReceiptUtility()
// //         const transactionId = receiptUtil.extractTransactionIdFromAppReceipt(appReceipt)
// //         let response: HistoryResponse | null = null

// //         if (transactionId != null) {
// //             const transactionHistoryRequest: TransactionHistoryRequest = {
// //                 sort: Order.ASCENDING,
// //                 revoked: false,
// //                 productTypes: [ProductType.AUTO_RENEWABLE]
// //             }
            
// //             let transactions: string[] = []

// //             do {
// //                 const revisionToken : any = response !== null && response.revision !== null ? response.revision : null
// //                 response = await client.getTransactionHistory(transactionId, revisionToken, transactionHistoryRequest)
// //                 if (response.signedTransactions) {
// //                     transactions = transactions.concat(response.signedTransactions)
// //                 }
// //             } while (response.hasMore)

// //             console.log(transactions , "transactions")
// //         }

// //         res.status(200).json({
// //             message : "Transaction Get Successfully.",
// //             data : response
// //         })
  
// //     } catch (error : any) {
  
// //         res.status(400).json({
// //             status: "Failed",
// //             message: error.message,
// //         });

// //     }
// // }

// // export const singnatureCreater = async (req : Request, res : Response ) => {
// //     try {
// //         const { productId ,subscriptionOfferId , applicationUsername , nonce} = req.body;

// //         const timestamp = Date.now();
// //         const signatureCreator = new PromotionalOfferSignatureCreator(encodedKey, keyId, bundleId)

// //         const signature = signatureCreator.createSignature(productId, subscriptionOfferId, applicationUsername, nonce, timestamp)

// //         res.status(200).json({
// //             message : "Transaction Get Successfully.",
// //             data : signature
// //         })
  
// //     } catch (error : any) {
  
// //         res.status(400).json({
// //             status: "Failed",
// //             message: error.message,
// //         });

// //     }
// // }