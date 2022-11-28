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
    benefits: [{
        type: String
    }],
    status: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
    },
    nextInvoiceAt: {
        type: Date
    }
})

export default mongoose.model("subscribers", SubscriberSchema)