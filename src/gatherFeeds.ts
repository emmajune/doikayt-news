import {parseFeed} from 'feedsmith'

type SourceObj = {origin: string, url: string, rss?: string, feedObj?: any, items?: any, noimg?: true};
type SourcesObj = {[key: string]: SourceObj};



// sourcesObj = {commondreams: sourcesObj.commondreams}

async function fetchRawFeeds(sourcesObj: SourcesObj) {
    // const rawFeeds = []
    for (const source in sourcesObj) {
        const sourceObj: SourceObj = sourcesObj[source];
        const url: string = sourceObj.url;
        try {
            var t1 = performance.now();
            const response = await fetch(url, { signal: AbortSignal.timeout(3000) })
            if (!response.ok) {
              throw new Error(`Response status: ${response.status}`);
            }
            const result = await response.text();
            
            sourceObj.rss = result;
            var t2 = performance.now();
            console.log(`fetching raw ${source} feed took ${(t2 - t1)/1000}`);
        }
        catch (error: any) {
            console.error(`Error fetching ${url}: ${error.message}`);
        }
    }
}

function parseFeeds(sourcesObj: SourcesObj) {
    for (const source in sourcesObj) {
        const sourceObj: SourceObj = sourcesObj[source];
        try {
            sourceObj.feedObj = parseFeed(sourceObj.rss);
            delete sourceObj.rss;
        } catch {
            delete sourcesObj[source];
            console.log(`unable to parse feed for ${source}!`);
        }
    }
}

