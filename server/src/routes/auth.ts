import { Router, Response } from "express";
import User from "../models/User";
import authMiddleware, { AuthRequest } from "../middleware/auth";

const router = Router();

/**
 * POST /api/auth/register
 * Register or sync a Firebase user with MongoDB.
 * Called after first sign-in from the client.
 */
router.post(
    "/register",
    authMiddleware,
    async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const { uid, email } = req.user!;
            const { displayName, photoURL, phone } = req.body;

            // Upsert — create if new, update if existing
            const user = await User.findOneAndUpdate(
                { firebaseUid: uid },
                {
                    firebaseUid: uid,
                    email: email || "",
                    displayName: displayName || "User",
                    photoURL: photoURL || "",
                    phone: phone || "",
                },
                { returnDocument: "after", upsert: true, setDefaultsOnInsert: true }
            );

            res.status(200).json({ success: true, data: user });
        } catch (error: any) {
            console.error("Auth register error:", error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
);

/**
 * GET /api/auth/me
 * Get current authenticated user's profile.
 */
router.get(
    "/me",
    authMiddleware,
    async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const user = await User.findOne({ firebaseUid: req.user!.uid })
                .populate("issuesReported", "title status category createdAt")
                .lean();

            if (!user) {
                res.status(404).json({ success: false, error: "User not found" });
                return;
            }

            res.json({ success: true, data: user });
        } catch (error: any) {
            console.error("Auth /me error:", error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
);

export default router;
