import Setting from "../models/Setting"
import User from "../models/User"
import Bite from "../models/Bite"

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

export const getSearchResult = async (req: any, res: any) => {
    try {
        const { search } = req.query
        if(search === "") return res.status(200).json({ success: true, payload: { result: [] }})
        const bites = await Bite.find({ title: { $regex: search, $options: "i" } })
        const users = await User.find({ name: { $regex: search, $options: "i" } })
        const bitesByComments = await Bite.find({ "comments.text": { $regex: search, $options: "i" } })
        let results: any = []
        bites.forEach((bite: any) => {
            results.push({
                text: bite.title,
                url: `/bite/detail/${bite._id}`
            })
        })
        users.forEach((user: any) => {
            results.push({
                text: user.name,
                url: `/${user.personalisedUrl}`
            })
        })
        bitesByComments.forEach((bite: any) => {
            bite.comments.forEach((comment: any) => {
                if (comment.text.toLowerCase().indexOf(search.toLowerCase()) !== -1) {
                    results.push({
                        text: comment.text,
                        url: `/bite/detail/${bite._id}`
                    })
                }
            })
        })
        return res.status(200).json({ success: true, payload: { result: results } })
    } catch (err) {
        console.log(err)
    }
}