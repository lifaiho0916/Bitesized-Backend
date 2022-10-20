import Transaction from "../models/Transaction"

export const getTransactions = async (req: any, res: any) => {
    try {
        const { userId, search, type } = req.body
        let transactions: any = []
        if (userId) {

        } else {
            const typeVal = type === 'free' ? 1 : type === 'paid' ? 2 : type === 'earn' ? 3 : type === 'cash' ? 5 : 0
            if (typeVal === 0) {
                if (search === "") transactions = await Transaction.find().populate({ path: 'user', select: { name: 1 } })
                else transactions = await Transaction.aggregate([
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
                if (search === "") transactions = await Transaction.find({ type: typeVal }).populate({ path: 'user', select: { name: 1 } })
                else transactions = await Transaction.aggregate([
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
                    }
                ])
            }
        }

        return res.status(200).json({ success: true, payload: { transactions: transactions } })
    } catch (err) {
        console.log(err)
    }
}