
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
            var score = newsItems[i].score
            var { title, pubDate, link, description } = newsItems[i].item
            var contentEncoded = newsItems[i].item['content:encoded']
            if (contentEncoded) {
                description += ' '+contentEncoded
            }
        }
        catch {
            var { title, pubDate, link, description } = newsItems[i]
            var score = newsItems[i]?.score
            var contentEncoded = newsItems[i]['content:encoded']
            if (contentEncoded) {
                description += ' '+contentEncoded
            }
        }   
        
        let source = link.split('://')[1].split('/')[0]
        source = source.toUpperCase()
        if (source.split('.').length === 2) {
            source = source.split('.')[0]
        }
        else {
            source = source.split('.')[1].split('.')[0]
        }
        score = 1 - score
        if (score < 0.5) {
            continue
        }


        pubDate = pubDate?.substring(5, 16)

        if (title.length > 150) {
            title = title.substring(0, 87) + '...' 
        }

        //description = unHtml(description + '')
        description = description.replace(/\n/g, '')

        if (source === 'JEWISHCURRENTS') {
            description = title.split(' - ')[1]
            title = title.split(' - ')[0]
        }
        
        if (description) {
            if (description.length > 1000) {
                description = description.slice(0, 1000)
            }
            description = description.replace('undefined', '')
        }
        else {
            description = ''
        }
        if (!score) {
            score = ''
        }
        if (typeof title === 'string') {
            title = title.split(' ')
            title = title.slice(0,-1).join(' ') + '&nbsp;' + title[title.length-1]
        }
        

        compiledHTML += `
    <div class="news-item" id="${i}" title="${score}"><span class="news-infobar">
             (${source} ${', '+pubDate ? pubDate : ''})<br />
             <a href="${link}">${title}</a>
        </span>
        <p class="description">${description}</p>
    </div>`
            // newsItems[i] = { title, pubDate, link, description }
        }
        

    return compiledHTML.replaceAll(' ()', '')

    // return newsItems

}

export default compileNews