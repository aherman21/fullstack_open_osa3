
require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

const Person = require('./models/person')
require('process')
require('console')


const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message })
  }

  next(error)
}

const unknwonEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(cors())
app.use(express.json())
app.use(express.static('dist'))

morgan.token('body', function (req) {return JSON.stringify(req.body)})

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

app.get('/info', async (request, response) => {
  const date = new Date()
  // get the number of people in the phonebook
  const count = await Person.countDocuments({})
  response.send(`<p>Phonebook has info for ${count} people</p><p>${date}</p>`)
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
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

// updating person
app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body


  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidators: true, context: 'query' }
  )
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})


app.post('/api/persons', (request, response, next) => {
  const body = request.body

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save()
    .then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => next(error))
})

app.use(unknwonEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT
const url = process.env.MONGODB_URI
console.log('connecting to', url)
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

