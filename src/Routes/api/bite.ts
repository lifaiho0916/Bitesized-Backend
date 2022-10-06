import express from "express"
import auth from "../../middleware/auth"
const router = express.Router()

//import Controller
import { 
    AddBite,
    uploadVideo,
    uploadCover,
} from '../../controllers/biteController'


router.post('/', auth, AddBite)
router.post('/upload/video', auth, uploadVideo)
router.post('/upload/cover', auth, uploadCover)

export default router