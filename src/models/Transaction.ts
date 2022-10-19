import monogoose, { Schema } from 'mongoose'
import Bite from './Bite'
import User from './User'

// type === 1 // Unlock Free Bite 
// type === 2 // Unlock Paid Bite
// type === 3 // Earnings from
// type === 4 // Refund
// type === 5 // Cash out

const TransactionSchema = new monogoose.Schema({
    type: {
        type: Number,
        required: true
    },
    bite: {
        type: Schema.Types.ObjectId,
        ref: Bite
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: User
    },
    currency: {
        type: String
    },
    createdAt: {
        type: Date
    }
})

export default monogoose.model("transactions", TransactionSchema)