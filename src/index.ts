import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

import pantry from 'pantry-node'
import { xml2json } from 'xml-js'

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
async function constellateRSS(source) {
  const linksRSS = {
    truthout:'https://truthout.org/latest/feed', the_intercept:'https://theintercept.com/feed',
    common_dreams:'https://commondreams.com/rss.xml', mondoweiss:'https://mondoweiss.net/feed',
    zeteo:'https://zeteo.com/feed', npr:'https://feeds.npr.org/1001/rss.xml',
    the_guardian:'https://theguardian.com/us/rss', plus_972_magazine:'https://www.972mag.com/feed',
    the_electronic_intifada:'https://electronicintifada.net/rss.xml',
    the_nation:'https://thenation.com/feed/?post_type=article'
  }

  const sampleRSS = await fetch(linksRSS[source])
    .then(response=>response.text())

  var objectRSS = JSON.parse(xml2json(sampleRSS, {compact: true}))
  objectRSS = objectRSS.rss.channel
  const itemsRSS = objectRSS.item
  var itemsArr = []
  for (var i = 0; i < itemsRSS.length; i++) {
    let { title, link, description } = itemsRSS[i]
    title = title?._text || title._cdata
    link = link?._text || link._cdata
    description = (description?._text || description._cdata)
    // .split('\n')[0]
    const htmlTemplate = `<a href="${link}">${title}</a>
    <br />
    <p>${description}</p>`
    itemsArr.push(`${title}\n${link}\n${description}`)
  }
  return itemsArr.join('\n\n')
}

console.log(await constellateRSS('zeteo'))