/**
 * Minified by jsDelivr using Terser v5.39.0.
 * Original file: /npm/minisearch@7.2.0/dist/umd/index.js
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */

import lunr from 'lunr'

export function searchNews (query, newsItems) {

    for (let i = 0; i < newsItems.length; i++) {
        newsItems[i].id = i
    }

    var index = lunr(function () {
        this.ref('id')
        this.field('text')
        this.field('description')

        newsItems.forEach(function (newsItem) {
            this.add(newsItem)
        }, this)
    })
    var results = index.search(query)
    var newsResults = []
    results.forEach(result=>{
        var newsItem = newsItems[+result.ref]
        newsItem.score = Math.round(result.score * 100)
        newsItem.matches = 'Matches: ' + Object.keys(result.matchData.metadata)
        newsResults.push(newsItem)
    })
    return newsResults
}

export default searchNews