import NeoCities from 'neocities'
import {writeFile} from 'fs/promises'

export async function neoCache(jsonStr) {
  await writeFile('/tmp/cache.json', jsonStr)
  
  var api = new NeoCities('d0ikayt', '=sp2eRLmigs^kPi')
  api.upload([
    {name: 'cache.json', path: '/tmp/cache.json'}
  ], function(resp) { 
    return resp
  })
}

export default neoCache