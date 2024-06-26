import path from "path"
import multer from "multer"
import fs from "fs"
import mongoose from "mongoose"
import Stripe from "stripe"
import Bite from "../models/Bite"
import User from "../models/User"
import Transaction from "../models/Transaction"
import Setting from "../models/Setting"
import Payment from "../models/Payment"

const stripe = new Stripe(
  `${process.env.STRIPE_SECRET_KEY}`,
  { apiVersion: '2022-11-15', typescript: true }
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

export const EditBite = async (req: any, res: any) => {
  try {
    const { id } = req.params
    const { bite } = req.body

    const oldBite: any = await Bite.findById(id)

    await Bite.findByIdAndUpdate(id, {
      title: bite.title,
      category: bite.category,
      videos: bite.videos
    })

    if (oldBite.title !== bite.title) {
      const trasactions: any = await Transaction.find({ "bite.id": id })
      trasactions.forEach((transaction: any) => { Transaction.findByIdAndUpdate(transaction._id, { "bite.title": bite.title }).exec() })
    }

    return res.status(200).json({ success: true })
  } catch (err) {
    console.log(err)
  }
}

export const CreateBiteByUserId = async (req: any, res: any) => {
  try {
    const { bite } = req.body
    const { userId } = req.params

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
    const { filter } = req.query
    let bites: any = []
    if (Number(filter) < 1) {
      bites = await Bite.aggregate([
        {
          $lookup: {
            from: "users",
            as: 'owner',
            let: { owner: "$owner" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$$owner", "$_id"] }
                }
              },
              {
                $project: { avatar: 1, name: 1, personalisedUrl: 1, visible: 1 }
              }
            ],
          }
        },
        { $unwind: "$owner" },
        {
          $project: {
            videos: {
              $filter: {
                input: "$videos",
                as: "videos",
                cond: { $eq: ["$$videos.visible", true] }
              }
            },
            currency: 1,
            owner: 1,
            price: 1,
            title: 1,
            visible: 1,
            purchasedUsers: 1,
            date: 1,
          }
        },
        {
          $match: {
            $and: [
              { visible: true },
              { 'owner.visible': { $eq: true } },
              { "videos.0": { $exists: true } }
            ]
          }
        },
        { $sort: { createdAt: -1 } }
      ])
    } else {
      bites = await Bite.aggregate([
        {
          $lookup: {
            from: "users",
            as: 'owner',
            let: { owner: "$owner" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$$owner", "$_id"] }
                }
              },
              {
                $project: { avatar: 1, name: 1, personalisedUrl: 1, visible: 1 }
              }
            ],
          }
        },
        { $unwind: "$owner" },
        {
          $project: {
            videos: {
              $filter: {
                input: "$videos",
                as: "videos",
                cond: { $eq: ["$$videos.visible", true] }
              }
            },
            currency: 1,
            owner: 1,
            price: 1,
            title: 1,
            visible: 1,
            category: 1,
            purchasedUsers: 1,
            date: 1,
          }
        },
        {
          $match: {
            $and: [
              { visible: true },
              { category: { $eq: Number(filter) - 1 } },
              { 'owner.visible': { $eq: true } },
              { "videos.0": { $exists: true } }
            ]
          }
        }
      ])
    }
    let resBites: any = []
    if (Number(filter) > -1) {
      const newArr1 = bites.slice()
      for (let i = newArr1.length - 1; i > 0; i--) {
        const rand = Math.floor(Math.random() * (i + 1))
        const temp = newArr1[i]
        newArr1[i] = newArr1[rand]
        newArr1[rand] = temp
      }

      newArr1.forEach((bite: any) => {
        resBites.push({
          ...bite,
          time: Math.round((new Date(bite.date).getTime() - new Date(calcTime()).getTime()) / 1000)
        })
      })
    } else resBites = bites

    return res.status(200).json({ success: true, payload: { bites: resBites } })
  } catch (err) {
    console.log(err)
  }
}

