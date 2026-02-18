import { Router, Request, Response } from "express";
import Issue from "../models/Issue";
import User from "../models/User";
import authMiddleware, { AuthRequest } from "../middleware/auth";

const router = Router();

/**
 * GET /api/issues
 * List issues with filtering, sorting, and pagination.
 */
router.get("/", async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            status,
            category,
            city,
            sort = "-createdAt",
            page = "1",
            limit = "20",
        } = req.query;

        const filter: Record<string, any> = {};
        if (status) filter.status = status;
        if (category) filter.category = category;
        if (city) filter["location.city"] = { $regex: city, $options: "i" };

        const pageNum = Math.max(1, parseInt(page as string));
        const limitNum = Math.min(50, Math.max(1, parseInt(limit as string)));
        const skip = (pageNum - 1) * limitNum;

        const [issues, total] = await Promise.all([
            Issue.find(filter)
                .sort(sort as string)
                .skip(skip)
                .limit(limitNum)
                .populate("reportedBy", "displayName photoURL")
                .lean(),
            Issue.countDocuments(filter),
        ]);

        res.json({
            success: true,
            data: issues,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum),
            },
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/issues/:id
 * Get a single issue with full details.
 */
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
    try {
        const issue = await Issue.findById(req.params.id)
            .populate("reportedBy", "displayName photoURL email")
            .populate("assignedTo", "displayName photoURL")
            .populate("comments.user", "displayName photoURL")
            .lean();

        if (!issue) {
            res.status(404).json({ success: false, error: "Issue not found" });
            return;
        }

        res.json({ success: true, data: issue });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/issues
 * Create a new issue (auth required).
 */
router.post(
    "/",
    authMiddleware,
    async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const user = await User.findOne({ firebaseUid: req.user!.uid });
            if (!user) {
                res.status(404).json({ success: false, error: "User not found" });
                return;
            }

            const issue = await Issue.create({
                ...req.body,
                reportedBy: user._id,
            });

            // Add issue to user's reported list
            await User.findByIdAndUpdate(user._id, {
                $push: { issuesReported: issue._id },
            });

            const populated = await issue.populate(
                "reportedBy",
                "displayName photoURL"
            );

            res.status(201).json({ success: true, data: populated });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
);

/**
 * PATCH /api/issues/:id
 * Update an issue (auth required — must be reporter or admin).
 */
router.patch(
    "/:id",
    authMiddleware,
    async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const user = await User.findOne({ firebaseUid: req.user!.uid });
            if (!user) {
                res.status(404).json({ success: false, error: "User not found" });
                return;
            }

            const issue = await Issue.findById(req.params.id);
            if (!issue) {
                res.status(404).json({ success: false, error: "Issue not found" });
                return;
            }

            // Only reporter, assigned official, or admin can update
            const isReporter = issue.reportedBy.toString() === user._id.toString();
            const isAssigned =
                issue.assignedTo?.toString() === user._id.toString();
            const isAdmin = user.role === "admin";
            const isOfficial = user.role === "official";

            if (!isReporter && !isAssigned && !isAdmin && !isOfficial) {
                res.status(403).json({ success: false, error: "Not authorized" });
                return;
            }

            // Track resolution
            if (req.body.status === "resolved" && issue.status !== "resolved") {
                req.body.resolvedAt = new Date();
            }

            const updated = await Issue.findByIdAndUpdate(
                req.params.id,
                req.body,
                { returnDocument: "after", runValidators: true }
            )
                .populate("reportedBy", "displayName photoURL")
                .lean();

            res.json({ success: true, data: updated });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
);

/**
 * DELETE /api/issues/:id
 * Delete an issue (auth required — must be reporter or admin).
 */
router.delete(
    "/:id",
    authMiddleware,
    async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const user = await User.findOne({ firebaseUid: req.user!.uid });
            if (!user) {
                res.status(404).json({ success: false, error: "User not found" });
                return;
            }

            const issue = await Issue.findById(req.params.id);
            if (!issue) {
                res.status(404).json({ success: false, error: "Issue not found" });
                return;
            }

            const isReporter = issue.reportedBy.toString() === user._id.toString();
            const isAdmin = user.role === "admin";

            if (!isReporter && !isAdmin) {
                res.status(403).json({ success: false, error: "Not authorized" });
                return;
            }

            await Issue.findByIdAndDelete(req.params.id);

            // Remove from user's reported list
            await User.findByIdAndUpdate(user._id, {
                $pull: { issuesReported: issue._id },
            });

            res.json({ success: true, message: "Issue deleted" });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
);

/**
 * POST /api/issues/:id/upvote
 * Toggle upvote on an issue (auth required).
 */
router.post(
    "/:id/upvote",
    authMiddleware,
    async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const user = await User.findOne({ firebaseUid: req.user!.uid });
            if (!user) {
                res.status(404).json({ success: false, error: "User not found" });
                return;
            }

            const issue = await Issue.findById(req.params.id);
            if (!issue) {
                res.status(404).json({ success: false, error: "Issue not found" });
                return;
            }

            const hasUpvoted = issue.upvotes.some(
                (id) => id.toString() === user._id.toString()
            );

            if (hasUpvoted) {
                // Remove upvote
                issue.upvotes = issue.upvotes.filter(
                    (id) => id.toString() !== user._id.toString()
                );
                issue.upvoteCount = Math.max(0, issue.upvoteCount - 1);
                await User.findByIdAndUpdate(user._id, {
                    $pull: { issuesUpvoted: issue._id },
                });
            } else {
                // Add upvote
                issue.upvotes.push(user._id as any);
                issue.upvoteCount += 1;
                await User.findByIdAndUpdate(user._id, {
                    $push: { issuesUpvoted: issue._id },
                });
            }

            await issue.save();

            res.json({
                success: true,
                data: { upvoteCount: issue.upvoteCount, hasUpvoted: !hasUpvoted },
            });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
);

/**
 * POST /api/issues/:id/comment
 * Add a comment to an issue (auth required).
 */
router.post(
    "/:id/comment",
    authMiddleware,
    async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const user = await User.findOne({ firebaseUid: req.user!.uid });
            if (!user) {
                res.status(404).json({ success: false, error: "User not found" });
                return;
            }

            const { text } = req.body;
            if (!text || !text.trim()) {
                res.status(400).json({ success: false, error: "Comment text is required" });
                return;
            }

            const issue = await Issue.findByIdAndUpdate(
                req.params.id,
                {
                    $push: {
                        comments: { user: user._id, text: text.trim(), createdAt: new Date() },
                    },
                },
                { returnDocument: "after" }
            )
                .populate("comments.user", "displayName photoURL")
                .lean();

            if (!issue) {
                res.status(404).json({ success: false, error: "Issue not found" });
                return;
            }

            res.status(201).json({
                success: true,
                data: issue.comments[issue.comments.length - 1],
            });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
);

/**
 * POST /api/issues/:id/resolve
 * Mark an issue as resolved (Official/Admin only).
 */
router.post(
    "/:id/resolve",
    authMiddleware,
    async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const user = await User.findOne({ firebaseUid: req.user!.uid });
            if (!user || (user.role !== "official" && user.role !== "admin")) {
                res.status(403).json({ success: false, error: "Only officials can resolve issues" });
                return;
            }

            const { proofMedia, officialNote } = req.body;
            if (!proofMedia || proofMedia.length === 0) {
                res.status(400).json({ success: false, error: "Proof media is required for resolution" });
                return;
            }

            const issue = await Issue.findByIdAndUpdate(
                req.params.id,
                {
                    status: "resolved",
                    verificationStatus: "pending",
                    resolution: {
                        resolvedBy: user._id,
                        proofMedia,
                        officialNote,
                        resolvedAt: new Date(),
                    },
                },
                { returnDocument: "after" }
            );

            if (!issue) {
                res.status(404).json({ success: false, error: "Issue not found" });
                return;
            }

            res.json({ success: true, data: issue });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
);

/**
 * POST /api/issues/:id/verify
 * Confirm resolution (Reporter only).
 */
router.post(
    "/:id/verify",
    authMiddleware,
    async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const user = await User.findOne({ firebaseUid: req.user!.uid });
            const issue = await Issue.findById(req.params.id);

            if (!issue) {
                res.status(404).json({ success: false, error: "Issue not found" });
                return;
            }

            if (issue.reportedBy.toString() !== user?._id.toString() && user?.role !== "admin") {
                res.status(403).json({ success: false, error: "Only the reporter can verify resolution" });
                return;
            }

            issue.verificationStatus = "verified";
            if (issue.resolution) {
                issue.resolution.verifiedAt = new Date();
            }
            await issue.save();

            res.json({ success: true, data: issue });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
);

/**
 * POST /api/issues/:id/dispute
 * Dispute resolution (Reporter only).
 */
router.post(
    "/:id/dispute",
    authMiddleware,
    async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const user = await User.findOne({ firebaseUid: req.user!.uid });
            const { reason } = req.body;

            const issue = await Issue.findById(req.params.id);
            if (!issue) {
                res.status(404).json({ success: false, error: "Issue not found" });
                return;
            }

            if (issue.reportedBy.toString() !== user?._id.toString() && user?.role !== "admin") {
                res.status(403).json({ success: false, error: "Only the reporter can dispute resolution" });
                return;
            }

            issue.status = "in-progress"; // Re-open
            issue.verificationStatus = "disputed";
            if (issue.resolution) {
                issue.resolution.disputeReason = reason;
            }
            await issue.save();

            res.json({ success: true, data: issue });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
);

/**
 * GET /api/issues/stats/overview
 * Get issue statistics.
 */
router.get("/stats/overview", async (_req: Request, res: Response): Promise<void> => {
    try {
        const [total, pending, inProgress, resolved] = await Promise.all([
            Issue.countDocuments(),
            Issue.countDocuments({ status: "pending" }),
            Issue.countDocuments({ status: "in-progress" }),
            Issue.countDocuments({ status: "resolved" }),
        ]);

        res.json({
            success: true,
            data: { total, pending, inProgress, resolved },
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
