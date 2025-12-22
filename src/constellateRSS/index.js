import { XMLParser, XMLBuilder, XMLValidator} from "fast-xml-parser"


export async function constellateRSS(sourcesArr) {
  
  const linksRSS = {
    truthout: 'https://truthout.org/latest/feed', the_intercept: 'https://theintercept.com/feed',
    common_dreams: 'https://www.commondreams.org/feeds/news.rss', mondoweiss: 'https://mondoweiss.net/feed',
    zeteo: 'https://zeteo.com/feed', npr: 'https://feeds.npr.org/1001/rss.xml',
    the_guardian: 'https://theguardian.com/us/rss', 
    the_electronic_intifada: 'https://electronicintifada.net/rss.xml',
    the_nation: 'https://thenation.com/feed/?post_type=article', drop_site_news: 'https://www.dropsitenews.com/feed',
    in_these_times: 'https://inthesetimes.com/rss', dissent_magazine: 'https://dissentmagazine.org/feed/',
    mother_jones: 'https://www.motherjones.com/feed', al_jazeera: 'https://www.aljazeera.com/xml/rss/all.xml'
  }

  //+972mag and jewishcurrents and jacobin all (prolly) have captchas (for some reason)


  let collectedRSS = [] //the grand list of rss items

  for (let i = 0; i < sourcesArr.length; i++) {
      let sourceRSS = await fetch(linksRSS[sourcesArr[i]]).then(response => response.text())
      
      const parser = new XMLParser()
      let jObj = parser.parse(sourceRSS)  //converts rss to json

      if (jObj?.rss?.channel) {
        let sourceObject = jObj.rss.channel
        const sourceItemsArr = sourceObject.item
        collectedRSS = collectedRSS.concat(sourceItemsArr)
      }
    }
  

// orders news in ascending order of date published
  collectedRSS.sort((a, b) => {
    a = new Date(a.pubDate)
    a = a.getTime()
    b = new Date(b.pubDate)
    b = b.getTime()
    return b - a 
  })

// reorders news in descending order
  collectedRSS.reverse()


  var compiledHTML = ''
  
  for (let i = 0; i < collectedRSS.length; i++) {
    let { title, link, description } = collectedRSS[i]
    let source = link.split('://')[1].split('/')[0]
    if (source.split('.').length === 2) {
      source = source.split('.')[0]
    }
    else {
      source = source.split('.')[1].split('.')[0]
    }
    source = source.toUpperCase()
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
    if (description.length > 107) {
       shortDescription = description.substring(0, 107) + '...' 
    }
    compiledHTML += `<div title="${description}">${source}: 
    <a href="${link}">${title}</a><p>${shortDescription}</p></div>`
  }

  return compiledHTML.replaceAll(' ()', '')
}

export default constellateRSS