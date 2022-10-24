import express from "express"
import auth from "../../middleware/auth"
const router = express.Router()

//import Controller
import { 
    googleSignin, 
    googleSignup,
    appleSignin,
    appleSignup,
    
    setLanguageCurrency,
    getUsersList,

    getAuthData,
    getCurrencyRate,
    editProfile,
    editAvatar,
    checkName,
    checkUrl,
    setSubscribeByAdmin,

    getOwnersOfBites,
    getUserByPersonalisedUrl,
    getCreatorsByCategory,
    getUsersByCategory,
    setUserVisible
} from '../../controllers/authController'

router.get("/", auth, getAuthData)
router.get("/currencyrate", getCurrencyRate)
router.post('/profile/save', auth ,editProfile)
router.post("/avatar/upload", auth, editAvatar)
router.post('/checkname', auth ,checkName)
router.post('/checkurl', auth ,checkUrl)

router.get('/owners', getOwnersOfBites)
router.get('/personalurl/:url', getUserByPersonalisedUrl)
router.post('/creators', getCreatorsByCategory)
router.post('/list', getUsersByCategory)

router.post("/googleSignin", googleSignin)
router.post("/googleSignup", googleSignup)
router.post("/appleSignin", appleSignin)
router.post("/appleSignup", appleSignup)
router.post('/setting/lang-currency', auth, setLanguageCurrency)

router.post('/users', auth, getUsersList)
router.put('/:id/setvisible', auth, setUserVisible)
router.put('/subscribe/available', auth, setSubscribeByAdmin)

export default router;