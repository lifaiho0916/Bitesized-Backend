import mongoose, { Schema } from 'mongoose'
import User from './User'

const SubscriberSchema = new mongoose.Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: User,
        required: true
    },
    subscriptionId: {
        type: String,
        required: true
    },
    currency: {
        type: String,
        required: true
    },
    productId: {
        type: String
    },
    planName: {
        type: String
    },
    price: {
        type: Number
    },
    benefits: [{
        type: String
    }],
    status: {
        type: Boolean,
        default: true
    },
    earnings: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
    },
    cancelledAt: {
        type: Date,
    },
    nextInvoiceAt: {
        type: Date
    }
})

export default mongoose.model("subscribers", SubscriberSchema)