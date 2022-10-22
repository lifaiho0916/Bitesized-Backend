import express from "express"
import auth from "../../middleware/auth"
const router = express.Router()

//import Controller
import {
    addCard,
    deleteCard,
    getPayment
} from '../../controllers/paymentController'

router.get('/', auth, getPayment)
router.post('/card', auth, addCard)
router.delete('/card', auth, deleteCard)

export default router