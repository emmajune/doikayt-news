
export async function compileNews(newsItems) {

    var compiledHTML = ''

    for (let i = 0; i < newsItems.length; i++) {
    let { title, pubDate, link, description } = newsItems[i]
    let source = link.split('://')[1].split('/')[0]
    if (source.split('.').length === 2) {
        source = source.split('.')[0]
    }
    else {
        source = source.split('.')[1].split('.')[0]
    }

    source = source.toUpperCase()

    pubDate = pubDate?.substring(5, 16)

    if (title.length > 87) {
        title = title.substring(0, 87) + '...' 
    }

    function unHtml(str) {
        str = str.replace(/(<[\s\S]*?>)+/g, ' ')
        return str
    }

    description = unHtml(description)
    description = description.replace(/\n\n/g, '\n')

    let shortDescription = description
    if (description.length > 307) {
        shortDescription = description.substring(0, 307) + '...' 
    }
    compiledHTML += `
    <div title="${description}" class="news-item">
        <span class="news-titlebar">${source}, ${pubDate}:
            <a href="${link}">${title}</a>
        </span>
        <p class="description">${shortDescription}</p>
    </div>
    <br />`
    }

    return compiledHTML.replaceAll(' ()', '')

}

export default compileNews