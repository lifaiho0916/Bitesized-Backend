import express from "express"
import auth from "../../middleware/auth"
const router = express.Router()

//import Controller
import { 
    googleSignin, 
    googleSignup,
    appleSignin,
    appleSignup,
    getAuthData,
    editAvatar,
    saveProfileInfo,
    setLanguage,
    getUsersList,
    getUserFromUrl,
    inviteFriend,

    checkName,
    checkUrl,

    getOwnersOfBites,
    getUserByPersonalisedUrl,
    getCreatorsByCategory
} from '../../controllers/authController'

router.post('/checkname', auth ,checkName)
router.post('/checkurl', auth ,checkUrl)

router.get('/owners', getOwnersOfBites)
router.get('/personalurl/:url', getUserByPersonalisedUrl)
router.post('/creators', getCreatorsByCategory)

router.post("/googleSignin", googleSignin);
router.post("/googleSignup", googleSignup);
router.post("/appleSignin", appleSignin)
router.post("/appleSignup", appleSignup)
router.get("/get", auth, getAuthData);
router.post("/avatar/upload", auth, editAvatar);
router.post('/profile/save', auth ,saveProfileInfo);
router.post('/setting/lang', auth, setLanguage);
router.post('/userFromUrl', getUserFromUrl);
router.post('/invite_friend', inviteFriend)

router.post('/users', auth, getUsersList);

export default router;