import multer from "multer";
import path from "path";
import express, { Router } from "express";
import fs from "fs";

const router = Router();

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});

const upload = multer({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024,
    },
    fileFilter: (_req, file, cb) => {
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "video/mp4", "video/quicktime"];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Unsupported file type"));
        }
    },
});

router.post("/", upload.single("file"), (req, res) => {
    if (!req.file) {
        res.status(400).json({ success: false, error: "No file uploaded" });
        return;
    }
    res.json({
        success: true,
        url: `/uploads/${req.file.filename}`,
        filename: req.file.filename,
    });
});

router.delete("/:filename", (req, res) => {
    const filePath = path.join(uploadDir, req.params.filename);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        res.json({ success: true });
    } else {
        res.status(404).json({ success: false, error: "File not found" });
    }
});

export default router;
