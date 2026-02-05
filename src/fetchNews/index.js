import searchNews from './searchNews.js'
import compileNews from './compileNews.js'
import { readFile, writeFile } from 'fs/promises'

import constellateRSS from './constellateRSS.js'


export async function fetchNews(query, sources, sourceNames) {
    
    // var newsItems = await readFile('../public/newsCache.json', { encoding: 'utf8' })
    // var newsItems = JSON.parse(newsItems)
    // var fNewsI = {}
    
    // for (let i = 0; i < sourceNames.length; i++) {
    //     fNewsI[sourceNames[i]] = newsItems[sourceNames[i]]
    // }
    // newsItems = Object.values(fNewsI).flat()

    var newsItems = await constellateRSS(sources, sourceNames)
    
    if (newsItems) {
        console.log(JSON.stringify(newsItems).length)
    }
    else {
        return 'Invalid Sources!!!'
    }
    if (query && (query != 'undefined')) {
        newsItems = searchNews(query, Object.values(newsItems).flat(2))
    }
    if (query == 'undefined') {
        newsItems = searchNews('', newsItems)
    }
    if (query == '*') {
        return 'INVALID QUERY'
    }
    if (Array.isArray(newsItems)) {
        newsItems.sort((a, b) => {
        a = new Date(a.pubDate)
        a = a.getTime()
        b = new Date(b.pubDate)
        b = b.getTime()
        return b - a
    })
    }
    var newsButHTML = compileNews(newsItems)
    return new Promise(resolve=>resolve({html: newsButHTML, length: newsItems.length}))
}

export default fetchNews