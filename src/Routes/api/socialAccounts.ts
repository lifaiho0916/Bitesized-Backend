import express from 'express'
import auth from '../../middleware/auth'
import {
    addAccount,
    deleteAccount,
    getAccount,
    setInstagramUsername,
} from '../../controllers/socialAccountsController'

const router = express.Router()

router.get('/', auth, getAccount)
router.post('/', auth, addAccount)
router.delete('/:id', auth, deleteAccount)

export default router
