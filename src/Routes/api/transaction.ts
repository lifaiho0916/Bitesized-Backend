import express from "express"
import auth from "../../middleware/auth"
const router = express.Router()

//import Controller
import {
    getTransactions
} from '../../controllers/transactionController'

router.post('/', getTransactions)

export default router