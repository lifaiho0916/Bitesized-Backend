import axios from 'axios';
import SocialAccounts from '../models/SocialAccounts';

export const getAccounts = async (req: any, res: any) => {
  try {
    const { userId } = req.params;
    const accounts = await SocialAccounts.find({ user: userId });
    return res.status(200).json({ message: 'Success', data: accounts });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server error!' });
  }
};
export const addAccount = async (req: any, res: any) => {
  try {
    const { id, metadata, userId: user, name } = req.body;
    const accounts = await SocialAccounts.find({ user, name });

    if (accounts.length > 0) {
      const updatedData = await SocialAccounts.findByIdAndUpdate(
        accounts[0]._id,
        {
          $set: {
            id,
            metadata,
          },
        },
        { new: true }
      );
      return res
        .status(200)
        .json({ message: 'Account saved!', data: updatedData });
    }

    const accountInstance = new SocialAccounts({
      id,
      metadata,
      user,
      name,
    });

    const savedAccount = await accountInstance.save();

    return res
      .status(201)
      .json({ message: 'Account connected', data: savedAccount });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server error!' });
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
    await SocialAccounts.findByIdAndRemove(req.params.id);

    return res.status(204).json({ message: 'Account removed' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server error!' });
  }
};
