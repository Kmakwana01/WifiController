import mongoose, { Document, Schema, Model } from 'mongoose';

// Define the interface for the User document
interface IUser extends Document {
    userName: string;
    email: string;
    password: string;
    familyId: String;
    role: "Parent" | "Child";
    isActive: boolean;
    // createdBy : mongoose.Schema.Types.ObjectId;
    isDeleted: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

// Define the schema
const UserSchema: Schema<IUser> = new Schema(
    {
        userName: {
            type: String
        },
        familyId: {
            type: String
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            validate: {
                validator: function (v: string) {
                    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
                },
                message: props => `${props.value} is not a valid email address!`
            }
        },
        password: {
            type: String,
            required: true
        },
        role: {
            type: String,
            required: true,
            enum: ["Parent", "Child"]
        },
        // createdBy : {
        //     type : mongoose.Schema.Types.ObjectId,
        //     ref : 'user'
        // },
        isActive : Boolean,
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
export const USER: Model<IUser> = mongoose.model<IUser>('user', UserSchema);
