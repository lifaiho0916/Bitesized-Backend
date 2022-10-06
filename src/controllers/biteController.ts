import path from "path"
import multer from "multer"
import fs from "fs"

const calcTime = () => {
  var d = new Date()
  var utc = d.getTime()
  var nd = new Date(utc + (3600000 * 8))
  return nd
}

export const AddBite = async (res: any, req: any) => {

}

const biteVideoStorage = multer.diskStorage({
  destination: "./public/uploads/bite/",
  filename: (req, file, cb) => { cb(null, "Bite-" + Date.now() + path.extname(file.originalname)) }
})

const uploadBiteVideo = multer({
  storage: biteVideoStorage,
  limits: { fileSize: 150 * 1024 * 1024 },
}).single("file")

export const uploadVideo = async (req: any, res: any) => {
  uploadBiteVideo(req, res, () => {
    return res.status(200).json({
      success: true,
      payload: {
        path: "uploads/bite/" + req.file ?.filename
      }
    })
  })
}

const biteCoverStorage = multer.diskStorage({
  destination: "./public/uploads/cover/",
  filename: (req, file, cb) => { cb(null, "Bite-" + Date.now() + path.extname(file.originalname)) }
})

const uploadBiteCover = multer({
  storage: biteCoverStorage,
  limits: { fileSize: 150 * 1024 * 1024 },
}).single("file")

export const uploadCover = async (req: any, res: any) => {
  uploadBiteCover(req, res, () => {
    return res.status(200).json({
      success: true,
      payload: {
        path: "uploads/cover/" + req.file ?.filename
      }
    })
  })
}
