import express from "express"
import auth from "../../middleware/auth"
const router = express.Router()

//import Controller
import {
    getSubScription,
    saveSubScription,
    deleteSubScription,
    setSubScriptionVisible,
    editSubScription,
    subscribePlan
} from '../../controllers/subScriptionController'

router.get('/:userId', getSubScription)
router.post('/', auth, saveSubScription)
router.delete('/:id', auth, deleteSubScription)
router.put('/:id/setvisible', auth, setSubScriptionVisible)
router.put('/:id', auth, editSubScription)
router.put('/:id/create', auth, subscribePlan)

export default router