import path from "path"
import multer from "multer"
import fs from "fs"
import Stripe from "stripe"
import Bite from "../models/Bite"
import User from "../models/User"

const stripe = new Stripe(
  `${process.env.STRIPE_SECRET_KEY}`,
  { apiVersion: '2020-08-27', typescript: true }
)

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
    return res.status(200).json({ success: true, payload: { path: "uploads/bite/" + req.file?.filename } })
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
    return res.status(200).json({ success: true, payload: { path: "uploads/cover/" + req.file?.filename } })
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

export const getBitesByPersonalisedUrl = async (req: any, res: any) => {
  try {
    const { url } = req.params
    const user = await User.findOne({ personalisedUrl: url })
    if (user) {
      const bites = await Bite.find({ owner: user._id }).populate({
        path: 'owner',
        select: { name: 1, avatar: 1, personalisedUrl: 1 }
      })
      return res.status(200).json({ success: true, payload: { bites: bites } })
    } else return res.status(200).json({ success: false })
  } catch (err) {
    console.log(err)
  }
}

export const unLockBite = async (req: any, res: any) => {
  try {
    const { id } = req.params
    const { userId, currency, amount, rate, token } = req.body
    const bite: any = await Bite.findById(id)

    if (currency) {
      let charge = { status: 'requested' }
      let usdAmount = (amount + amount * 0.034 + 0.3) * 100
      let ratedAmount = usdAmount * rate

      await stripe.charges.create({
        amount: Number(Math.round(ratedAmount)),
        currency: currency,
        source: token.id,
        description: `Unlock Bite (id: ${id})`,
      }).then(result => {
        charge = result
      }).catch(err => { return res.status(200).json({ success: false, payload: err.raw.message }) })

      if (charge.status !== 'succeeded') {
        /// ERROR Message
        return res.status(200).json({ success: false, payload: charge })
      }
    }

    let purchasedUsers = bite.purchasedUsers
    purchasedUsers.push(userId)

    const resBite = await Bite.findByIdAndUpdate(id, { purchasedUsers: purchasedUsers }, { new: true }).populate({
      path: 'owner',
      select: { name: 1, avatar: 1, personalisedUrl: 1 }
    })

    return res.status(200).json({ success: true, payload: { bite: resBite } })
  } catch (err) {
    console.log(err)
  }
}
