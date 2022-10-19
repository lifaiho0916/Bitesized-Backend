import { Request, Response } from "express"
import path from "path"
import fs from "fs"
import multer from "multer"
import User from "../models/User"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import Mixpanel from "mixpanel"
import Bite from "../models/Bite"
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

    return res.status(200).json({ success: true, payload: { users: owners } })
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
    const { categories } = req.body
    const bites = await Bite.find({ visible: true })
      .populate({ path: 'owner', select: { name: 1, avatar: 1, personalisedUrl: 1, categories: 1, role: 1, bioText: 1, visible: 1 } })

    let users = <Array<any>>[]

    bites.forEach((bite: any) => {
      const filters = users.filter((user: any) => String(user._id) === String(bite.owner._id))
      if (filters.length === 0 && bite.owner.visible === true && bite.owner.role === 'USER') users.push(bite.owner)
    })

    let resUsers: any = []

    if (categories.length !== 0) {
      const filterUsers = users.filter((user: any) => {
        for (let i = 0; i < categories.length; i++) if (user.categories.indexOf(categories[i]) !== -1) return true
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
    const { categories } = req.body

    const users = await User.aggregate([{ $match: { role: 'USER' } }])
    let resUsers: any = []

    if (categories.length !== 0) {
      const filterUsers = users.filter((user: any) => {
        for (let i = 0; i < categories.length; i++) if (user.categories.indexOf(categories[i]) !== -1) return true
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

//-------------Google Signin---------------------------
export const googleSignin = async (req: Request, res: Response) => {
  try {
    const userData = req.body
    const email = userData.email
    const browser = userData.browser
    const user: any = await User.findOne({ email: email })

    if (user) {
      const password = userData.email + userData.googleId
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (isMatch) {
          const payload = {
            id: user._id,
            name: user.name,
            avatar: user.avatar,
            role: user.role,
            email: user.email,
            personalisedUrl: user.personalisedUrl,
            language: user.language,
            category: user.categories,
            bioText: user.bioText
          };

          jwt.sign(
            payload,
            `${process.env.KEY}`,
            { expiresIn: CONSTANT.SESSION_EXPIRE_TIME_IN_SECONDS },
            (err, token) => {
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
        } else return res.status(400).json({ error: 'sing-up methods error' })
      })
    } else googleSignup(req, res)
  } catch (err) {
    console.log(err)
  }
}

//-------------Google Signup---------------------------
export const googleSignup = async (req: Request, res: Response) => {
  try {
    const userData = req.body
    const email = userData.email
    const browser = userData.browser
    let role = "USER"
    const user: any = await User.findOne({ email: email })

    if (user) googleSignin(req, res)
    else {
      const password = userData.email + userData.googleId
      bcrypt.genSalt(10, (err: any, salt: any) => {
        bcrypt.hash(password, salt, (err: any, hash: any) => {
          if (err) throw err;
          const newUser = new User({
            email: userData.email,
            avatar: userData.avatar,
            name: userData.name,
            role: role,
            password: hash,
            date: calcTime()
          });
          newUser.save().then((user: any) => {
            const index = user.email.indexOf("@")
            const subEmail = user.email.substring(0, index).replace(/\s/g, '').toLowerCase()
            User.find({ personalisedUrl: subEmail }).then((foundUsers: any) => {
              let url = ""
              if (foundUsers.length > 1) url = `${subEmail}${foundUsers.length - 1}`
              else url = subEmail
              User.findOneAndUpdate({ _id: user._id }, { $set: { personalisedUrl: url } }, { new: true })
                .then((updatedUser: any) => {
                  const payload = {
                    id: updatedUser._id,
                    name: updatedUser.name,
                    avatar: updatedUser.avatar,
                    role: updatedUser.role,
                    email: updatedUser.email,
                    personalisedUrl: updatedUser.personalisedUrl,
                    language: updatedUser.language,
                    category: updatedUser.categories,
                    bioText: user.bioText
                  };
                  jwt.sign(
                    payload,
                    `${process.env.KEY}`,
                    { expiresIn: CONSTANT.SESSION_EXPIRE_TIME_IN_SECONDS },
                    (err, token) => {
                      mixpanel.people.set_once(updatedUser._id, {
                        $name: updatedUser.name,
                        $email: updatedUser.email,
                      });

                      mixpanel.track("Sign Up", {
                        'Sign Up Method': 'Gmail',
                        'Browser Used': browser,
                        distinct_id: updatedUser._id,
                        $name: updatedUser.name,
                        $email: updatedUser.email,
                      });
                      return res.status(200).json({ success: true, payload: { user: payload, token: token } })
                    }
                  );
                }).catch((err: any) => console.log(err))
            }).catch((err: any) => console.log(err))
          }).catch((err: any) => console.log(err))
        })
      })
    }
  } catch (err) {
    console.log(err)
  }
}

export const appleSignin = async (req: Request, res: Response) => {
  try {
    const userData = req.body
    const token = userData.token
    const browser = userData.browser

    const decodeToken: any = jwt.decode(token)
    const user: any = await User.findOne({ email: decodeToken.email })
    if (user) {
      const password = decodeToken.email + decodeToken.sub
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (isMatch) {
          const payload = {
            id: user._id,
            name: user.name,
            avatar: user.avatar,
            role: user.role,
            email: user.email,
            personalisedUrl: user.personalisedUrl,
            language: user.language,
            category: user.categories,
            bioText: user.bioText
          }

          jwt.sign(
            payload,
            `${process.env.KEY}`,
            { expiresIn: CONSTANT.SESSION_EXPIRE_TIME_IN_SECONDS },
            (err, token) => {
              mixpanel.people.set_once(user._id, {
                $name: user.name,
                $email: user.email,
              });
              mixpanel.track("Sign In", {
                'Login Method': 'Apple',
                'Browser Used': browser,
                distinct_id: user._id,
                $name: user.name,
                $email: user.email,
              })

              return res.status(200).json({ success: true, payload: { user: payload, token: token } })
            }
          );
        } else return res.status(400).json({ error: 'sing-up methods error' })
      });
    } else appleSignup(req, res)
  } catch (err) {
    console.log(err)
  }
}

export const appleSignup = async (req: Request, res: Response) => {
  try {
    const userData = req.body
    const token = userData.token
    const browser = userData.browser
    const appleUser = userData.user

    const decodeToken: any = jwt.decode(token)
    const user: any = await User.findOne({ email: decodeToken.email })

    if (user) appleSignin(req, res)
    else {
      const password = decodeToken.email + decodeToken.sub
      bcrypt.genSalt(10, (err: any, salt: any) => {
        bcrypt.hash(password, salt, (err: any, hash: any) => {
          if (err) throw err;
          const i = decodeToken.email.indexOf("@");
          const alterName = decodeToken.email.substring(0, i)
          const newUser = new User({
            email: decodeToken.email,
            name: appleUser ? appleUser.firstName + ' ' + appleUser.lastName : alterName,
            role: 'USER',
            password: hash,
            date: calcTime()
          })
          newUser.save().then((user: any) => {
            const index = user.email.indexOf("@")
            const subEmail = user.email.substring(0, index).replace(/\s/g, '').toLowerCase()
            User.find({ personalisedUrl: subEmail }).then((foundUsers: any) => {
              let url = "";
              if (foundUsers.length > 1) url = `${subEmail}${foundUsers.length - 1}`
              else url = subEmail
              User.findOneAndUpdate({ _id: user._id }, { $set: { personalisedUrl: url } }, { new: true })
                .then((updatedUser: any) => {
                  const payload = {
                    id: updatedUser._id,
                    name: updatedUser.name,
                    avatar: updatedUser.avatar,
                    role: updatedUser.role,
                    email: updatedUser.email,
                    personalisedUrl: updatedUser.personalisedUrl,
                    language: updatedUser.language,
                    category: updatedUser.categories,
                    bioText: user.bioText
                  }
                  jwt.sign(
                    payload,
                    `${process.env.KEY}`,
                    { expiresIn: CONSTANT.SESSION_EXPIRE_TIME_IN_SECONDS },
                    (err, token) => {
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
                      });
                      return res.status(200).json({ success: true, payload: { user: payload, token: token } })
                    }
                  );
                }).catch((err: any) => console.log(err))
            }).catch((err: any) => console.log(err))
          }).catch((err: any) => console.log(err))
        })
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
      bioText: user.bioText
    }
    return res.status(200).json({ success: true, payload: { user: payload } })
  } catch (err) {
    console.log(err)
  }
}

export const editProfile = async (req: Request, res: Response) => {
  try {
    const { id, name, url, category, avatar, bioText } = req.body
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
    const updatedUser: any = await User.findByIdAndUpdate(id, { name: name, personalisedUrl: url, categories: category, avatar: avatar ? avatar : user.avatar, bioText: bioText }, { new: true })
    const payload = {
      id: updatedUser._id,
      name: updatedUser.name,
      avatar: updatedUser.avatar,
      role: updatedUser.role,
      email: updatedUser.email,
      personalisedUrl: updatedUser.personalisedUrl,
      language: updatedUser.language,
      category: updatedUser.categories,
      bioText: updatedUser.bioText
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

export const setLanguage = async (req: Request, res: Response) => {
  try {
    const { userId, lang } = req.body;
    const updatedUser = await User.findByIdAndUpdate(userId, { language: lang }, { new: true });
    if (updatedUser) return res.status(200).json({ success: true });
  } catch (err) {
    console.log(err);
  }
}

export const getUsersList = async (req: Request, res: Response) => {
  try {
    const { search } = req.body

    let users: any = []
    if (search === "") users = await User.find().select({ personalisedUrl: 1, date: 1, email: 1, name: 1, categories: 1, role: 1, avatar: 1, visible: 1 })
    else users = await User.find({
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ]
    }).select({ personalisedUrl: 1, date: 1, email: 1, name: 1, categories: 1, role: 1, avatar: 1, visible: 1 })

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