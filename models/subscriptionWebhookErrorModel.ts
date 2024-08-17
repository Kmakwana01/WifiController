import mongoose, { Document, Schema, Model, mongo } from 'mongoose';

// Define the interface for the User document
interface ISubscriptionWebhookError extends Document {
    userId: mongoose.Schema.Types.ObjectId;
    from: string;
    originalTransactionId: string;
    platform: string;
    productId: string;
    receipt: string;
    response: string;
    reason: string;
    token: string;
    expireAt: String;
    isDeleted: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

// Define the schema
const UserSchema: Schema<ISubscriptionWebhookError> = new Schema(
    {
        userId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'user'
        },
        from : String,
        originalTransactionId : String,
        platform : String,
        productId : String,
        receipt : String,
        response : String,
        reason : String,
        token : String,
        expireAt : String,
        isDeleted: Boolean,
        createdAt: Date,
        updatedAt: Date
    },
    { timestamps: true, versionKey: false }
);

// Create and export the model
export const SUBSCRIPTION_WEBHOOK_ERROR: Model<ISubscriptionWebhookError> = mongoose.model<ISubscriptionWebhookError>('subscriptionwebhookerror', UserSchema);
