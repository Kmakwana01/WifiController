/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onRequest } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
var iap = require('in-app-purchase');
const functions = require('firebase-functions');
const { getMessaging } = require('firebase-admin/messaging');
const { google } = require('googleapis');
const moment = require('moment');
require('dotenv').config();

//const sanitizer = require("./sanitizer");

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'surei-dev'
});
var db = admin.firestore();

const cors = require('cors')({ origin: true });
const achivementRef = db.collection('achivement');
const bookRef = db.collection('book');
const childRef = db.collection('child');
const holidayRef = db.collection('holiday');
const parentRef = db.collection('parent');
const reminderRef = db.collection('reminder');
const taskRef = db.collection('task');
const parentSubscriptionRef = db.collection('parentSubscription');
const appleSubscriptionWebhookRef = db.collection('appleSubscriptionWebhook');
const appleSubscriptionWebhookErrorRef = db.collection('appleSubscriptionWebhookError');
const androidSubscriptionWebhookRef = db.collection('androidSubscriptionWebhook');
const androidSubscriptionWebhookErrorRef = db.collection('androidSubscriptionWebhookError');
const weeklyJobRef = db.collection('weeklyJob');

const assignmentRef = db.collection('assignment');
const competitionRef = db.collection('competition');
const testRef = db.collection('test');
const countdownEventRef = db.collection('countdownEvent');
const timeTableRef = db.collection('timeTable');


// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

