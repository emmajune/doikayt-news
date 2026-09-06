import path, { dirname } from 'path'
import { readFile, writeFile } from 'fs/promises'

import express from 'express'
import {parseFeed} from 'feedsmith'
import * as jdenticon from 'jdenticon'
import { rando } from '@nastyox/rando.js'

type SourceObj = {url: string, origin: string | string[]}
type SourcesObj = {[key: string]: SourceObj}

const sourcesObj: SourcesObj = {
    the_nation: {url: 'https://thenation.com/feed/?post_type=article', origin: 'US'},
    npr: {url: 'https://feeds.npr.org/1014/rss.xml', origin: 'US'},
    the_guardian: {url: 'https://www.theguardian.com/world/rss', origin: 'UK'},
    the_electronic_intifada: {url: 'https://electronicintifada.net/rss.xml', origin:'Palestine'},
    drop_site_news: {url: 'https://www.dropsitenews.com/feed', origin: 'US'},
    in_these_times: {url: 'https://inthesetimes.com/rss', origin: 'US'},
    dissent_magazine: {url: 'https://dissentmagazine.org/feed/', origin: 'US'},
    mother_jones: {url: 'https://www.motherjones.com/feed', origin: 'US'},
    al_jazeera: {url: 'https://www.aljazeera.com/xml/rss/all.xml', origin: 'International'},
    // counterpunch: {url: 'https://counterpunch.org/feed', origin: 'US'},
    human_rights_watch: {url: 'https://www.hrw.org/rss/news', origin: 'International'},
    haitian_times: {url: 'https://haitiantimes.com/feed/', origin: 'Haiti'},
    truthout: {url: 'https://truthout.org/latest/feed/', origin: 'US'},
    democracy_now: {url: 'https://www.democracynow.org/democracynow.rss', origin: 'US'},
    the_intercept: {url: 'https://theintercept.com/feed/', origin: 'US'},
    // p972_mag: {url: 'http://www.972mag.com/rss', origin: ['Israel', 'Palestine']},
    jacobin: {url: 'http://jacobin.com/rss', origin: 'International'},
    propublica: {url: 'https://www.propublica.org/rss', origin: 'US'},
    dabanga: {url: 'https://www.dabangasudan.org/rss', origin: 'Sudan'}
}

async function fetchRawFeeds(sourcesObj: SourcesObj) {
    const rawFeeds = []
    for (const source in sourcesObj) {
        const sourceObj: SourceObj = sourcesObj[source]
        const url: string = sourceObj.url
        try {
            const response = await fetch(url)
            if (!response.ok) {
              throw new Error(`Response status: ${response.status}`)
            }
            const result = await response.text()
            
            rawFeeds.push(result)
        }
        catch (error: any) {
            console.error(`Error fetching ${url}: ${error.message}`);
        }
    }
    return rawFeeds
}

await fetchRawFeeds(sourcesObj)

// const app = express()

// app.get('/', async (req:any, res:any)=>{
//     var html = await readFile(path.join(__dirname, '..', 'components', 'local_news.html'), 'utf-8')
//     res.type('html')
//     res.send(html.replace('?RANDOM', '?'+rando()))
// })

// app.get('api')