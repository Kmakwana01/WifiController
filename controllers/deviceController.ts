import { USER } from "../models/userModel";
import mongoose from "mongoose";
import { Request, Response } from 'express';
import { DEVICE } from "../models/deviceModel";
import { generateUUIDv4LikeNumberString } from "../utils/handler";



interface updatedRequest extends Request {
    query: {
        id: string;
        isActive: string;
        userId: string;
    };
}

export const addNewDevice = async (req : Request, res : Response) => {
    try {

        let { userId } = req.body;

        if (!userId){
            throw new Error('userId is required.')
        }

        let findUser = await USER.findOne({ _id : userId })
        if(!findUser) throw new Error('please provide valid userId.');

        if(!findUser.familyId){
            findUser.familyId = await generateUUIDv4LikeNumberString(19,20)
            await findUser.save()
        }

        let findCurrentUser : any = await USER.findOne({ _id : req.userId });
        if (findCurrentUser) {
            if (findCurrentUser.familyId != null) {
                throw new Error("you are already add in other family");
            } else {
                findCurrentUser.familyId = findUser.familyId;
                await findCurrentUser.save();
            }
        }

        res.status(200).json({
            status: 201,
            message: 'Device add successfully',
            data: findCurrentUser
        });

    } catch (error : any) {
        res.status(400).json({
            status: "Failed",
            message: error.message,
        });
    }
}

export const getDeviceList = async (req : Request, res : Response) => {
    try {

        let findUser = await USER.findOne({ _id: req.userId })
        if(!findUser) throw new Error('please provide valid userId.');

        const userIds : any = findUser.familyId
        ? (await USER.find({ familyId: findUser.familyId, isDeleted: false })).map(user => user._id)
        : [new mongoose.Types.ObjectId(req.userId)];

        let allDevices = await DEVICE.aggregate([
              {
                  $match: {
                    isDeleted: false,
                    userId: { $in: userIds }
                  }
              },
              {
                $lookup: {
                  from: 'profiles',       // Name of the Profile collection
                  localField: 'userId',  // Field from the DEVICE collection
                  foreignField: 'userId',// Field from the Profile collection
                  as: 'profile'          // Name for the results
                }
              },
              {
                $unwind: '$profile'       // Unwind the profile array to flatten the structure
              },
              {
                $project: {
                  _id: 1,
                  userId: 1,
                  deviceName: 1,
                  platform: 1,
                  isActive: 1,
                  isDeleted: 1,
                  createdAt: 1,
                  updatedAt: 1,
                  name: '$profile.name'    // Include the name field from the Profile collection
                }
              }
        ]);

        res.status(200).json({
            status: 201,
            message: 'Devices get successfully',
            data: allDevices
        });

    } catch (error : any) {
        res.status(400).json({
            status: "Failed",
            message: error.message,
        });
    }
}

export const deviceRemove = async (req : updatedRequest, res : Response) => {
    try {
            const { userId } = req.query;

            if (!userId) {
                throw new Error('id is required in query.');
            } else if (!mongoose.Types.ObjectId.isValid(userId)) {
                throw new Error('please provide valid objectId.')
            }

            const isUser : any = await USER.findOne({ _id : userId });

            if (!isUser) {
                throw new Error('This user does not exist.');
            } else if (isUser.isDeleted === true) {
                throw new Error('This user has already been deleted.')
            }

            isUser.familyId = null;
            await isUser.save();

            res.status(202).json({
                status: 202,
                message: 'device remove successfully.'
            })

    } catch (error : any) {
            res.status(400).json({
                status: 'Failed',
                message: error.message
            })
    }
}

export const statusChange = async (req : updatedRequest, res : Response) => {
    try {

        const { userId } = req.query

        if (!userId) {
            throw new Error('userId is required in query.');
        } else if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new Error('please provide valid objectId.')
        } 

        const isUser : any = await USER.findOne({ _id : userId , isDeleted : false });

        if (!isUser) {
            throw new Error('This user does not exist.');
        } 

       let findCurrentDevice = await DEVICE.findOne({ userId : isUser._id , isDeleted : false });

       if(!findCurrentDevice) throw new Error('device does not exist.');

       findCurrentDevice.isActive = !findCurrentDevice.isActive
       await findCurrentDevice.save()


        res.status(202).json({
            status: 202,
            message: 'status update successfully.',
            data : findCurrentDevice
        })
        
    } catch (error : any) {
        res.status(400).json({
            status: 'Failed',
            message: error.message
        })
    }
}
