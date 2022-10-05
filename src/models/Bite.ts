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
    bites: [{
        cover: {
            type: String
        },
        video: {
            type: String
        }
    }],
    purchasedUsers: [{
        type: Schema.Types.ObjectId
    }],
    date: {
        type: Date
    }
})

export default monogoose.model("bites", BiteSchema)