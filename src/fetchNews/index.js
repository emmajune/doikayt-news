import constellateRSS from './constellateRSS.js'
import searchNews from './searchNews.js'
import compileNews from './compileNews.js'

export async function fetchNews(query, sources) {
    var newsItems = await constellateRSS(sources)
    if (!newsItems) {
        return 'Invalid Sources!!!'
    }
    if (query) {
        newsItems = searchNews(query, newsItems)
    }
    else {
        newsItems.sort((a, b) => {
        a = new Date(a.pubDate)
        a = a.getTime()
        b = new Date(b.pubDate)
        b = b.getTime()
        return b - a
    })
    }
    var newsButHTML = compileNews(newsItems)
    return new Promise(resolve=>resolve(newsButHTML))
}

export default fetchNews