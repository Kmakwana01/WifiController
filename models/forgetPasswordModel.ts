import mongoose, { Document, Schema, Model } from 'mongoose';

// Define the interface for the ForgetPassword document
interface IForgetPassword extends Document {
    email: string;
    verificationCode: number;
    userId?: mongoose.Schema.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}

// Define the schema
const forgetPasswordSchema: Schema<IForgetPassword> = new Schema(
    {
        email: {
            type: String,
            required: true
        },
        verificationCode: {
            type: Number,
            required: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
        },
        createdAt: Date,
        updatedAt: Date
    },
    { timestamps: true, versionKey: false }
);

// Create and export the model
export const RESET: Model<IForgetPassword> = mongoose.model<IForgetPassword>('forgetPassword', forgetPasswordSchema);
