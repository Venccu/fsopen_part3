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


let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]
 

  
  app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)

    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
  })

  app.get('/api/info',(request, response) => {
    
    response.send(`<p>Phonebook currently has ${persons.length} people </p>
    <p>${new Date()}</p>`);
    
  })

  app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
  
    response.status(204).end()
  })
  
  app.get('/api/persons', (request, response) => {
    //response.json(persons)
    Person.find({}).then(person => {
        response.json(person)
      })
  })

  const generateId = () => {
    const maxId = 10000
    return Math.floor(Math.random()*maxId)
  }


  morgan.token('logContent', function logContent (req, res) { 
    if(Object.keys(req.body).length > 0) return JSON.stringify(req.body) 
})
  
  app.post('/api/persons', (request, response) => {
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
  
  
  })
  
  
  const PORT = process.env.PORT || 3001
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })