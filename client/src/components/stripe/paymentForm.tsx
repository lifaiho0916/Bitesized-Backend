import { useEffect, useState, useRef, useContext } from "react"
import axios from "axios"
import { useDispatch } from "react-redux"
import { loadStripe } from "@stripe/stripe-js"
import {
  Elements,
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js"
import ContainerBtn from "../general/containerBtn"
import CurrencySelect from "./CurrencySelect"
import { SET_LOADING_FALSE, SET_LOADING_TRUE } from "../../redux/types";
import { CloseIcon, VisaCardIcon, VisaCardActiveIcon, MasterCardIcon, MasterCardActiveIcon, AECardIcon, AECardActiveIcon, UnionPayCardIcon, UnionPayCardActiveIcon } from "../../assets/svg"
import { LanguageContext } from "../../routes/authRoute"
import { biteAction } from "../../redux/actions/biteActions"
import CONSTANT from "../../constants/constant"
import '../../assets/styles/payment/stripe/checkoutFormStyle.scss'

const stripePromise = loadStripe(`${process.env.REACT_APP_STRIPE_PUBLIC_KEY}`)

const CheckoutForm = (props: any) => {
  const { bite } = props
  const [numberInfo, setNumberInfo] = useState<any>(null)
  const [holder, setHolder] = useState("")
  const dispatch = useDispatch()
  const formRef = useRef<any>(null)
  const stripe = useStripe()
  const elements = useElements()
  const checkBoxRef = useRef(null)
  const [saveCheck, setSaveCheck] = useState(false)
  const [errorToDisplay, setErrorToDisplay] = useState('')
  const context = useContext(LanguageContext)
  const [currency, setCurrency] = useState(0)

  const elementStyle = {
    lineHeight: '42px',
    color: '#54504E'
  }

  const handleSubmit = async (e: any) => {
    try {
      e.preventDefault();
      if (!stripe || !elements) return;
      const cardNumberElement = elements?.getElement(CardNumberElement)
      if (!cardNumberElement) return setErrorToDisplay('No exit card!')
      dispatch({ type: SET_LOADING_TRUE })
      const token = await stripe.createToken(cardNumberElement, { name: holder })
      if (token.error) {
        dispatch({ type: SET_LOADING_FALSE })
        return setErrorToDisplay('' + token.error.message)
      }

      props.exit()

      const response = await axios.get('https://api.striperates.com/rates/usd', {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': `${process.env.REACT_APP_STRIPE_CURRENCY_RATE_API_KEY}`,
        }
      })

      const { data } = response
      const rate1 = bite.currency === 'usd' ? 1.0 : data.data[0].rates[bite.currency]
      const usdAmount = rate1 * bite.price
      const rate2 = currency === 0 ? 1.0 : data.data[0].rates[CONSTANT.PAYMENT_CURRENCIES[currency]]
      dispatch(biteAction.unLockBite(bite.id, CONSTANT.PAYMENT_CURRENCIES[currency], usdAmount, rate2, token.token))
      setErrorToDisplay('')
    } catch (err) {
      console.log(err)
      dispatch({ type: SET_LOADING_FALSE })
    }
  }

  useEffect(() => {
    const cardNumberElement: any = elements?.getElement(CardNumberElement);
    if (cardNumberElement) cardNumberElement.clear();
    const expiryElement: any = elements?.getElement(CardExpiryElement);
    if (expiryElement) expiryElement.clear();
    const cvcElement: any = elements?.getElement(CardCvcElement);
    if (cvcElement) cvcElement.clear();
    setHolder("");
    setSaveCheck(false);
    setErrorToDisplay("");
  }, [props.display]);

  return (
    <div className="stripe-checkout-wrapper" style={props.display ? { visibility: 'visible', opacity: 1 } : {}} onClick={props.exit}>
      <div className="stripe-checkout" onClick={e => e.stopPropagation()}>
        <div className="stripe-header">
          <div className="header-title">
            {/* {context.PAYMENT.BUY_DONUTS} */}
          </div>
          <div onClick={props.exit}>
            <CloseIcon color="black" />
          </div>
        </div>
        <div className="stripe-letter">
          <span>{context.PAYMENT.ENTER_CARDS_DETAIL}</span>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="card-types">
            <div className="letter">
              <span>{context.PAYMENT.CARD_NUMBER}</span>
            </div>
            <div className="card-type">
              <div className="card">{numberInfo && numberInfo.brand === "visa" ? numberInfo.error?.code !== "invalid_number" ? <VisaCardActiveIcon /> : <VisaCardIcon /> : <VisaCardIcon />}</div>
              <div className="card">{numberInfo && numberInfo.brand === "mastercard" ? numberInfo?.error?.code !== "invalid_number" ? <MasterCardActiveIcon /> : <MasterCardIcon /> : <MasterCardIcon />}</div>
              <div className="card">{numberInfo && numberInfo.brand === "amex" ? numberInfo.error?.code !== "invalid_number" ? <AECardActiveIcon /> : <AECardIcon /> : <AECardIcon />}</div>
              <div className="card">{numberInfo && numberInfo.brand === "unionpay" ? numberInfo.error?.code !== "invalid_number" ? <UnionPayCardActiveIcon /> : <UnionPayCardIcon /> : <UnionPayCardIcon />}</div>
            </div>
          </div >
          <div className="card-number">
            <CardNumberElement
              onChange={(e) => { setNumberInfo(e) }}
              options={{
                style: {
                  base: elementStyle,
                },
              }}
            />
          </div>
          <div className="card-holder-name">
            <div className="letter">
              <span>{context.PAYMENT.CARD_HOLDER_NAME}</span>
            </div>
            <div className="holder-name">
              <input
                value={holder}
                onChange={(e: any) => { setHolder(e.target.value) }}
                placeholder={context.PAYMENT.CARD_HOLDER_NAME}
              />
            </div>
          </div>
          <div className="expire-cvv">
            <div className="expire">
              <div className="letter">
                {context.PAYMENT.EXPIRY_DATE}
              </div>
              <div className="expire-ele">
                <CardExpiryElement
                  options={{
                    style: {
                      base: elementStyle,
                    },
                  }}
                />
              </div>
            </div>
            <div className="cvv">
              <div className="letter">
                {context.PAYMENT.CVC}
              </div>
              <div className="cvv-ele">
                <CardCvcElement
                  options={{
                    style: {
                      base: elementStyle,
                    },
                  }}
                />
              </div>
            </div>
          </div>
          {/* {props.tipData === undefined &&
            <div className="check-box">
              <label className="checkbox">
                <input type="checkbox" id="save_card" ref={checkBoxRef} checked={saveCheck} onChange={(e) => { setSaveCheck(e.target.checked) }} />
                <span className="letter">&nbsp;{context.PAYMENT.SAVE_CARD_INFO}</span>
              </label>
            </div>
          } */}
          <div className="error-letter">
            <span>{errorToDisplay ? errorToDisplay : null}</span>
          </div>
          <div style={{ border: '1px solid #E1E0DF', margin: '10px 0px 30px 0px' }}></div>
          <div className="select-currency">
            <span>{context.PAYMENT.SELECT_CURRENCY}</span>
          </div>
          <div style={{ marginBottom: '30px' }}>
            <CurrencySelect
              label={context.PAYMENT.YOU_WILL_PAY_IN}
              options={context.PAYMENT_CURRENCIES}
              setOption={setCurrency}
              option={currency}
              width={'100%'}
            />
          </div>
          <div className="pay-button">
            <div style={{ width: '250px' }} onClick={() => { formRef.current.click(); }}>
              <ContainerBtn text={context.PAYMENT.PAY} styleType="fill" />
              <input type="submit" hidden ref={formRef} />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

const PaymentForm = (props: any) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  )
}

export default PaymentForm;