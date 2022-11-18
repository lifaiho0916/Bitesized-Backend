import mongoose from 'mongoose'
import User from './User'

const SocialAccounts = new mongoose.Schema(
    {
        social: {
            youtube: {
                type: String
            },
            instagram: {
                type: String
            }
        },   
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: User,
            required: true,
        }
    },
)

export default mongoose.model('socialaccounts', SocialAccounts)
