import path from "path"
import multer from "multer"
import fs from "fs"
import Bite from "../models/Bite"

const calcTime = () => {
  var d = new Date()
  var utc = d.getTime()
  var nd = new Date(utc + (3600000 * 8))
  return nd
}

export const CreateBite = async (req: any, res: any) => {
  try {
    const { bite, userId } = req.body
    const newBite = new Bite({
      ...bite,
      owner: userId,
      date: calcTime()
    })

    await newBite.save()
    return res.status(200).json({ success: true })
  } catch (err) {
    console.log(err)
  }
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
    return res.status(200).json({ success: true, payload: { path: "uploads/bite/" + req.file ?.filename } })
  })
}

const biteCoverStorage = multer.diskStorage({
  destination: "./public/uploads/cover/",
  filename: (req, file, cb) => { cb(null, "Cover-" + Date.now() + path.extname(file.originalname)) }
})

const uploadBiteCover = multer({
  storage: biteCoverStorage,
  limits: { fileSize: 150 * 1024 * 1024 },
}).single("file")

export const uploadCover = async (req: any, res: any) => {
  uploadBiteCover(req, res, () => {
    return res.status(200).json({ success: true, payload: { path: "uploads/cover/" + req.file ?.filename } })
  })
}

export const getAllBites = async (req: any, res: any) => {
  try {
    const bites = await Bite.find().populate({
      path: 'owner',
      select: { name: 1, avatar: 1, personalisedUrl: 1 }
    })

    const resBites: any = []

    bites.forEach((bite: any) => {
      resBites.push({
        ...bite._doc,
        time: Math.round((new Date(bite.date).getTime() - new Date(calcTime()).getTime()) / 1000)
      })
    })

    return res.status(200).json({ success: true, payload: { bites: resBites } })
  } catch (err) {
    console.log(err)
  }
}
