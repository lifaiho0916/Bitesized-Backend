import { useEffect, useState, useLayoutEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import Input from "../../components/general/input"
import TeaserCard from "../../components/general/TeaserCard"
import TeaserCardPopUp from "../../components/general/TeaserCardPopUp"
import CurrencySelect from "../../components/stripe/CurrencySelect"
import ContainerBtn from "../../components/general/containerBtn"
import Dialog from "../../components/general/dialog"
import Button from "../../components/general/button"
import { AddIcon, BackIcon, PlayIcon } from "../../assets/svg"
import { biteAction } from "../../redux/actions/biteActions"
import "../../assets/styles/bite/CreateBiteStyle.scss"

const useWindowSize = () => {
    const [size, setSize] = useState(0)
    useLayoutEffect(() => {
        const updateSize = () => { setSize(window.innerWidth) }
        window.addEventListener("resize", updateSize)
        updateSize();
        return () => window.removeEventListener("resize", updateSize)
    }, [])
    return size
}

const currencies = ['USD', 'INR', 'TWD', 'HKD', 'MYR']

const CreateBite = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const biteState = useSelector((state: any) => state.bite)
    const [title, setTitle] = useState('')
    const [price, setPrice] = useState('')
    const [currency, setCurrency] = useState(0)
    const [publishEnable, setPublishEnable] = useState(false)
    const [videoIndex, setVideoIndex] = useState(0)
    const { bite } = biteState
    const width = useWindowSize()

    const [openVideoPopup, setOpenVideoPopUp] = useState(false)
    const [openQuit, setOpenQuit] = useState(false)
    const [openPublish, setOpenPublish] = useState(false)

    const gotoUploadBite = () => { navigate('/bite/create/upload') }
    const publish = () => {
        if (!publishEnable) return
        setOpenPublish(true)
    }
    const publishBite = () => {
        const newBite = {
            ...bite,
            title: title,
            price: price,
            currency: (currencies[currency]).toLowerCase()
        }
        dispatch(biteAction.saveBite(newBite, navigate))
    }
    const displayDuration = (duration: any) => {
        return Math.floor(duration / 60) + ":" + (Math.round(duration % 60) < 10 ? '0' : '') + Math.round(duration % 60)
    }
    const popUpTeaser = (index: any) => {
        setVideoIndex(index)
        setOpenVideoPopUp(true)
    }

    useEffect(() => {
        if (price === "" || Number(price) === 0 || bite.videos.length === 0) {
            setPublishEnable(false)
            return
        }
        setPublishEnable(true)
    }, [price, bite])

    return (
        <div className="create-bite-wrapper">
            <div className="page-header">
                <div onClick={() => setOpenQuit(true)}><BackIcon color="black" /></div>
                <div className="page-title"><span>Posting on Bite</span></div>
                <div style={{ width: '24px' }}></div>
            </div>
            <TeaserCardPopUp
                display={openVideoPopup}
                exit={() => { setOpenVideoPopUp(false) }}
                teaser={bite.videos.length === 0 ? "" : bite.videos[videoIndex].videoUrl.preview}
                size={bite.videos.length === 0 ? false : bite.videos[videoIndex].size}
            />
            <Dialog
                display={openQuit}
                wrapExit={() => setOpenQuit(false)}
                title="Quit?"
                context="Your draft will not be saved."
                buttons={[
                    {
                        text: 'Quit',
                        handleClick: () => navigate('/')
                    },
                    {
                        text: 'Cancel',
                        handleClick: () => setOpenQuit(false)
                    }
                ]}
            />
            <Dialog
                display={openPublish}
                exit={() => setOpenPublish(false)}
                wrapExit={() => setOpenPublish(false)}
                title="Confirm:"
                context="Post can not be edited afterwards."
                buttons={[
                    {
                        text: 'Publish',
                        handleClick: () => publishBite()
                    }
                ]}
            />
            <div className="create-bite">
                <div className="uploaded-vidoes"
                    style={{ height: width > 940 ? bite.videos.length === 0 ? '50px' : '480px' : '160px' }}
                >
                    {bite.videos.map((video: any, index: any) => (
                        <div className="uploaded-video" key={index}>
                            {width > 940 ?
                                <TeaserCard
                                    cover={video.coverUrl.preview}
                                    teaser={video.videoUrl.preview}
                                    size={video.size}
                                    type={"dareme"}
                                />
                                :
                                <div className="mobile-part">
                                    <div className="cover-image">
                                        <img
                                            src={video.coverUrl.preview}
                                            alt="cover Image"
                                            style={video.size ? { width: '100%', height: 'auto' } : { width: 'auto', height: '100%' }}
                                        />
                                    </div>
                                    <div className="play-icon" onClick={() => popUpTeaser(index)}>
                                        <PlayIcon color="white" />
                                    </div>
                                </div>
                            }
                            <div className="time-duration">
                                <span>{displayDuration(video.duration)}</span>
                            </div>
                        </div>
                    ))}
                    {bite.videos.length < 3 &&
                        <div className="uploaded-video">
                            {width > 940 ?
                                <Button
                                    text="Upload Bite Videos"
                                    width={250}
                                    shape="rounded"
                                    fillStyle="fill"
                                    color="primary"
                                    icon={[<AddIcon color="white" />, <AddIcon color="white" />, <AddIcon color="white" />]}
                                    handleSubmit={gotoUploadBite}
                                />
                                :
                                <div className="upload-video-btn" onClick={gotoUploadBite}>
                                    <AddIcon color="white" />
                                </div>
                            }
                        </div>
                    }
                </div>

                <div className="first-divider"></div>
                <div className="session-title">
                    <span>Bite Title</span>
                </div>
                <div className="session-input">
                    <Input
                        type="input"
                        width={'100%'}
                        wordCount={100}
                        placeholder="Tell the story..."
                        title={title}
                        setTitle={setTitle}
                    />
                </div>

                <div className="second-divider"></div>
                <div className="session-title">
                    <span> $ Price to unlock</span>
                </div>
                <div className="session-input">
                    <Input
                        type="input"
                        isNumber={true}
                        width={'100%'}
                        minnum={0}
                        maxnum={100000000000000}
                        placeholder="$1 USD is ideal for bite-size!"
                        title={price}
                        setTitle={setPrice}
                    />
                </div>

                <div className="third-divider"></div>
                <div className="session-title">
                    <span>Currency</span>
                </div>
                <div className="currency-description">
                    <span>(Price will be displayed in USD)</span>
                </div>

                <div className="firth-divider"></div>
                <div className="currency-selection">
                    <CurrencySelect
                        width={'100%'}
                        option={currency}
                        setOption={setCurrency}
                        options={currencies}
                    />
                </div>

                <div className="fifth-divider"></div>
                <div className="publish-btn" onClick={publish}>
                    <ContainerBtn
                        styleType="fill"
                        color="primary"
                        text="Publish"
                        disabled={!publishEnable}
                    />
                </div>

            </div>
        </div >
    )
}

export default CreateBite