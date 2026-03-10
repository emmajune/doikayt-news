import NeoCities from 'neocities'
import {writeFile} from 'fs/promises'
import dotenv from 'dotenv'

dotenv.config()

export async function neoCache(jsonStr) {
  await writeFile('/tmp/cache.json', jsonStr)
  
  var api = new NeoCities(process.env.NEOCITIES_SITE, process.env.NEOCITIES_PW)
  api.upload([
    {name: 'cache.json', path: '/tmp/cache.json'}
  ], function(resp) { 
    return resp
  })
}

export default neoCache