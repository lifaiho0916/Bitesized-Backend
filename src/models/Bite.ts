import mongoose, { Schema } from 'mongoose'
import User from './User'

const BiteSchema = new mongoose.Schema({
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
    comments: [{
        _id: false,
        text: {
            type: String
        },
        commentedBy: {
            type: Schema.Types.ObjectId,
            ref: User
        },
        commentedAt: {
            type: Date
        }
    }],
    visible: {
        type: Boolean,
        default: true
    },
    commentNotification: {
        type: Boolean,
        default: false
    },
    date: {
        type: Date
    }
})

export default mongoose.model("bites", BiteSchema)