import { xml2json } from 'xml-js'

export async function constellateRSS(source) {
  const linksRSS = {
    truthout: 'https://truthout.org/latest/feed', the_intercept: 'https://theintercept.com/feed',
    common_dreams: 'https://www.commondreams.org/feeds/news.rss', mondoweiss: 'https://mondoweiss.net/feed',
    zeteo: 'https://zeteo.com/feed', npr: 'https://feeds.npr.org/1001/rss.xml',
    the_guardian: 'https://theguardian.com/us/rss', plus_972_magazine: 'https://www.972mag.com/feed',
    the_electronic_intifada: 'https://electronicintifada.net/rss.xml',
    the_nation: 'https://thenation.com/feed/?post_type=article', jewish_commons: 'https://jewish_commons/feed'
  }

  const sampleRSS = await fetch(linksRSS[source]).then(response => response.text())

  let objectRSS = JSON.parse(xml2json(sampleRSS, { compact: true }))
  objectRSS = objectRSS.rss.channel
  const itemsRSS = objectRSS.item
  const itemsArr = []
  source = source.replaceAll('_', ' ')
  for (let i = 0; i < itemsRSS.length; i++) {
    let { title, link, description } = itemsRSS[i]
    title = title?._text || title._cdata
    link = link?._text || link._cdata
    description = (description?._text || description._cdata)
    description = description.replaceAll('<', '<!--').replaceAll('>', '-->')
    itemsArr.push(`<a href="${link}">${title} (${source})</a><p>${description}</p>`)
  }
  return itemsArr.join('\n\n')
}

export default constellateRSS
