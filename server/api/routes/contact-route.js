import express from "express";
import { isExisted } from "../../middlewares/isExisted.js";
import { getAllContact, createContact, deleteContact, updateContact } from "../controllers/contact-controller.js";

const router = express.Router();

router.get("/", getAllContact);
router.post("/", createContact);
router.put("/:id", isExisted, updateContact);
router.delete("/:id", isExisted, deleteContact);

export default router;
