import express from "express"
import auth from "../../middleware/auth"
const router = express.Router()

//import Controller
import { 
    getAllBites,
    CreateBite,
    uploadVideo,
    uploadCover,
    unLockBite,
    getBitesByPersonalisedUrl,
    getBitesList
} from '../../controllers/biteController'

router.get('/', getAllBites)
router.post('/create', auth, CreateBite)
router.post('/upload/video', auth, uploadVideo)
router.post('/upload/cover', auth, uploadCover)
router.put('/:id/unlock', auth, unLockBite)
router.get('/personalurl/:url', getBitesByPersonalisedUrl)
router.get('/bites', getBitesList)

export default router