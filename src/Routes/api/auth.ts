import express from "express";
import auth from "../../middleware/auth";
const router = express.Router();

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
    getExistName,
    getExistURL,
    getUserFromUrl,
    getTipState,
    inviteFriend,
    getCreatorsByCategory,
    getOwnersOfBites
} from '../../controllers/authController';

router.get('/owners', getOwnersOfBites)

router.post("/googleSignin", googleSignin);
router.post("/googleSignup", googleSignup);
router.post("/appleSignin", appleSignin)
router.post("/appleSignup", appleSignup)
router.get("/get", auth, getAuthData);
router.post("/avatar/upload", auth, editAvatar);
router.post('/profile/save', auth ,saveProfileInfo);
router.post('/setting/lang', auth, setLanguage);
router.post('/exist_name', auth ,getExistName);
router.post('/exist_url', auth ,getExistURL);
router.post('/userFromUrl', getUserFromUrl);
router.get('/tip_state', auth, getTipState)
router.post('/invite_friend', inviteFriend)
router.post('/creators', getCreatorsByCategory)

router.post('/users', auth, getUsersList);

export default router;