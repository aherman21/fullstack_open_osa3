
const express = require('express')
const app = express()

app.use(express.json())

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "044-123456"
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-532523"
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345"
  },
  {
    id: 4,
    name: "Mary Poppendick",
    number: "39-23-6423122"
  }
]

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</>')
})

app.get('/info', (request, response) => {
    len = persons.length
    currentdate = new Date()
    response.send(
      `<p>Phonebook has info for ${len} people</> <p>${currentdate} </>`
    )
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
    

    response.status(204).end()
})

const generateId = () => {
  const newId = Math.floor(Math.random() * 1000)
  return newId
}

app.post('/api/persons', (request, response) => {
  const body = request.body
  names = persons.map(person => person.name)

  if (!body.name) {
    return response.status(400).json({
      error: 'name missing'
    })
  } else if (!body.number) {
    return response.status(400).json({
      error: 'number missing'
    })
  } else if (names.includes(body.name)) {
    return response.status(400).json({
      error: 'name already exists in the phonebook'
    })

  }

  const person = {

    id: generateId(),
    name: body.name,
    number: body.number
  }

  persons = persons.concat(person)
  response.json(person)
})

const PORT = 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)
