import monogoose, { Schema } from 'mongoose'

const SettingSchema = new monogoose.Schema({
    currencyRate:  {
        type: Object
    }
})

export default monogoose.model("settings", SettingSchema)