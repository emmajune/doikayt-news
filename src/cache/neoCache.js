import NeoCities from 'neocities'
import {writeFile} from 'fs/promises'

export async function neoCache(jsonStr) {
  
  await writeFile('/tmp/cache.json', jsonStr)
  
  var api = new NeoCities('svrss', 'B?3ny8aZ9Q~M"tZ')
  api.upload([
    {name: 'cache.json', path: '/tmp/cache.json'}
  ], function(resp) {
    return resp
  })
}

export default neoCache