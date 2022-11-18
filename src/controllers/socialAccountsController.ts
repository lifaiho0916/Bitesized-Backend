import axios from 'axios';
import SocialAccounts from '../models/SocialAccounts';

export const getAccount = async (req: any, res: any) => {
  try {
    const { userId } = req.body;
    const account = await SocialAccounts.findOne({ user: userId });
    return res.status(200).json({ success: true, payload: { socialAccout: account } });
  } catch (error) {
    console.log(error)
  }
};
export const addAccount = async (req: any, res: any) => {
  try {
    const { type, userId, socialId } = req.body;
    const account = await SocialAccounts.findOne({ user: userId })

    if (type === 'youtube') {
      let resData: any
      if (account) resData = await SocialAccounts.findByIdAndUpdate(account._id, { "social.youtube": socialId }, { new: true })
      else {
        const newData = new SocialAccounts({
          social: { youtube: socialId },
          user: userId
        })
        resData = await newData.save()
      }
      return res.status(200).json({ success: true, payload: { socialAccout: resData }})
    } else if ( type === 'instagram' ) {

    }
  } catch (err) {
    console.log(err)
  }
};

export const setInstagramUsername = async (req: any, res: any, next: any) => {
  if (!req.body.name || req.body.name !== 'instagram') return next();

  try {
    const { id: code, metadata } = req.body;
    const { redirect_uri } = JSON.parse(metadata);

    const findData = await SocialAccounts.find({ id: code });

    if (findData.length > 0) {
      return res
        .status(200)
        .json({ message: 'Account connected', data: findData[0] });
    }

    const {
      data: { access_token },
    } = await getInstagramAccessToken(code, redirect_uri);

    const url = `https://graph.instagram.com/me?fields=username&access_token=${access_token}`;

    const { data: profile } = await axios.get(url);

    const parseMetaData = JSON.parse(metadata);
    parseMetaData.username = profile.username || null;

    req.body.metadata = JSON.stringify(parseMetaData);

    return next();
  } catch (error: any) {
    console.error(error.message);
    next();
  }
};

const getInstagramAccessToken = async (code: any, redirect_uri: any) => {
  const { INSTAGRAM_APP_ID, INSTAGRAM_SECRET_ID } = process.env;
  const id: any = INSTAGRAM_APP_ID;
  const secret: any = INSTAGRAM_SECRET_ID;
  const data = new URLSearchParams();
  console.log(redirect_uri);
  data.append('client_id', id);
  data.append('client_secret', secret);
  data.append('code', code);
  data.append('redirect_uri', redirect_uri);
  data.append('grant_type', 'authorization_code');

  const config = {
    url: 'https://api.instagram.com/oauth/access_token/',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };

  return await axios(config);
};

export const deleteAccount = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { social } = req.query;

    let resData: any
    if(social === 'youtube') resData = await SocialAccounts.findByIdAndUpdate(id, { "social.youtube": null }, { new: true })
    else if(social === "instagram") resData = await SocialAccounts.findByIdAndUpdate(id, { "social.instagram": null }, { new: true })

    return res.status(200).json({ success: true, payload: { socialAccout: resData } })
  } catch (error) {
    console.log(error)
  }
};
