import { useState, useContext } from "react"
import Avatar from "../general/avatar"
import { LanguageContext } from "../../routes/authRoute"
import { ClockIcon, NoOfPeopleIcon } from "../../assets/svg"
import "../../assets/styles/bite/BiteCardHomeStyle.scss"

const BiteCardHome = (props: any) => {
    const { bite, navigate } = props
    const contexts = useContext(LanguageContext)

    const displayTime = (left: any) => {
        const passTime = Math.abs(left)
        let res: any = 'Posted'
        if (Math.floor(passTime / (3600 * 24 * 30)) >= 1) res = res + ' ' + Math.floor(passTime / (3600 * 24 * 30)) + '' + (Math.floor(passTime / (3600 * 24 * 30)) === 1 ? contexts.ITEM_CARD.MONTH : contexts.ITEM_CARD.MONTHS)
        else if (Math.floor(passTime / (3600 * 24 * 7)) >= 1) res = res + ' ' + Math.floor(passTime / (3600 * 24 * 7)) + '' + (Math.floor(passTime / (3600 * 24 * 7)) === 1 ? contexts.ITEM_CARD.WEEK : contexts.ITEM_CARD.WEEKS)
        else if (Math.floor(passTime / (3600 * 24)) >= 1) res = res + ' ' + Math.floor(passTime / (3600 * 24)) + '' + (Math.floor(passTime / (3600 * 24)) === 1 ? contexts.ITEM_CARD.DAY : contexts.ITEM_CARD.DAYS)
        else if (Math.floor(passTime / 3600) >= 1) res = res + ' ' + Math.floor(passTime / 3600) + '' + (Math.floor(passTime / 3600) === 1 ? contexts.ITEM_CARD.HOUR : contexts.ITEM_CARD.HOURS)
        else if (Math.floor(passTime / 60) > 0) res = res + ' ' + Math.floor(passTime / 60) + '' + (Math.floor(passTime / 60) === 1 ? contexts.ITEM_CARD.MIN : contexts.ITEM_CARD.MINS)
        if (Math.floor(passTime / 60) > 0) res = res + contexts.ITEM_CARD.AGO
        return res
    }
    const displayPrice = (currency: any, price: any) => {
        let res: any = ''
        if(currency === 'usd') res += "US $" + price 
        else if(currency === 'hkd') res += 'HK $' + price
        else if(currency === 'twd') res += 'NT $' + price
        else if(currency === 'INR') res += 'Rp ₹' + price
        else res += 'RM ' + price
        return res
    }

    return (
        <div className="bite-card-home-wrapper">
            <div className="top-info">
                <div className="owner-avatar">
                    <Avatar
                        size="mobile"
                        avatar={bite.owner.avatar.indexOf('uploads') === -1 ? bite.owner.avatar : `${process.env.REACT_APP_SERVER_URL}/${bite.owner.avatar}`}
                        handleClick={() => { navigate(`/${bite.owner.profile}`) }}
                    />
                </div>
                <div className="ownername-lefttime-wrapper">
                    <div className="ownername-lefttime">
                        <div className="owner-name">
                            <span>{bite.owner.name}</span>
                        </div>
                        <div className="left-time">
                            <ClockIcon color="#DE5A67" width={18} height={18} />&nbsp;<span>{displayTime(bite.time)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bite-body">
                <div className="video-part"></div>
                <div className="price-purchased">
                    <span>{displayPrice(bite.currency, bite.price)}</span>
                    {bite.purchasedUsers.length > 0 && <span style={{ marginLeft: '10px' }}><NoOfPeopleIcon color="white" width={18} height={18} />&nbsp;{bite.purchasedUsers.length} purchased</span>}
                </div>
                <div className="bite-title">
                    <span>{bite.title}</span>
                </div>
            </div>
        </div>
    )
}

export default BiteCardHome