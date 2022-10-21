import express from "express"
import auth from "../../middleware/auth"
const router = express.Router()

//import Controller
import {
    getTransactions,
    getTransactionsByBiteId
} from '../../controllers/transactionController'

router.post('/', auth, getTransactions)
router.get('/bite/:biteId', auth, getTransactionsByBiteId)

export default router