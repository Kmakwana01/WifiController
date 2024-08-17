import express from 'express';
import { isAuthenticated } from '../middlewares/isAuth';
import {
    addNewDevice,
    deviceRemove,
    getDeviceList,
    statusChange
} from '../controllers/deviceController';

const router = express.Router();

router.post('/addNewDevice', isAuthenticated,  addNewDevice)
router.get('/getDeviceList', isAuthenticated, getDeviceList)
router.post('/deviceRemove', isAuthenticated,deviceRemove)
router.post('/statusChange', isAuthenticated, statusChange)
// router.get('/getProfile', isAuthenticated, getProfile)

export default router;

