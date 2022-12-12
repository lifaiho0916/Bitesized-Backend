import express from "express"
import auth from "../../middleware/auth"
const router = express.Router()

//import Controller
import {
    getSearchResult
} from "../../controllers/settingController"

router.get("/", auth, getSearchResult)

export default router;