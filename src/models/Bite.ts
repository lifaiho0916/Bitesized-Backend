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
    date: {
        type: Date
    }
})

export default monogoose.model("bites", BiteSchema)