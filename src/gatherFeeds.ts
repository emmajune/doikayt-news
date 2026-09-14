import {parseFeed} from 'feedsmith'

type SourceObj = {origin: string, url: string, rss?: string, feedObj?: any, items?: any}
type SourcesObj = {[key: string]: SourceObj}

const sourcesObj: SourcesObj = {
    the_nation: {url: 'https://thenation.com/feed/?post_type=article', origin: 'US'},
    npr: {url: 'https://feeds.npr.org/1014/rss.xml', origin: 'US'},
    // the_guardian: {url: 'https://www.theguardian.com/world/rss', origin: 'UK'}, // ughh, it keepts being racist
    the_electronic_intifada: {url: 'https://electronicintifada.net/rss.xml', origin:'Palestine'},
    drop_site_news: {url: 'https://www.dropsitenews.com/feed', origin: 'US'},
    // takes like 10s on my laptop :0 -- in_these_times: {url: 'https://inthesetimes.com/rss', origin: 'US'},
    dissent_magazine: {url: 'https://dissentmagazine.org/feed/', origin: 'US'},
    mother_jones: {url: 'https://www.motherjones.com/feed', origin: 'US'},
    // al_jazeera: {url: 'https://www.aljazeera.com/xml/rss/all.xml', origin: 'International'},
    human_rights_watch: {url: 'https://www.hrw.org/rss/news', origin: 'International'},
    haitian_times: {url: 'https://haitiantimes.com/feed/', origin: 'Haiti'},
    truthout: {url: 'https://truthout.org/latest/feed/', origin: 'US'},
    democracy_now: {url: 'https://www.democracynow.org/democracynow.rss', origin: 'US'},
    the_intercept: {url: 'https://theintercept.com/feed/', origin: 'US'},
    // p972_mag: {url: 'http://www.972mag.com/rss', origin: ['Israel', 'Palestine']},
    jacobin: {url: 'http://jacobin.com/rss', origin: 'International'},
    propublica: {url: 'https://www.propublica.org/rss', origin: 'US'},
    dabanga: {url: 'https://www.dabangasudan.org/rss', origin: 'Sudan'},
    jewish_currents: {'url': 'https://jewishcurrents.org/feed', origin: 'US'},
    // crimethinc: {'url': 'https://crimethinc.com/rss', 'origin': 'US'}, caused weird error
    newlinesmag: {'url': 'https://newlinesmag.com/feed', origin: 'US'},
    novara: {'url': 'https://novaramedia.com/rss/', origin: 'UK'},
    derspekter: {'url': 'https://www.derspekter.org/rss', origin: 'International'},
    burningspear: {'url': 'https://theburningspear.com/rss/', origin: 'US'},
    blackagendareport: {'url': 'https://www.blackagendareport.com/feeds-story', origin: 'US'},
    bulatlat: {'url': 'https://www.bulatlat.com/rss', origin: 'Phillipines'},
    // elciudadano: {'url': 'https://www.elciudadano.com/en/rss', origin: 'Chile'}, caused different error
    feminisminindia: {'url': 'https://feminisminindia.com/rss', origin: 'India'}, // weird image loading
    lausancollective: {url: 'https://lausancollective.com/rss', origin: 'China'},
    junputh: {url: 'https://english.junputh.com/rss', origin: 'India'},
    himalmag: {url: 'https://www.himalmag.com/rss', origin: 'South Asia'},
    nativenewsonline: {url: 'https://nativenewsonline.net/rss', origin: 'US'},
    msf: {url: 'https://www.msf.org/rss/all', origin: 'International'},
    uyghurtimes: {'url': 'https://uyghurtimes.com/rss', origin: 'International'},
    leftberlin: {url: 'https://theleftberlin.com/rss', origin: 'Germany'},
    indybay: {url: 'https://www.indybay.org/syn/generate_rss.php?news_item_status_restriction=690690&include_blurbs=0&include_events=0&media_type_grouping_id=1&include_posts=1&region_id=0&topic_id=0', origin: 'US'}
    // newlefttimes -- monthlyyy

    

    //many sources from progressive international news wire
    
    // africaisacountry: {'url': 'https://africasacountry.com/feed', origin: 'Africa'} being wonky, but worth trying to fix
}



