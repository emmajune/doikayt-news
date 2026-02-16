// TODO: make search more accurate for shorter terms;
// show matches in results;
// migrate search.js and compile.js to frontend (add sexy caching too, ofc!);
// fix tab-navigation scrolling;
// integrate search and source-selection into frontend aesthetics
// frontend images..?
// optimize loading time; mayhaps remove unnecessary words?

//custom rss scraper, mayhaps?

import express from 'express'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import { readFile, writeFile } from 'fs/promises'
import { rando } from '@nastyox/rando.js'
import * as jdenticon from 'jdenticon'

//import pantry from 'pantry-node'

import fetchNews from './fetchNews/index.js'
import disclosureHtml from './disclosureHtml.js'

import neoCache from './cache/neoCache.js'
import {updateBucket, readBucket} from './cache/supaCache.js'

import constellateRSS from './fetchNews/constellateRSS.js'




const app = express()

app.get('/test', async (req:any, res:any)=>{
  res.sendFile(path.join(__dirname, '..', 'components', 'local_news.html'))
})


// @ts-ignore
global.newsItemCache = await readBucket() //not a problem I think
//@ts-ignore
global.updateBool = true

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
// const pantryID = "4b8eeebc-b2e8-404b-808d-da8a45297b77"
// const pantryClient = new pantry(pantryID)

const sourcesObj:any = {
  the_nation: {url: 'https://thenation.com/feed/?post_type=article', vp: 'GN'},
  npr: {url: 'https://feeds.npr.org/1001/rss.xml', vp: 'GN'},
  // the_guardian: {url: 'https://www.theguardian.com/world/rss', vp: 'GN'},
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
  haitian_times: {url: 'https://haitiantimes.com/feed/', vp: 'GS'},
  truthout: {url: 'https://truthout.org/latest/feed/', vp: 'GN'},
  democracy_now: {url: 'https://www.democracynow.org/democracynow.rss', vp: 'GN'},
  the_intercept: {url: 'https://theintercept.com/feed/', vp: 'GN'},
  p972_mag: {url: 'https://rss.app/feeds/aNuThbWh76dCx90s.xml', vp: 'GN'},
  jewish_currents: {url: 'https://jewishcurrents.org/feed', vp: 'GN'},
  jacobin: {url: 'http://jacobin.com/rss', vp: 'GN'},
  propublica: {url: 'https://www.propublica.org/rss', vp: 'GN'}
}
const sourcesUrlArr = Object.values(sourcesObj)
const sourceNames:any = Object.keys(sourcesObj)

app.get('/favicon.png', async function (req, res) {
  const size = 64;
  const value = rando(999)
  jdenticon.configure({ backColor: '#000'});
  const png = jdenticon.toPng(value, size);
  res.setHeader('Content-Type', 'image/png');
  res.send(png)
})

// pantry test - JSON
// app.get('/pantry-test', (req, res) => {
//   const payload = {
//   animalSounds: {
//     goose: 'honk!',
//     // dragon: 'RAWRR',
//     // kitty: 'mraow',
//     // bug: 'chitter'
//   }
// }

//   pantryClient.basket
//       //get, create, delete
//       .update('news-cache', {payload})
//       .then((response:any) => res.send(response))
// })

app.get('/api', async (req:any, res) => {
  var time1 = Date.now()
  
  // set timeout before first update
  // @ts-ignore
  var newsJson = await fetchNews(sourcesUrlArr, sourceNames, global.updateBool)
  // @ts-ignore
  if (global.updateBool) {
    // @ts-ignore
    global.updateBool = false
  }
  var time2 = Date.now()
  console.log('Overall, took ' + (time2-time1) + 'ms')
  

  // pageHTML = pageHTML.replace('/favicon.png', '/favicon.png?'+rando(9999))//attempts to trick browsers into refreshing favicon cache
  // res.type('html')
  // res.send(pageHTML)
  res.type('json')
  res.send(newsJson)
  //@ts-ignore
  updateBucket(JSON.stringify(global.newsItemCache))
})

async function updateNeo() {
  var newsObj = await constellateRSS(sourcesUrlArr, sourceNames)
  var newsJson = JSON.stringify(newsObj)
  return await neoCache(newsJson)
}

app.listen(1080)
setInterval(updateNeo, 62000)

export default app


// svo.bz/123 (or abc) (or xyz)


// todo: categorize and each source in the kelp-disclosure; work on kelp gui