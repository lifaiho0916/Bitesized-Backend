import express from "express"
import auth from "../../middleware/auth"
const router = express.Router()

//import Controller
import {
    getTransactions,
    getTransactionsByBiteId,
    getTransactionsByUserId
} from '../../controllers/transactionController'

router.get('/', auth, getTransactions)
router.get('/user/:userId', auth, getTransactionsByUserId)
router.get('/bite/:biteId', auth, getTransactionsByBiteId)

export default router