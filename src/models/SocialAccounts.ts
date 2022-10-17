import mongoose from 'mongoose'
import User from './User'

const SocialAccounts = new mongoose.Schema(
    {
        id: {
            type: String,
        },
        name: {
            type: String,
            required: true,
        },
        metadata: {
            type: String,
            default: null,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: User,
            required: true,
        },
    },
    { timestamps: true }
)

export default mongoose.model('socialaccounts', SocialAccounts)
