import mongoose, { Document, Schema, Model, mongo } from 'mongoose';

// Define the interface for the User document
interface IUser extends Document {
    userId: mongoose.Schema.Types.ObjectId;
    name: string;
    mobileNumber: string;
    isDeleted: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

// Define the schema
const UserSchema: Schema<IUser> = new Schema(
    {
        
        userId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'user'
        },
        name : String,
        mobileNumber : String,
        isDeleted: {
            type: Boolean,
            required: true
        },
        createdAt: Date,
        updatedAt: Date
    },
    { timestamps: true, versionKey: false }
);

// Create and export the model
export const PROFILE: Model<IUser> = mongoose.model<IUser>('profile', UserSchema);
