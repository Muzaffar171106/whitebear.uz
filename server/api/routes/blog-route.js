import express from "express";
import { isExisted } from "../../middlewares/isExisted.js";
import uploadImage from "../../middlewares/uploadImage.js";
import { createBlog, deleteBlog, getAllBlog, updateBlog } from "../controllers/blog-controller.js";

const router = express.Router();

router.get("/", getAllBlog);
router.post("/", isExisted, uploadImage, createBlog);
router.put("/:id", isExisted, uploadImage, updateBlog);
router.delete("/:id", isExisted, deleteBlog);

export default router;
