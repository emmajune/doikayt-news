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
    var newsButHTML = compileNews(newsItems, sources)
    return new Promise(resolve=>resolve(newsButHTML))
}

export default fetchNews