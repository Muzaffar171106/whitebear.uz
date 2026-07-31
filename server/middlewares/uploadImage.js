import multer from "multer";
import crypto from "crypto";
import path from "path";
import sharp from "sharp";
import fs from "fs";
import dotenv from "dotenv"

dotenv.config()
const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    const dir = "uploads/images";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (_, file, cb) => {
    const hash = crypto.randomBytes(16).toString("hex");
    const ext = path.extname(file.originalname);
    cb(null, `${hash}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {

    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed!"), false);
    }
    cb(null, true);
  },
});

export default function (req, res, next) {
  req.files
  upload.array("images", 20)(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message });

    if (req.files) {
      try {
        const BASE_URL = process.env.SERVER_URL || "http://localhost:3000";

        const optimizedFiles = await Promise.all(
          req.files.map(async (file) => {
            const outputFilename = file.filename.replace(path.extname(file.filename), ".webp");
            const outputPath = path.join("uploads/images", outputFilename);

            await sharp(file.path)
              .resize({ width: 1200, withoutEnlargement: true })
              .webp({ quality: 60 })
              .toFile(outputPath);

            await fs.promises.unlink(file.path);

            return `${BASE_URL}/api/uploads/images/${outputFilename}`;
          })
        );

        req.uploadedImages = optimizedFiles;
      } catch (error) {
        return res.status(500).json({
          message: "Image optimization failed",
          error: error.message,
        });
      }
    }

    next();
  });
}
