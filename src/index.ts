import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

import pantry from 'pantry-node'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

const pantryID = "4b8eeebc-b2e8-404b-808d-da8a45297b77"
const pantryClient = new pantry(pantryID)


// Home route - HTML
app.get('/', (req, res) => {
  // res.type('html').send(`<!doctype html>...`)
  res.sendFile(path.join(__dirname, '..', 'components', 'index.html'))
})

app.get('/about', function (req, res) {
  res.sendFile(path.join(__dirname, '..', 'components', 'about.htm'))
})

// Example API endpoint - JSON
app.get('/api-data', (req, res) => {
  res.json({
    message: 'Here is some sample API data',
    items: ['apple', 'banana', 'cherry'],
  })
})

// pantry test - JSON
app.get('/pantry-test', (req, res) => {
  const payload = {
  animalSounds: {
    goose: 'honk!',
    // dragon: 'RAWRR',
    // kitty: 'mraow',
    // bug: 'chitter'
  }
}

  pantryClient.basket
      //get, create, delete
      .update('test', payload)
      .then((response) => res.send(response))
})


// Health check
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(1080)

export default app


// svo.bz/123 (or abc) (or xyz)

//const ddg = await fetch('https://duckduckgo.com').then(response=>response.text())