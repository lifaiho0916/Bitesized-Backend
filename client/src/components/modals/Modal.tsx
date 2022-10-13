import { CloseIcon } from "../../assets/svg"
import "../../assets/styles/modals/ModalStyle.scss"

const Modal = (props: any) => {
    const { show, title, child, onClose } = props

    return (
        <div className={`modal${show ? ' show' : ''}`} onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <span>{title ? title : ''}</span>
                    <div className="close-btn" onClick={onClose}>
                        <CloseIcon color="black" width={30} height={30} />
                    </div>
                </div>
                <div className="modal-body">
                    {child}
                </div>
            </div>
        </div>
    )
}

export default Modal