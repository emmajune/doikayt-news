// TODO: make search more accurate for shorter terms;
// show matches in results;
// migrate search.js and compile.js to frontend (add sexy caching too, ofc!);
// fix tab-navigation scrolling;
// integrate search and source-selection into frontend aesthetics
// frontend images..?
// optimize loading time; mayhaps remove unnecessary words?

//custom rss scraper, mayhaps?

import express from 'express';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFile, writeFile } from 'fs/promises';

import {gatherFeeds} from '../src/gatherFeeds.js';

import {neoCache} from '../src/cache/neoCache.js';
import dotenv from 'dotenv';

const app = express()

app.get('/', async (req:any, res:any)=>{
  var html = await readFile(path.join(__dirname, '..', 'components', 'local_news.html'), 'utf-8')
  res.type('html')
  res.send(html.replace('?RANDOM', '?'+Math.random()))
})


//@ts-ignore
// global.newsItemCache = await readBucket() //not a problem I think
//@ts-ignore
global.updateBool = true

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
// const pantryID = "4b8eeebc-b2e8-404b-808d-da8a45297b77"
// const pantryClient = new pantry(pantryID)

//TODO: implement timeout for fetchh


var cachedJson = await gatherFeeds();

setInterval(async ()=>{
  cachedJson = await gatherFeeds();
  await neoCache(cachedJson);
}, 120000);

async function api(res:any, newsJson = '') {
  var time1 = performance.now();
  newsJson = newsJson || await gatherFeeds();
  var time2 = performance.now();
  console.log('Overall, took ' + (time2-time1) + 'ms')
  res.set({
    'Cache-Control': 's-maxage=0, stale-while-revalidate=0',
    'CDN-Cache-Control': 's-maxage=0, stale-while-revalidate=0',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Credentials': 'false'
  });
  res.type('json');
  res.send(newsJson);
  return newsJson;
}

app.get('/api', async (req:any, res) => {
  // if (cachedJson) {
  //   api(res, cachedJson);
  // } else {
  //   cachedJson = await api(res);
  //   await neoCache(cachedJson);
  // }
  cachedJson = await gatherFeeds();
  const neoRes = await neoCache(cachedJson);
  res.send(neoRes);
  //@ts-ignore
  //updateBucket(JSON.stringify(global.newsItemCache))
})



// async function updateNeo() {
//   var newsObj = await constellateRSS(sourcesUrlArr, sourceNames)
//   var newsJson = JSON.stringify(newsObj)
//   return await neoCache(newsJson)
// }

app.listen(1080)
// setInterval(updateNeo, 62000)

export default app


// svo.bz/123 (or abc) (or xyz)


// todo: categorize and each source in the kelp-disclosure; work on kelp gui