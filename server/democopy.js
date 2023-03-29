// const axios = require('axios');
import axios from "axios";

require('dotenv').config()
const mongoose = require('mongoose')
require('./customFunctions/tokenModel')
const TokenData = mongoose.model('tokendata')
const shortid = require('shortid')
let saslprep;
saslprep = require('saslprep');
// import Toastify from 'toastify-js'

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

exports.handler = async (event, context) => {
  // console.log(event);
  const array = event.body.split('&')
  // const firstName = array[0].split('fname=')
  // const lastName = array[1].split('lname=')

  const name = array[0].split('name=')
  const email = array[1].split('email=')
  const phone = array[2].split('pnumber=')
  const companyName = array[3].split('cname=')
  // const companySize = array[3].split('field=')

  // const a = decodeURIComponent(firstName[1])
  // const b = decodeURIComponent(lastName[1])
  const a = decodeURIComponent(name[1])
  const b = decodeURIComponent(email[1])
  const c = decodeURIComponent(phone[1])
  const d = decodeURIComponent(companyName[1])
  // const d = decodeURIComponent(companySize[1])


  // Get token from mongoose
  try {
    await mongoose.connect('mongodb+srv://root:cdzleap@cluster0.xixnf.mongodb.net/?retryWrites=true&w=majority', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    })

    let tokenData;

    await TokenData.findById('6419c56b2579cb000809cc30', (err, tdata) => {
      if (err) {
        console.log(err); // handle the error
      } else {
        tokenData = tdata
      }
    });

    // console.log(a)
    // console.log(b)
    // console.log(c)
    // console.log(d)


    const options = {
      method: 'POST',
      url: 'https://services.leadconnectorhq.com/contacts/',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + tokenData.token,
        Version: '2021-04-15'
      },
      data: {
        name: a,
        email: b,
        locationId: tokenData.locationId,
        phone: c,
        customFields: [{ id: 'company_name', field_value: d }]
      }
    };

    await axios.request(options).then(async (response) => {
      console.log('---------------')

      console.log(response.data);
      var contact = await response.data;

      console.log("con id ="+response.data.contact.id)

      const options2 = {
        method: 'POST',
        url: 'https://services.leadconnectorhq.com/opportunities/',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + tokenData.token,
          Version: '2021-04-15'
        },
        data: {
          pipelineId: 'Msh7bxNE145rV5yQ2YRB',
          locationId: tokenData.locationId,
          name: 'Opportunity 1',
          pipelineStageId: 'be5521fc-12e4-4064-8d5c-6a452b39ffdb',
          status: 'open',
          contactId: response.data.contact.id
        }
      };

      await axios.request(options2).then(function (response2) {
        console.log(response2.data);
      }).catch(function (error2) {
        console.error(error2);
      });

      console.log('---------------')
    }).catch(function (error) {
      console.log('---------------')
      console.error(error);
      console.log('---------------')
    });

    mongoose.disconnect()
    return {
      statusCode: 301,
      headers: {
        Location: '/calendar.html'
      }
    }
  } catch (error) {
    // console.log(error)
  }




  return {
    statusCode: 400,
    body: '',
  }


  // send to gohighlevel


  // try {
  //   mongoose.connect(process.env.MONGODB_URI_DEPLOYC, {
  //     useNewUrlParser: true,
  //     useUnifiedTopology: true,
  //     useFindAndModify: false,
  //   })

  //   const shortIdVariable = shortid.generate()

  //   const user = await new User({
  //     referralId: shortIdVariable,
  //     // first_name: a,
  //     // last_name: b,
  //     name: a,
  //     email: b,
  //     phone_number: c,
  //     company_name: d,
  //     // company_size: d,
  //   })

  //   await user.save()
  //   mongoose.disconnect()
  //   return {
  //     statusCode: 200,
  //     body: 'Success',
  //   }
  // } catch (err) {
  //   return {
  //     statusCode: 400,
  //     body: err,
  //   }
  // }
}
