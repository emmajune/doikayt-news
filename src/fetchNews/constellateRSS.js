import { XMLParser } from "fast-xml-parser"


export async function constellateRSS(sourcesArr, sourceNames) {
  //+972mag and jewishcurrents and jacobin don't work

  let collectedRSS = {} //the grand list of rss items

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
        var sourceName = jObj.rss.channel.title
        for (let i = 0; i < sourceItemsArr.length; i++) {
          var {description, title, link, pubDate} = sourceItemsArr[i]
          var contentEncoded = sourceItemsArr[i]['content:encoded']
          if (description) {
            if (description == '0') {
              description = ''
            }
          }
          else if (contentEncoded){
            if (contentEncoded == '0') {
              contentEncoded = ''
            }
            //contentEncoded = unHtml(contentEncoded)
          }
          description += ' ' + contentEncoded
          if (sourceName === 'ProPublica') {
            description = contentEncoded
          }
          //TODO: isloate first match....
          description = unHtml(description)
          sourceItemsArr[i] = {description, title, link, pubDate}
        }
        collectedRSS[sourceName] = sourceItemsArr
      }
      else {
        console.log(jObj)
        console.log('Error parsing ' + JSON.stringify(source.url))
      }
    }
    function unHtml(str) {
      str = str.replace(/(<[\s\S]*?>)+/g, ' ')
      str = str.replaceAll('\\n', ' ')
      str = str.replaceAll(/&[^\s]+?;/g, ' ')
      str = str.replace(/&[^\s]*?;/g, ' ')
      str = str.replaceAll('  ', ' ')
      str = str.replaceAll(/ s | s$/g, "'s ")
      str = str.replaceAll(/ t | t$/g, "'t ")
      str = str.replaceAll(/ ve | ve$/g, "'ve ")
      return str.split('<')[0]
  }

  return collectedRSS
}

export default constellateRSS