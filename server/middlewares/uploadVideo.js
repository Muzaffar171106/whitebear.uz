import multer from "multer";
import crypto from "crypto";
import path from "path";

const storage = multer.diskStorage({
    destination: (_, __, cb) => {
        cb(null, "uploads/videos");
    },
    filename: (_, file, cb) => {
        const hash = crypto.randomBytes(16).toString("hex");
        const ext = path.extname(file.originalname);
        cb(null, `${hash}${ext}`);
    },
});

const upload = multer({
    storage,
    limits: {
        fileSize: 1000 * 1024 * 1024 
    },
    fileFilter: (_, file, cb) => {
        if (!file.mimetype.startsWith("video/")) {
            return cb(new Error("Faqat video fayllarga ruxsat berilgan!"), false);
        }
        cb(null, true);
    },
});

export default function (req, res, next) {
    upload.single("video")(req, res, (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        const BASE_URL = process.env.SERVER_URL || "http://localhost:3000";

        if (req.file) {
            req.uploadedVideo = `${BASE_URL}/api/uploads/videos/${req.file.filename}`;
        }

        next();
    });
}