async function fetchRawFeeds(sourcesObj: SourcesObj) {
    // const rawFeeds = []
    for (const source in sourcesObj) {
        const sourceObj: SourceObj = sourcesObj[source]
        const url: string = sourceObj.url
        try {
            var t1 = performance.now()
            const response = await fetch(url)
            if (!response.ok) {
              throw new Error(`Response status: ${response.status}`)
            }
            const result = await response.text()
            
            sourceObj.rss = result;
            var t2 = performance.now();
            console.log(`fetching raw ${source} feed took ${(t2 - t1)/1000}`)
        }
        catch (error: any) {
            console.error(`Error fetching ${url}: ${error.message}`);
        }
    }
}

function parseFeeds(sourcesObj: SourcesObj) {
    for (const source in sourcesObj) {
        const sourceObj: SourceObj = sourcesObj[source]
        try {
            sourceObj.feedObj = parseFeed(sourceObj.rss)
        } catch {
            console.log(`unable to parse feed for ${source}!`)
        }
        delete sourceObj.rss;
    }
}

function gatherImgUrls(sourcesObj: SourcesObj) {
    for (let source in sourcesObj) {
        const sourceObj = sourcesObj[source]
        const feed = sourceObj.feedObj.feed;
        for (const item of feed.items) {
            let imgUrl = ""
            if (!imgUrl && item?.media?.contents) {
                const contents = item.media.contents;
                if (Array.isArray(contents) && contents[0]?.url) {
                    imgUrl = contents[0].url;
                }
            }
            if (!imgUrl && Array.isArray(item?.enclosures)) {
                const enclosures = item.enclosures;
                if (Array.isArray(enclosures) && enclosures[0]?.url) {
                    if (enclosures[0].url.match(/http(s)?:\/\/.+?(png|jpg|jpeg)/)) {
                        imgUrl = enclosures[0].url;
                    }
                }
            }
            if (!imgUrl && item?.description) {
                const descMatch = item.description.match(/http(s)?:\/\/.+?(png|jpg|jpeg)/);
                if (descMatch) {
                    imgUrl = descMatch[0];
                }
            }
            if (!imgUrl && item?.content?.encoded) {
                const cEncMatch = item.content.encoded.match(/http(s)?:\/\/(.){1,100}(png|jpg|jpeg)/);
                if (cEncMatch && !cEncMatch[0].includes('tracking')) {
                    imgUrl = cEncMatch[0];
                }
            }
            // if (!imgUrl && feed?.image?.url) {
            //     imgUrl = feed.image.url;
            // }
            item.imgUrl = imgUrl;
        }
    }
}

function cleanDescription(description: string) {
    //remove annoying tag: "The post [x] first appeared on [y]"
    description = description.split('The post')[0]
    //remove html elements and new lines
    description = description.replace(/(<[\s\S]*?>)+/g, '').replace(/\n/g, '')
    return description
}

function cleanSourcesObj(sourcesObj: SourcesObj) {
    for (const source in sourcesObj) {
        const sourceObj: SourceObj = sourcesObj[source];
        const items = sourceObj.feedObj.feed.items;
        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            const {title, link, pubDate, imgUrl} = item;
            let description = item?.description;
            let categories = item?.categories;
            item = {title, link, pubDate, imgUrl};
            if (description) {
                item.description = cleanDescription(description);
            }
            if (categories) {
                item.categories = categories;
            } 
            items[i] = item;
        }
        sourcesObj[source] = {items: items, url: sourceObj.url,  origin: sourceObj.origin};
    }
}

export async function gatherFeeds() {
    var t1 = performance.now();
    await fetchRawFeeds(sourcesObj);
    var t2 = performance.now();
    console.log(`fetching raw feeds took ${(t2 - t1)/1000}s`);

    var t1 = performance.now();
    parseFeeds(sourcesObj);
    var t2 = performance.now();
    gatherImgUrls(sourcesObj);
    cleanSourcesObj(sourcesObj);

    const json: string = JSON.stringify(sourcesObj);
    console.log(`gathering feeds took ${(t2 - t1)/1000}s`);
    return json;
}
/*

how to find images:

(nation, dissentmag, haitiantimes, dabanga) - src of first html image in description

(propublica, democracynow) - src of first html image in content:encoded

(intercept, guardian, ei) - item.media.contents[0].url

(dropsitenews, truthout) - item.enclosures[0].url

(npr, motherj, aljazeera) - feed.image.url [global image]

(hrw, jacobin) - none


-- test all urls --


TODO: think abt alt tags

*/