import express from 'express'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import { readFile } from 'fs/promises'
import { rando } from '@nastyox/rando.js'
import * as jdenticon from 'jdenticon'

import pantry from 'pantry-node'

import fetchNews from './fetchNews/index.js'
import disclosureHtml from './disclosureHtml.js'

import constellateRSS from './fetchNews/constellateRSS.js'


import { createClient } from "@supabase/supabase-js";

// Create Supabase client
const supabase = createClient(
  "https://gtlobmekbicbhkctqaky.supabase.co",
  "sb_secret_VnysgCOq1-gJXlGHlAmOTg_9-Vkgunx",
);

async function updateBucket(data:any) {
  const date = Date.now() + ".txt";

  var uploadData = await supabase.storage
    .from("doikayt_cache")
    .upload(date, data);
  if (uploadData.error) {
    return uploadData.error
  }
  const bucketList:any = await supabase.storage.from("doikayt_cache").list("", {
    limit: 100,
    offset: 0,
    sortBy: { column: "updated_at", order: "desc" },
  });

  var trashArr = []
  for (let i = 1; i < bucketList.data.length; i++) {
    trashArr.push(bucketList.data[i].name)
  }
  
  await supabase.storage.from('doikayt_cache').remove(trashArr)

  return uploadData.data
}


async function readBucket() {
  const bucketList = await supabase.storage.from("doikayt_cache").list("", {
    limit: 100,
    offset: 0,
    sortBy: { column: "updated_at", order: "asc" },
  });

  const name:any = bucketList!.data![0].name;
  const url =
    "https://gtlobmekbicbhkctqaky.supabase.co/storage/v1/object/public/doikayt_cache/" +
    name;

  var response = await fetch(url);
  response = await response.json();
  
  return response;
}

console.log(await updateBucket('{"puck": "inA"}'))

console.log(await readBucket())



const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

const pantryID = "4b8eeebc-b2e8-404b-808d-da8a45297b77"
const pantryClient = new pantry(pantryID)

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
  woy_magazine: {url: 'https://rss.app/feeds/oD3q0jTyFEeGNlIL.xml', vp: 'GS'},
  truthout: {url: 'https://truthout.org/latest/feed/', vp: 'GN'},
  democracy_now: {url: 'https://www.democracynow.org/democracynow.rss', vp: 'GN'},
  the_intercept: {url: 'https://theintercept.com/feed/', vp: 'GN'},
  p972_mag: {url: 'https://rss.app/feeds/aNuThbWh76dCx90s.xml', vp: 'GN'},
  jewish_currents: {url: 'https://jewishcurrents.org/feed', vp: 'GN'},
  jacobin: {url: 'http://jacobin.com/rss', vp: 'GN'}
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
  const size = 64;
  const value = rando(999)
  jdenticon.configure({ backColor: '#000'});
  const png = jdenticon.toPng(value, size);
  res.setHeader('Content-Type', 'image/png');
  res.send(png)
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
      .update('news-cache', {payload})
      .then((response:any) => res.send(response))
})


app.get('/news', async (req:any, res) => {
  var time1 = Date.now()
  let query = req.url.split('q=')[1]
  query = query ? query.replaceAll('+', ' ') : undefined
  query = decodeURIComponent(query)
  var sources:any = Object.keys(req.query);
  sources.pop()
  sources = sources.length ? sources : undefined
  if (sources) {
    for (let i = 0; i < sources.length; i++) {
      let source = sources[i]
      sources[i] = sourcesObj[source]
    }
  }
  var sourceNames:any = Object.keys(sourcesObj)
  var theNews = await fetchNews(query, sources ? sources : sourcesUrlArr, sourceNames)
  var time2 = Date.now()
  console.log('Overall, took ' + (time2-time1) + 'ms')
  var htmlNews = await theNews.html
  var nNewsI = await theNews.length
  var disclosureHTML = disclosureHtml(sourceNames, sourcesObj)
  var pageHTML:any = await readFile(path.join(__dirname, '..', 'components', 'news.html'))
  pageHTML = pageHTML.toString().replace('SOURCES_GO_HERE', disclosureHTML)
  var isAllSources = (!sources || (sources?.length === sourcesUrlArr.length))
  pageHTML = pageHTML.replace(' maybe-super-checked', isAllSources ? ' checked' : '')
  pageHTML = pageHTML.replace('QUERY_GOES_HERE', (query != 'undefined') ? query : '')
  pageHTML = pageHTML.replace('nNewsI_GOES_HERE', nNewsI ? nNewsI : '1')
  pageHTML = pageHTML.replaceAll('THE_NEWS_GOES_HERE', htmlNews ? htmlNews : 'Search for something!')
  pageHTML = pageHTML.replace('/favicon.png', '/favicon.png?'+rando(9999))//attempts to trick browsers into refreshing favicon cache
  res.type('html').send(pageHTML)
  //constellateRSS(sources, sourceNames)
})


// Health check
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
})


app.listen(1080)

export default app


// svo.bz/123 (or abc) (or xyz)


// todo: categorize and include each source in the kelp-disclosure; work on kelp gui