// server/src/routes/settingRoutes.js
import express from "express";
import { protect } from "../middleware/auth.js";
import {
    personalInfoUpdate,
    changePassword,
    setPassword,
    deleteAccount,
    editFlow,
} from "../controllers/settingController.js";

const router = express.Router();

router.put("/profile", protect, personalInfoUpdate);
router.put("/password", protect, changePassword);
router.post("/set-password", protect, setPassword);
router.delete("/delete", protect, deleteAccount);
router.put("/edit-flow", protect, editFlow);

export default router;
