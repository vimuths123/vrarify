const mongoose = require('mongoose')
const { Schema } = mongoose

const tokenSchema = new Schema({
  token: String,
  refresh_token: String,  
  locationId: String,  
  expire: String,  
})

mongoose.model('tokendata', tokenSchema)
