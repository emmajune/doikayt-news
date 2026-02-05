
//remove duplicate description x contentEncoded pairs

export function compileNews(newsItems) {
    //newsItems = Object.values(newsItems).flat(2)
    var compiledHTML = ''

    function unHtml(str) {
        str = str.replace(/(<[\s\S]*?>)+/g, ' ')
        str = str.replaceAll('\\n', ' ')
        str = str.replaceAll(/&[^\s]+?;/g, ' ')
        str = str.replace(/&[^\s]*?;/g, ' ')
        str = str.replaceAll('  ', ' ')
        str = str.replaceAll(' s ', "'s ")
        return str.split('<')[0]
    }
    
    for (let i = 0; i < newsItems.length; i++) {
        try {
            var { title, pubDate, link, description } = newsItems[i].item
            //var contentEncoded = newsItems[i].item['content:encoded']
        }
        catch {
            var { title, pubDate, link, description } = newsItems[i]
        }   //var contentEncoded = newsItems[i]['content:encoded']

        
        let source = link.split('://')[1].split('/')[0]
            if (source.split('.').length === 2) {
                source = source.split('.')[0]
            }
            else {
                source = source.split('.')[1].split('.')[0]
            }

        source = source.toUpperCase()

        pubDate = pubDate?.substring(5, 16)

        if (title.length > 150) {
            title = title.substring(0, 87) + '...' 
        }

        //description = description + (contentEncoded ? ' '+contentEncoded : '')
        description = unHtml(description + '')
        description = description.replace(/\n/g, '')

        let shortDescription = description
        // if (description.length > 307) {
        //     shortDescription = description.substring(0, 307) + '...' 
        // }
        
        compiledHTML += `
    <div class="news-item" id="${i}"><span class="news-infobar">
             (${source} ${', '+pubDate ? pubDate : ''})<br />
             <a href="${link}">${title}</a>
        </span>
        <p class="description">${description.replace(/(0 undefined$)|(undefined$)/, '')}</p>
    </div>`
            // newsItems[i] = { title, pubDate, link, description }
        }
        

    return compiledHTML.replaceAll(' ()', '')

    // return newsItems

}

export default compileNews