export const getBitesAdmin = async (req: any, res: any) => {
  try {
    const { search, type, sort } = req.query
    const sortOrder: any = Number(sort)
    let bites: any = []
    if (type === 'all') {
      bites = await Bite.find({ title: { $regex: search, $options: "i" } }).populate([
        { path: 'owner', select: { name: 1, avatar: 1, personalisedUrl: 1 } },
        { path: 'comments.commentedBy', select: { name: 1, avatar: 1, role: 1, categories: 1 } }
      ]).sort({ date: sortOrder })
    } else if (type === 'paid') {
      bites = await Bite.find({ title: { $regex: search, $options: "i" }, currency: { $ne: null } }).populate([
        { path: 'owner', select: { name: 1, avatar: 1, personalisedUrl: 1 } },
        { path: 'comments.commentedBy', select: { name: 1, avatar: 1, role: 1, categories: 1 } }
      ]).sort({ date: sortOrder })
    } else {
      bites = await Bite.find({ title: { $regex: search, $options: "i" }, currency: { $eq: null } }).populate([
        { path: 'owner', select: { name: 1, avatar: 1, personalisedUrl: 1 } },
        { path: 'comments.commentedBy', select: { name: 1, avatar: 1, role: 1, categories: 1 } }
      ]).sort({ date: sortOrder })
    }

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

export const getBitesSortByCommentAdmin = async (req: any, res: any) => {
  try {
    const { search, type, sort } = req.query
    const sortOrder: any = Number(sort)
    let bites: any = []
    if (type === 'all') {
      bites = await Bite.find({ title: { $regex: search, $options: "i" }, "comments.0": { $exists: true } }).populate([
        { path: 'owner', select: { name: 1, avatar: 1, personalisedUrl: 1 } },
        { path: 'comments.commentedBy', select: { name: 1, avatar: 1, role: 1, categories: 1 } }
      ])
    } else if (type === 'paid') {
      bites = await Bite.find({ title: { $regex: search, $options: "i" }, currency: { $ne: null }, "comments.0": { $exists: true } }).populate([
        { path: 'owner', select: { name: 1, avatar: 1, personalisedUrl: 1 } },
        { path: 'comments.commentedBy', select: { name: 1, avatar: 1, role: 1, categories: 1 } }
      ])
    } else {
      bites = await Bite.find({ title: { $regex: search, $options: "i" }, currency: { $eq: null }, "comments.0": { $exists: true } }).populate([
        { path: 'owner', select: { name: 1, avatar: 1, personalisedUrl: 1 } },
        { path: 'comments.commentedBy', select: { name: 1, avatar: 1, role: 1, categories: 1 } }
      ])
    }

    const resBites: any = []
    bites.forEach((bite: any) => {
      resBites.push({
        ...bite._doc,
        time: Math.round((new Date(bite.date).getTime() - new Date(calcTime()).getTime()) / 1000),
        commentDate: bite.comments[bite.comments.length - 1].commentedAt
      })
    })

    return res.status(200).json({
      success: true,
      payload: {
        bites: resBites.sort((first: any, second: any) => {
          if (first.commentDate > second.commentDate) return sortOrder
          else if (first.commentDate < second.commentDate) return -sortOrder
          return 0
        })
      }
    })
  } catch (err) {
    console.log(err)
  }
}

export const getBitesByPersonalisedUrl = async (req: any, res: any) => {
  try {
    const { url } = req.params
    const { userId, tab } = req.query
    const user: any = await User.findOne({ personalisedUrl: { $regex: url, $options: "i" }})

    if (user) {
      let bites: any = []
      if (userId === String(user._id) && tab === 'null') {
        bites = await Bite.aggregate([
          {
            $lookup: {
              from: "users",
              as: 'owner',
              let: { owner: "$owner" },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$$owner", "$_id"] }
                  }
                },
                {
                  $project: { avatar: 1, name: 1, personalisedUrl: 1, visible: 1 }
                }
              ],
            }
          },
          { $unwind: "$owner" },
          {
            $project: {
              videos: {
                $filter: {
                  input: "$videos",
                  as: "videos",
                  cond: { $eq: ["$$videos.visible", true] } //<-- filter sub-array based on condition
                }
              },
              currency: 1,
              owner: 1,
              price: 1,
              title: 1,
              visible: 1,
              purchasedUsers: 1,
              date: 1,
            }
          },
          {
            $match: {
              $and: [
                { "purchasedUsers.purchasedBy": user._id },
                { visible: true },
                { 'owner.visible': { $eq: true } },
                { "videos.0": { $exists: true } }
              ]
            }
          }
        ])
      } else {
        bites = await Bite.aggregate([
          {
            $lookup: {
              from: "users",
              as: 'owner',
              let: { owner: "$owner" },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$$owner", "$_id"] }
                  }
                },
                {
                  $project: { avatar: 1, name: 1, personalisedUrl: 1, visible: 1 }
                }
              ],
            }
          },
          { $unwind: "$owner" },
          {
            $project: {
              videos: {
                $filter: {
                  input: "$videos",
                  as: "videos",
                  cond: { $eq: ["$$videos.visible", true] } //<-- filter sub-array based on condition
                }
              },
              currency: 1,
              owner: 1,
              price: 1,
              title: 1,
              visible: 1,
              purchasedUsers: 1,
              date: 1,
            }
          },
          {
            $match: {
              $and: [
                { "owner._id": user._id },
                { visible: true },
                { 'owner.visible': { $eq: true } },
                { "videos.0": { $exists: true } }
              ]
            }
          }
        ])
      }

      const resBites: any = []

      bites.forEach((bite: any) => {
        resBites.push({
          ...bite,
          time: Math.round((new Date(bite.date).getTime() - new Date(calcTime()).getTime()) / 1000)
        })
      })
      return res.status(200).json({ success: true, payload: { bites: resBites } })
    } else return res.status(200).json({ success: false })
  } catch (err) {
    console.log(err)
  }
}

