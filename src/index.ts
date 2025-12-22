import express from 'express'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import { readFile } from 'fs/promises'
import {rando, randoSequence} from '@nastyox/rando.js';

import pantry from 'pantry-node'

import constellateRSS from './constellateRSS/index.js'

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

app.get('/favicon.png', async function (req, res) {
  const randoFavicon = rando(1000000)
  const response = await fetch(`http://www.strangebanana.com/api/icon/${randoFavicon}`);
  const favicon = await response.arrayBuffer();
    
  res.setHeader('Content-Type', 'image/png');
  res.send(Buffer.from(favicon));
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
      .then((response:any) => res.send(response))
})


app.get('/rss-test', async (req, res) => {
  var htmlNews = await constellateRSS(['the_intercept', 'truthout', 'common_dreams', 'mondoweiss', 'zeteo', 'npr', 'the_guardian', 'the_electronic_intifada', 'the_nation', 'drop_site_news', 'in_these_times', 'dissent_magazine', 'mother_jones', 'al_jazeera'])
  var randoFavicon = rando(1000000)
  var pageHTML:any = await readFile(path.join(__dirname, '..', 'components', 'news.html'))
  pageHTML = pageHTML.toString().replace('THE_NEWS_GOES_HERE', htmlNews)
  pageHTML = pageHTML.replace('RANDOM_ICON_NUMBER_GOES_HERE', randoFavicon)
  res.type('html').send(pageHTML)
})


// Health check
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
})


app.listen(1080)

export default app


// svo.bz/123 (or abc) (or xyz)