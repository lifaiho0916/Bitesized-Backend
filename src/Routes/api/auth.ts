import express from "express"
import auth from "../../middleware/auth"
const router = express.Router()

//import Controller
import { 
    googleAuth,
    appleAuth,
    
    setLanguageCurrency,
    getUsersList,

    getAuthData,
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
router.post('/profile/save', auth ,editProfile)
router.post("/avatar/upload", auth, editAvatar)
router.post('/checkname', auth ,checkName)
router.post('/checkurl', auth ,checkUrl)

router.get('/owners', getOwnersOfBites)
router.get('/personalurl/:url', getUserByPersonalisedUrl)
router.get('/creators', getCreatorsByCategory)
router.get('/list', getUsersByCategory)

router.post('/google', googleAuth)
router.post('/apple', appleAuth)
router.post('/setting/lang-currency', auth, setLanguageCurrency)

router.post('/users', auth, getUsersList)
router.put('/:id/setvisible', auth, setUserVisible)
router.put('/subscribe/available', auth, setSubscribeByAdmin)

export default router;