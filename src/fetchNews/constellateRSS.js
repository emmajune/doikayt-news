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

  //+972mag and jewishcurrents and jacobin don't work


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

  return collectedRSS
}

export default constellateRSS

/*

decided to use fusejs for sezrchingQ!

*/