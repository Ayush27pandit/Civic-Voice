import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
    firebaseUid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    phone?: string;
    role: "citizen" | "official" | "admin";
    location?: {
        address?: string;
        city?: string;
        state?: string;
        pincode?: string;
        coordinates?: {
            lat: number;
            lng: number;
        };
    };
    issuesReported: mongoose.Types.ObjectId[];
    issuesUpvoted: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        firebaseUid: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        displayName: {
            type: String,
            required: true,
            trim: true,
        },
        photoURL: {
            type: String,
            default: "",
        },
        phone: {
            type: String,
            default: "",
        },
        role: {
            type: String,
            enum: ["citizen", "official", "admin"],
            default: "citizen",
        },
        location: {
            address: { type: String },
            city: { type: String },
            state: { type: String },
            pincode: { type: String },
            coordinates: {
                lat: { type: Number },
                lng: { type: Number },
            },
        },
        issuesReported: [
            {
                type: Schema.Types.ObjectId,
                ref: "Issue",
            },
        ],
        issuesUpvoted: [
            {
                type: Schema.Types.ObjectId,
                ref: "Issue",
            },
        ],
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IUser>("User", UserSchema);
