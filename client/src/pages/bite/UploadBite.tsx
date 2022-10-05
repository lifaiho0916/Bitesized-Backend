import { useRef } from "react";
import { useNavigate } from "react-router-dom"
import { Carousel } from 'react-responsive-carousel'
import { BackIcon, AddImageIcon } from "../../assets/svg"
import "../../assets/styles/bite/UploadBiteStyle.scss"

const UploadBite = () => {
    const navigate = useNavigate()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const gotoCreateBite = () => { navigate('/bite/create') }
    const uploadVideos = () => {

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
                    <div onClick={() => { fileInputRef.current?.click() }}>
                        <AddImageIcon color="#A6A29F" />
                    </div>
                </div>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={uploadVideos}
                    hidden
                    accept="video/*"
                    value=""
                />
            </div>
        </div>
    )
}

export default UploadBite