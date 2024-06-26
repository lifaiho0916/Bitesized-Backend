import mongoose, { Schema } from 'mongoose'
import User from './User'

const PaymentSchema = new mongoose.Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: User
    },
    stripe: {
        customerId: {
            type: String
        },
        cardType: {
            type: String
        },
        cardNumber: {
            type: String
        },
        cardHolder: {
            type: String
        }
    }
})

export default mongoose.model("payments", PaymentSchema)