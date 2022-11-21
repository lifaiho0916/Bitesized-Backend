import mongoose from "mongoose"
import Subscription from "../models/Subscription"

export const getSubScription = async (req: any, res: any) => {
    try {
       const { userId } = req.params
       console.log(userId)
       return res.status(200).json({ success: true, payload: { subScription: null } })
    } catch (err) {
        console.log(err)
    }
}