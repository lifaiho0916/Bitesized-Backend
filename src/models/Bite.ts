import monogoose, { Schema } from 'mongoose'
import User from './User'

const BiteSchema = new monogoose.Schema({
    owner: {
        type: Schema.Types.ObjectId,
        ref: User
    },
    title: {
        type: String
    },
    price: {
        type: Number
    },
    currency: {
        type: String
    },
    videos: [{
        _id: false,
        coverUrl: {
            type: String
        },
        videoUrl: {
            type: String
        },
        visible: {
            type: Boolean,
            default: true
        }
    }],
    purchasedUsers: [{
        _id: false,
        purchasedBy: {
            type: Schema.Types.ObjectId,
            ref: User
        },
        purchasedAt: {
            type: Date
        }
    }],
    visible: {
        type: Boolean,
        default: true
    },
    date: {
        type: Date
    }
})

export default monogoose.model("bites", BiteSchema)