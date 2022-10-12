import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { useSelector } from "react-redux"
import AvatarEditor from 'react-avatar-editor'
import ContainerBtn from "../../components/general/containerBtn"
import { BackIcon } from "../../assets/svg"
import NextBtn from "../../assets/img/next-grey.png"
import { SET_BITE } from "../../redux/types"
import "../../assets/styles/bite/EditCoverStyle.scss"

const EditCoverImage = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const loadState = useSelector((state: any) => state.load)
    const biteState = useSelector((state: any) => state.bite)
    const { prevRoute } = loadState
    const { bite } = biteState
    const [videoIndex, setVideoIndex] = useState(0)
    let imageEditor: any = null

    const NextCover = async () => {
        if (videoIndex < bite.videos.length - 1) {
            if (bite.videos[videoIndex].coverUrl.name !== 'edit.png') {
                const canvas = imageEditor.getImage()
                let url = canvas.toDataURL('image/png')
                const res = await fetch(url)
                const blob = await res.blob()
                const imageFile = new File([blob], 'edit.png', blob)
                const cover = Object.assign(imageFile, { preview: url })
                const videos = bite.videos
                videos[videoIndex].coverUrl = cover
                setVideoIndex((index) => index + 1)
                dispatch({ type: SET_BITE, payload: { ...bite, videos: videos } })
            } else setVideoIndex((index) => index + 1)
        }
    }
    const PrevCover = async () => {
        if (videoIndex > 0) {
            if (bite.videos[videoIndex].coverUrl.name !== 'edit.png') {
                const canvas = imageEditor.getImage()
                let url = canvas.toDataURL('image/png')
                const res = await fetch(url)
                const blob = await res.blob()
                const imageFile = new File([blob], 'edit.png', blob)
                const cover = Object.assign(imageFile, { preview: url })
                const videos = bite.videos
                videos[videoIndex].coverUrl = cover
                setVideoIndex((index) => index - 1)
                dispatch({ type: SET_BITE, payload: { ...bite, videos: videos } })
            } else setVideoIndex((index) => index - 1)
            
        }
    }

    const gotoCreateBite = async () => {
        const canvas = imageEditor.getImage()
        let url = canvas.toDataURL('image/png')
        const res = await fetch(url)
        const blob = await res.blob()
        const imageFile = new File([blob], 'edit.png', blob)
        const cover = Object.assign(imageFile, { preview: url })
        const videos = bite.videos
        videos[videoIndex].coverUrl = cover
        setVideoIndex((index) => index - 1)
        dispatch({ type: SET_BITE, payload: { ...bite, videos: videos } })
        navigate(prevRoute)
    }

    const setEditorRef = (editor: any) => (imageEditor = editor)

    return (
        <div className="edit-cover-wrapper">
            <div className="page-header">
                <div onClick={gotoCreateBite}><BackIcon color="black" /></div>
                <div className="page-title"><span>Edit thumbnail</span></div>
                <div style={{ width: '24px' }}></div>
            </div>
            <div className="edit-cover">
                <div className="cover-editor">
                    <div className="next-prev-btn"
                        style={{ transform: 'rotate(180deg)' }}
                        onClick={PrevCover}
                    >
                        {videoIndex > 0 ?
                            <img src={NextBtn} alt="Prev" />
                            :
                            <div style={{ width: '23px' }}></div>
                        }
                    </div>
                    <AvatarEditor
                        ref={setEditorRef}
                        image={bite.videos[videoIndex]?.coverUrl.preview}
                        width={220}
                        height={377}
                        border={15}
                        color={[0, 0, 0, 0.6]} // RGBA
                        scale={1.0}
                    />
                    <div className="next-prev-btn" onClick={NextCover}>
                        {videoIndex < bite.videos.length - 1 ?
                            <img src={NextBtn} alt="Next" />
                            :
                            <div style={{ width: '23px' }}></div>
                        }
                    </div>
                </div>

            </div>
        </div>
    )
}

export default EditCoverImage