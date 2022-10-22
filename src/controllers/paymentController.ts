import mongoose from 'mongoose'
import Stripe from "stripe"
import User from '../models/User'
import Payment from '../models/Payment'

const stripe = new Stripe(
    `${process.env.STRIPE_SECRET_KEY}`,
    { apiVersion: '2020-08-27', typescript: true }
)

export const getPayment = async (req: any, res: any) => {
    try {
        const { userId } = req.body
        const payment = await Payment.aggregate([
            { $match: { user: { $$eq: new mongoose.Types.ObjectId(userId) } } }
        ])

        return res.status(200).json({ success: true, payload: { payment: payment } })
    } catch (err) {
        console.log(err)
    }
}

export const addCard = async () => {
    try {

    } catch (err) {
        console.log(err)
    }
}
