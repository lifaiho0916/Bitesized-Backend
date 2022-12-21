import express from "express";
import auth from "../../middleware/auth";
import {
	addAccount,
	deleteAccount,
	getAccount,
	setInstagramUsername,
} from "../../controllers/socialAccountsController";

const router = express.Router();

router.get("/:userId", getAccount);
router.post("/", auth, addAccount);
router.post("/instagramlogin", auth, setInstagramUsername);
router.delete("/:id", auth, deleteAccount);

export default router;
