import express from "express";
import {
  register,
  login,
  getAllAdmins,
  getAdmin,
  updateAdmin,
  deleteAdmin,
  getMe
} from "../controllers/admin-controller.js";
import { verifyRole, isExisted } from "../../middlewares/isExisted.js";

const router = express.Router();

router.post("/register", register);
// router.post("/register", isExisted, verifyRole(["superadmin"]), register);
router.post("/login", login);
router.get("/", isExisted, verifyRole(["superadmin"]), getAllAdmins);
router.get("/get/me", isExisted, getMe);
router.get("/:id", isExisted, verifyRole(["superadmin"]), getAdmin);
router.put("/:id", isExisted, verifyRole(["superadmin"]), updateAdmin);
router.delete("/:id", isExisted, verifyRole(["superadmin"]), deleteAdmin);

export default router;
