import express from "express"
import auth from "../../middleware/auth"
const router = express.Router()

//import Controller
import {
    getSubScription,
    saveSubScription,
    deleteSubScription,
    setSubScriptionVisible
} from '../../controllers/subScriptionController'

router.get('/:userId', auth, getSubScription)
router.post('/', auth, saveSubScription)
router.delete('/:id', auth, deleteSubScription)
router.put('/:id/setvisible', auth, setSubScriptionVisible)

export default router