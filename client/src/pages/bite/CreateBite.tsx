import { useEffect, useState, useLayoutEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import Input from "../../components/general/input"
import TeaserCard from "../../components/general/TeaserCard"
import TeaserCardPopUp from "../../components/general/TeaserCardPopUp"
import CurrencySelect from "../../components/stripe/CurrencySelect"
import ContainerBtn from "../../components/general/containerBtn"
import { AddIcon, BackIcon, PlayIcon } from "../../assets/svg"
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
    const biteState = useSelector((state: any) => state.bite)
    const [title, setTitle] = useState('')
    const [price, setPrice] = useState('')
    const [currency, setCurrency] = useState(0)
    const [publishEnable, setPublishEnable] = useState(false)
    const [videoIndex, setVideoIndex] = useState(0)
    const { bite } = biteState
    const width = useWindowSize()

    const [openVideoPopup, setOpenVideoPopUp] = useState(false)

    const gotoHome = () => { navigate('/') }
    const gotoUploadBite = () => { navigate('/bite/create/upload') }
    const publish = () => {
        if (publishEnable) {

        }
    }
    const displayDuration = (duration: any) => { return Math.floor(duration / 60) + ":" + Math.round(duration % 60) }
    const popUpTeaser = (index: any) => {
        setVideoIndex(index)
        setOpenVideoPopUp(true)
    }

    useEffect(() => {
        if (title === "") {
            setPublishEnable(false)
            return
        }
        if (price === "" || Number(price) === 0) {
            setPublishEnable(false)
            return
        }
        setPublishEnable(true)
    }, [title, price])

    return (
        <div className="create-bite-wrapper">
            <div className="page-header">
                <div onClick={gotoHome}><BackIcon color="black" /></div>
                <div className="page-title"><span>Posting on Bite</span></div>
                <div style={{ width: '24px' }}></div>
            </div>
            <TeaserCardPopUp
                display={openVideoPopup}
                exit={() => { setOpenVideoPopUp(false) }}
                teaser={bite.videos.length === 0 ? "" : bite.videos[videoIndex].videoUrl.preview}
                size={bite.videos.length === 0 ? false : bite.videos[videoIndex].size}
            />
            <div className="create-bite">
                <div className="uploaded-vidoes">
                    {bite.videos.map((video: any, index: any) => (
                        <div className="uploaded-video">
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
                            <div className="upload-video-btn" onClick={gotoUploadBite}>
                                <AddIcon color="white" />
                            </div>
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
        </div>
    )
}

export default CreateBite