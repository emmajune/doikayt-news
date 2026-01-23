import constellateRSS from './constellateRSS.js'
import searchNews from './searchNews.js'
import compileNews from './compileNews.js'

export async function fetchNews(query, sources) {
    var newsItems = await constellateRSS(sources)
    if (!newsItems) {
        return 'Invalid Sources!!!'
    }
    if (query && (query != 'undefined')) {
        newsItems = searchNews(query, newsItems)
    }
    if (query == 'undefined') {
        newsItems = searchNews('', newsItems)
    }
    if (query == '*') {
        return 'INVALID QUERY'
    }
    newsItems.sort((a, b) => {
        a = new Date(a.pubDate)
        a = a.getTime()
        b = new Date(b.pubDate)
        b = b.getTime()
        return b - a
    })
    var newsButHTML = compileNews(newsItems)
    return new Promise(resolve=>resolve({html: newsButHTML, length: newsItems.length}))
}

export default fetchNews