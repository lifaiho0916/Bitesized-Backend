import { useState, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import ReactPlayer from "react-player"
import ContainerBtn from "../../components/general/containerBtn"
import { BackIcon, AddImageIcon, PlayIcon, DeleteIcon } from "../../assets/svg"
import CONSTANT from "../../constants/constant"
import { SET_BITE } from "../../redux/types"
import "../../assets/styles/bite/UploadBiteStyle.scss"

const UploadBite = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const biteState = useSelector((state: any) => state.bite)
    const playerRef = useRef<ReactPlayer>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { bite } = biteState

    const [uploadedVideo, setUploadedVideo] = useState<any>(null)
    const [cover, setCover] = useState<any>(null)
    const [size, setSize] = useState<any>(null)
    const [duration, setDuration] = useState<any>(null)
    const [play, setPlay] = useState(false)

    const gotoCreateBite = () => { navigate('/bite/create') }
    const uploadVideo = (e: any) => {
        const { files } = e.target
        if (files.length === 0) return
        if (files[0].size > CONSTANT.MAX_BITE_FILE_SIZE) {
            alert("file size is over 150M")
            return
        }
        const loadFile = Object.assign(files[0], { preview: URL.createObjectURL(files[0]) })
        window.URL = window.URL || window.webkitURL
        const video = document.createElement('video')
        video.preload = "metadata"
        video.onloadedmetadata = evt => {
            setDuration(video.duration)
            setSize(video.videoHeight >= video.videoWidth)
            setUploadedVideo(loadFile)
        }
        video.src = URL.createObjectURL(loadFile)
    }
    const removeVideo = () => {
        setSize(null)
        setUploadedVideo(null)
        setPlay(false)
        setDuration(null)
        setCover(null)
    }
    const playVideo = () => { setPlay(true) }
    const stopVideo = () => { if (play) setPlay(false) }
    const replayVideo = (progress: any) => { if (progress.playedSeconds >= progress.loadedSeconds) playerRef.current ?.seekTo(0)}
    const getFirstFrame = () => {
        const video: any = document.getElementById("element") ?.firstChild
        let canvas = document.createElement("canvas") as HTMLCanvasElement
        let context = canvas.getContext('2d')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context ?.drawImage(video, 0, 0)
        let url = canvas.toDataURL('image/png')
        fetch(url)
            .then(res => res.blob())
            .then(blob => {
                const file = new File([blob], 'cover.png', blob);
                const cover = Object.assign(file, { preview: url })
                setCover(cover)
            })
    }
    const save = () => {
        if(uploadedVideo === null) return
        const video = {
            coverUrl: cover,
            videoUrl: uploadedVideo,
            size: size,
            duration: duration
        }
        bite.videos.push(video)
        dispatch({ type: SET_BITE, payload: bite })
        navigate('/bite/create')
    }

    return (
        <div className="upload-bite-wrapper">
            <div className="page-header">
                <div onClick={gotoCreateBite}><BackIcon color="black" /></div>
                <div className="page-title"><span>Make a Bite</span></div>
                <div style={{ width: '24px' }}></div>
            </div>
            <div className="upload-bite">
                <div className="bite-description">
                    <span>Upload video to fans!</span>
                </div>

                <div className="first-divider"></div>
                <div className="upload-part">
                    {
                        (uploadedVideo !== null && size !== null) ?
                            <div className="video-part" onClick={stopVideo}>
                                {(cover && !play) ?
                                    <div className="cover-image">
                                        <img
                                            src={cover.preview}
                                            alt="cover Image"
                                            style={size ? { width: '100%', height: 'auto' } : { width: 'auto', height: '100%' }}
                                        />
                                    </div>
                                    :
                                    <ReactPlayer
                                        id="element"
                                        ref={playerRef}
                                        className={size ? "react-player-width" : "react-player-height"}
                                        url={uploadedVideo.preview}
                                        playing={play}
                                        onProgress={progress => replayVideo(progress)}
                                        onReady={getFirstFrame}
                                    />
                                }
                                {!play &&
                                    <div className="play-icon" onClick={playVideo}>
                                        <PlayIcon color="white" />
                                    </div>
                                }
                                <div className="delete-icon" onClick={removeVideo}>
                                    <DeleteIcon color="#BAB6B5" />
                                </div>
                            </div>
                            :
                            <div onClick={() => { fileInputRef.current ?.click()}}>
                                <AddImageIcon color="#A6A29F" />
                            </div>
                    }
                </div>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={uploadVideo}
                    hidden
                    accept="video/*"
                    value=""
                />
                <div className="save-btn" onClick={save}>
                    <ContainerBtn
                        styleType="fill"
                        color="primary"
                        text="Save"
                        disabled={uploadedVideo ? false : true}
                    />
                </div>
            </div>
        </div>
    )
}

export default UploadBite