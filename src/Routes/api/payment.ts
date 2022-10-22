import express from "express"
import auth from "../../middleware/auth"
const router = express.Router()

//import Controller
import {
    addCard,
    getPayment
} from '../../controllers/paymentController'

router.get('/', auth, getPayment)
router.post('/addcard', auth, addCard)

export default router