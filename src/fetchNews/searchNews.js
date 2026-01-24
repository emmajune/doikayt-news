import {stemmer} from 'stemmer'
import Fuse from 'fuse.js'


export function searchNews (query, newsItems) {

    if (!query) {
        return newsItems.sort((a,b)=>{
            let diff = +Date.parse(a.pubDate) - +Date.parse(b.pubDate)
            if (!diff) {
                diff = 0
            }
            return diff
        })
    }
    //fancy dynamic category selection??
    const fuse = new Fuse(newsItems, {
        keys: ['title', 'description', 'categories'],
        ignoreLocation: true//,
        //useExtendedSearch: true
    })
    return fuse.search(stemmer(query))
}

export default searchNews