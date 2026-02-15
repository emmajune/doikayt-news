import searchNews from './searchNews.js'
import compileNews from './compileNews.js'

import constellateRSS from './constellateRSS.js'



export async function fetchNews(sources, sourceNames, update=false) {

    var newsItems

    if (!global?.newsItemCache || update) {
        newsItems = await constellateRSS(sources, sourceNames)
        global.newsItemCache = newsItems
    }
    else {
        newsItems = global.newsItemCache
    }
            
    return newsItems
}

export default fetchNews