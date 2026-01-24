import { XMLParser, XMLBuilder, XMLValidator} from "fast-xml-parser"


export async function constellateRSS(sourcesArr) {
  //+972mag and jewishcurrents and jacobin don't work

  let collectedRSS = [] //the grand list of rss items

  var promises = []
  for (let i = 0; i < sourcesArr.length; i++) {
    var source = sourcesArr[i]
    if (!source) {
      collectedRSS = undefined
      break
    }
    try {
      promises.push(fetch(source.url).then(response=>{
        console.log(response.ok ? '' : `Error fetching ${source.url}: ${response.status}`)
        return response.text()
      }))
    }
    catch {
      console.log(`Fetch of ${source.url} failed`)
    }
  }
  var time1 = Date.now()
  var resolvedRSS = await Promise.all(promises)
  var time2 = Date.now()
  console.log('it took '+(time2 - time1)+'ms')
  for (let i = 0; i < sourcesArr.length; i++) {

      var source = sourcesArr[i]

      if (!source) {
        collectedRSS = undefined
        break
      }
      let sourceRSS = resolvedRSS[i]
      
      const parser = new XMLParser()
      let jObj = parser.parse(sourceRSS)  //converts rss to json

      if (jObj?.rss?.channel) {
        let sourceObject = jObj.rss.channel
        const sourceItemsArr = sourceObject.item
        collectedRSS = collectedRSS.concat(sourceItemsArr)
      }
      else {
        console.log('Error parsing ' + JSON.stringify(source.url))
      }
    }

  return collectedRSS
}

export default constellateRSS