export const unLockBite = async (req: any, res: any) => {
  try {
    const { id } = req.params
    const { userId, currency, amount, token, saveCheck, holder, cardType, subscribe } = req.body
    const bite: any = await Bite.findById(id)
    const user: any = await User.findById(bite.owner)
    const setting: any = await Setting.findOne()

    const currencyRate = JSON.parse(setting.currencyRate)
    let resBite: any

    if (bite.purchasedUsers.every((purchaseInfo: any) => purchaseInfo.purchasedBy !== userId)) {
      if (currency) {
        if (subscribe) {
          const time = calcTime()

          const newTransaction1 = new Transaction({
            type: 2,
            bite: {
              id: bite._id,
              title: bite.title,
              currency: bite.currency,
              price: bite.price,
              subscription: true,
            },
            user: userId,
            createdAt: time
          })
          newTransaction1.save()

          const newTransaction2 = new Transaction({
            type: 3,
            bite: {
              id: bite._id,
              title: bite.title,
              currency: bite.currency,
              price: bite.price,
              subscription: true,
            },
            user: bite.owner,
            createdAt: time
          })
          newTransaction2.save()
        } else {
          let usdAmount = (amount * 1.034 + 0.3) * (currency === 'jpy' ? 1 : 100)
          let ratedAmount = usdAmount * (currency === 'usd' ? 1.0 : currencyRate[`${currency}`])

          if (saveCheck) {
            const user: any = await User.findById(userId)

            const customer: any = await stripe.customers.create({
              email: user.email,
              name: holder,
              source: token.id
            })

            const customerId = customer.id
            const card: any = await stripe.customers.retrieveSource(customerId, customer.default_source)
            const cardNumber = card.last4

            const newPayment = new Payment({
              user: userId,
              stripe: {
                customerId: customerId,
                cardType: cardType,
                cardNumber: cardNumber,
                cardHolder: holder
              }
            })

            newPayment.save()

            const charge = await stripe.charges.create({
              amount: Number(Math.round(ratedAmount)),
              currency: currency,
              customer: customerId,
              description: `Unlock Bite (${bite.title})`,
            })

            if (charge.status !== 'succeeded') {
              return res.status(200).json({ success: false, payload: charge })
            }

          } else {
            const charge = await stripe.charges.create({
              amount: Number(Math.round(ratedAmount)),
              currency: currency,
              source: token.id,
              description: `Unlock Bite (${bite.title})`,
            })
            if (charge.status !== 'succeeded') {
              return res.status(200).json({ success: false, payload: charge })
            }
          }

          const time = calcTime()

          const newTransaction1 = new Transaction({
            type: 2,
            bite: {
              id: bite._id,
              title: bite.title,
              currency: bite.currency,
              price: bite.price
            },
            user: userId,
            currency: currency,
            localPrice: (amount * 1.034 + 0.3) * (currency === 'usd' ? 1.0 : currencyRate[`${currency}`]),
            createdAt: time
          })
          newTransaction1.save()

          const newTransaction2 = new Transaction({
            type: 3,
            bite: {
              id: bite._id,
              title: bite.title,
              currency: bite.currency,
              price: bite.price
            },
            user: bite.owner,
            createdAt: time
          })
          newTransaction2.save()
          User.findByIdAndUpdate(user._id, { earnings: user.earnings + amount }).exec()
        }
      } else {
        const newTransaction = new Transaction({
          type: 1,
          bite: {
            id: bite._id,
            title: bite.title
          },
          user: userId,
          createdAt: calcTime()
        })

        newTransaction.save()
      }

      let purchasedUsers = bite.purchasedUsers
      purchasedUsers.push({
        purchasedBy: userId,
        purchasedAt: calcTime()
      })

      resBite = await Bite.findByIdAndUpdate(id, { purchasedUsers: purchasedUsers }, { new: true }).populate([
        { path: 'owner', select: { name: 1, avatar: 1, personalisedUrl: 1, categories: 1 } },
        { path: 'comments.commentedBy', select: { name: 1, avatar: 1, categories: 1, role: 1 } }
      ])
    } else {
      resBite = await Bite.findById(id).populate([
        { path: 'owner', select: { name: 1, avatar: 1, personalisedUrl: 1, categories: 1 } },
        { path: 'comments.commentedBy', select: { name: 1, avatar: 1, categories: 1, role: 1 } }
      ])
    }

    const videos = resBite.videos.filter((video: any) => video.visible === true)
    const result = {
      ...resBite._doc,
      videos: videos,
      time: Math.round((new Date(bite.date).getTime() - new Date(calcTime()).getTime()) / 1000)
    }
    return res.status(200).json({ success: true, payload: { bite: result } })
  } catch (err) {
    console.log(err)
  }
}

