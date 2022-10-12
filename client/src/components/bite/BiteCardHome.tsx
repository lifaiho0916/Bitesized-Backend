import { useState, useContext, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import ReactPlayer from "react-player"
import Avatar from "../general/avatar"
import Button from "../general/button"
import { LanguageContext } from "../../routes/authRoute"
import { ClockIcon, NoOfPeopleIcon, PlayIcon, UnlockIcon } from "../../assets/svg"
import NextBtn from "../../assets/img/next-bright.png"
import { biteAction } from "../../redux/actions/biteActions"
import "../../assets/styles/bite/BiteCardHomeStyle.scss"

const BiteCardHome = (props: any) => {
    const { bite, setBite } = props
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const contexts = useContext(LanguageContext)
    const userState = useSelector((state: any) => state.auth)
    const { user } = userState

    const [videoIndex, setVideoIndex] = useState(0)
    const [play, setPlay] = useState(false)
    const [lock, setLock] = useState(true)

    const PrevVideo = () => {
        if (videoIndex > 0) setVideoIndex((index) => index - 1)
    }
    const NextVideo = () => {
        if (videoIndex < bite.videos.length - 1) setVideoIndex((index) => index + 1)
    }

    const displayTime = (left: any) => {
        const passTime = Math.abs(left)
        let res: any = 'Posted'
        if (Math.floor(passTime / (3600 * 24 * 30)) >= 1) res = res + ' ' + Math.floor(passTime / (3600 * 24 * 30)) + '' + (Math.floor(passTime / (3600 * 24 * 30)) === 1 ? contexts.ITEM_CARD.MONTH : contexts.ITEM_CARD.MONTHS)
        else if (Math.floor(passTime / (3600 * 24 * 7)) >= 1) res = res + ' ' + Math.floor(passTime / (3600 * 24 * 7)) + '' + (Math.floor(passTime / (3600 * 24 * 7)) === 1 ? contexts.ITEM_CARD.WEEK : contexts.ITEM_CARD.WEEKS)
        else if (Math.floor(passTime / (3600 * 24)) >= 1) res = res + ' ' + Math.floor(passTime / (3600 * 24)) + '' + (Math.floor(passTime / (3600 * 24)) === 1 ? contexts.ITEM_CARD.DAY : contexts.ITEM_CARD.DAYS)
        else if (Math.floor(passTime / 3600) >= 1) res = res + ' ' + Math.floor(passTime / 3600) + '' + (Math.floor(passTime / 3600) === 1 ? contexts.ITEM_CARD.HOUR : contexts.ITEM_CARD.HOURS)
        else if (Math.floor(passTime / 60) > 0) res = res + ' ' + Math.floor(passTime / 60) + '' + (Math.floor(passTime / 60) === 1 ? contexts.ITEM_CARD.MIN : contexts.ITEM_CARD.MINS)
        if (Math.floor(passTime / 60) > 0) res += contexts.ITEM_CARD.AGO
        else res = 'Just ' + res
        return res
    }
    const displayPrice = (currency: any, price: any) => {
        let res: any = ''
        if (currency === 'usd') res += "US $" + price
        else if (currency === 'hkd') res += 'HK $' + price
        else if (currency === 'twd') res += 'NT $' + price
        else if (currency === 'inr') res += 'Rp ₹' + price
        else if (currency === 'myr') res += 'RM ' + price
        else res = "FREE"
        return res
    }

    const findPurchasedUser = (userId: any) => {
        return String(userId) !== String(user.id)
    }

    const checkUnLock = () => {
        if (user === null) {
            setLock(true)
            return
        }
        if (String(bite.owner._id) === String(user.id)) {
            setLock(false)
            return
        }

        setLock(bite.purchasedUsers.every(findPurchasedUser))
    }

    const Unlock = () => {
        if (user) {
            setBite(bite)
            if (bite.currency) {
            } else dispatch(biteAction.unLockBite(bite._id, bite.currency, bite.price))
        }
        else navigate('/auth/signin')
    }

    useEffect(() => { checkUnLock() }, [bite])

    return (
        <div className="bite-card-home-wrapper">
            <div className="top-info">
                <div className="owner-avatar">
                    <Avatar
                        size="mobile"
                        avatar={bite.owner.avatar.indexOf('uploads') === -1 ? bite.owner.avatar : `${process.env.REACT_APP_SERVER_URL}/${bite.owner.avatar}`}
                        handleClick={() => { navigate(`/${bite.owner.personalisedUrl}`) }}
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
                <div className="video-part"
                    onClick={() => {
                        if (play) { setPlay(false) }
                    }}
                >
                    <div className="cover-image">
                        {videoIndex > 0 &&
                            <div className="prev-video" onClick={PrevVideo}>
                                <img src={NextBtn} alt="next video" />
                            </div>
                        }
                        {videoIndex < bite.videos.length - 1 &&
                            <div className="next-video" onClick={NextVideo}>
                                <img src={NextBtn} alt="next video" />
                            </div>
                        }
                        {play === true ?
                            <ReactPlayer
                                className="react-player"
                                config={{
                                    file: {
                                        attributes: {
                                            controlsList: 'nodownload noremoteplayback noplaybackrate',
                                            disablePictureInPicture: true,
                                        }
                                    }
                                }}
                                url={`${process.env.REACT_APP_SERVER_URL}/${bite.videos[videoIndex].videoUrl}`}
                                muted={true}
                                playing={play}
                                playsinline={true}
                                controls
                            />
                            :
                            <>
                                <img
                                    src={`${process.env.REACT_APP_SERVER_URL}/${bite.videos[videoIndex].coverUrl}`}
                                    alt="cover Image"
                                    width={'100%'}
                                />
                                {lock ?
                                    <div className="lock-btn">
                                        <Button
                                            text="Unlock"
                                            shape="rounded"
                                            fillStyle="outline"
                                            color="primary"
                                            icon={[<UnlockIcon color="#EFA058" />, <UnlockIcon color="white" />, <UnlockIcon color="white" />]}
                                            handleSubmit={Unlock}
                                        />
                                    </div>
                                    :
                                    <div className="play-icon" onClick={() => setPlay(true)}>
                                        <PlayIcon color="white" />
                                    </div>
                                }
                            </>
                        }
                        <div
                            className="video-count"
                            style={{ width: `${bite.videos.length * 55}px` }}
                        >
                            {bite.videos.map((video: any, index: any) => (
                                <div key={index} className={videoIndex === index ? "active-bar" : "inactive-bar"} ></div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className={bite.currency ? "price-purchased" : "price-free"}>
                    <span>{displayPrice(bite.currency, bite.price)}</span>
                    {bite.purchasedUsers.length > 0 && <span style={{ marginLeft: '10px' }}><NoOfPeopleIcon color="white" width={18} height={18} />&nbsp;{bite.purchasedUsers.length} {bite.currency ? "purchased" : "unlocked"}</span>}
                </div>
                <div className="bite-title">
                    <span>{bite.title}</span>
                </div>
            </div>
        </div>
    )
}

export default BiteCardHome