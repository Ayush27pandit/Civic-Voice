import { Request, Response, NextFunction } from "express";

interface AppError extends Error {
    statusCode?: number;
    code?: string;
}

const errorHandler = (
    err: AppError,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    // Mongoose validation error
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = err.message;
    }

    // Mongoose duplicate key error
    if ((err as any).code === 11000) {
        statusCode = 409;
        message = "Duplicate field value entered";
    }

    // Mongoose cast error (bad ObjectId)
    if (err.name === "CastError") {
        statusCode = 400;
        message = "Invalid resource ID";
    }

    // Firebase auth error
    if (err.code?.startsWith("auth/")) {
        statusCode = 401;
        message = "Authentication failed";
    }

    // Log error in development
    if (process.env.NODE_ENV === "development") {
        console.error("Error:", err.stack);
    }

    res.status(statusCode).json({
        success: false,
        error: message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
};

export default errorHandler;
