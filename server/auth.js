import axios from "axios";
const mongoose = require('mongoose');
require('./customFunctions/tokenModel');
const TokenData = mongoose.model('tokendata');
const ObjectId = require('mongodb').ObjectID;

export const handler = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI_DEPLOYC, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });

    const tokenData = await TokenData.findById(process.env.MONGO_TOKEN_ID);

    if (new Date().getTime() > tokenData.expire) {
      console.log('Token expired.');

      const currentTime = new Date().getTime();
      const expirationTime = currentTime + (60 * 60 * 1000 * 12);
      // const expirationTime = currentTime + (1 * 60 * 1000);

      const options = {
        method: 'POST',
        url: 'https://services.leadconnectorhq.com/oauth/token',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        data: {
          client_id: process.env.GOHIGHLEVEL_CLIENT_ID,
          client_secret: process.env.GOHIGHLEVEL_CLIENT_SECRET,
          grant_type: 'refresh_token',
          code: '',
          refresh_token: tokenData.refresh_token
        }
      };

      const response = await axios.request(options);

      await TokenData.updateOne(
        { _id: ObjectId(process.env.MONGO_TOKEN_ID) },
        {
          token: response.data.access_token,
          refresh_token: response.data.refresh_token,
          locationId: response.data.locationId,
          expire: expirationTime
        }
      );

      console.log('Token updated.');

    } else {
      console.log('Token not yet expired.');
    }

    mongoose.disconnect();

    return {
      statusCode: 200,
      body: 'Success',
    };
  } catch (err) {
    console.error(err);
    mongoose.disconnect();

    return {
      statusCode: 400,
      body: err.toString(),
    };
  }
}