import express from "express"
import auth from "../../middleware/auth"
const router = express.Router()

//import Controller
import {
    getSubScription,
    saveSubScription
} from '../../controllers/subScriptionController'

router.get('/:userId', auth, getSubScription)
router.post('/', auth, saveSubScription)

export default router