const mongoose = require('mongoose')
const { Schema } = mongoose

const demoSchema = new Schema({
  // first_name: String,
  // last_name: String,
  name: String,
  email: String,
  phone_number: String,
  company_name: String,
  // company_size: String,
  
})

mongoose.model('chats', demoSchema)
