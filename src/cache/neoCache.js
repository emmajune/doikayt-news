import NeoCities from 'neocities'
import {writeFile} from 'fs/promises'
import cssEscape from 'css.escape'

export async function neoCache(jsonStr) {
  const escJson = cssEscape(jsonStr)
  await writeFile('/tmp/cache.css', `data { content: "${escJson}" }`)
  
  var api = new NeoCities('svrss', 'B?3ny8aZ9Q~M"tZ')
  api.upload([
    {name: 'cache.css', path: '/tmp/cache.css'}
  ], function(resp) {
    return resp
  })
}

export default neoCache