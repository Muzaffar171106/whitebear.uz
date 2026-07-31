import express from "express";
import { isExisted } from "../../middlewares/isExisted.js";
import uploadImage from "../../middlewares/uploadImage.js";

import {
    createProduct,
    deleteProduct,
    getAllProduct,
    updateProduct,
    getProductById
} from "../controllers/product-controller.js";

const router = express.Router();

router.get("/", getAllProduct);
router.post("/", isExisted, uploadImage, createProduct);
router.put("/:id", isExisted, uploadImage, updateProduct);
router.delete("/:id", isExisted, deleteProduct);
router.get("/:id", getProductById);

export default router;