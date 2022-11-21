import mongoose from "mongoose"
import Subscription from "../models/Subscription"

const calcTime = () => {
    var d = new Date()
    var utc = d.getTime()
    var nd = new Date(utc + (3600000 * 8))
    return nd
}

export const getSubScription = async (req: any, res: any) => {
    try {
        const { userId } = req.params
        const subscription = await Subscription.findOne({ user: userId })
        return res.status(200).json({ success: true, payload: { subScription: subscription } })
    } catch (err) {
        console.log(err)
    }
}

export const saveSubScription = async (req: any, res: any) => {
    try {
        const { userId, subScription } = req.body
        const newSubScription = new Subscription({
            ...subScription,
            user: userId,
            createdAt: calcTime()
        })

        await newSubScription.save()
        return res.status(200).json({ success: true })
    } catch (err) {
        console.log(err)
    }
}