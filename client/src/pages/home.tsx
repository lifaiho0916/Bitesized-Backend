import { useNavigate, useLocation } from "react-router-dom"
import { useEffect, useContext, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { LanguageContext } from "../routes/authRoute"
import Avatar from "../components/general/avatar"
import BiteCardHome from "../components/bite/BiteCardHome"
import SignDialog from "../components/general/signDialog"
import { SET_USERS } from "../redux/types"
import { biteAction } from "../redux/actions/biteActions"
import "../assets/styles/homeStyle.scss"

const Home = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const userState = useSelector((state: any) => state.auth)
  const biteState = useSelector((state: any) => state.bite)
  const contexts = useContext(LanguageContext)
  const [openSigninDlg, setOpenSigninDlg] = useState(false)

  const { users } = userState
  const { bites } = biteState

  const showCategories = (categories: any) => {
    let category = ''
    categories.forEach((cate: any, index: any) => {
      category += contexts.CREATOR_CATEGORY_LIST[cate]
      if (index !== categories.length - 1) category += '/'
    })
    return category
  }
  const gotoCreators = () => { navigate('/creators') }
  const gotoCreatoProfile = (url: any) => {
    dispatch({ type: SET_USERS, payload: [] })
    navigate(url)
  }
  useEffect(() => { dispatch(biteAction.getHomeSessions()) }, [location, dispatch])

  return (
    <div className="home-wrapper">
      <SignDialog
        display={openSigninDlg}
        exit={() => { setOpenSigninDlg(false) }}
        wrapExit={() => { setOpenSigninDlg(false) }}
      />
      {bites.length > 0 &&
        <div className="section" style={{ marginTop: '20px' }}>
          <div className="title">Bite-sized Knowledge 💡</div>
          <div className="daremes scroll-bar">
            {bites.map((bite: any, i: any) => (
              <div className="dareme" key={i}>
                <BiteCardHome bite={bite} />
              </div>
            ))
            }
          </div>
        </div>
      }
      {users.length > 0 &&
        <div className="section">
          <div className="title">Creators You Might Like 🎨</div>
          <div className="see-more" onClick={gotoCreators}>See More</div>
          <div className="users scroll-bar">
            {users.map((user: any, index: any) => (
              <div key={index} className="user" onClick={() => gotoCreatoProfile(`/${user.personalisedUrl}`)}>
                <Avatar
                  avatar={user.avatar.indexOf('uploads') !== -1 ? `${process.env.REACT_APP_SERVER_URL}/${user.avatar}` : user.avatar}
                  size="web"
                  avatarStyle="vertical"
                  category={showCategories(user.categories)}
                  username={user.name}
                />
              </div>
            ))}
          </div>
        </div>
      }
    </div >
  )
}

export default Home