export const getBitesList = async (req: any, res: any) => {
  try {
    const { categories } = req.query
    const temp = categories === "" ? [] : String(categories).split(",")
    const category = temp.map((item: any) => Number(item))
    let bites: any = []
    if (category.length === 0) {
      bites = await Bite.aggregate([
        {
          $lookup: {
            from: "users",
            as: 'owner',
            let: { owner: "$owner" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$$owner", "$_id"] }
                }
              },
              {
                $project: { avatar: 1, name: 1, personalisedUrl: 1, visible: 1 }
              }
            ],
          }
        },
        { $unwind: "$owner" },
        {
          $project: {
            videos: {
              $filter: {
                input: "$videos",
                as: "videos",
                cond: { $eq: ["$$videos.visible", true] }
              }
            },
            currency: 1,
            owner: 1,
            price: 1,
            title: 1,
            visible: 1,
            purchasedUsers: 1,
            date: 1,
          }
        },
        {
          $match: {
            $and: [
              { visible: true },
              { 'owner.visible': { $eq: true } },
              { "videos.0": { $exists: true } }
            ]
          }
        },
      ])
    } else {
      bites = await Bite.aggregate([
        {
          $lookup: {
            from: "users",
            as: 'owner',
            let: { owner: "$owner" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$$owner", "$_id"] }
                }
              },
              {
                $project: { avatar: 1, name: 1, personalisedUrl: 1, visible: 1 }
              }
            ],
          }
        },
        { $unwind: "$owner" },
        {
          $project: {
            videos: {
              $filter: {
                input: "$videos",
                as: "videos",
                cond: { $eq: ["$$videos.visible", true] }
              }
            },
            currency: 1,
            owner: 1,
            price: 1,
            title: 1,
            category: 1,
            visible: 1,
            purchasedUsers: 1,
            date: 1,
          }
        },
        {
          $match: {
            $and: [
              { "category": { $in: category } },
              { visible: true },
              { 'owner.visible': { $eq: true } },
              { "videos.0": { $exists: true } }
            ]
          }
        },
      ])
    }

    const resBites: any = []

    bites.forEach((bite: any) => {
      resBites.push({
        ...bite,
        time: Math.round((new Date(bite.date).getTime() - new Date(calcTime()).getTime()) / 1000)
      })
    })

    const newArr1 = resBites.slice()
    for (let i = newArr1.length - 1; i > 0; i--) {
      const rand = Math.floor(Math.random() * (i + 1))
      const temp = newArr1[i]
      newArr1[i] = newArr1[rand]
      newArr1[rand] = temp
    }

    return res.status(200).json({ success: true, payload: { bites: newArr1 } })
  } catch (err) {
    console.log(err)
  }
}

