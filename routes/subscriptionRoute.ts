import express from 'express';
import { isAuthenticated } from '../middlewares/isAuth';
import { verifyReceipt , iosWebhookV2 , getTransactions , checkSubscriptionStatus , subscriptionStatusCheckAppleSide , check } from '../controllers/subscriptionController';
const router = express.Router();

router.post('/verifyReceipt', isAuthenticated, verifyReceipt)
router.post('/iosWebhookV2', iosWebhookV2)
router.get('/getTransactions', isAuthenticated, getTransactions)
router.get('/checkSubscriptionStatus', isAuthenticated, checkSubscriptionStatus)
router.get('/subscriptionStatusCheckAppleSide', isAuthenticated, subscriptionStatusCheckAppleSide)
router.get('/check', isAuthenticated, check)

export default router;