exports.helloWorld = onRequest(async (request, response) => {

  const weeklyJobQuerySnapshot = await weeklyJobRef.get();

  let notificationSentArray = []

  for (const docSnapshot of weeklyJobQuerySnapshot.docs) {
    const val = docSnapshot.data();
    console.log('>>>>>', val.key)
    if (val.jobs && val.jobs.length > 0) {
      for (const jobItem of val.jobs) {
        if (jobItem.jobStatus && jobItem.jobStatus.length > 0) {

          let jobStatus = Array.from(jobItem.jobStatus);

          for (let index = 0; index < jobStatus.length; index++) {
            const statusItem = jobStatus[index];
            const timestamp = Math.floor(statusItem.date * 1000);
            console.log(timestamp)
            const options = { timeZone: 'Asia/Kolkata' };
            const date = new Date(timestamp);
            const formatter = new Intl.DateTimeFormat('en-US', {
              timeZone: 'Asia/Kolkata',
              day: '2-digit'
            });

            const formattedDate = formatter.format(date);

            const currentDate = new Date().getDate('en-US', options);

            console.log(`weeklyJobDate : ${typeof date, formattedDate}`);
            console.log('todayDate', currentDate)

            if (formattedDate == currentDate) {

              console.log('enter')
              let now = new Date();
              let options = {
                hour12: true,
                timeZone: 'Asia/Kolkata' // Asia/Kolkata
              };
              let formattedTime = now.toLocaleString('en-US', options); // 4/8/2024, 8:13:53 AM
              let currentTime = new Date(formattedTime)

              let match = formattedTime.split(',');
              match[1] = val.deadlineTime; /// "08:00 PM"
              let parentDeadlineString = match.join(',');
              let parentDeadlineSetSecond = new Date(parentDeadlineString).setSeconds(0); // Convert to Date object
              let parentDeadlineTime = new Date(parentDeadlineSetSecond)

              console.log(currentTime.toLocaleString(), parentDeadlineTime.toLocaleString(), '$$$$$$', currentTime, "&&", parentDeadlineTime) // >  4/8/2024, 6:09:47 AM 4/8/2024,04:00 AM fff

              let isSameAMPM = (currentTime.getHours() >= 12) === (parentDeadlineTime.getHours() >= 12);
              let isSameHour = currentTime.getHours() === parentDeadlineTime.getHours();
              let isSameMinutes = currentTime.getMinutes() >= parentDeadlineTime.getMinutes();

              let advancedWarning = val.advancedWarning
              console.log(advancedWarning);
              if (advancedWarning.length > 0) {
                let advancedWarningInHour = parseInt(advancedWarning[0])
                console.log(currentTime.getHours(), parentDeadlineTime.getHours(), advancedWarningInHour, "*******@@@@@")
                if (!isNaN(advancedWarningInHour) && currentTime.getHours() === parentDeadlineTime.getHours() - advancedWarningInHour) {
                  isSameHour = true
                  console.log(isSameAMPM, isSameHour, isSameMinutes, '*******')
                }
              }

              console.log(isSameAMPM, isSameHour, isSameMinutes);

              if (isSameAMPM && isSameHour && isSameMinutes) {

                if (statusItem.childStatus && statusItem.childStatus.length > 0) {

                  let parentUId = val.parentUId
                  let fcmTokensArray = []
                  let childArray = []
                  let childStatus = statusItem.childStatus

                  for (let index = 0; index < childStatus.length; index++) {
                    if (childStatus[index].status === 'pending' && childStatus[index].childId) {
                      let singleChild = await childRef.doc(childStatus[index].childId).get()
                      if (singleChild.exists) {
                        let childData = singleChild.data();
                        childArray.push({
                          firstName: childData.firstName,
                          lastName: childData.lastName,
                          childId: childData.key
                        })
                      }
                    }
                  }

                  const parentQuerySnapshot = await parentRef.where("parentUId", "==", parentUId).get();

                  parentQuerySnapshot.forEach(async (doc) => {
                    const parentData = doc.data();
                    // console.log("Parent data:", parentData);
                    let fcmTokens = parentData.fcmTokens
                    fcmTokensArray.push(...fcmTokens)
                  });

                  if (parentUId && fcmTokensArray && childArray) {
                    let obj = {
                      parentUId: parentUId,
                      fcmTokens: fcmTokensArray,
                      childArray,
                      weeklyJob: jobItem
                    }
                    notificationSentArray.push(obj)
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  for (const notificationItem of notificationSentArray) {
    let tokens = notificationItem.fcmTokens;
    let childs = notificationItem.childArray
    for (const child of childs) {
      for (const token of tokens) {
        console.log(child, `${child.firstName} ${child.lastName} Task is Pending`)

        const payload = {
          notification: {
            title: `WeeklyJob`,
            body: `${child.firstName} ${child.lastName} Task is Pending`
          },
          data: {
            title: `WeeklyJob`,
            body: `${child.firstName} ${child.lastName} Task is Pending`,
          },
          token: token
        };

        const silentPayload = {
          data: {
            title: `WeeklyJob`,
            body: `${child.firstName} ${child.lastName} Task is Pending`,
          },
          token: token
        };

        try {
          await getMessaging().send(payload).then((response) => {
            console.log("##$#$#$#$ ",response);
          }).catch((error)=> {
            console.log("3434343422e ",error);
          });

        } catch (error) {
          console.log('Error sending notification:', error);
          continue;
        }

        try {
          await getMessaging().send(silentPayload).then((response) => {
            console.log("##$#$#$#$ ", response);
          }).catch((error) => {
            console.log("3434343422e ", error);
          });

        } catch (error) {
          console.log('Error sending notification:', error);
          continue;
        }
      }
    }
  }


  console.log('successfully ' + JSON.stringify(notificationSentArray));

  response.send({ "status": true, "message": JSON.stringify(notificationSentArray) });
});

exports.deleteParent = onRequest(async (request, response) => {
  var uid = request.body.uid;
  if (!uid) {
    response.status(500).send({ "status": false, "message": "Please provide uid." });
    return;
  }

  const parentSnapshot = await parentRef.where('uid', '==', uid).get();
  var userIdsToDelete = [];
  if (!parentSnapshot.empty) {
    var parent = parentSnapshot.docs[0].data();
    var parentUId = parent.parentUId;
    var isInvited = parent.isInvited;

    if (!isInvited) {
      const achivementSnapshot = await achivementRef.where('parentUId', '==', parentUId).get();
      if (!achivementSnapshot.empty) {
        achivementSnapshot.forEach(async doc => {
          await achivementRef.doc(doc.data().key).delete();
        });
      }

      const bookSnapshot = await bookRef.where('parentUId', '==', parentUId).get();
      if (!bookSnapshot.empty) {
        bookSnapshot.forEach(async doc => {
          await bookRef.doc(doc.data().key).delete();
        });
      }

      const childkSnapshot = await childRef.where('parentUId', '==', parentUId).get();
      if (!childkSnapshot.empty) {
        childkSnapshot.forEach(async doc => {
          await childRef.doc(doc.data().key).delete();
        });
      }

      const holidaySnapshot = await holidayRef.where('parentUId', '==', parentUId).get();
      if (!holidaySnapshot.empty) {
        holidaySnapshot.forEach(async doc => {
          await holidayRef.doc(doc.data().key).delete();
        });
      }

      const parentSnapshot = await parentRef.where('parentUId', '==', parentUId).get();
      if (!parentSnapshot.empty) {
        parentSnapshot.forEach(async doc => {
          var id = doc.data().uid;
          if (id) {
            userIdsToDelete.push(id)
            await parentRef.doc(id).delete();
          }
        });
      }

      const reminderSnapshot = await reminderRef.where('parentUId', '==', parentUId).get();
      if (!reminderSnapshot.empty) {
        reminderSnapshot.forEach(async doc => {
          await reminderRef.doc(doc.data().key).delete();
        });
      }

      const taskSnapshot = await taskRef.where('parentUId', '==', parentUId).get();
      if (!taskSnapshot.empty) {
        taskSnapshot.forEach(async doc => {
          await parentRef.doc(doc.data().key).delete();
        });
      }

      const assignmentSnapshot = await assignmentRef.where('parentUId', '==', parentUId).get();
      if (!assignmentSnapshot.empty) {
        assignmentSnapshot.forEach(async doc => {
          await assignmentRef.doc(doc.data().key).delete();
        });
      }

      const competitionSnapshot = await competitionRef.where('parentUId', '==', parentUId).get();
      if (!competitionSnapshot.empty) {
        competitionSnapshot.forEach(async doc => {
          await competitionRef.doc(doc.data().key).delete();
        });
      }

      const testSnapshot = await testRef.where('parentUId', '==', parentUId).get();
      if (!testSnapshot.empty) {
        testSnapshot.forEach(async doc => {
          await testRef.doc(doc.data().key).delete();
        });
      }
    }
    else {
      userIdsToDelete.push(uid)
      await parentRef.doc(uid).delete();
    }
    if (userIdsToDelete.length > 0) {
      admin.auth().deleteUsers(userIdsToDelete)
        .then((deleteUsersResult) => {
          logger.log(`Successfully deleted ${deleteUsersResult.successCount} users`);
          logger.log(`Failed to delete ${deleteUsersResult.failureCount} users`);
          deleteUsersResult.errors.forEach((err) => {
            logger.log(err.error.toJSON());
          });
        })
        .catch((error) => {
          logger.log('Error deleting users:', error);
        });
    }
    response.send({ "status": true, "message": (isInvited ? "Invited p" : "P") + "arent's all documents removed successfully." });
  }
  else {
    response.status(500).send({ "status": false, "message": "User not found with specified uid." });
  }
});

exports.invitePartner = onRequest(async (request, response) => {
  var invitingParentId = request.body.invitingParentId;
  var currentParentId = request.body.currentParentId;

  if (!invitingParentId) {
    response.status(500).send({ "status": false, "message": "Please provide invitingParentId." });
    return;
  }
  if (!currentParentId) {
    response.status(500).send({ "status": false, "message": "Invitation accepted currentParentId." });
    return;
  }

  const achivementSnapshot = await achivementRef.where('parentUId', '==', currentParentId).get();
  if (!achivementSnapshot.empty) {
    console.log(achivementSnapshot)
    achivementSnapshot.forEach(async doc => {
      console.log(doc)
      console.log(doc.data().key)
      await achivementRef.doc(doc.data().key).set({ "parentUId": invitingParentId }, { merge: true })
      console.log(doc.id, '=>', doc.data());
    });
  }

  const bookSnapshot = await bookRef.where('parentUId', '==', currentParentId).get();
  if (!bookSnapshot.empty) {
    bookSnapshot.forEach(async doc => {
      //doc.set({"parentUId": invitingParentId})
      await bookRef.doc(doc.data().key).set({ "parentUId": invitingParentId }, { merge: true })
      console.log(doc.id, '=>', doc.data());
    });
  }

  const childkSnapshot = await childRef.where('parentUId', '==', currentParentId).get();
  if (!childkSnapshot.empty) {
    childkSnapshot.forEach(async doc => {
      //doc.set({"parentUId": invitingParentId})
      await childRef.doc(doc.data().key).set({ "parentUId": invitingParentId }, { merge: true })
      console.log(doc.id, '=>', doc.data());
    });
  }

  const holidaySnapshot = await holidayRef.where('parentUId', '==', currentParentId).get();
  if (!holidaySnapshot.empty) {
    holidaySnapshot.forEach(async doc => {
      //doc.set({"parentUId": invitingParentId})
      await holidayRef.doc(doc.data().key).set({ "parentUId": invitingParentId }, { merge: true })
      console.log(doc.id, '=>', doc.data());
    });
  }

  const parentSnapshot = await parentRef.where('parentUId', '==', currentParentId).get();
  if (!parentSnapshot.empty) {
    parentSnapshot.forEach(async doc => {
      await parentRef.doc(doc.data().uid).set({ "parentUId": invitingParentId }, { merge: true })
      //doc.set({"parentUId": invitingParentId})
      console.log(doc.id, '=>', doc.data());
    });
  }

  const reminderSnapshot = await reminderRef.where('parentUId', '==', currentParentId).get();
  if (!reminderSnapshot.empty) {
    reminderSnapshot.forEach(async doc => {
      await reminderRef.doc(doc.data().key).set({ "parentUId": invitingParentId }, { merge: true })
      //doc.set({"parentUId": invitingParentId})
      console.log(doc.id, '=>', doc.data());
    });
  }

  const taskSnapshot = await taskRef.where('parentUId', '==', currentParentId).get();
  if (!taskSnapshot.empty) {
    taskSnapshot.forEach(async doc => {
      //doc.set({"parentUId": invitingParentId})
      await taskRef.doc(doc.data().key).set({ "parentUId": invitingParentId }, { merge: true })
      console.log(doc.id, '=>', doc.data());
    });
  }

  logger.info("Invite Parent called at ", { structuredData: true });
  response.send({ "status": true, "message": "Invitation accepted successfully." });
});

exports.checkSubscriptionStatus = onRequest(async (request, response) => {
  var parentUId = request.body.parentUId;
  if (parentUId) {
    const parentSubscriptionSnapshot = await parentSubscriptionRef.where('parentUId', '==', parentUId).get();
    if (!parentSubscriptionSnapshot.empty) {
      var doc = parentSubscriptionSnapshot.docs[0].data();
      var expiresDateMs = doc.expiresAt;
      if (expiresDateMs > Date.now()) {
        response.status(200).send({ "status": true, "message": "Subscription is active.", "data": doc });
      }
      else {
        var platformType = doc.platformType.toLowerCase()
        if (platformType == "android") {
          var token = doc.token;
          var productId = doc.productId;
          var packageName = "com.atesta.inapp"
          validateGoogleReceipt(parentUId, platformType, token, productId, packageName, request, response)
        }
        else {
          response.status(403).send({ "status": false, "message": "Subscription expired.", "data": doc });
        }
      }
    }
    else {
      response.status(403).send({ "status": false, "message": "No valid subscription found." });
      return
    }
  }
  else {
    response.status(400).send({ "status": false, "message": "Please provide parentUId." });
  }
});

exports.verifyReceipt = onRequest(async (request, response) => {
  var platformType = request.body.platformType;
  var parentUId = request.body.parentUId;

  if (!platformType) {
    response.status(500).send({ "status": false, "message": "Please provide platformType." });
    return;
  }

  if (!parentUId) {
    response.status(500).send({ "status": false, "message": "Please provide parentUId." });
    return;
  }

  if (platformType.toLowerCase() == "ios") {
    
    var receipt = request.body.receipt;
    if (!receipt) {
      response.status(500).send({ "status": false, "message": "Please provide receipt." });
      return;
    }
    iap.setup()
      .then(() => {
        iap.validate(receipt).then(onSuccess).catch(onError);
      })
      .catch((error) => {
        response.status(500).send({ "status": false, "message": "Something wrong happen", "error": error });
        return
        // error...
      });

    async function onSuccess(validatedData) {
      logger.log("####")
      // validatedData: the actual content of the validated receipt
      // validatedData also contains the original receipt
      var options = {
        ignoreCanceled: true, // Apple ONLY (for now...): purchaseData will NOT contain cancceled items
        ignoreExpired: true // purchaseData will NOT contain exipired subscription items
      };
      // validatedData contains sandbox: true/false for Apple and Amazon
      var purchaseData = iap.getPurchaseData(validatedData, options);
      var latestReceipts = validatedData.latest_receipt_info;
      logger.log("####  ", latestReceipts.length);
      logger.log("####  ", typeof latestReceipts);
      logger.log("####  ", latestReceipts);
      if (latestReceipts.length > 0) {
        latestReceipt = latestReceipts[0];
        var expiresDateMs = latestReceipt.expires_date_ms;
        var originalTransactionId = latestReceipt.original_transaction_id;
        logger.log("#### ", originalTransactionId);
        var productId = latestReceipt.product_id;
        var data = {
          "parentUId": parentUId,
          "originalTransactionId": originalTransactionId,
          "updatedAt": Date.now(),
          "expiresAt": expiresDateMs,
          "platformType": platformType,
          "receipt": receipt,
          "productId": productId,
          "response": JSON.stringify(validatedData),
          "token": "",
          "from": "Receipt validation"
        };
        if (expiresDateMs > Date.now()) {
          var transactionRef = appleSubscriptionWebhookRef.doc().id;
          data.key = transactionRef;
          await appleSubscriptionWebhookRef.doc(transactionRef).set(data);
          const parentSubscriptionSnapshot = await parentSubscriptionRef.where('parentUId', '==', parentUId).get();
          if (!parentSubscriptionSnapshot.empty) {
            logger.log("#### Transaction found");
            var doc = parentSubscriptionSnapshot.docs[0];
            var key = doc.data().key;
            data.key = key
            data.transactionRef = transactionRef;
            await parentSubscriptionRef.doc(key).set(data, { merge: true })
            logger.log(doc.id, '=>', doc.data());
            logger.log("#### Data updated");
          }
          else {
            logger.log("#### Transaction not found");
            data.createdAt = Date.now();
            var id = parentSubscriptionRef.doc().id;
            data.key = id;
            await parentSubscriptionRef.doc(id).set(data);
            logger.log("#### Data entered");
          }
          response.send({ "status": true, "message": "Receipt verified.", "data": purchaseData, "validatedData": validatedData });
        }
        else {
          response.status(403).send({ "status": false, "message": "Subscription expired.", "data": purchaseData, "validatedData": validatedData });
        }
      }
      else {
        response.status(500).send({ "status": false, "message": "Can not find valid receipt.", "data": purchaseData, "validatedData": validatedData });
      }
    }

    function onError(error) {
      response.status(500).send({ "status": false, "message": "Receipt validation failed.", "error": error });
      // failed to validate the receipt...
    }
  }
  else if (platformType.toLowerCase() == "android") {
    var token = request.body.token;
    var productId = request.body.productId;
    var packageName = request.body.packageName;
    if (!token) {
      response.status(500).send({ "status": false, "message": "Please provide token." });
      return;
    }
    if (!productId) {
      response.status(500).send({ "status": false, "message": "Please provide productId." });
      return;
    }
    if (!packageName) {
      response.status(500).send({ "status": false, "message": "Please provide packageName." });
      return;
    }
    validateGoogleReceipt(parentUId, platformType, token, productId, packageName, request, response)
  }
  else {
    response.status(500).send({ "status": false, "message": "Please provide valid platform type." });
    return;
  }
});

function validateGoogleReceipt(parentUId, platformType, token, productId, packageName, request, response) {
  const receipt = {
    purchaseToken: token,
    productId: productId,
    packageName: packageName,
    subscription: true,
    "developerPayload": parentUId
  };

  iap.setup()
    .then(() => {
      iap.validate(receipt).then(onSuccess).catch(onError);
    })
    .catch((error) => {
      response.status(500).send({ "status": false, "message": "Something wrong happen", "error": error });
      return
      // error...
    });

  async function onSuccess(validatedData) {
    logger.log("####", validatedData)
    // validatedData: the actual content of the validated receipt
    // validatedData also contains the original receipt
    var latestReceipt = validatedData
    logger.log("####  " + JSON.stringify(latestReceipt));
    if (latestReceipt) {
      var expiresDateMs = latestReceipt.expiryTimeMillis;
      var orderId = latestReceipt.orderId;
      var purchaseToken = latestReceipt.purchaseToken;
      // logger.log("#### ", purchaseToken);
      var productId = latestReceipt.productId;
      var data = {
        "parentUId": parentUId,
        "originalTransactionId": orderId,
        "updatedAt": Date.now(),
        "expiresAt": expiresDateMs,
        "platformType": platformType,
        "receipt": "",
        "productId": productId,
        "response": JSON.stringify(validatedData),
        "token": "",
        "from": "Receipt validation"
      };
      if (expiresDateMs > Date.now()) {
        var transactionRef = androidSubscriptionWebhookRef.doc().id;
        data.key = transactionRef;
        await androidSubscriptionWebhookRef.doc(transactionRef).set(data);
        const parentSubscriptionSnapshot = await parentSubscriptionRef.where('parentUId', '==', parentUId).get();
        if (!parentSubscriptionSnapshot.empty) {
          logger.log("#### Transaction found");
          var doc = parentSubscriptionSnapshot.docs[0];
          var key = doc.data().key;
          data.key = key
          data.transactionRef = transactionRef;
          await parentSubscriptionRef.doc(key).set(data, { merge: true })
          logger.log(doc.id, '=>', doc.data());
          logger.log("#### Data updated");
        }
        else {
          logger.log("#### Transaction not found");
          data.createdAt = Date.now();
          var id = parentSubscriptionRef.doc().id;
          data.key = id;
          await parentSubscriptionRef.doc(id).set(data);
          logger.log("#### Data entered");
        }
        response.send({ "status": true, "message": "Receipt verified.", "data": validatedData });
      }
      else {
        response.status(403).send({ "status": false, "message": "Subscription expired.", "data": validatedData });
      }
    }
    else {
      response.status(500).send({ "status": false, "message": "Can not find valid receipt .", "data": validatedData });
    }
  }
  function onError(error) {
    response.status(500).send({ "status": false, "message": "Receipt validation failed.", "error": error });
    // failed to validate the receipt...
  }
}

exports.appleNotificationV1VerifyReceipt = onRequest(async (request, response) => {
  var unifiedReceipt = request.body.unified_receipt;
  if (unifiedReceipt) {
    var latestReceipts = unifiedReceipt.latest_receipt_info;
    logger.log("####  ", latestReceipts.length);
    logger.log("####  ", typeof latestReceipts);
    logger.log("####  ", latestReceipts);
    if (latestReceipts.length > 0) {
      latestReceipt = latestReceipts[0];
      var expiresDateMs = latestReceipt.expires_date_ms;

      var parentUId = "";
      var originalTransactionId = latestReceipt.original_transaction_id;
      logger.log("#### ", originalTransactionId);
      var productId = latestReceipt.product_id;

      var data = {
        "originalTransactionId": originalTransactionId,
        "updatedAt": Date.now(),
        "expiresAt": expiresDateMs,
        "platformType": "ios",
        "response": JSON.stringify(request.body),
        "productId": productId,
        "token": "",
        "from": "AppleWebhook"
      };
      const parentSubscriptionSnapshot = await parentSubscriptionRef.where('originalTransactionId', '==', originalTransactionId).get();
      if (!parentSubscriptionSnapshot.empty) {
        var doc = parentSubscriptionSnapshot.docs[0];
        var key = doc.data().key;
        parentUId = doc.data().parentUId;
        data.parentUId = parentUId
        logger.log("#### Transaction found");
        if (expiresDateMs > Date.now()) {
          var transactionRef = appleSubscriptionWebhookRef.doc().id;
          data.key = transactionRef;
          await appleSubscriptionWebhookRef.doc(transactionRef).set(data);
          data.transactionRef = transactionRef;
          data.key = key;
          await parentSubscriptionRef.doc(key).set(data, { merge: true })
          logger.log(doc.id, '=>', doc.data());
          logger.log("#### Data updated");
          response.status(200).send({ "status": true, "message": "Receipt received.", "data": unifiedReceipt });
        }
        else {
          var transactionRef = appleSubscriptionWebhookErrorRef.doc().id;
          data.key = transactionRef;
          data.createdAt = Date.now()
          data.reason = "Subsciption is expired"
          data.receipt = JSON.stringify(unifiedReceipt)
          await appleSubscriptionWebhookErrorRef.doc(transactionRef).set(data);
          response.status(500).send({ "status": false, "message": "Subscription expired.", "data": unifiedReceipt });
        }
      }
      else {
        var transactionRef = appleSubscriptionWebhookErrorRef.doc().id;
        data.key = transactionRef;
        data.createdAt = Date.now()
        data.reason = "parentUId not found in parent subscription tabel"
        data.receipt = JSON.stringify(unifiedReceipt)
        await appleSubscriptionWebhookErrorRef.doc(transactionRef).set(data);
        response.status(500).send({ "status": false, "message": "Receipt received but parent uid not found.", "data": JSON.stringify(request.body) });
        return
      }
    }
    else {
      var transactionRef = appleSubscriptionWebhookErrorRef.doc().id;
      data.createdAt = Date.now()
      data.key = transactionRef;
      data.reason = "Can not find latest receipt"
      data.receipt = JSON.stringify(request.body)
      await appleSubscriptionWebhookErrorRef.doc(transactionRef).set(data);
      response.status(500).send({ "status": false, "message": "Can not find latest receipt.", "data": JSON.stringify(request.body) });
    }
  }
  else {
    var data = {
      "originalTransactionId": "",
      "createdAt": Date.now(),
      "updatedAt": Date.now(),
      "expiresAt": 0,
      "platformType": "ios",
      "receipt": "",
      "productId": "",
      "token": "",
      "from": "AppleWebhook"
    };

    var transactionRef = appleSubscriptionWebhookErrorRef.doc().id;
    data.key = transactionRef;
    data.reason = "Can not find unifiedReceipt"
    data.receipt = ""
    data.response = JSON.stringify(request.body);
    await appleSubscriptionWebhookErrorRef.doc(transactionRef).set(data);
    response.status(500).send({ "status": false, "message": "Can not find unifiedReceipt." });
  }
});

exports.androidNotificationV1 = onRequest(async (request, response) => {
  response.send("Android notification v1  !");
});

iap.config({

  /* Configurations for HTTP request */
  requestDefaults: { /* Please refer to the request module documentation here: https://www.npmjs.com/package/request#requestoptions-callback */ },

  /* Configurations for Apple */
  appleExcludeOldTransactions: true, // if you want to exclude old transaction, set this to true. Default is false
  applePassword: 'cd72731f425e40c39dc41f3603b37f26', // this comes from iTunes Connect (You need this to valiate subscriptions)

  /* Configurations for Google Service Account validation: You can validate with just packageName, productId, and purchaseToken */
  googleServiceAccount: {
    clientEmail: 'test-in-app@test-in-app-405713.iam.gserviceaccount.com',
    privateKey: '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC3fsJx0FFS7OI6\nOkTGQIl7B6mgyesM1YJVprnFhjFHxHG+Uz8v0BmEW/TzFF2evSuio9F6/K/bSgsI\n1ZXvZDAAYjHn0JB5vd4BTxHjXgp7lpOfMwU0db1+mO69EDUmx9+hc7akHoe2pDud\nf7NWGPFnGNgowftabefVMb2k0SEDIo0CgeowsQIyzsZQEtEOFpr+JXXzlFTfTBcg\nMYVrzMc+OQfJEhp/pAVDRNytNZ8kSo1D9u2v1swc+TKvVjsBR2CuqOht/B258cyo\ndiKZejegHk1vg5KycuZt5H6l0maaDI5jCUPO8a5gQoMmXeXtMGxtXRAYGvOoCpaS\nNiS/Dz8rAgMBAAECggEAJW/kRgpFfVC9OzoGLBigtAw1LIvlu+GXzNfOUSF2znii\n6DzdyGiBvEJysGF4VFmuHGml5JzHWEs8Axpok8XyETH3kp83ys7VC5lRQf0+0EZB\nahqjtjdLaRfUpZg37+iZlLwiCEv+TmIlk5WpRiiin/EusOoa2TFROmsCkSzluliq\nrcrCF16QvYDdvok1Ai47lnTTKd4Alq7Q6pzLQolMYLDRga0xX2AsfFm0lCQBJO2t\nPn3H0rWaoNJNjMT6GmZPgpPCGiPtTmqAj0o8OFztiOLe6jLGrsSUtQ1sjCm6F5+z\nrqUjxEjcyjKHdFKRV4qnOKQnZPxTG/eS471BLyXdEQKBgQDlUMP4UTzGdC2qzboY\nMoRMJxsz7Uij9Iv1sdVjlb3blS8unaua8ipy0cnWEijWOaM+OJzvW1TqmPXZhyyf\ntZSTbpaVEXcLuJz/IBY4YFpFhNI392n5hqwEIEFQQFW6SyiJ7SzxSxSwHp5j0If0\npphD3pkPVQQLt744RZT22Sz2mQKBgQDM2QVhZTbF3Khb6Id8Mi7ZcXaN8awezSmO\nP4293njHqowYHKAgYvXjnKakPKZAxXTbIbuOFl7lFnsKmY2+AAG5EphLtHm/HbCl\ncfVvS4CFCTJROOLX4fH46+7uHMP8mXLlw0pE+IbCMc0jvd/KN0wAIpCdWpPLAOxM\nAk1q2dIyYwKBgC+PCJW/g3NFNRNvh2DtWTLSCXpDhAU8+qoCL9dvfujDj/2DBcwk\n3Vji2ZFkQsPrQEfvRdz+fCYLgzGSL1cQObg5/1D7Rk1QBH+FEBaxJQe1/ENPNNNj\nctmINwOF1EHGxKmWXvPMNoYwU3kwDoJW6s1opSXg4+3qNbFF/RcVA5ZBAoGANe/O\not5rlZ2MFucbBXCRNV/Sv30qvNF4Z6QERkIVuz0EtjSTVPO5mrzcg9IUVGmpYyl2\noOrzAY7xxtC3qZeG3JwwzX4vsEq5AFcJMMzIgj7xqME5uW4csFYvCzM3x4L/5c+N\n9qsZkHhcc1TDYBM/R6nSOhxnXcRYc4sHp2LDHdECgYEAltHlbaQXzHMx3B1o/V/l\nP5EeW+AcgN5KT34gr6jUHYrI5/L8BMCrNR7JuELYhRlIimT3J4X9tSR/1Uf4xPSh\n45CFm9tjnQXh7kFT2ybMzVYbqf8R0SpOje+zIec3GQ/T2LNWuteSx32JyWUc9rVL\nB9PnQJWF6kParCVtJ6c9j84=\n-----END PRIVATE KEY-----\n'
  },

  // googleServiceAccount: {
  //   clientEmail: 'test-163@test-in-app-405713.iam.gserviceaccount.com',
  //   privateKey: ''
  // },

  /* Configurations for Google Play */
  //googleRefToken: 'dddd...', // optional, for Google Play subscritions
  //googleClientID: '400748433104-sphopjajlssj6ma3fd8cinrquch05srl.apps.googleusercontent.com', // optional, for Google Play subscriptions
  //googleClientSecret: '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', // optional, for Google Play subscriptions

  /* Configurations for Roku */
  rokuApiKey: 'aaaa...', // this comes from Roku Developer Dashboard

  /* Configurations for Facebook (Payments Lite) */
  facebookAppId: '112233445566778',
  facebookAppSecret: 'cafebabedeadbeefabcdef0123456789',

  /* Configurations all platforms */
  test: true, // For Apple and Googl Play to force Sandbox validation only
  verbose: true // Output debug logs to stdout stream
});

exports.childDelete = onRequest(async (request, response) => {
  var parentUId = request.body.parentUId;
  var childId = request.body.childId;

  const holidaySnapshot = await holidayRef.where('parentUId', '==', parentUId).get();
  if (!holidaySnapshot.empty) {
    holidaySnapshot.forEach(async holiday => {
      const childIds = Array.from(holiday.data().childId);
      if (childIds.length > 1) {
        for (let index = 0; index < childIds.length; index++) {
          const element = childIds[index];

          if (childId === element) {
            childIds.splice(index, 1);
            break;
          }

        }
        await holidayRef.doc(holiday.data().key).set({ "childId": childIds }, { merge: true });
      } else {
        if (childIds[0] == childId) {
          await holidayRef.doc(holiday.data().key).delete();
        }
      }
    });
  }

  const reminderSnapshot = await reminderRef.where('parentUId', '==', parentUId).get();
  if (!reminderSnapshot.empty) {
    reminderSnapshot.forEach(async reminder => {
      const childIds = Array.from(reminder.data().childIds);
      const childStatus = Array.from(reminder.data().childStatus);
      if (childIds.length > 1) {
        for (let index = 0; index < childIds.length; index++) {
          const element = childIds[index];

          if (childId === element) {
            childIds.splice(index, 1);
            break;
          }

        }

        for (let index = 0; index < childStatus.length; index++) {
          const element = childStatus[index];
          if (childId === element.childId) {
            childStatus.splice(index, 1);
            break;
          }
        }

        await reminderRef.doc(reminder.data().key).set({ "childIds": childIds, "childStatus": childStatus }, { merge: true });
      } else {
        if (childIds[0] == childId) {
          await reminderRef.doc(reminder.data().key).delete();
        }
      }
    });
  }

  const achivementSnapshot = await achivementRef.where('createdBy', '==', childId).get();
  if (!achivementSnapshot.empty) {
    achivementSnapshot.forEach(async achivement => {
      await achivementRef.doc(achivement.data().key).delete();
    });
  }

  const bookSnapshot = await bookRef.where('createdBy', '==', childId).get();
  if (!bookSnapshot.empty) {
    bookSnapshot.forEach(async book => {
      await bookRef.doc(book.data().key).delete();
    });
  }

  const assignmentSnapshot = await assignmentRef.where('parentUId', '==', parentUId).get();
  if (!assignmentSnapshot.empty) {
    assignmentSnapshot.forEach(async assignment => {
      if (assignment.data().createdBy === childId) {

        await assignmentRef.doc(assignment.data().key).delete();

      } else {
        const childIds = Array.from(assignment.data().childIds);
        const childStatus = Array.from(assignment.data().childStatus);
        const readStatus = Array.from(assignment.data().readStatus);

        if (childIds.length > 1) {
          for (let index = 0; index < childIds.length; index++) {
            const element = childIds[index];

            if (childId === element) {
              childIds.splice(index, 1);
              break;
            }

          }

          for (let index = 0; index < readStatus.length; index++) {
            const element = readStatus[index];

            if (childId === element) {
              readStatus.splice(index, 1);
              break;
            }

          }

          for (let index = 0; index < childStatus.length; index++) {
            const element = childStatus[index];
            if (childId === element.childId) {
              childStatus.splice(index, 1);
              break;
            }
          }

          await assignmentRef.doc(assignment.data().key).set({ "childIds": childIds, "childStatus": childStatus, "readStatus": readStatus }, { merge: true });
        } else {
          if (childIds[0] == childId) {
            await assignmentRef.doc(assignment.data().key).delete();
          }
        }
      }

    });
  }

  const testSnapshot = await testRef.where('parentUId', '==', parentUId).get();
  if (!testSnapshot.empty) {
    testSnapshot.forEach(async test => {
      if (test.data().createdBy === childId) {

        await testRef.doc(test.data().key).delete();

      } else {
        const childIds = Array.from(test.data().childIds);
        const childStatus = Array.from(test.data().childStatus);
        const readStatus = Array.from(test.data().readStatus);

        if (childIds.length > 1) {
          for (let index = 0; index < childIds.length; index++) {
            const element = childIds[index];

            if (childId === element) {
              childIds.splice(index, 1);
              break;
            }

          }

          for (let index = 0; index < readStatus.length; index++) {
            const element = readStatus[index];

            if (childId === element) {
              readStatus.splice(index, 1);
              break;
            }

          }

          for (let index = 0; index < childStatus.length; index++) {
            const element = childStatus[index];
            if (childId === element.childId) {
              childStatus.splice(index, 1);
              break;
            }
          }

          await testRef.doc(test.data().key).set({ "childIds": childIds, "childStatus": childStatus, "readStatus": readStatus }, { merge: true });
        } else {
          if (childIds[0] == childId) {
            await testRef.doc(test.data().key).delete();
          }
        }
      }

    });
  }

  const taskSnapshot = await taskRef.where('parentUId', '==', parentUId).get();
  if (!taskSnapshot.empty) {
    taskSnapshot.forEach(async task => {
      const childIds = Array.from(task.data().childIds);
      const readStatus = Array.from(task.data().readStatus);
      const subtask = Array.from(task.data().subTask);
      if (childIds.length > 1) {
        for (let index = 0; index < childIds.length; index++) {
          const element = childIds[index];

          if (childId === element) {
            childIds.splice(index, 1);
            break;
          }
        }

        for (let index = 0; index < readStatus.length; index++) {
          const element = readStatus[index];

          if (childId === element) {
            readStatus.splice(index, 1);
            break;
          }

        }

        for (let index = 0; index < subtask.length; index++) {
          const element = subtask[index];
          const childStatus = Array.from(element.childStatus);
          for (let j = 0; j < childStatus.length; j++) {
            const childStatus_element = childStatus[j];
            if (childStatus_element.childId === childId) {
              childStatus.splice(j, 1);
              break;
            }
          }
          element.childStatus = childStatus;
        }

        await taskRef.doc(task.data().key).set({ "childIds": childIds, "subTask": subtask, "readStatus": readStatus }, { merge: true });

      } else {
        if (childIds[0] == childId) {
          await taskRef.doc(task.data().key).delete();
        }
      }

    });

  }

  const competitionSnapshot = await competitionRef.where('parentUId', '==', parentUId).get();
  if (!competitionSnapshot.empty) {
    competitionSnapshot.forEach(async competition => {
      const competitorsIds = Array.from(competition.data().competitorsIds);
      const activities = Array.from(competition.data().activities);
      if (competitorsIds.length > 1) {
        for (let index = 0; index < competitorsIds.length; index++) {
          const element = competitorsIds[index];
          if (element == childId) {
            competitorsIds.splice(index, 1);
            break;
          }

        }

        for (let i = 0; i < activities.length; i++) {
          const activity = activities[i];
          const activityResults = Array.from(activity.activityResults);
          for (let j = 0; j < activityResults.length; j++) {
            const element = activityResults[j];

            if (element.competitorId == childId) {
              activityResults.splice(j, 1);
              break;
            }

          }
          activity.activityResults = activityResults;

        }

        await competitionRef.doc(competition.data().key).set({ "competitorsIds": competitorsIds, "activities": activities }, { merge: true });

      } else {
        if (competitorsIds[0] == childId) {
          await competitionRef.doc(competition.data().key).delete();
        }
      }

    });

  }

  const timeTableSnapshot = await timeTableRef.where('parentUId', '==', parentUId).get();
  if (!timeTableSnapshot.empty) {
    timeTableSnapshot.forEach(async timeTable => {
      const childIds = Array.from(timeTable.data().childId);
      // console.log(childIds.length,"asdddd")
      if (childIds.length > 1) {
        for (let index = 0; index < childIds.length; index++) {
          const element = childIds[index];
          if (childId === element) {
            childIds.splice(index, 1);
            break;
          }
        }
        await timeTableRef.doc(timeTable.data().key).set({ "childId": childIds }, { merge: true });
        // console.log(childIds,"childIds")
      } else {
        if (childIds[0] == childId) {
          await timeTableRef.doc(timeTable.data().key).delete();
        }
      }
    });
  }

  const countdownEventSnapshot = await countdownEventRef.where('parentUId', '==', parentUId).get();
  if (!countdownEventSnapshot.empty) {
    countdownEventSnapshot.forEach(async countdown => {
      const childIds = Array.from(countdown.data().childId);
      console.log('first')
      if (childIds.length > 1) {
        for (let index = 0; index < childIds.length; index++) {
          const element = childIds[index];
          if (childId === element) {
            childIds.splice(index, 1);
            break;
          }
        }
        await countdownEventRef.doc(countdown.data().key).set({ "childId": childIds }, { merge: true });
        console.log(childIds, "update childIds");
      } else {
        if (childIds[0] == childId) {
          await countdownEventRef.doc(countdown.data().key).delete();
          console.log('destroy collection');
        }
      }
    });
  }

  const weeklyJobQuerySnapshot = await weeklyJobRef.where('parentUId', '==', parentUId).get();
  if (!weeklyJobQuerySnapshot.empty) {
    weeklyJobQuerySnapshot.forEach(async (weeklyJob) => {
      const jobArray = Array.from(weeklyJob.data().jobs);
      if (jobArray.length > 0) {
        for (let index = 0; index < jobArray.length; index++) {
          const childIds = jobArray[index].childIds;
          if (childIds.length > 1) {
            if (childIds && childIds.length > 0) {
              const updatedChildIds = childIds.filter(child => child !== childId);
              jobArray[index].childIds = updatedChildIds;
              await weeklyJobRef.doc(weeklyJob.data().key).set({ jobs: jobArray }, { merge: true });
              // console.log("asdf",jobArray,"child delete")
            }
          } else {
            if (childIds[0] == childId) {
              await weeklyJobRef.doc(weeklyJob.data().key).delete();
            }
          }
        }
      }
    })
  }

  const childDelete = await childRef.doc(childId).delete();

  response.send({ "status": true, "message": "Child delete successfully." });

});

exports.cronJobForJobStatus = onSchedule({
  schedule: "every day 01:00",
  timeZone: "Europe/London"
}, async (event) => {
  console.log('This function is run everyday 00:00');
  var date = new Date();
  console.log("current date : " + date);
  date.setHours(0, 0, 0, 0);

  date.setDate(date.getDate() - 2);

  console.log("two days ago : " + date.getTime() / 1000);

  const querySnapshot = await weeklyJobRef.get();

  if (!querySnapshot.empty) {
    for (const docSnapshot of querySnapshot.docs) {
      const val = docSnapshot.data();
      if (val.jobs && val.jobs.length > 0) {

        var isMatch = false;
        for (const jobItem of val.jobs) {
          if (jobItem.jobStatus && jobItem.jobStatus.length > 0) {
            var jobStatus = Array.from(jobItem.jobStatus);

            for (let index = 0; index < jobStatus.length; index++) {
              const statusItem = jobStatus[index];

              console.log("timestamp : " + statusItem.date);
              console.log("date: " + date.getTime() / 1000);

              if (statusItem.date <= date.getTime() / 1000) {

                isMatch = true;

                const newTimestamp = statusItem.date + 1209600

                const newJobStatus = {
                  date: newTimestamp,
                  childStatus: statusItem.childStatus.map(child => ({
                    childId: child.childId,
                    status: "pending"
                  }))
                };

                jobStatus.push(newJobStatus);
                jobStatus.splice(index, 1);
                jobItem.jobStatus = jobStatus;
                console.log("updated job :  " + JSON.stringify(jobItem));
                break;
              }
            }
          }
        }

        if (isMatch) {
          // await weeklyJobRef.doc(val.key).update({ "jobs": val.jobs }, { merge: true });
        }
      }
    }
  }

  console.log('Job status update successfully');
});

exports.parentPushNotificationJob = onSchedule({
  schedule: "*/30 * * * *",
  timeZone: "Asia/Kolkata"
}, async (event) => {

  try {

    const weeklyJobQuerySnapshot = await weeklyJobRef.get();

    let notificationSentArray = []

    for (const docSnapshot of weeklyJobQuerySnapshot.docs) {
      const val = docSnapshot.data();
      console.log('>>>>>', val.key)
      if (val.jobs && val.jobs.length > 0) {
        for (const jobItem of val.jobs) {
          if (jobItem.jobStatus && jobItem.jobStatus.length > 0) {

            let jobStatus = Array.from(jobItem.jobStatus);

            for (let index = 0; index < jobStatus.length; index++) {
              const statusItem = jobStatus[index];
              const timestamp = Math.floor(statusItem.date * 1000);
              console.log(timestamp)
              const options = { timeZone: 'Asia/Kolkata' };
              const date = new Date(timestamp);
              const formatter = new Intl.DateTimeFormat('en-US', {
                timeZone: 'Asia/Kolkata',
                day: '2-digit'
              });

              const formattedDate = formatter.format(date);

              const currentDate = new Date().getDate('en-US', options);

              console.log(`weeklyJobDate : ${typeof date, formattedDate}`);
              console.log('todayDate', currentDate)

              if (formattedDate == currentDate) {

                console.log('enter')
                let now = new Date();
                let options = {
                  hour12: true,
                  timeZone: 'Asia/Kolkata' // Asia/Kolkata
                };
                let formattedTime = now.toLocaleString('en-US', options); // 4/8/2024, 8:13:53 AM
                let currentTime = new Date(formattedTime)

                let match = formattedTime.split(',');
                match[1] = val.deadlineTime; /// "08:00 PM"
                let parentDeadlineString = match.join(',');
                let parentDeadlineSetSecond = new Date(parentDeadlineString).setSeconds(0); // Convert to Date object
                let parentDeadlineTime = new Date(parentDeadlineSetSecond)

                console.log(currentTime.toLocaleString(), parentDeadlineTime.toLocaleString(), '$$$$$$', currentTime, "&&", parentDeadlineTime) // >  4/8/2024, 6:09:47 AM 4/8/2024,04:00 AM fff

                let isSameAMPM = (currentTime.getHours() >= 12) === (parentDeadlineTime.getHours() >= 12);
                let isSameHour = currentTime.getHours() === parentDeadlineTime.getHours();
                let isSameMinutes = currentTime.getMinutes() >= parentDeadlineTime.getMinutes();

                let advancedWarning = val.advancedWarning
                console.log(advancedWarning);
                if (advancedWarning.length > 0) {
                  let advancedWarningInHour = parseInt(advancedWarning[0])
                  console.log(currentTime.getHours(), parentDeadlineTime.getHours(), advancedWarningInHour, "*******@@@@@")
                  if (!isNaN(advancedWarningInHour) && currentTime.getHours() === parentDeadlineTime.getHours() - advancedWarningInHour) {
                    isSameHour = true
                    console.log(isSameAMPM, isSameHour, isSameMinutes, '*******')
                  }
                }

                console.log(isSameAMPM, isSameHour, isSameMinutes);

                if (isSameAMPM && isSameHour && isSameMinutes) {

                  if (statusItem.childStatus && statusItem.childStatus.length > 0) {

                    let parentUId = val.parentUId
                    let fcmTokensArray = []
                    let childArray = []
                    let childStatus = statusItem.childStatus

                    for (let index = 0; index < childStatus.length; index++) {
                      if (childStatus[index].status === 'pending' && childStatus[index].childId) {
                        let singleChild = await childRef.doc(childStatus[index].childId).get()
                        if (singleChild.exists) {
                          let childData = singleChild.data();
                          childArray.push({
                            firstName: childData.firstName,
                            lastName: childData.lastName,
                            childId: childData.key
                          })
                        }
                      }
                    }

                    const parentQuerySnapshot = await parentRef.where("parentUId", "==", parentUId).get();

                    parentQuerySnapshot.forEach(async (doc) => {
                      const parentData = doc.data();
                      // console.log("Parent data:", parentData);
                      let fcmTokens = parentData.fcmTokens
                      fcmTokensArray.push(...fcmTokens)
                    });

                    if (parentUId && fcmTokensArray && childArray) {
                      let obj = {
                        parentUId: parentUId,
                        fcmTokens: fcmTokensArray,
                        childArray,
                        weeklyJob: jobItem
                      }
                      notificationSentArray.push(obj)
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    for (const notificationItem of notificationSentArray) {
      let tokens = notificationItem.fcmTokens;
      let childs = notificationItem.childArray
      for (const child of childs) {
        for (const token of tokens) {
          console.log(child, `${child.firstName} ${child.lastName} Task is Pending`)

          const payload = {
            notification: {
              title: `WeeklyJob`,
              body: `${child.firstName} ${child.lastName} Task is Pending`
            },
            data: {
              title: `WeeklyJob`,
              body: `${child.firstName} ${child.lastName} Task is Pending`,
            },
            token: token
          };

          const silentPayload = {
            data: {
              title: `WeeklyJob`,
              body: `${child.firstName} ${child.lastName} Task is Pending`,
            },
            token: token
          };

          try {
            await getMessaging().send(payload).then((response) => {
              console.log("##$#$#$#$ ", response);
            }).catch((error) => {
              console.log("3434343422e ", error);
            });

          } catch (error) {
            console.log('Error sending notification:', error);
            continue;
          }

          try {
            await getMessaging().send(silentPayload).then((response) => {
              console.log("##$#$#$#$ ", response);
            }).catch((error) => {
              console.log("3434343422e ", error);
            });

          } catch (error) {
            console.log('Error sending notification:', error);
            continue;
          }
        }
      }
    }

    console.log('successfully ' + JSON.stringify(notificationSentArray));

  } catch (error) {
    console.error('Error fetching data from Firestore:', error);
    res.status(500).json({
      status: 'fail',
      message: error?.message ?? 'Error fetching data from Firestore'
    });
  }

});