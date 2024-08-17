import mongoose, { Document, Schema, Model } from 'mongoose';

// Define the interface for the Session document
interface ISession extends Document {
    notificationToken: string;
    jwtToken: string;
    userAgent: string;
    ipAddress: string;
    deviceName: string;
    platform: string;
    userId: mongoose.Schema.Types.ObjectId;
    generatedAt?: Date;
    version: string;
    buildNumber: string;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

// Define the schema
const SessionSchema: Schema<ISession> = new Schema(
    {
        notificationToken: {
            type: String
        },
        jwtToken: {
            type: String,
            required: true,
            unique: true
        },
        userAgent: {
            type: String,
        },
        ipAddress: {
            type: String
        },
        deviceName: {
            type: String,
        },
        platform: {
            type: String
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true
        },
        generatedAt: {
            type: Date,
        },
        version: {
            type: String
        },
        buildNumber: {
            type: String
        },
        isActive: {
            type: Boolean,
        },
        createdAt: {
            type: Date,
        },
        updatedAt: {
            type: Date,
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

// Create and export the model
export const SESSION: Model<ISession> = mongoose.model<ISession>('session', SessionSchema);
