import mongoose, { Schema } from 'mongoose'

const SettingSchema = new mongoose.Schema({
    currencyRate:  {
        type: Object
    }
})

export default mongoose.model("settings", SettingSchema)