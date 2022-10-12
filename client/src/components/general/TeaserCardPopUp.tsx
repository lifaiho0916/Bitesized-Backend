import { useState, useRef, useLayoutEffect, useEffect } from "react"
import ReactPlayer from "react-player"
import { MuteVolumeIcon, UnMuteVolumeIcon, StopIcon, CloseIcon } from "../../assets/svg"
import "../../assets/styles/TeaserCardPopUpStyle.scss"

const useWindowSize = () => {
  const [size, setSize] = useState(0)
  useLayoutEffect(() => {
    const updateSize = () => { setSize(window.innerWidth) }
    window.addEventListener("resize", updateSize)
    updateSize()
    return () => window.removeEventListener("resize", updateSize)
  }, [])
  return size
}

const TeaserCardPopUp = (props: any) => {
  const width = useWindowSize()
  const { teaser, display, exit } = props
  const [play, setPlay] = useState(true)
  const playerRef = useRef<ReactPlayer | null>(null)

  useEffect(() => {
    if (display) {
      setPlay(true)
      if (playerRef) playerRef.current?.seekTo(0)
    }
  }, [display])

  return (
    <div className="teaser-pop-up-wrapper" style={display ? { visibility: 'visible', opacity: 1 } : {}}>
      <div className="teaser-main-wrapper"
        style={{ width: `${width > 500 ? 500 : width}px`, height: `${(width > 500 ? 500 : width) * 1.71}px` }}
        onClick={() => { setPlay(!play) }}>
        <ReactPlayer
          className="react-player"
          config={{
            file: {
              attributes: {
                controlsList: 'nodownload noremoteplayback noplaybackrate',
                disablePictureInPicture: true,
              }
            }
          }}
          ref={playerRef}
          url={teaser}
          muted={true}
          playing={play}
          playsinline={true}
          controls
          onProgress={(progress) => {
            if (progress.playedSeconds >= progress.loadedSeconds) playerRef.current?.seekTo(0);
          }}
        />
        <div className="exit-icon" onClick={(e) => {
          e.stopPropagation()
          exit()
        }}>
          <CloseIcon color="white" />
        </div>
      </div>
    </div>
  )
}

export default TeaserCardPopUp