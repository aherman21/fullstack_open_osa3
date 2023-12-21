
require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

const Person = require('./models/person')
const { allowedNodeEnvironmentFlags } = require('process')


const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({error: 'malformatted id'})
  }
  next(error)
}

const unknwonEndpoint = (request, response) => {
  response.status(404).send({error: 'unknown endpoint'})
}

app.use(cors())
app.use(express.json())
app.use(express.static('dist'))

morgan.token('body', function (req, res) {return JSON.stringify(req.body)})

app.use(morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    tokens.body(req, res)
  ].join(' ')
}))

app.get('/', (request, response) => {
    response.send('<h1>Phonebook</>')
})

app.get('/info', (request, response) => {
    const date = new Date()
    const people = persons.length
    response.send(`<p>Phonebook has info for ${people} people</p><p>${date}</p>`)
})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id).
      then(person => {
        response.json(person)
    })
    .catch(error => next(error))
})

// deleting person

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
  .then(result => {
    response.status(204).end()
  })
  .catch(error => next(error))
})


app.post('/api/persons', (request, response) => {
  const body = request.body

  if (body.name === undefined || body.number === undefined) {
    return response.status(400).json({
      error: 'name or number missing'
    })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save().then(savedPerson => {
    response.json(savedPerson)
  })
})


app.use(unknwonEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT
const url = process.env.MONGODB_URI
console.log('connecting to', url)
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

