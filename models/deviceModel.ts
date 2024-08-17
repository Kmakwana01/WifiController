import mongoose, { Document, Schema, Model, mongo } from 'mongoose';

// Define the interface for the User document
interface IUser extends Document {
    // name: String;
    deviceName: string;
    platform: string;
    userId : mongoose.Schema.Types.ObjectId;
    isActive: boolean;
    isDeleted: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

// Define the schema
const deviceSchema: Schema<IUser> = new Schema(
    {
        userId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'user'
        },
        deviceName : String,
        platform : String,
        isActive : Boolean,
        isDeleted: Boolean,
        createdAt: Date,
        updatedAt: Date
    },
    { timestamps: true, versionKey: false }
);

// Create and export the model
export const DEVICE: Model<IUser> = mongoose.model<IUser>('device', deviceSchema);
