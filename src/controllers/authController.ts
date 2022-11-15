import { Request, Response } from "express"
import path from "path"
import fs from "fs"
import multer from "multer"
import User from "../models/User"
import jwt from "jsonwebtoken"
import Mixpanel from "mixpanel"
import Bite from "../models/Bite"
import Setting from "../models/Setting"
import 'dotenv/config'
import CONSTANT from "../utils/constant"

const mixpanel = Mixpanel.init(`${process.env.MIXPANEL_TOKEN}`)
var mixpanel_importer = Mixpanel.init(`${process.env.MIXPANEL_TOKEN}`, {
  secret: `${process.env.MIXPANEL_API_SECRET}`
});


const calcTime = () => {
  var d = new Date()
  var utc = d.getTime()
  var nd = new Date(utc + (3600000 * 8))
  return nd
}

export const getOwnersOfBites = async (req: any, res: any) => {
  try {
    const bites = await Bite.find({ visible: true }).populate({
      path: 'owner',
      select: { name: 1, avatar: 1, personalisedUrl: 1, categories: 1, role: 1, bioText: 1, visible: 1 }
    })

    const owners: any = []
    bites.forEach((bite: any) => {
      const filterRes = owners.filter((owner: any) => String(owner._id) === String(bite.owner._id))
      if (filterRes.length === 0 && bite.owner.visible === true && bite.owner.role === "USER") owners.push(bite.owner)
    })

    const newArr = owners.slice()
    for (let i = newArr.length - 1; i > 0; i--) {
      const rand = Math.floor(Math.random() * (i + 1))
      const temp = newArr[i]
      newArr[i] = newArr[rand]
      newArr[rand] = temp
    }

    return res.status(200).json({ success: true, payload: { users: newArr } })
  } catch (err) {
    console.log(err)
  }
}

export const getUserByPersonalisedUrl = async (req: any, res: any) => {
  try {
    const { url } = req.params
    const user = await User.findOne({ personalisedUrl: url })
      .select({ name: 1, avatar: 1, personalisedUrl: 1, categories: 1, role: 1, bioText: 1 })

    if (user) return res.status(200).json({ success: true, payload: { users: [user] } })
    else return res.status(200).json({ success: false })
  } catch (err) {
    console.log(err)
  }
}

export const getCreatorsByCategory = async (req: Request, res: Response) => {
  try {
    const { categories } = req.query
    const category = categories === "" ? [] : String(categories).split(",")
    const bites = await Bite.find({ visible: true })
      .populate({ path: 'owner', select: { name: 1, avatar: 1, personalisedUrl: 1, categories: 1, role: 1, bioText: 1, visible: 1 } })

    let users = <Array<any>>[]

    bites.forEach((bite: any) => {
      const filters = users.filter((user: any) => String(user._id) === String(bite.owner._id))
      if (filters.length === 0 && bite.owner.visible === true && bite.owner.role === 'USER') users.push(bite.owner)
    })

    let resUsers: any = []

    if (category.length !== 0) {
      const filterUsers = users.filter((user: any) => {
        for (let i = 0; i < category.length; i++) if (user.categories.indexOf(category[i]) !== -1) return true
        return false
      })
      resUsers = filterUsers
    } else resUsers = users

    const newArr1 = resUsers.slice()
    for (let i = newArr1.length - 1; i > 0; i--) {
      const rand = Math.floor(Math.random() * (i + 1))
      const temp = newArr1[i]
      newArr1[i] = newArr1[rand]
      newArr1[rand] = temp
    }

    return res.status(200).json({ success: true, payload: { creators: newArr1 } })
  } catch (err) {
    console.log(err)
  }
}

export const getUsersByCategory = async (req: Request, res: Response) => {
  try {
    const { categories, search } = req.query
    const category = categories === "" ? [] : String(categories).split(",")
    const users = await User.find({ role: 'USER', name: { $regex: search, $options: "i" } })
    let resUsers: any = []

    if (category.length !== 0) {
      const filterUsers = users.filter((user: any) => {
        for (let i = 0; i < category.length; i++) if (user.categories.indexOf(category[i]) !== -1) return true
        return false
      })
      resUsers = filterUsers
    } else resUsers = users

    return res.status(200).json({ success: true, payload: { users: resUsers } })
  } catch (err) {
    console.log(err)
  }
}


