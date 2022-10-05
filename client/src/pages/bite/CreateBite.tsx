import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Input from "../../components/general/input"
import CurrencySelect from "../../components/stripe/CurrencySelect"
import ContainerBtn from "../../components/general/containerBtn"
import { AddIcon, BackIcon } from "../../assets/svg"
import "../../assets/styles/bite/CreateBiteStyle.scss"

const currencies = ['USD', 'INR', 'TWD', 'HKD', 'MYR']

const CreateBite = () => {
    const navigate = useNavigate()
    const [title, setTitle] = useState('')
    const [price, setPrice] = useState('')
    const [currency, setCurrency] = useState(0)
    const [publishEnable, setPublishEnable] = useState(false)

    const gotoHome = () => { navigate('/') }
    const gotoUploadBite = () => { navigate('/bite/create/upload') }
    const publish = () => {
        if (publishEnable) {

        }
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
            <div className="create-bite">
                <div className="uploaded-vidoes">
                    <div className="uploaded-video">
                        <div className="upload-video-btn" onClick={gotoUploadBite}>
                            <AddIcon color="white" />
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '20px' }}></div>
                <div className="session-title">
                    <span>Bite Title</span>
                </div>
                <div className="session-input">
                    <Input
                        type="input"
                        width={340}
                        wordCount={100}
                        placeholder="Tell the story..."
                        title={title}
                        setTitle={setTitle}
                    />
                </div>

                <div style={{ marginTop: '35px' }}></div>
                <div className="session-title">
                    <span> $ Price to unlock</span>
                </div>
                <div className="session-input">
                    <Input
                        type="input"
                        isNumber={true}
                        minnum={0}
                        maxnum={100000000000000}
                        width={340}
                        placeholder="$1 USD is ideal for bite-size!"
                        title={price}
                        setTitle={setPrice}
                    />
                </div>

                <div style={{ marginTop: '15px' }}></div>
                <div className="currency-description">
                    <span>Currency (Price will be displayed in USD)</span>
                </div>

                <div style={{ marginTop: '15px' }}></div>
                <div className="currency-selection">
                    <CurrencySelect
                        width={306}
                        option={currency}
                        setOption={setCurrency}
                        options={currencies}
                    />
                </div>

                <div style={{ marginTop: '25px' }}></div>
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