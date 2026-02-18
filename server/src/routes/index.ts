import { Router } from "express";
import issueRoutes from "./issues";
import authRoutes from "./auth";
import userRoutes from "./users";

const router = Router();

// Mount sub-routers
router.use("/issues", issueRoutes);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);

export default router;
