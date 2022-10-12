import { useEffect, useState, useLayoutEffect, useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import ReactPlayer from "react-player"
import Input from "../../components/general/input"
import TeaserCard from "../../components/general/TeaserCard"
import TeaserCardPopUp from "../../components/general/TeaserCardPopUp"
import CurrencySelect from "../../components/stripe/CurrencySelect"
import ContainerBtn from "../../components/general/containerBtn"
import Dialog from "../../components/general/dialog"
import Button from "../../components/general/button"
import { AddIcon, BackIcon, PlayIcon } from "../../assets/svg"
import { biteAction } from "../../redux/actions/biteActions"
import { SET_BITE, SET_PREVIOUS_ROUTE } from "../../redux/types"
import CONSTANT from "../../constants/constant"
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
    const location = useLocation()

    const fileInputRef = useRef<HTMLInputElement>(null)
    const biteState = useSelector((state: any) => state.bite)
    const [title, setTitle] = useState('')
    const [price, setPrice] = useState('')
    const [currency, setCurrency] = useState(0)
    const [publishEnable, setPublishEnable] = useState(false)
    const [videoIndex, setVideoIndex] = useState(0)
    const [free, setFree] = useState(false)
    const { bite } = biteState
    const width = useWindowSize()

    const [openVideoPopup, setOpenVideoPopUp] = useState(false)
    const [openQuit, setOpenQuit] = useState(false)
    const [openPublish, setOpenPublish] = useState(false)

    const publish = () => {
        if (!publishEnable) return
        setOpenPublish(true)
    }
    const publishBite = () => {
        const newBite = free ? {
            ...bite,
            title: title,
        } : {
            ...bite,
            title: title,
            price: price,
            currency: (currencies[currency]).toLowerCase()
        }
        dispatch(biteAction.saveBite(newBite, navigate))
    }
    const displayDuration = (duration: any) => { return Math.floor(duration / 60) + ":" + (Math.round(duration % 60) < 10 ? '0' : '') + Math.round(duration % 60) }
    const popUpTeaser = (index: any) => {
        setVideoIndex(index)
        setOpenVideoPopUp(true)
    }
    const uploadVideo = (e: any) => {
        const { files } = e.target
        if (files.length === 0) return
        let len = bite.videos.length === 0 ? files.length > 3 ? 3 : files.length
            : files.length > (3 - bite.videos.length) ? 3 - bite.videos.length : files.length
        for (let i = 0; i < len; i++) {
            if (files[i].size > CONSTANT.MAX_BITE_FILE_SIZE) {
                alert("file size is over 150M")
                return
            }
        }

        for (let i = 0; i < len; i++) {
            const loadFile = Object.assign(files[i], { preview: URL.createObjectURL(files[i]) })
            window.URL = window.URL || window.webkitURL
            const video = document.createElement('video')
            video.preload = "metadata"
            video.onloadedmetadata = evt => {
                let videos: any = bite.videos
                videos.push({
                    coverUrl: null,
                    videoUrl: loadFile,
                    duration: video.duration
                })
                dispatch({ type: SET_BITE, payload: { ...bite, videos: videos } })
            }
            video.src = URL.createObjectURL(loadFile)
        }
    }

    const getFirstFrame = async (index: any) => {
        const video: any = document.getElementById(`element${index}`)?.firstChild
        let canvas = document.createElement("canvas") as HTMLCanvasElement
        let context = canvas.getContext('2d')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context?.drawImage(video, 0, 0)
        let url = canvas.toDataURL('image/png')
        const res = await fetch(url)
        const blob = await res.blob()
        const file = new File([blob], 'cover.png', blob)
        const cover = Object.assign(file, { preview: url })
        const videos = bite.videos
        videos[index].coverUrl = cover
        dispatch({ type: SET_BITE, payload: { ...bite, videos: videos } })
    }
    const gotoEditThumbnail = () => {
        dispatch({ type: SET_PREVIOUS_ROUTE, payload: location.pathname })
        navigate('/bite/create/edit_thumbnail')
    }

    useEffect(() => {
        if (title === "" || bite.videos.length === 0) {
            setPublishEnable(false)
            return
        }
        if (!free && (price === "" || Number(price) === 0)) {
            setPublishEnable(false)
            return
        }
        setPublishEnable(true)
    }, [title, price, bite])

    useEffect(() => { setFree(location.pathname.substring(location.pathname.length - 4) === 'free') }, [location])

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
            />
            <Dialog
                display={openQuit}
                wrapExit={() => setOpenQuit(false)}
                title="Quit?"
                context="Your draft will not be saved."
                buttons={[
                    {
                        text: 'Quit',
                        handleClick: () => navigate('/bite/create_type')
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
                    style={{ height: bite.videos.length === 0 ? '0px' : width > 940 ? '480px' : '160px' }}
                >
                    {bite.videos.map((video: any, index: any) => (
                        <div className="uploaded-video" key={index}>
                            {width > 940 ?
                                <TeaserCard
                                    cover={video.coverUrl ? video.coverUrl.preview : null}
                                    teaser={video.videoUrl.preview}
                                    type={"dareme"}
                                />
                                :
                                <div className="mobile-part">
                                    <div className="cover-image">
                                        {video.coverUrl &&
                                            <img
                                                src={video.coverUrl.preview}
                                                alt="cover Image"
                                                width={'100%'}
                                            />
                                        }
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
                </div>

                <div className="upload-edit-btns">
                    {bite.videos.length > 0 &&
                        <div className="upload-btn">
                            <Button
                                text="Edit thumbnail"
                                width={250}
                                shape="rounded"
                                fillStyle="fill"
                                color="primary"
                                handleSubmit={gotoEditThumbnail}
                            />
                        </div>
                    }
                    {bite.videos.length < 3 &&
                        <div className="upload-btn">
                            <Button
                                text="Upload Bite Videos"
                                width={250}
                                shape="rounded"
                                fillStyle="fill"
                                color="primary"
                                icon={[<AddIcon color="white" />, <AddIcon color="white" />, <AddIcon color="white" />]}
                                handleSubmit={() => fileInputRef.current?.click()}
                            />
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={uploadVideo}
                                hidden
                                multiple
                                accept="video/*"
                                value=""
                            />
                        </div>
                    }
                </div>
                <div className="react-player-hidden">
                    {bite.videos.map((video: any, index: any) => (
                        <ReactPlayer
                            id={`element${index}`}
                            key={index}
                            url={video.videoUrl.preview}
                            onReady={() => { if (video.coverUrl === null) getFirstFrame(index) }}
                        />
                    ))}
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

                {!free &&
                    <div>
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
                    </div>
                }

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