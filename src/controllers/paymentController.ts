import mongoose from 'mongoose'
import Stripe from "stripe"
import User from '../models/User'
import Payment from '../models/Payment'

const stripe = new Stripe(
    `${process.env.STRIPE_SECRET_KEY}`,
    { apiVersion: '2022-11-15', typescript: true }
)

export const getPayment = async (req: any, res: any) => {
    try {
        const { userId } = req.body
        const payment = await Payment.aggregate([
            { $match: { user: { $eq: new mongoose.Types.ObjectId(userId) } } },
            { $limit: 1 }
        ])

        return res.status(200).json({ success: true, payload: { payment: payment } })
    } catch (err) {
        console.log(err)
    }
}

export const addCard = async (req: any, res: any) => {
    try {
        const { token, userId, holder, cardType } = req.body
        
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

        const payment = await newPayment.save()
        return res.status(200).json({ success: true, payload: { payment: payment } })
    } catch (err) {
        console.log(err)
    }
}

export const deleteCard = async (req: any, res: any) => {
    try {
        const { userId } = req.body
        const payment: any = await Payment.findOne({ user: userId })
        if (payment) {
            await stripe.customers.del(payment.stripe.customerId)
            await Payment.findByIdAndDelete(payment._id)
        } else return res.status(200).json({ success: false })

        return res.status(200).json({ success: true })
    } catch (err) {
        console.log(err)
    }
}
