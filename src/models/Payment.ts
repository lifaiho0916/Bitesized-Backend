import mongoose, { Schema } from 'mongoose'
import User from './User'

const PaymentSchema = new mongoose.Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: User
    },
    stripe: {
        cardNumber: {
            type: String
        },
        customerId: {
            type: String
        }
    }
})

export default mongoose.model("payments", PaymentSchema)