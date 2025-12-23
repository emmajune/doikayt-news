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
    mother_jones: 'https://www.motherjones.com/feed', al_jazeera: 'https://www.aljazeera.com/xml/rss/all.xml',
    counterpunch: 'https://counterpunch.org/feed', internation_viewpoint: 'https://internationalviewpoint.org/spip.php?page=backend', its_going_down: 'https://itsgoingdown.org/feed/'
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
  

// orders news in descending order of date published
  collectedRSS.sort((a, b) => {
    a = new Date(a.pubDate)
    a = a.getTime()
    b = new Date(b.pubDate)
    b = b.getTime()
    return b - a 
  })



  var compiledHTML = ''
  
  for (let i = 0; i < collectedRSS.length; i++) {
    let { title, pubDate, link, description } = collectedRSS[i]
    let source = link.split('://')[1].split('/')[0]
    if (source.split('.').length === 2) {
      source = source.split('.')[0]
    }
    else {
      source = source.split('.')[1].split('.')[0]
    }
    
    source = source.toUpperCase()
    
    pubDate = pubDate.substring(6, 16)

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
      <label>
        <span class="news-titlebar">${source}, ${pubDate}:
          <a href="${link}">${title}</a>
        </span>
        <p class="description">${shortDescription}</p>
      </label>
    </div>`
  }

  return compiledHTML.replaceAll(' ()', '')
}

export default constellateRSS

/*

search formula ideas:

4ld = 1st 4 lines of description 

(vv descending order of result quality)

1: one perfect match in title, 2 in 4ld

2: one perfect match in title, 1 perfect match and 1 imperfect match 4ld

3: one perfect match in title, 2 imperfect matches in 4ld

4: one imperfect match in title, 2 imperfect matches in 4ld

5: one imperfect match in title, 1 imperfect match and and 1 scrambled match in 4ld (xn scramblednesses)

6: one imperfect match in title, 2 scrambled matches in 4ld (xn scramblednesses)

7: one imperfect match in title, 1 scrambled match in 4ld (xn scramblednesses)

8: one imperfect match in title, 1 partial scrambled match in 4ld (xn scramblednesses, xn partialities)

9: one scrambled match in title (xn scramblednesses), nada in description

10 one partial scrambled match in title (xn scramblednesses, xn partialities)

11: nada in title, 2 perf matches in 4ld

12: nada, 1perf + 1imp

13: 


waaaa add synonyms in abovealksdfjasdlfk

TODO: pick just a few of guardian's rss feeds
*/