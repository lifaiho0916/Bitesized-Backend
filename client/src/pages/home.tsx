import { useNavigate, useLocation } from "react-router-dom"
import { useEffect, useContext, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { LanguageContext } from "../routes/authRoute"
import Avatar from "../components/general/avatar"
import BiteCardHome from "../components/bite/BiteCardHome"
import Dialog from "../components/general/dialog"
import { SET_DIALOG_STATE, SET_USERS } from "../redux/types"
import { biteAction } from "../redux/actions/biteActions"
import "../assets/styles/homeStyle.scss"
import { RewardIcon } from "../assets/svg"

const Home = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const userState = useSelector((state: any) => state.auth)
  const biteState = useSelector((state: any) => state.bite)
  const loadState = useSelector((state: any) => state.load)
  const contexts = useContext(LanguageContext)
  const [title, setTitle] = useState("")
  const [openFreeUnlock, setOpenFreeUnLock] = useState(false)

  const { users } = userState
  const { bites } = biteState
  const { dlgState } = loadState

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

  const exitUnLockFree = () => {
    setOpenFreeUnLock(false)
    dispatch({ type: SET_DIALOG_STATE, payload: "" })
  }

  useEffect(() => { dispatch(biteAction.getHomeSessions()) }, [location, dispatch])
  useEffect(() => {
    if(dlgState === 'unlock_free') setOpenFreeUnLock(true)
  }, [dlgState])

  return (
    <div className="home-wrapper">
      <Dialog
        display={openFreeUnlock}
        title="Sucessful"
        icon={{
          pos: 1,
          icon: <RewardIcon color="#efa058" width={70} height={70} />
        }}
        subTitle="You have unlock this FREE Bite"
        context={title}
        exit={exitUnLockFree}
        wrapExit={exitUnLockFree}
        buttons={[
          {
            text: 'Check on profile',
            handleClick: () => { alert('asdfsd') }
          }
        ]}
      />
      {bites.length > 0 &&
        <div className="section" style={{ marginTop: '20px' }}>
          <div className="title">Bite-sized Knowledge 💡</div>
          <div className="daremes scroll-bar">
            {bites.map((bite: any, i: any) => (
              <div className="dareme" key={i}>
                <BiteCardHome bite={bite} setTitle={setTitle} />
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