export const getBiteById = async (req: any, res: any) => {
  try {
    const { id } = req.params
    const bite: any = await Bite.findById(id).populate([
      { path: 'owner', select: { name: 1, avatar: 1, personalisedUrl: 1, categories: 1 } },
      { path: 'comments.commentedBy', select: { name: 1, avatar: 1, categories: 1, role: 1 } }
    ])

    const videos = bite.videos.filter((video: any) => video.visible === true)
    const resBite = {
      ...bite._doc,
      videos: videos,
      time: Math.round((new Date(bite.date).getTime() - new Date(calcTime()).getTime()) / 1000)
    }

    return res.status(200).json({ success: true, payload: { bite: resBite } })
  } catch (err) {
    console.log(err)
  }
}

export const setVisible = async (req: any, res: any) => {
  try {
    const { id } = req.params
    const { visible } = req.body
    await Bite.findByIdAndUpdate(id, { visible: visible })
    return res.status(200).json({ success: true })
  } catch (err) {
    console.log(err)
  }
}

export const deleteBite = async (req: any, res: any) => {
  try {
    const { id } = req.params
    const bite = await Bite.findById(id)
    bite?.videos.forEach((video: any) => {
      if (video.coverUrl) {
        const filePath = "public/" + video.coverUrl
        if (fs.existsSync(filePath)) {
          fs.unlink(filePath, (err) => {
            if (err) throw err
          })
        }
      }
      if (video.videoUrl) {
        const filePath = "public/" + video.videoUrl
        if (fs.existsSync(filePath)) {
          fs.unlink(filePath, (err) => {
            if (err) throw err
          })
        }
      }
    })
    await Bite.findByIdAndDelete(id)
    return res.status(200).json({ success: true })
  } catch (err) {
    console.log(err)
  }
}

export const removeVideoFromBite = async (req: any, res: any) => {
  try {
    const { id, index } = req.params
    const bite = await Bite.findById(id)
    if (bite?.videos[index].coverUrl) {
      const filePath = "public/" + bite?.videos[index].coverUrl
      if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
          if (err) throw err
        })
      }
    }
    if (bite?.videos[index].videoUrl) {
      const filePath = "public/" + bite?.videos[index].videoUrl
      if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
          if (err) throw err
        })
      }
    }
    let videos = bite?.videos.filter((video: any, i: any) => i !== Number(index))
    await Bite.findByIdAndUpdate(id, { videos: videos })
    return res.status(200).json({ success: true })
  } catch (err) {
    console.log(err)
  }
}

export const changeVideoVisible = async (req: any, res: any) => {
  try {
    const { id, index } = req.params
    const { visible } = req.body
    const bite = await Bite.findById(id)
    let videos: any = bite?.videos
    videos[index].visible = visible
    await Bite.findByIdAndUpdate(id, { videos: videos })
    return res.status(200).json({ success: true })
  } catch (err) {
    console.log(err)
  }
}

