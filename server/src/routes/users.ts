import { Router, Response } from "express";
import User from "../models/User";
import authMiddleware, { AuthRequest } from "../middleware/auth";

const router = Router();

/**
 * GET /api/users/:id
 * Get a user's public profile.
 */
router.get("/:id", async (req, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.params.id)
            .select("displayName photoURL role location.city issuesReported createdAt")
            .populate("issuesReported", "title status category createdAt")
            .lean();

        if (!user) {
            res.status(404).json({ success: false, error: "User not found" });
            return;
        }

        res.json({ success: true, data: user });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * PATCH /api/users/profile
 * Update the authenticated user's profile.
 */
router.patch(
    "/profile",
    authMiddleware,
    async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const allowedFields = ["displayName", "photoURL", "phone", "location"];
            const updates: Record<string, any> = {};

            for (const field of allowedFields) {
                if (req.body[field] !== undefined) {
                    updates[field] = req.body[field];
                }
            }

            const user = await User.findOneAndUpdate(
                { firebaseUid: req.user!.uid },
                updates,
                { returnDocument: "after", runValidators: true }
            );

            if (!user) {
                res.status(404).json({ success: false, error: "User not found" });
                return;
            }

            res.json({ success: true, data: user });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
);

export default router;
