import { useNavigate } from "react-router-dom"
import { useEffect, useContext, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { LanguageContext } from "../routes/authRoute"
import Dialog from "../components/general/dialog"
import WelcomeDlg from "../components/general/welcomeDlg"
import Avatar from "../components/general/avatar"
import SignDialog from "../components/general/signDialog"
import { SET_DIALOG_STATE, SET_LOADING_TRUE, SET_USERS } from "../redux/types"
import { RewardIcon } from "../assets/svg"
import { biteAction } from "../redux/actions/biteActions"
import "../assets/styles/homeStyle.scss"

const Home = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const userState = useSelector((state: any) => state.auth)
  const biteState = useSelector((state: any) => state.bite)
  const loadState = useSelector((state: any) => state.load)
  const contexts = useContext(LanguageContext)
  const [openSigninDlg, setOpenSigninDlg] = useState(false)
  const [openWelcomeDlg, setOpenWelcomeDlg] = useState(false)
  const [openWelcomeDlg2, setOpenWelcomeDlg2] = useState(false)

  const { users } = userState
  const { dlgState } = loadState
  const { bites } = biteState

  const showCategories = (categories: any) => {
    let category = ''
    categories.forEach((cate: any, index: any) => {
      category += contexts.CREATOR_CATEGORY_LIST[cate]
      if (index !== categories.length - 1) category += '/'
    })
    return category
  }

  useEffect(() => {
    dispatch(biteAction.getHomeSessions())
  }, [dispatch])

  useEffect(() => {
    if (dlgState.type === 'welcome') {
      if (dlgState.state) {
        setOpenWelcomeDlg(true);
      }
    } else if (dlgState.type === 'welcome2') {
      if (dlgState.state) {
        setOpenWelcomeDlg2(true)
      }
    }
  }, [dlgState, dispatch])

  return (
    <div className="home-wrapper">
      <WelcomeDlg
        display={openWelcomeDlg2}
        exit={() => {
          setOpenWelcomeDlg2(false)
          dispatch({ type: SET_DIALOG_STATE, payload: { type: "", state: false } })
        }}
        wrapExit={() => {
          setOpenWelcomeDlg2(false)
          dispatch({ type: SET_DIALOG_STATE, payload: { type: "", state: false } })
        }}
        buttons={[{
          text: contexts.WELCOME_DLG.OK,
          handleClick: () => {
            setOpenWelcomeDlg2(false)
            dispatch({ type: SET_DIALOG_STATE, payload: { type: "", state: false } })
          }
        }]}
      />
      <SignDialog
        display={openSigninDlg}
        exit={() => { setOpenSigninDlg(false) }}
        wrapExit={() => { setOpenSigninDlg(false) }}
      />
      <Dialog
        display={openWelcomeDlg}
        title="Welcome to Creato"
        exit={() => {
          dispatch({ type: SET_DIALOG_STATE, payload: { type: "", state: false } });
          setOpenWelcomeDlg(false);
        }}
        wrapExit={() => {
          dispatch({ type: SET_DIALOG_STATE, payload: { type: "", state: false } });
          setOpenWelcomeDlg(false);
        }}
        subcontext={true}
        icon={
          {
            pos: 1,
            icon: <RewardIcon color="#EFA058" width="60px" height="60px" />
          }
        }
        buttons={[
          {
            text: "Go",
            handleClick: () => {
              setOpenWelcomeDlg(false);
              dispatch({ type: SET_DIALOG_STATE, payload: { type: "", state: false } });
            }
          }
        ]}
      />
      {(bites.length > 0) &&
        <div className="section" style={{ marginTop: '20px' }}>
          <div className="title">Bite-sized Knowledge 💡</div>
          {/* <div className="see-more" onClick={() => { }}>See More</div> */}
          <div className="daremes scroll-bar">
            {/* {daremes.map((dareme: any, i: any) => (
              <div className="dareme" key={i}>
                <DareMeCard
                  owner={{
                    name: dareme.owner.name,
                    avatar: dareme.owner.avatar,
                    profile: dareme.owner.personalisedUrl,
                    tip: dareme.owner.tipFunction
                  }}
                  item={{
                    id: dareme._id,
                    title: dareme.title,
                    teaser: `${process.env.REACT_APP_SERVER_URL}/${dareme.teaser}`,
                    cover: `${process.env.REACT_APP_SERVER_URL}/${dareme.cover}`,
                    size: dareme.sizeType,
                    leftTime: dareme.time,
                    voters: dareme.voteInfo.length,
                    donuts: dareme.donuts,
                  }}
                  handleSubmit={() => { dispatch({ type: SET_PREVIOUS_ROUTE, payload: '/' }) }}
                />
              </div>
            ))
            } */}
          </div>
        </div>
      }
      {users.length > 0 &&
        <div className="section">
          <div className="title">Creators You Might Like 🎨</div>
          <div className="see-more" onClick={() => { navigate(`/creators`) }}>See More</div>
          <div className="users scroll-bar">
            {users.map((user: any, i: any) => (
              <div key={i}>
                {user.avatar &&
                  <div className="user" onClick={() => {
                    dispatch({ type: SET_USERS, payload: [] })
                    navigate(`/${user ?.personalisedUrl}`)
                  }}>
                    <Avatar
                      avatar={user ?.avatar.indexOf('uploads') !== -1 ? `${process.env.REACT_APP_SERVER_URL}/${user ?.avatar}` : user ?.avatar}
                      size="web"
                      avatarStyle="vertical"
                      category={showCategories(user ?.categories)}
                      username={user ?.name}
                    />
                  </div>
                }
              </div>
            ))}
          </div>
        </div>
      }
    </div>
  );
};

export default Home