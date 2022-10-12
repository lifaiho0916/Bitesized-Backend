import { useNavigate } from "react-router-dom"
import Button from "../../components/general/button"
import { BackIcon, AddIcon } from "../../assets/svg"
import CreateImage from "../../assets/img/create.png"
import "../../assets/styles/bite/CreateTypeStyle.scss"

const CreateType = () => {
    const navigate = useNavigate()

    return (
        <div className="create-type-wrapper">
            <div className="page-header">
                <div onClick={() => navigate('/')}><BackIcon color="black" /></div>
                <div className="page-title"><span>Make a Bite</span></div>
                <div style={{ width: '24px' }}></div>
            </div>
            <div className="create-type">
                <img src={CreateImage} alt="create image" />
                <div className="type-description">
                    <span>I want to gift a Bite to fans!</span>
                </div>
                <div className="first-divider"></div>
                <Button
                    text="FREE Bite"
                    width="320px"
                    fillStyle="fill"
                    shape="rounded"
                    color="primary"
                    icon={[
                        <AddIcon color="white" />, <AddIcon color="white" />, <AddIcon color="white" />
                    ]}
                    handleSubmit={() => navigate('/bite/create?type=free')}
                />
                <div className="second-divider"></div>
                <div className="type-description">
                    <span>I want to earn some by Bite !</span>
                </div>
                <div className="first-divider"></div>
                <Button
                    text="Paid Bite"
                    width="320px"
                    fillStyle="fill"
                    shape="rounded"
                    color="primary"
                    icon={[
                        <AddIcon color="white" />, <AddIcon color="white" />, <AddIcon color="white" />
                    ]}
                    handleSubmit={() => navigate('/bite/create?type=paid')}
                />
            </div>
        </div>
    )
}

export default CreateType