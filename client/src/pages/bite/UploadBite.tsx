import { useRef } from "react";
import { useNavigate } from "react-router-dom"
import { BackIcon, AddImageIcon } from "../../assets/svg"
import CONSTANT from "../../constants/constant"
import "../../assets/styles/bite/UploadBiteStyle.scss"

const UploadBite = () => {
    const navigate = useNavigate()
    const fileInputRef = useRef<HTMLInputElement>(null)

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
            const sizeRate = video.videoWidth / video.videoHeight
            const size = sizeRate >= 0.583
            
        }
        video.src = URL.createObjectURL(loadFile)
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

                <div style={{ marginTop: '20px' }}></div>
                <div className="upload-part">
                    <div onClick={() => { fileInputRef.current ?.click()}}>
                        <AddImageIcon color="#A6A29F" />
                    </div>
                </div>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={uploadVideo}
                    hidden
                    accept="video/*"
                    value=""
                />
            </div>
        </div>
    )
}

export default UploadBite