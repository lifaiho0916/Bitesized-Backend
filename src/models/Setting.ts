import mongoose, { Schema } from 'mongoose'

const SettingSchema = new mongoose.Schema({
    currencyRate:  {
        type: String
    },
    termsAndPrivacy: {
        terms: {
            type: String
        },
        privacy: {
            type: String
        }
    }
})

export default mongoose.model("settings", SettingSchema)