export const checkName = async (req: Request, res: Response) => {
  try {
    const { name, id } = req.body
    const users = await User.find({ name: new RegExp(`^${name}$`, 'i') }).where('_id').ne(id)
    return res.status(200).json({ success: true, payload: { exist: users.length > 0 ? true : false } })
  } catch (err) {
    console.log(err)
  }
}

export const checkUrl = async (req: Request, res: Response) => {
  try {
    const { url, id } = req.body
    const users = await User.find({ personalisedUrl: new RegExp(`^${url}$`, 'i') }).where('_id').ne(id)
    return res.status(200).json({ success: true, payload: { exist: users.length > 0 ? true : false } })
  } catch (err) {
    console.log(err)
  }
}

export const googleAuth = async (req: any, res: any) => {
  try {
    const { name, email, avatar, authId, lang, browser } = req.body
    const user: any = await User.findOne({ email: email })

    if (user) {
      if (user.authProvider.authId === authId && user.authProvider.authType === 'Google') {
        const payload = {
          id: user._id,
          name: user.name,
          avatar: user.avatar,
          role: user.role,
          email: user.email,
          authType: user.authProvider.authType,
          personalisedUrl: user.personalisedUrl,
          language: user.language,
          category: user.categories,
          bioText: user.bioText,
          earnings: user.earnings,
          currency: user.currency,
          subscribe: user.subscribe
        }

        jwt.sign(
          payload,
          `${process.env.KEY}`,
          { expiresIn: CONSTANT.SESSION_EXPIRE_TIME_IN_SECONDS },
          (err, token) => {
            if (err) return res.status(200).json({ success: false })

            mixpanel.people.set_once(user._id, {
              $name: user.name,
              $email: user.email,
            })

            mixpanel.track("Sign In", {
              'Login Method': 'Gmail',
              'Browser Used': browser,
              distinct_id: user._id,
              $name: user.name,
              $email: user.email,
            })

            return res.status(200).json({ success: true, payload: { user: payload, token: token } })
          }
        )
      } else return res.status(200).json({ success: false })
    } else {
      const newUser = new User({
        email: email,
        avatar: avatar,
        name: name,
        authProvider: {
          authId: authId,
          authType: 'Google'
        },
        date: calcTime()
      })

      const savedUser = await newUser.save()
      const index = savedUser.email.indexOf("@")
      const subEmail = savedUser.email.substring(0, index).replace(/\s/g, '').toLowerCase()

      const foundUsers = await User.find({ personalisedUrl: subEmail })
      let url = ""
      if (foundUsers.length !== 0) url = `${subEmail}${foundUsers.length}`
      else url = subEmail

      const updatedUser: any = await User.findByIdAndUpdate(savedUser._id, { personalisedUrl: url }, { new: true })

      const payload = {
        id: updatedUser._id,
        name: updatedUser.name,
        avatar: updatedUser.avatar,
        role: updatedUser.role,
        email: updatedUser.email,
        authType: updatedUser.authProvider.authType,
        personalisedUrl: updatedUser.personalisedUrl,
        language: updatedUser.language,
        category: updatedUser.categories,
        bioText: updatedUser.bioText,
        earnings: updatedUser.earnings,
        currency: updatedUser.currency,
        subscribe: updatedUser.subscribe
      }

      jwt.sign(
        payload,
        `${process.env.KEY}`,
        { expiresIn: CONSTANT.SESSION_EXPIRE_TIME_IN_SECONDS },
        (err, token) => {
          if (err) return res.status(200).json({ success: false })

          mixpanel.people.set_once(updatedUser._id, {
            $name: updatedUser.name,
            $email: updatedUser.email,
          })

          mixpanel.track("Sign Up", {
            'Sign Up Method': 'Gmail',
            'Browser Used': browser,
            distinct_id: updatedUser._id,
            $name: updatedUser.name,
            $email: updatedUser.email,
          })

          return res.status(200).json({ success: true, payload: { user: payload, token: token, new: true } })
        })
    }
  } catch (err) {
    console.log(err)
  }
}

