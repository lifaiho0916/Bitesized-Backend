import express from "express"
import auth from "../../middleware/auth"
const router = express.Router()

//import Controller
import {
    webhook,
    getSubScription,
    saveSubScription,
    deleteSubScription,
    setSubScriptionVisible,
    editSubScription,
    subscribePlan,
    getSubscribersByUserId,
    getSubscribersByOwner,
    unSubscribe
} from '../../controllers/subScriptionController'

router.post('/webhook', express.raw({ type: 'application/json' }), webhook)
router.get('/user-subscribers', auth, getSubscribersByUserId)
router.get('/owner-subscribers', auth, getSubscribersByOwner)
router.get('/:userId', getSubScription)
router.post('/', auth, saveSubScription)
router.delete('/:id', auth, deleteSubScription)
router.put('/unsubscribe', auth, unSubscribe)
router.put('/:id/setvisible', auth, setSubScriptionVisible)
router.put('/:id', auth, editSubScription)
router.put('/:id/create', auth, subscribePlan)

export default router