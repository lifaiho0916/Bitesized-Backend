import express from "express"
import auth from "../../middleware/auth"
const router = express.Router()

//import Controller
import {
    getAllBites,
    CreateBite,
    CreateBiteByUserId,
    EditBite,
    uploadVideo,
    uploadCover,
    unLockBite,
    getBitesByPersonalisedUrl,
    getBitesByUserId,
    getBitesList,
    getBiteById,
    setVisible,
    getBitesAdmin,
    deleteBite,
    removeVideoFromBite,
    changeVideoVisible,
    sendComment,
    deleteComment,
    clearCommentNotification
} from '../../controllers/biteController'

router.get('/', getAllBites)
router.post('/create', auth, CreateBite)
router.post('/create/:userId', auth, CreateBiteByUserId)
router.post('/upload/video', auth, uploadVideo)
router.post('/upload/cover', auth, uploadCover)
router.put('/:id', auth, EditBite)
router.put('/:id/unlock', auth, unLockBite)
router.get('/personalurl/:url', getBitesByPersonalisedUrl)
router.get('/user/:id', getBitesByUserId)
router.get('/list', getBitesList)
router.get('/adminlist', auth, getBitesAdmin)
router.get('/:id', getBiteById)
router.delete('/:id', auth, deleteBite)
router.delete('/:id/:index', auth, removeVideoFromBite)
router.put('/:id/setvisible', auth, setVisible)
router.put('/:id/comment', auth, sendComment)
router.delete('/:id/comment/:index', auth, deleteComment)
router.get('/:id/comment/notification', auth, clearCommentNotification)
router.put('/:id/:index/setvisible', auth, changeVideoVisible)

export default router