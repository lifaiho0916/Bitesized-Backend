import express from 'express'
import auth from '../../middleware/auth'
import {
    addAccount,
    deleteAccount,
    getAccounts,
    setInstagramUsername,
} from '../../controllers/socialAccountsController'

const router = express.Router()

router.get('/:userId', auth, getAccounts)
router.post('/add', auth, setInstagramUsername, addAccount)
router.delete('/delete/:id', auth, deleteAccount)

export default router
