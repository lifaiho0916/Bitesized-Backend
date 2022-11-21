import express from "express"
import auth from "../../middleware/auth"
const router = express.Router()

//import Controller
import {
    getSubScription,
    saveSubScription,
    deleteSubScription
} from '../../controllers/subScriptionController'

router.get('/:userId', auth, getSubScription)
router.post('/', auth, saveSubScription)
router.delete('/:id', auth, deleteSubScription)

export default router