export const appleAuth = async (req: any, res: any) => {
  try {
    const { token, userInfo, browser, lang } = req.body

    const decodeToken: any = jwt.decode(token)
    const user: any = await User.findOne({ email: decodeToken.email })
    if (user) {
      if (user.authProvider.authId === decodeToken.sub && user.authProvider.authType === 'Apple') {
        const payload = {
          id: user._id,
          name: user.name,
          avatar: user.avatar,
          role: user.role,
          email: user.email,
          authType: user.authProvider.authType,
          personalisedUrl: user.personalisedUrl,
          language: user.language,
          category: user.categories,
          bioText: user.bioText,
          earnings: user.earnings,
          currency: user.currency,
          subscribe: user.subscribe
        }

        jwt.sign(
          payload,
          `${process.env.KEY}`,
          { expiresIn: CONSTANT.SESSION_EXPIRE_TIME_IN_SECONDS },
          (err, token) => {
            if (err) return res.status(200).json({ success: false })
            mixpanel.people.set_once(user._id, {
              $name: user.name,
              $email: user.email,
            })
            mixpanel.track("Sign In", {
              'Login Method': 'Apple',
              'Browser Used': browser,
              distinct_id: user._id,
              $name: user.name,
              $email: user.email,
            })

            return res.status(200).json({ success: true, payload: { user: payload, token: token } })
          })
      }
    } else {
      const i = decodeToken.email.indexOf("@");
      const alterName = decodeToken.email.substring(0, i)
      const newUser = new User({
        email: decodeToken.email,
        name: userInfo ? userInfo.firstName + ' ' + userInfo.lastName : alterName,
        authProvider: {
          authId: decodeToken.sub,
          authType: 'Apple'
        },
        date: calcTime()
      })

      const savedUser = await newUser.save()
      const index = savedUser.email.indexOf("@")
      const subEmail = savedUser.email.substring(0, index).replace(/\s/g, '').toLowerCase()

      const foundUsers = await User.find({ personalisedUrl: subEmail })
      let url = ""
      if (foundUsers.length !== 0) url = `${subEmail}${foundUsers.length}`
      else url = subEmail

      const updatedUser: any = await User.findByIdAndUpdate(savedUser._id, { personalisedUrl: url }, { new: true })

      const payload = {
        id: updatedUser._id,
        name: updatedUser.name,
        avatar: updatedUser.avatar,
        role: updatedUser.role,
        email: updatedUser.email,
        authType: updatedUser.authProvider.authType,
        personalisedUrl: updatedUser.personalisedUrl,
        language: updatedUser.language,
        category: updatedUser.categories,
        bioText: updatedUser.bioText,
        earnings: updatedUser.earnings,
        currency: updatedUser.currency,
        subscribe: updatedUser.subscribe
      }

      jwt.sign(
        payload,
        `${process.env.KEY}`,
        { expiresIn: CONSTANT.SESSION_EXPIRE_TIME_IN_SECONDS },
        (err, token) => {
          if (err) return res.status(200).json({ success: false })
          mixpanel.people.set_once(updatedUser._id, {
            $name: updatedUser.name,
            $email: updatedUser.email,
          })

          mixpanel.track("Sign Up", {
            'Sign Up Method': 'Apple',
            'Browser Used': browser,
            distinct_id: updatedUser._id,
            $name: updatedUser.name,
            $email: updatedUser.email,
          })
          return res.status(200).json({ success: true, payload: { user: payload, token: token, new: true } })
        })
    }
  } catch (err) {
    console.log(err)
  }
}

