require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')
const app = express()
app.use(express.static('dist'))
app.use(cors())
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :logContent'))


app.get('/api/info',(request, response, next) => {

  Person.find({}).then(result => {
    response.send(`<p>Phonebook currently has ${result.length} people </p>
    <p>${new Date()}</p>`)
  })
    .catch(error => next(error))
})

//   app.delete('/api/persons/:id', (request, response) => {
//     const id = Number(request.params.id)
//     persons = persons.filter(person => person.id !== id)
//     response.status(204).end()
//   })

app.delete('/api/persons/:id', (request, response, next) => {
  console.log(request.params)
  Person.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {

  const id = request.params.id
  Person.findById(id).then(person => {
    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
  })
    .catch(error => next(error))
    //const id = Number(request.params.id)
    // const person = persons.find(person => person.id === id)
    // if (person) {
    //   response.json(person)
    // } else {
    //   response.status(404).end()
    // }
})

app.get('/api/persons', (request, response) => {
  //response.json(persons)
  Person.find({}).then(person => {
    response.json(person)
  })
})

// const generateId = () => {
//   const maxId = 10000
//   return Math.floor(Math.random()*maxId)
// }

morgan.token('logContent', function logContent (req) { //res) {
  if(Object.keys(req.body).length > 0) return JSON.stringify(req.body)
})

app.put('/api/persons/:id', (request, response, next) => {

  const { name, number } = request.body

  Person.findByIdAndUpdate(request.params.id, { name, number },
    { new: true, runValidators: true, context: 'query' }
  )
    .then(updatedP => {
      response.json(updatedP)
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (!body.number) {
    return response.status(400).json({
      error: 'number missing'
    })
  }

  if (!body.name) {
    return response.status(400).json({
      error: 'name missing'
    })
  }

  // if (persons.map(n=>n.name).includes(body.name)) {
  //     return response.status(400).json({
  //       error: 'Name is already in phonebook'
  //     })
  //   }

  const person = new Person ({
    // id: generateId(),
    name: body.name,
    number: body.number,
  })
  //persons = persons.concat(person)
  //response.json(person)
  person.save().then(savedPerson => {
    response.json(savedPerson)
  })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)


const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  console.log('error is of type',error.name)
  next(error)
}

// this has to be the last loaded middleware.
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})