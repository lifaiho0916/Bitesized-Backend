import { useState, useRef } from "react"
import ReactPlayer from "react-player"
import { MuteVolumeIcon, UnMuteVolumeIcon, PlayIcon } from "../../assets/svg"
import "../../assets/styles/TeaserCardStyle.scss"

const TeaserCard = (props: any) => {
  const { cover, teaser, type, border } = props
  const [play, setPlay] = useState(false)
  const [muted, setMuted] = useState(true)
  const playerRef = useRef<ReactPlayer | null>(null)

  return (
    <div className="teaser-wrapper"
      onClick={() => {
        if (play) {
          setPlay(false)
          setMuted(true)
          playerRef.current ?.seekTo(0)
        }
      }}
    >
      {(cover && !play) &&
        <div className="cover-image" style={{ borderRadius: border ? border : '0px' }}>
          <img
            src={cover}
            alt="cover Image"
            width={'100%'}
          />
        </div>
      }
      {play &&
        <>
          <ReactPlayer
            className="react-player"
            style={{ borderRadius: border ? border : '0px' }}
            ref={playerRef}
            url={teaser}
            muted={muted}
            playing={play}
            playsinline={true}
            onProgress={(progress) => {
              if (progress.playedSeconds >= progress.loadedSeconds) playerRef.current ?.seekTo(0);
            }}
          />
          <div className="mute-icon" onClick={(e) => {
            e.stopPropagation()
            setMuted(!muted)
          }}>
            {muted === true ? <MuteVolumeIcon color="white" /> : <UnMuteVolumeIcon color="white" />}
          </div>
        </>
      }
      {!play &&
        <div className={`play-icon-${type}`} onClick={() => { setPlay(true) }}>
          <PlayIcon color="white" />
        </div>
      }
    </div>
  )
}

export default TeaserCard