import { XMLParser, XMLBuilder, XMLValidator} from "fast-xml-parser"


export async function constellateRSS(sourcesArr) {

  //+972mag and jewishcurrents and jacobin don't work

  let collectedRSS = [] //the grand list of rss items

  for (let i = 0; i < sourcesArr.length; i++) {

      var source = sourcesArr[i]

      if (!source) {
        collectedRSS = undefined
        break
      }
      let sourceRSS = await fetch(source.url).then(response => response.text())
      
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