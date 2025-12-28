import express from 'express'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import { readFile } from 'fs/promises'
import {rando, randoSequence} from '@nastyox/rando.js';

import pantry from 'pantry-node'

import fetchNews from './fetchNews/index.js'
import disclosureHtml from './disclosureHtml.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

const pantryID = "4b8eeebc-b2e8-404b-808d-da8a45297b77"
const pantryClient = new pantry(pantryID)

const sourcesObj:any = {
  the_nation: {url: 'https://thenation.com/feed/?post_type=article', vp: 'GN'},
  npr: {url: 'https://feeds.npr.org/1001/rss.xml', vp: 'GN'},
  the_guardian: {url: 'https://theguardian.com/us/rss', vp: 'GN'},
  the_electronic_intifada: {url: 'https://electronicintifada.net/rss.xml', vp:'GS'},
  drop_site_news: {url: 'https://www.dropsitenews.com/feed', vp: 'GN'},
  in_these_times: {url: 'https://inthesetimes.com/rss', vp: 'GN'},
  dissent_magazine: {url: 'https://dissentmagazine.org/feed/', vp: 'GN'},
  mother_jones: {url: 'https://www.motherjones.com/feed', vp: 'GN'},
  al_jazeera: {url: 'https://www.aljazeera.com/xml/rss/all.xml', vp: 'GS'},
  counterpunch: {url: 'https://counterpunch.org/feed', vp: 'GN'},
  international_viewpoint: {url: 'https://internationalviewpoint.org/spip.php?page=backend', vp: 'GS'},
  its_going_down: {url: 'https://itsgoingdown.org/feed/', vp: 'GS'},
  human_rights_watch: {url: 'https://www.hrw.org/rss/news', vp: 'GS'},
  haitian_times: {url: 'http://haitiantimes.com/feed/', vp: 'GS'},
  woy_magazine: {url: 'https://woymagazine.com/feed/', vp: 'GN'},
  truthout: {url: 'https://truthout.org/latest/feed/', vp: 'GN'}
}
const sourcesUrlArr = Object.values(sourcesObj)

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


app.get('/news', async (req:any, res) => {
  const query = req.url.split('q=')[1]
  var sources:any = Object.keys(req.query);
  sources.pop()
  sources = sources.length ? sources : undefined
  var sourceNames
  if (sources) {
    sourceNames = Array.from(sources)
    for (let i = 0; i < sources.length; i++) {
      let source = sources[i]
      sources[i] = sourcesObj[source]
    }
    var htmlNews = await fetchNews(query, sources ? sources : sourcesUrlArr)
  }
  var disclosureHTML = disclosureHtml(sourceNames, sourcesObj)
  var pageHTML:any = await readFile(path.join(__dirname, '..', 'components', 'news.html'))
  pageHTML = pageHTML.toString().replace('SOURCES_GO_HERE', disclosureHTML)
  var isAllSources = (sources?.length === sourcesUrlArr.length)
  pageHTML = pageHTML.toString().replace(' maybe-super-checked', isAllSources ? ' checked' : '')
  pageHTML = pageHTML.toString().replace('QUERY_GOES_HERE', query ? query : '')
  pageHTML = pageHTML.toString().replace('THE_NEWS_GOES_HERE', htmlNews ? htmlNews : 'Search for something!')
  pageHTML = pageHTML.replace('/favicon.png', '/favicon.png?'+rando(9999))//attempts to trick browsers into refreshing favicon cache
  res.type('html').send(pageHTML)
})


// Health check
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
})


app.listen(1080)

export default app


// svo.bz/123 (or abc) (or xyz)


// todo: categorize and include each source in the kelp-disclosure; work on kelp gui