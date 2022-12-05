import mongoose, { Schema } from 'mongoose'
import Bite from './Bite'
import User from './User'

// type === 1 // Unlock Free Bite 
// type === 2 // Unlock Paid Bite
// type === 3 // Earnings from
// type === 4 // Refund
// type === 5 // Cash out
// type === 6 // Subscription from
// type === 7 // Subscription fee

const TransactionSchema = new mongoose.Schema({
    type: {
        type: Number,
        required: true
    },
    bite: {
        id: {
            type: Schema.Types.ObjectId,
            ref: Bite
        },
        title: {
            type: String
        },
        currency: {
            type: String
        },
        price: {
            type: Number
        },
        subscription: {
            type: Boolean
        }
    },
    subscription: {
        owner: {
            type: Schema.Types.ObjectId,
            ref: User    
        },
        subscriber: {
            type: Schema.Types.ObjectId,
            ref: User    
        },
        planName: {
            type: String
        },
        currency: {
            type: String
        },
        price: {
            type: Number
        },
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: User
    },
    currency: {
        type: String
    },
    localPrice: {
        type: Number
    },
    createdAt: {
        type: Date
    }
})

export default mongoose.model("transactions", TransactionSchema)