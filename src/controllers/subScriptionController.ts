import Subscription from "../models/Subscription"
import User from "../models/User"
import Setting from "../models/Setting"
import Stripe from "stripe"

const currencies = [ 'inr', 'twd', 'hkd', 'myr', 'aud', 'eur', 'gbp', 'cad', 'zar', 'jpy', 'chf', 'nzd', 'cny', 'sgd', 'thb', 'php', 'idr' ]

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

const currenyOptions = (type: any /* 0: usdAmount, 1: usdAFeemount*/ , currencyRate: any, usdAmount: any) => {
    if(type === 0 ) {
        return {
            usd: Math.round(usdAmount * 100) / 100,
            inr: Math.round(usdAmount * currencyRate['inr'] * 100) / 100,
            twd: Math.round(usdAmount * currencyRate['twd'] * 100) / 100,
            hkd: Math.round(usdAmount * currencyRate['hkd'] * 100) / 100,
            myr: Math.round(usdAmount * currencyRate['myr'] * 100) / 100,
            aud: Math.round(usdAmount * currencyRate['aud'] * 100) / 100,
            eur: Math.round(usdAmount * currencyRate['eur'] * 100) / 100,
            gbp: Math.round(usdAmount * currencyRate['gbp'] * 100) / 100,
            cad: Math.round(usdAmount * currencyRate['cad'] * 100) / 100,
            zar: Math.round(usdAmount * currencyRate['zar'] * 100) / 100,
            jpy: Math.round(usdAmount * currencyRate['jpy'] * 100) / 100,
            chf: Math.round(usdAmount * currencyRate['chf'] * 100) / 100,
            nzd: Math.round(usdAmount * currencyRate['nzd'] * 100) / 100,
            cny: Math.round(usdAmount * currencyRate['cny'] * 100) / 100,
            sgd: Math.round(usdAmount * currencyRate['sgd'] * 100) / 100,
            thb: Math.round(usdAmount * currencyRate['thb'] * 100) / 100,
            php: Math.round(usdAmount * currencyRate['php'] * 100) / 100,
            idr: Math.round(usdAmount * currencyRate['idr'] * 100) / 100,
        }
    } else {
        const useAmountwithFee = usdAmount + usdAmount * 0.043 + 0.3
        return {
            inr: { unit_amount: Math.round(useAmountwithFee * currencyRate['inr'] * 100) },
            twd: { unit_amount: Math.round(useAmountwithFee * currencyRate['twd'] * 100) },
            hkd: { unit_amount: Math.round(useAmountwithFee * currencyRate['hkd'] * 100) },
            myr: { unit_amount: Math.round(useAmountwithFee * currencyRate['myr'] * 100) },
            aud: { unit_amount: Math.round(useAmountwithFee * currencyRate['aud'] * 100) },
            eur: { unit_amount: Math.round(useAmountwithFee * currencyRate['eur'] * 100) },
            gbp: { unit_amount: Math.round(useAmountwithFee * currencyRate['gbp'] * 100) },
            cad: { unit_amount: Math.round(useAmountwithFee * currencyRate['cad'] * 100) },
            zar: { unit_amount: Math.round(useAmountwithFee * currencyRate['zar'] * 100) },
            jpy: { unit_amount: Math.round(useAmountwithFee * currencyRate['jpy']) },
            chf: { unit_amount: Math.round(useAmountwithFee * currencyRate['chf'] * 100) },
            nzd: { unit_amount: Math.round(useAmountwithFee * currencyRate['nzd'] * 100) },
            cny: { unit_amount: Math.round(useAmountwithFee * currencyRate['cny'] * 100) },
            sgd: { unit_amount: Math.round(useAmountwithFee * currencyRate['sgd'] * 100) },
            thb: { unit_amount: Math.round(useAmountwithFee * currencyRate['thb'] * 100) },
            php: { unit_amount: Math.round(useAmountwithFee * currencyRate['php'] * 100) },
            idr: { unit_amount: Math.round(useAmountwithFee * currencyRate['idr'] * 100) },
        }
    }
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
        const setting: any = await Setting.findOne()
        const currencyRate = JSON.parse(setting.currencyRate)

        const usdAmount = subScription.price / (subScription.currency === 'usd' ? 1 : currencyRate[`${subScription.currency}`])
        const useAmountwithFee = usdAmount + usdAmount * 0.034 + 0.3

        const product = await stripe.products.create({ name: `Plan(${user.email})` })

        const options: any = currenyOptions(1, currencyRate, usdAmount)
        const price = await stripe.prices.create({
            product: product.id,
            unit_amount: Math.round(useAmountwithFee * 100),
            currency: 'usd',
            recurring: {interval: 'month'},
            currency_options: options,
        })

        const newSubScription = new Subscription({
            ...subScription,
            productId: product.id,
            priceId: price.id,
            multiPrices: JSON.stringify(currenyOptions(0, currencyRate, usdAmount)),
            user: userId,
            createdAt: calcTime()
        })

        await newSubScription.save()
        return res.status(200).json({ success: true })
    } catch (err) {
        console.log(err)
    }
}

export const editSubScription = async (req: any, res: any) => {
    try {
        const { subScription } = req.body
        const { id } = req.params
        const subscription: any = await Subscription.findById(id)
        if(subscription.price !== subScription.price || subscription.currency !== subScription.currency) {
            const setting: any = await Setting.findOne()
            const currencyRate = JSON.parse(setting.currencyRate)
            const usdAmount = subScription.price / (subScription.currency === 'usd' ? 1 : currencyRate[`${subScription.currency}`])
            const useAmountwithFee = usdAmount + usdAmount * 0.034 + 0.3

            const options: any = currenyOptions(1, currencyRate, usdAmount)
            const price = await stripe.prices.create({
                product: subScription.productId,
                unit_amount: Math.round(useAmountwithFee * 100),
                currency: 'usd',
                recurring: {interval: 'month'},
                currency_options: options,
            })

            await stripe.products.update(
                subScription.productId,
                {default_price: price.id}
            )

            const newSub = {
                ...subScription,
                priceId: price.id,
                multiPrices: JSON.stringify(currenyOptions(0, currencyRate, usdAmount)),
            }
            await Subscription.findByIdAndUpdate(id, newSub)
        } else await Subscription.findByIdAndUpdate(id, subScription)
        return res.status(200).json({ success: true })
    } catch (err) {
        console.log(err)
    }
}

export const deleteSubScription = async (req: any, res: any) => {
    try {
        const { id } = req.params
        const subscription: any = await Subscription.findById(id)
        await stripe.products.update(subscription.productId, { active: false })
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