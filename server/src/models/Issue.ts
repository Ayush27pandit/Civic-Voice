import mongoose, { Schema, Document } from "mongoose";

export interface IIssue extends Document {
    title: string;
    description: string;
    category: string;
    status: "pending" | "in-progress" | "resolved" | "dismissed";
    verificationStatus: "unverified" | "pending" | "verified" | "disputed";
    priority: "low" | "medium" | "high" | "critical";
    location: {
        address: string;
        city: string;
        state: string;
        pincode?: string;
        coordinates: {
            lat: number;
            lng: number;
        };
    };
    media: {
        url: string;
        type: "image" | "video";
        path: string;
    }[];
    resolution?: {
        resolvedBy: mongoose.Types.ObjectId;
        proofMedia: {
            url: string;
            type: "image" | "video";
            path: string;
        }[];
        officialNote: string;
        resolvedAt: Date;
        verifiedAt?: Date;
        disputeReason?: string;
    };
    reportedBy: mongoose.Types.ObjectId;
    assignedTo?: mongoose.Types.ObjectId;
    upvotes: mongoose.Types.ObjectId[];
    upvoteCount: number;
    comments: {
        user: mongoose.Types.ObjectId;
        text: string;
        createdAt: Date;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

const IssueSchema: Schema = new Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true },
        category: {
            type: String,
            required: true,
            index: true,
        },
        status: {
            type: String,
            enum: ["pending", "in-progress", "resolved", "dismissed"],
            default: "pending",
            index: true,
        },
        verificationStatus: {
            type: String,
            enum: ["unverified", "pending", "verified", "disputed"],
            default: "unverified",
            index: true,
        },
        priority: {
            type: String,
            enum: ["low", "medium", "high", "critical"],
            default: "medium",
        },
        location: {
            address: { type: String, required: true },
            city: { type: String, required: true, index: true },
            state: { type: String, required: true },
            pincode: String,
            coordinates: {
                lat: { type: Number, required: true },
                lng: { type: Number, required: true },
            },
        },
        media: [
            {
                url: { type: String, required: true },
                type: { type: String, enum: ["image", "video"], required: true },
                path: { type: String, required: true },
            },
        ],
        resolution: {
            resolvedBy: { type: Schema.Types.ObjectId, ref: "User" },
            proofMedia: [
                {
                    url: { type: String, required: true },
                    type: { type: String, enum: ["image", "video"], required: true },
                    path: { type: String, required: true },
                },
            ],
            officialNote: String,
            resolvedAt: Date,
            verifiedAt: Date,
            disputeReason: String,
        },
        reportedBy: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        assignedTo: { type: Schema.Types.ObjectId, ref: "User", index: true },
        upvotes: [{ type: Schema.Types.ObjectId, ref: "User" }],
        upvoteCount: { type: Number, default: 0 },
        comments: [
            {
                user: { type: Schema.Types.ObjectId, ref: "User", required: true },
                text: { type: String, required: true },
                createdAt: { type: Date, default: Date.now },
            },
        ],
    },
    { timestamps: true }
);

// Indexes for common queries
IssueSchema.index({ "location.coordinates": "2dsphere" });
IssueSchema.index({ createdAt: -1 });
IssueSchema.index({ upvoteCount: -1 });

export default mongoose.model<IIssue>("Issue", IssueSchema);
