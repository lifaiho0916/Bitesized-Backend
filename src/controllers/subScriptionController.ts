import Subscription from "../models/Subscription"
import User from "../models/User"
import Stripe from "stripe"

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
        const user: any = await User.findById(userId)

        const product = await stripe.products.create({
            name: `Plan(${user.email})`
        })

        // const price = await stripe.prices.create({
        //     product: product.id,
        //     unit_amount: 1000,
        //     currency: subScription.currency,
        //     currency_options: {
        //       eur: {
        //         unit_amount: 9000
        //       },
        //       jpy: {
        //         unit_amount: 12000
        //       }
        //     },
        //   });
        // const newSubScription = new Subscription({
        //     ...subScription,
        //     user: userId,
        //     createdAt: calcTime()
        // })

        // await newSubScription.save()
        return res.status(200).json({ success: true })
    } catch (err) {
        console.log(err)
    }
}

export const editSubScription = async (req: any, res: any) => {
    try {
        const { subScription } = req.body
        const { id } = req.params
        await Subscription.findByIdAndUpdate(id, subScription)
        return res.status(200).json({ success: true })
    } catch (err) {
        console.log(err)
    }
}

export const deleteSubScription = async (req: any, res: any) => {
    try {
        const { id } = req.params
        await Subscription.findByIdAndDelete(id)
        return res.status(200).json({ success: true })
    } catch (err) {
        console.log(err)
    }
}

export const setSubScriptionVisible = async (req: any, res: any) => {
    try {
        const { id } = req.params
        const { visible } = req.body
        const updatedPlan = await Subscription.findByIdAndUpdate(id, { visible: visible }, { new: true })
        return res.status(200).json({ success: true, payload: { subScription: updatedPlan } })
    } catch (err) {
        console.log(err)
    }
}