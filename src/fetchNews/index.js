import searchNews from './searchNews.js'
import compileNews from './compileNews.js'

import constellateRSS from './constellateRSS.js'



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
        console.log(newsItems.length)
    }
    else {
        return 'Invalid Sources!!!'
    }
    if (query && (query != 'undefined')) {
        newsItems = searchNews(query, Object.values(newsItems).flat(2))
        newsItems.sort((a, b) => {
            a = new Date(a.item.pubDate)
            a = a.getTime()
            b = new Date(b.item.pubDate)
            b = b.getTime()
            return b - a
        })
    }
    if (query == 'undefined') {
        newsItems = searchNews('', newsItems)
        newsItems.sort((a, b) => {
            a = new Date(a.pubDate)
            a = a.getTime()
            b = new Date(b.pubDate)
            b = b.getTime()
            return b - a
        })
    }
    if (query == '*') {
        return 'INVALID QUERY'
    }
    
    var newsButHTML = compileNews(newsItems)
    return new Promise(resolve=>resolve({html: newsButHTML, length: newsItems.length}))
}

export default fetchNews