function gatherImgUrls(sourcesObj: SourcesObj) {
    for (let source in sourcesObj) {
        try {
        const sourceObj = sourcesObj[source]
        const feed = sourceObj.feedObj.feed;
        if (Object.hasOwn(feed, 'entries')) {
            feed.items = feed.entries;
            delete feed.entries;
        }
        if (Object.hasOwn(sourceObj, 'noimg')) {
            continue;
        }
        for (const item of feed.items) {
            let imgUrl = "";
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
            if (!imgUrl && item?.content) {
                const content = item.content?.encoded || item.content;
                const contentMatch = content.match(/http(s)?:\/\/(.){1,100}(png|jpg|jpeg)/);
                if (contentMatch && !contentMatch[0].includes('tracking')) {
                    imgUrl = contentMatch[0];
                }
            }
            if (!imgUrl && feed?.image?.url) {
                imgUrl = feed.image.url;
            }
            item.imgUrl = imgUrl;
        }
    } catch{}
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
    let maxPubDate = 0;
    let minPubDate = Date.now();
    for (const source in sourcesObj) {
        try {
        const sourceObj: SourceObj = sourcesObj[source];
        const items = sourceObj.feedObj.feed.items;
        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            const {title, imgUrl} = item;
            var pubDate = item?.pubDate || item.published;
            // pubDate = (new Date(pubDate)).toTimeString()
            if (pubDate) {
                pubDate = Date.parse(pubDate)
                if (pubDate > maxPubDate) {
                    maxPubDate = pubDate;
                }
                if (pubDate < minPubDate) {
                    minPubDate = pubDate;
                }
            }
            else {
                console.log('FUCKKDSFKFD')
            }
            // console.log({pubDate})
            if (Object.hasOwn(item, 'link')) {
                var link = item.link;
            } else if (Object.hasOwn(item, 'links')) {
                var link = item.links[0].href;
            } else {
                var link = item.id;
            }
            let description = item?.description;
            if (!description && Object.hasOwn(item, 'content')) {
                description = item.content.replace(/(<[\s\S]*?>)+/g, '').replace(/\//g, '');
            } else if (description && description.replace(/(<[\s\S]*?>)+/g, '').length < 200 && item?.content?.encoded) {
                description = item.content.encoded.replace(/(<[\s\S]*?>)+/g, ' / ').replace(/\/ \//g, '');
            }
            // let categories = item?.categories;
            item = {title, link, pubDate, imgUrl};
            if (description) {
                item.description = cleanDescription(description);
            }
            // if (categories) {
            //     item.categories = categories;
            // } 
            items[i] = item;
        }
        sourcesObj[source] = {items: items, url: sourceObj.url,  origin: sourceObj.origin};
        }
        catch {}
    }
    for (const source in sourcesObj) {
        try {
        const sourceObj = sourcesObj[source];
        for (const item of sourceObj.items) {
            item.normPubDate = (item.pubDate - minPubDate)/(maxPubDate - minPubDate);
            if (Number.isNaN(item.normPubDate)) {
                item.normPubDate = .5;
            }
            // console.log({'normpubdate': item.normPubDate})
        }
    }catch{}}
}

export async function gatherFeeds() {
    var sourcesObj: SourcesObj = {
    // the_nation: {url: 'https://thenation.com/feed/?post_type=article', origin: 'US'},
    // npr: {url: 'https://feeds.npr.org/1014/rss.xml', origin: 'US'},
    // the_guardian: {url: 'https://www.theguardian.com/world/rss', origin: 'Britain'}, // ughh, it keepts being racist
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
    crimethinc: {'url': 'https://crimethinc.com/rss', 'origin': 'US'},
    newlinesmag: {'url': 'https://newlinesmag.com/feed', origin: 'US'},
    novara: {'url': 'https://novaramedia.com/rss/', origin: 'Britain'},
    derspekter: {'url': 'https://www.derspekter.org/rss', origin: 'International'},
    burningspear: {'url': 'https://theburningspear.com/rss/', origin: 'US'},
    blackagendareport: {'url': 'https://www.blackagendareport.com/feeds-story', origin: 'US'},
    bulatlat: {'url': 'https://www.bulatlat.com/rss', origin: 'Philipines'},
    // feminisminindia: {'url': 'https://feminisminindia.com/rss', origin: 'India', noimg: true}, // weird image loading
    lausancollective: {url: 'https://lausancollective.com/rss', origin: 'China'},
    junputh: {url: 'https://english.junputh.com/rss', origin: 'India'},
    himalmag: {url: 'https://www.himalmag.com/rss', origin: 'International'},
    hcn: {url: 'https://www.hcn.org/rss', origin: 'US'},
    amnesty: {url: 'https://www.amnesty.org/en/rss', origin: 'International'},
    _404media: {url: 'https://www.404media.co/rss', origin: 'US'},
    commondreams: {url: 'https://www.commondreams.org/feeds/news.rss', origin: 'US'},
    leftycartoons: {url: 'https://leftycartoons.com/rss', origin: 'US'},
    unicornriot: {url: "https://www.unicornriot.ninja/rss", origin: "US"},
    leftvoice: {url: 'https://www.leftvoice.org/rss', origin: 'International'},
    africaisacountry: {'url': 'https://africasacountry.com/feed', origin: 'International'},
    icij: {'url': 'https://www.icij.org/rss', origin: 'International'},
    uyghurnews: {'url': 'https://uyghurnews.org/rss', origin: 'International'},
    uyghurtimes: {'url': 'https://uyghurtimes.com/rss', origin: 'International', noimg: true},
    rohingyakhobor: {'url': 'https://rohingyakhobor.com/rss', origin: 'Myanmar'},
    hyperallergic: {'url': 'https://hyperallergic.com/rss', 'origin': 'US'},
    // aljazeera: {url: 'http://aljazeera.com/rss', origin: 'International'},
    cpj: {url: 'https://cpj.org/rss', origin: 'International'},
    freedom: {url: 'http://freedomnews.org.uk/rss', origin: 'Britain'},
    commons: {url: 'https://commons.com.ua/en/rss', origin: 'Ukraine'},
    anticapitalistresistance: {url: 'https://anticapitalistresistance.org/rss', origin: 'Britain'}
}
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
    console.log(`json lenght: ${json.length}`)
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