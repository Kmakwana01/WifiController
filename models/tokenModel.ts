import mongoose, { Document, Schema, Model } from 'mongoose';

// Define the interface for the Token document
interface IToken extends Document {
    userId?: mongoose.Schema.Types.ObjectId;
    accessToken?: string;
    refreshToken?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

// Define the schema
const TokenSchema: Schema<IToken> = new Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
        accessToken: String,
        refreshToken: String,
        createdAt: Date,
        updatedAt: Date
    },
    { timestamps: true, versionKey: false }
);

// Create and export the model
export const TOKEN: Model<IToken> = mongoose.model<IToken>('token', TokenSchema);