export const getAuthData = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body
    const user: any = await User.findById(userId)

    const payload = {
      id: user._id,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      email: user.email,
      personalisedUrl: user.personalisedUrl,
      language: user.language,
      category: user.categories,
      bioText: user.bioText,
      earnings: user.earnings,
      currency: user.currency,
      subscribe: user.subscribe
    }
    return res.status(200).json({ success: true, payload: { user: payload } })
  } catch (err) {
    console.log(err)
  }
}

export const editProfile = async (req: Request, res: Response) => {
  try {
    const { id, name, url, category, avatar, bioText, subscribe } = req.body
    const user: any = await User.findById(id)
    if (avatar) {
      if (user.avatar.indexOf('uploads') !== -1) {
        const filePath = "public/" + user.avatar
        if (fs.existsSync(filePath)) {
          fs.unlink(filePath, (err) => {
            if (err) throw err
          })
        }
      }
    }
    const updatedUser: any = await User.findByIdAndUpdate(id,
      {
        name: name,
        personalisedUrl: url,
        categories: category, avatar: avatar ? avatar : user.avatar,
        bioText: bioText,
        "subscribe.switch": subscribe
      }, { new: true })

    const payload = {
      id: updatedUser._id,
      name: updatedUser.name,
      avatar: updatedUser.avatar,
      role: updatedUser.role,
      email: updatedUser.email,
      personalisedUrl: updatedUser.personalisedUrl,
      language: updatedUser.language,
      category: updatedUser.categories,
      bioText: updatedUser.bioText,
      earnings: user.earnings,
      currency: user.currency,
      subscribe: user.subscribe
    }
    return res.status(200).json({ success: true, payload: { user: payload } })
  } catch (err) {
    console.log(err);
  }
}

const avatarStorage = multer.diskStorage({
  destination: "./public/uploads/avatar/",
  filename: function (req, file, cb) {
    cb(null, "Avatar-" + Date.now() + path.extname(file.originalname));
  }
});

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 30 * 1024 * 1024 },
}).single("file");

export const editAvatar = async (req: Request, res: Response) => {
  uploadAvatar(req, res, () => {
    res.status(200).json({ success: true, path: "uploads/avatar/" + req.file?.filename });
  });
}

export const setLanguageCurrency = async (req: Request, res: Response) => {
  try {
    const { userId, lang, currency } = req.body
    await User.findByIdAndUpdate(userId, { language: lang, currency: currency })
    return res.status(200).json({ success: true })
  } catch (err) {
    console.log(err);
  }
}

export const getUsersList = async (req: Request, res: Response) => {
  try {
    const { search } = req.body

    let users: any = []
    if (search === "") users = await User.find().select({ personalisedUrl: 1, date: 1, email: 1, name: 1, categories: 1, role: 1, avatar: 1, visible: 1, earnings: 1, subscribe: 1 })
    else users = await User.find({
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ]
    }).select({ personalisedUrl: 1, date: 1, email: 1, name: 1, categories: 1, role: 1, avatar: 1, visible: 1, earnings: 1, subscribe: 1 })

    let biteFuncs: any = []
    users.forEach((user: any) => { biteFuncs.push(Bite.find({ owner: user._id })) })
    const responses: any = await Promise.all(biteFuncs)

    let resUsers: any = []
    users.forEach((user: any, index: any) => {
      const sum = responses[index].reduce((prev: any, current: any) => prev + current.videos.length, 0)
      resUsers.push({
        ...user._doc,
        videoCnt: sum,
        biteCnt: responses[index].length
      })
    })

    return res.status(200).json({ success: true, payload: { users: resUsers } })
  } catch (err) {
    console.log(err)
  }
}


export const setUserVisible = async (req: any, res: any) => {
  try {
    const { id } = req.params
    const { visible } = req.body

    await User.findByIdAndUpdate(id, { visible: visible })
    return res.status(200).json({ success: true })
  } catch (err) {
    console.log(err)
  }
}

export const setSubscribeByAdmin = async (req: any, res: any) => {
  try {
    const { user, available } = req.body
    await User.findByIdAndUpdate(user, { "subscribe.available": available })
    return res.status(200).json({ success: true })
  } catch (err) {
    console.log(err)
  }
}