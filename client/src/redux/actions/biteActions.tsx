import { Dispatch } from "redux"
import * as api from "../../api"

export const biteAction = {
    saveBite: (bite: any) => async (dispatch: Dispatch<any>) => {
        try {
            const formData = new FormData()
            formData.append("file", bite.videos[0].videoUrl)
            const config = { headers: { "content-type": "multipart/form-data" } }
            await api.uploadVideo(formData, config)
        } catch (err) {
            console.log(err)
        }
    }
    // getDraftDareme: (navigate: any) => async (dispatch: Dispatch<any>) => {
    //   dispatch({ type: SET_LOADING_TRUE });
    //   api.getDraftDareme()
    //     .then((result) => {
    //       const { data } = result;
    //       dispatch({ type: SET_DAREME_INITIAL });
    //       if (data.isDraft) dispatch({ type: SET_DAREME, payload: data.dareme });
    //       navigate('/dareme/create');
    //       dispatch({ type: SET_LOADING_FALSE });
    //     })
    //     .catch((err) => console.log(err));
    // },
}