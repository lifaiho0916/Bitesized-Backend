import mongoose, { Schema } from 'mongoose'
import User from './User'
import Subscriber from "./Subscriber"

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
        type: Schema.Types.ObjectId,
        ref: Subscriber
    }],
    visible: {
        type: Boolean,
        default: true
    },
    earnings: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date
    }
})

export default mongoose.model("subscriptions", SubScriptionSchema)