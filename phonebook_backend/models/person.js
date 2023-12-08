const mongoose = require('mongoose')

const url = process.env.MONGODB_URI
console.log('connecting to', url)

mongoose.set('strictQuery',false)
mongoose.connect(url)
  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

function validator_length (val) {
    return val.length >= 8
}
function validator_format (val) {
    if (val.includes('-')) {
        const parts = val.split('-');
        // console.log(parts)
        // console.log("number format: ",/^\d+$/.test(parts[0]))
        // console.log("number format: ",/^\d+$/.test(parts[1]))
        if(parts.length > 2) return false  // only two parts
        if(parts[0].length < 2 || parts[0].length > 3) return false // xx-xxxx.. or xxx-xxxxx...
        if(/^\d+$/.test(parts[1]) && /^\d+$/.test(parts[0])) return true // number format
    } 
    return false
}
const validators = [
    { validator: validator_length, message: 'Number must have at least 8 characters' }
  , { validator: validator_format, message: 'Wrong format, should be xx-xxxxx or xxx-xxxx' }
]

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true
  },
  number: {
    type: String,
    validate: validators
  }
})

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString()
      delete returnedObject._id
      delete returnedObject.__v
      
    }
  })

module.exports = mongoose.model('Person', personSchema)
