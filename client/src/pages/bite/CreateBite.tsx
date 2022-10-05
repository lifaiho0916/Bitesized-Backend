import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Input from "../../components/general/input"
import CurrencySelect from "../../components/stripe/CurrencySelect"
import { AddIcon, BackIcon } from "../../assets/svg"
import "../../assets/styles/bite/CreateBiteStyle.scss"

const CreateBite = (props: any) => {
    const navigate = useNavigate()
    const [title, setTitle] = useState('')
    const [price, setPrice] = useState('')
    const [currency, setCurrency] = useState(0)

    const gotoHome = () => { navigate('/') }

    return (
        <div className="create-bite-wrapper">
            <div className="page-header">
                <div onClick={gotoHome}><BackIcon color="black" /></div>
                <div className="page-title"><span>Posting on Bite</span></div>
                <div></div>
            </div>
            <div className="create-bite">
                <div className="uploaded-vidoes">
                    <div className="uploaded-video">
                        <div className="upload-video-btn">
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
                        options={['USD', 'INR', 'TWD', 'HKD', 'MYR']}
                    />
                </div>

            </div>
        </div>
    )
}

export default CreateBite