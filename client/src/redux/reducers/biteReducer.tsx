import * as actionTypes from '../types'

const INITIAL_STATE: any = {
    bite: {
        title: null,
        price: null,
        currency: null,
        videos: []
    },
    bites: []
}

const biteReducer = (state: any = INITIAL_STATE, action: any) => {
    const { payload = null } = action

    switch (action.type) {
        case actionTypes.SET_BITE:
            return {
                ...state,
                bite: payload
            }
        case actionTypes.SET_BITES:
            return {
                ...state,
                bites: payload
            }
        case actionTypes.SET_BITE_INITIAL:
            return {
                bite: {
                    title: null,
                    price: null,
                    currency: null,
                    videos: []
                },
                bites: []
            }
        default:
            return state
    }
}

export default biteReducer