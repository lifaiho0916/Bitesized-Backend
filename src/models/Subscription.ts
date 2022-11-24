import mongoose, { Schema } from 'mongoose'
import User from './User'

const SubScriptionSchema = new mongoose.Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: User,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    benefits: [{
        type: String        
    }],
    active: {
        type: Boolean,
        default: true,
    },
    productId: {
        type: String
    },
    priceId: {
        type: String
    },
    multiPrices: {
        type: String
    },
    subscribers: [{
        _id: false,
        subscriber: {
            type: Schema.Types.ObjectId,
            ref: User,
        },
        subscriptionId: {
            type: String
        },
        subscribed: {
            type: Boolean,
            default: true
        },
        currency: {
            type: String
        },
        subscribedAt: {
            type: Date
        }
    }],
    visible: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date
    }
})

export default mongoose.model("subscriptions", SubScriptionSchema)