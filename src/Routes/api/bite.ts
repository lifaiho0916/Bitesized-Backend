import express from "express"
import auth from "../../middleware/auth"
const router = express.Router()

//import Controller
import {
    getAllBites,
    CreateBite,
    CreateBiteByUserId,
    uploadFiles,
    unLockBite,
    getBitesByPersonalisedUrl,
    getBitesList,
    getBiteById,
    setVisible,
    getBitesAdmin,
    deleteBite,
    removeVideoFromBite,
    changeVideoVisible
} from '../../controllers/biteController'

router.get('/', getAllBites)
router.post('/create', auth, CreateBite)
router.post('/create/:userId', auth, CreateBiteByUserId)
router.post('/upload/files', auth, uploadFiles)
router.put('/:id/unlock', auth, unLockBite)
router.get('/personalurl/:url', getBitesByPersonalisedUrl)
router.get('/list', getBitesList)
router.get('/adminlist', auth, getBitesAdmin)
router.get('/:id', getBiteById)
router.delete('/:id', auth, deleteBite)
router.delete('/:id/:index', auth, removeVideoFromBite)
router.put('/:id/setvisible', auth, setVisible)
router.put('/:id/:index/setvisible', auth, changeVideoVisible)

export default router