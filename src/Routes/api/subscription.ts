import express from "express"
import auth from "../../middleware/auth"
const router = express.Router()

//import Controller
import {
    getSubScription
} from '../../controllers/subScriptionController'

router.get('/:userId', auth, getSubScription)

export default router