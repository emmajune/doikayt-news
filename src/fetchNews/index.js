import searchNews from './searchNews.js'
import compileNews from './compileNews.js'
import { readFile, writeFile } from 'fs/promises'

import constellateRSS from './constellateRSS.js'

var numStr = Math.random().toString().split('.')[1]

writeFile('/tmp/'+numStr+'.txt', 'HI!')

export async function fetchNews(query, sources, sourceNames, update=false) {

    var newsItems

    if (!global?.newsItemCache || update) {
        newsItems = await constellateRSS(sources, sourceNames)
        global.newsItemCache = newsItems
    }
    else {
        newsItems = global.newsItemCache
    }
    
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