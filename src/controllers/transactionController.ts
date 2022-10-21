import mongoose from "mongoose"
import Transaction from "../models/Transaction"
import Setting from "../models/Setting"
import axios from "axios"

export const getCurrencyRate = async () => {
    try {
        const response = await axios.get('https://api.striperates.com/rates/usd', {
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': `${process.env.STRIPE_CURRENCY_RATE_API_KEY}`,
            }
        })
        const { data } = response
        const currencyRate = data.data[0].rates
        const setting: any = await Setting.findOne()
        if (setting) await Setting.findByIdAndUpdate(setting._id, { currencyRate: currencyRate })
        else {
            const newSetting = new Setting({
                currencyRate: currencyRate
            })
            await newSetting.save()
        }

    } catch (err) {
        console.log(err)
    }
}

export const getTransactions = async (req: any, res: any) => {
    try {
        const { type, search } = req.query
        let transactions: any = []
        const typeVal = type === 'free' ? 1 : type === 'paid' ? 2 : type === 'earn' ? 3 : type === 'cash' ? 5 : 0
        if (typeVal === 0) {
            transactions = await Transaction.aggregate([
                {
                    $lookup: {
                        from: "users",
                        as: 'user',
                        let: { user: "$user" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $eq: ["$$user", "$_id"] }
                                }
                            },
                            {
                                $project: { name: 1 }
                            }
                        ],
                    }
                },
                { $unwind: "$user" },
                {
                    $match: {
                        "user.name": { $regex: search, $options: "i" }
                    }
                }
            ])
        } else {
            transactions = await Transaction.aggregate([
                {
                    $lookup: {
                        from: "users",
                        as: 'user',
                        let: { user: "$user" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $eq: ["$$user", "$_id"] }
                                }
                            },
                            {
                                $project: { name: 1 }
                            }
                        ],
                    }
                },
                { $unwind: "$user" },
                {
                    $match: {
                        $and: [
                            { type: { $eq: typeVal } },
                            { "user.name": { $regex: search, $options: "i" } }
                        ]
                    }
                },
            ])
        }

        return res.status(200).json({ success: true, payload: { transactions: transactions } })
    } catch (err) {
        console.log(err)
    }
}

export const getTransactionsByUserId = async (req: any, res: any) => {
    try {
        const { userId } = req.params
        const { type } = req.query
        let transactions: any = []
        if (type === '0')
            transactions = await Transaction.aggregate([
                {
                    $match: {
                        $and: [
                            { user: { $eq: new mongoose.Types.ObjectId(userId) } },
                            { type: { $ne: 1 } }
                        ]
                    }
                },
                { $sort: { createdAt: -1 } },
                { $limit: 5 },
            ])
        else if (type === '1' || type === '2') {
            transactions = await Transaction.aggregate([
                {
                    $match: {
                        $and: [
                            { user: { $eq: new mongoose.Types.ObjectId(userId) } },
                            { type: { $ne: 1 } }
                        ]
                    }
                },
                { $sort: { createdAt: -1 } },
            ])
        } else if (type === '3') {
            transactions = await Transaction.aggregate([
                {
                    $match: {
                        $and: [
                            { user: { $eq: new mongoose.Types.ObjectId(userId) } },
                            { type: { $ne: 1 } }
                        ]
                    }
                },
                { $sort: { createdAt: -1 } }
            ])
        }

        return res.status(200).json({ success: true, payload: { transactions: transactions } })
    } catch (err) {
        console.log(err)
    }
}

export const getTransactionsByBiteId = async (req: any, res: any) => {
    try {
        const { biteId } = req.params
        const { sort } = req.query
        const sortValue: any = Number(sort)

        const transactions = await Transaction.aggregate([
            {
                $lookup: {
                    from: "users",
                    as: 'user',
                    let: { user: "$user" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$$user", "$_id"] }
                            }
                        },
                        {
                            $project: { name: 1, avatar: 1 }
                        }
                    ],
                }
            },
            { $unwind: "$user" },
            {
                $match: {
                    "bite.id": { $eq: new mongoose.Types.ObjectId(biteId) }
                }
            },
            { $sort: { createdAt: sortValue } }
        ])

        return res.status(200).json({ success: true, payload: { transactions: transactions } })
    } catch (err) {
        console.log(err)
    }
}