export const getBitesByUserId = async (req: any, res: any) => {
  try {
    const { id } = req.params
    const { biteId } = req.query
    const user: any = await User.findById(id)

    const ownerBites = await Bite.aggregate([
      {
        $lookup: {
          from: "users",
          as: 'owner',
          let: { owner: "$owner" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$$owner", "$_id"] }
              }
            },
            {
              $project: { avatar: 1, name: 1, personalisedUrl: 1, visible: 1 }
            }
          ],
        }
      },
      { $unwind: "$owner" },
      {
        $project: {
          videos: {
            $filter: {
              input: "$videos",
              as: "videos",
              cond: { $eq: ["$$videos.visible", true] }
            }
          },
          currency: 1,
          owner: 1,
          price: 1,
          title: 1,
          visible: 1,
          purchasedUsers: 1,
          date: 1,
        }
      },
      {
        $match: {
          $and: [
            { 'owner._id': { $eq: new mongoose.Types.ObjectId(id) } },
            { "_id": { $ne: new mongoose.Types.ObjectId(biteId) } },
            { visible: true },
            { 'owner.visible': { $eq: true } },
            { "videos.0": { $exists: true } }
          ]
        }
      }
    ])

    let categoryBites: any = []

    if (user.categories.length > 0) {
      categoryBites = await Bite.aggregate([
        {
          $lookup: {
            from: "users",
            as: 'owner',
            let: { owner: "$owner" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$$owner", "$_id"] }
                }
              },
              {
                $project: { avatar: 1, name: 1, personalisedUrl: 1, visible: 1, categories: 1 }
              }
            ],
          }
        },
        { $unwind: "$owner" },
        {
          $project: {
            videos: {
              $filter: {
                input: "$videos",
                as: "videos",
                cond: { $eq: ["$$videos.visible", true] }
              }
            },
            currency: 1,
            owner: 1,
            price: 1,
            title: 1,
            visible: 1,
            purchasedUsers: 1,
            date: 1,
          }
        },
        {
          $match: {
            $and: [
              { 'owner._id': { $ne: new mongoose.Types.ObjectId(id) } },
              { visible: true },
              { 'owner.visible': { $eq: true } },
              { "videos.0": { $exists: true } }
            ]
          }
        },
        {
          "$redact": {
            "$cond": [
              {
                "$gte": [
                  { "$size": { "$setIntersection": ["$owner.categories", user.categories] } },
                  1
                ]
              },
              "$$KEEP",
              "$$PRUNE"
            ]
          }
        }
      ])
    }

    const resBites: any = []

    ownerBites.forEach((bite: any) => {
      resBites.push({
        ...bite,
        time: Math.round((new Date(bite.date).getTime() - new Date(calcTime()).getTime()) / 1000),
        isCreator: true
      })
    })
    categoryBites.forEach((bite: any) => {
      resBites.push({
        ...bite,
        time: Math.round((new Date(bite.date).getTime() - new Date(calcTime()).getTime()) / 1000),
        isCreator: false
      })
    })

    const newArr1 = resBites.slice()
    for (let i = newArr1.length - 1; i > 0; i--) {
      const rand = Math.floor(Math.random() * (i + 1))
      const temp = newArr1[i]
      newArr1[i] = newArr1[rand]
      newArr1[rand] = temp
    }

    return res.status(200).json({ success: true, payload: { bites: newArr1 } })
  } catch (err) {
    console.log(err)
  }
}

export const sendComment = async (req: any, res: any) => {
  try {
    const { id } = req.params
    const { userId, comment } = req.body

    const bite: any = await Bite.findById(id)
    const comments = bite.comments

    comments.push({
      commentedBy: userId,
      commentedAt: calcTime(),
      text: comment
    })

    const updatedBite = await Bite.findByIdAndUpdate(id, { comments: comments, commentNotification: true }, { new: true }).populate([
      { path: 'owner', select: { name: 1, avatar: 1, personalisedUrl: 1, categories: 1 } },
      { path: 'comments.commentedBy', select: { name: 1, avatar: 1, categories: 1, role: 1 } }
    ])

    return res.status(200).json({ success: true, payload: { bite: updatedBite } })
  } catch (err) {
    console.log(err)
  }
}

export const deleteComment = async (req: any, res: any) => {
  try {
    const { id, index } = req.params
    const bite: any = await Bite.findById(id)
    const comments = bite.comments.filter((comment: any, i: any) => i !== Number(index))
    const updatedBite = await Bite.findByIdAndUpdate(id, { comments: comments }, { new: true }).populate([
      { path: 'owner', select: { name: 1, avatar: 1, personalisedUrl: 1 } },
      { path: 'comments.commentedBy', select: { name: 1, avatar: 1, categories: 1, role: 1 } }
    ])

    return res.status(200).json({ success: true, payload: { bite: updatedBite } })
  } catch (err) {
    console.log(err)
  }
}

export const clearCommentNotification = async (req: any, res: any) => {
  try {
    const { id } = req.params
    await Bite.findByIdAndUpdate(id, { commentNotification: false })
    return res.status(200).json({ success: true })
  } catch (err) {
    console.log(err)
  }
}