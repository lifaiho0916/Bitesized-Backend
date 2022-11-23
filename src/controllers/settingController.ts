import Setting from "../models/Setting"

export const getCurrencyRate = async (req: any, res: any) => {
    try {
        const setting: any = await Setting.findOne()
        return res.status(200).json({ success: true, payload: { currencyRate: JSON.parse(setting.currencyRate) } })
    } catch (err) {
        console.log(err)
    }
}

export const getTermsAndPrivacy = async (req: any, res: any) => {
    try {
        const setting: any = await Setting.findOne()
        return res.status(200).json({ success: true, payload: { termsAndPrivacy: setting.termsAndPrivacy } })
    } catch (err) {
        console.log(err)
    }
}

export const saveTermsAndPrivacy = async (req: any, res: any) => {
    try {
        const { termsAndPrivacy } = req.body
        const setting: any = await Setting.findOne()
        const updatedSetting: any = await Setting.findByIdAndUpdate(setting._id, { termsAndPrivacy: termsAndPrivacy }, { new: true })
        return res.status(200).json({ success: true, payload: { termsAndPrivacy: updatedSetting.termsAndPrivacy } })
    } catch (err) {
        console.log(err)
    }
}