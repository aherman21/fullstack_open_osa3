
require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/person')


app.use(express.json())
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

app.use(cors())
app.use(express.static('dist'))

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

app.get('/api/persons/:id', (request, response) => {
    Person.findById(request.params.id).then(person => {
        response.json(person)
    })
})

// app.delete('/api/persons/:id', (request, response) => {
//     const id = Number(request.params.id)
//     persons = persons.filter(person => person.id !== id)
    

//     response.status(204).end()
// })


app.post('/api/persons', (request, response) => {
  const body = request.body

  if (body.name === undefined || body.number === undefined) {
    return response.status(400).json({
      error: 'name or number missing'
    })
  // } else if (!body.number) {
  //   return response.status(400).json({
  //     error: 'number missing'
  //   })
  // } else if (names.includes(body.name)) {
  //   return response.status(400).json({
  //     error: 'name already exists in the phonebook'
  //   })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save().then(savedPerson => {
    response.json(savedPerson)
  })
})

const PORT = process.env.PORT
const url = process.env.MONGODB_URI
console.log('connecting to', url)
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

