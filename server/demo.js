import axios from "axios";

require('dotenv').config()
const mongoose = require('mongoose')
require('./customFunctions/tokenModel')
const TokenData = mongoose.model('tokendata')

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

exports.handler = async (event, context) => {
  console.log('--------------')
  try {
    await mongoose.connect(process.env.MONGODB_URI_DEPLOYC, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    })

    const tokenData = await TokenData.findById(process.env.MONGO_TOKEN_ID);

    const params = new URLSearchParams(event.body);
    const name = decodeURIComponent(params.get('name'));
    const email = decodeURIComponent(params.get('email'));
    const phone = decodeURIComponent(params.get('pnumber'));
    const companyName = decodeURIComponent(params.get('cname'));

    const options1 = {
      method: 'POST',
      url: 'https://services.leadconnectorhq.com/contacts/',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + tokenData.token,
        Version: '2021-04-15'
      },
      data: {
        name,
        email,
        locationId: tokenData.locationId,
        phone,
        customFields: [{ id: 'company_name', field_value: companyName }]
      }
    };

    const response1 = await axios.request(options1);
    const contactId = response1.data.contact.id;

    const options2 = {
      method: 'POST',
      url: 'https://services.leadconnectorhq.com/opportunities/',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + tokenData.token,
        Version: '2021-04-15'
      },
      data: {
        pipelineId: process.env.PIPE_LINE_ID,
        locationId: tokenData.locationId,
        name: 'Opportunity 1',
        pipelineStageId: process.env.PIPE_LINE_STAGE_ID,
        status: 'open',
        contactId
      }
    };

    const response2 = await axios.request(options2);

    mongoose.disconnect()

    return {
      statusCode: 301,
      headers: { Location: '/calendar.html' }
    }
  } catch (error) {
    console.error(error);
    mongoose.disconnect();
    
    return {
      statusCode: 400,
      body: '',
    }
  }
}