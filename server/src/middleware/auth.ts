import { Request, Response, NextFunction } from "express";
import { adminAuth } from "../config/firebase";

// Extend Express Request to include authenticated user
export interface AuthRequest extends Request {
    user?: {
        uid: string;
        email?: string;
    };
}

/**
 * Middleware to verify Firebase ID token from Authorization header.
 * Usage: router.get("/protected", authMiddleware, handler)
 */
const authMiddleware = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({
                success: false,
                error: "Access denied. No token provided.",
            });
            return;
        }

        const token = authHeader.split("Bearer ")[1];

        const decodedToken = await adminAuth.verifyIdToken(token);

        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
        };

        next();
    } catch (error) {
        console.error("Auth middleware error:", error);
        res.status(401).json({
            success: false,
            error: "Invalid or expired token.",
        });
    }
};

export default authMiddleware;
