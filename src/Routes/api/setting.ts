import express from "express"
import auth from "../../middleware/auth"
const router = express.Router()

//import Controller
import {
    getCurrencyRate,
    getTermsAndPrivacy,
    saveTermsAndPrivacy
} from '../../controllers/settingController'

router.get("/currencyrate", getCurrencyRate)
router.get('/terms-privacy', getTermsAndPrivacy)
router.post('/terms-privacy', auth, saveTermsAndPrivacy)

export default router;