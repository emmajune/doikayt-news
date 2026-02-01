
//remove duplicate description x contentEncoded pairs

export async function compileNews(newsItems) {

    var compiledHTML = ''

    for (let i = 0; i < newsItems.length; i++) {
        try {
            var { title, pubDate, link, description } = newsItems[i].item
            //var contentEncoded = newsItems[i].item['content:encoded']
        }
        catch {
            var { title, pubDate, link, description } = newsItems[i]
        }   //var contentEncoded = newsItems[i]['content:encoded']

        
        let source = link.split('://')[1].split('/')[0]
            if (source.split('.').length === 2) {
                source = source.split('.')[0]
            }
            else {
                source = source.split('.')[1].split('.')[0]
            }

        source = source.toUpperCase()

        pubDate = pubDate?.substring(5, 16)

        if (title.length > 150) {
            title = title.substring(0, 87) + '...' 
        }

        function unHtml(str) {
            str = str.replace(/(<[\s\S]*?>)+/g, ' ')
            str = str.replaceAll('\\n', ' ')
            str = str.replaceAll(/&[^\s]+?;/g, ' ')
            str = str.replace(/&[^\s]*?;/g, ' ')
            str = str.replaceAll('  ', ' ')
            str = str.replaceAll(' s ', "'s ")
            return str.split('<')[0]
        }
        //description = description + (contentEncoded ? ' '+contentEncoded : '')
        description = unHtml(description + '')
        description = description.replace(/\n/g, '')

        let shortDescription = description
        // if (description.length > 307) {
        //     shortDescription = description.substring(0, 307) + '...' 
        // }
        function isolateMatches(matches, description) {
            let parsedMatches = {}
            let obj = matches
            //'matches' becomes an inverted matches obj wherein matches descend from categories
            for (let i = 0; i < Object.keys(obj).length; i++) {
                let matchedWord = Object.keys(obj)[i]
                for (let i = 0; i < Object.keys(obj[matchedWord]).length; i++) {
                let field = Object.keys(obj[matchedWord])[i]
                if (!Object.hasOwn(parsedMatches, field)) {
                    parsedMatches[field] = []
                    }
                parsedMatches[field].push(matchedWord)
                }
            }
            var mainArr = []
            if (Object.hasOwn(parsedMatches, 'description')) {
                var words = Object.values(parsedMatches.description)
                for (let i = 0; i < words.length; i++) {
                    let word = words[i]
                    mainArr.push(...matchWord(word, description))
                }
            }
            //pads each match w/ textual context
            function matchWord(wMatch, str){
                var length = str.split(wMatch).length
                var indexPadding = 0
                let parsedMatches = []
                for (let i = 0; i < length; i++) {
                    let padding = 240
                    let index = str.toLowerCase().search(wMatch)
                    if (index === -1) {
                        continue
                    }
                    let padStart = padding
                    if (padStart > str.split(wMatch)[i].length) {
                        padStart = str.split(wMatch)[i].length
                    }
                    let padEnd = padding
                    if (padEnd > str.split(wMatch)[i].length) {
                        padEnd = str.split(wMatch)[i].length
                    }
                    let result = str.slice(index-padStart, index+wMatch.length+30)
                    // let startsSentence = /[A-Z]/.test(result[0])
                    // let endsSentence = /[\.\!\?]/.test(result[result.length-1])
                    // result = result.split(' ')
                    // let firstWord = result[0]
                    // let lastWord = result[result.length-1]
                    // result = result.slice(1, -1).join(' ')
                    // if (startsSentence) {
                    //     result = firstWord + ' ' + result
                    // }
                    // if (endsSentence) {
                    //     result = result + ' ' + lastWord
                    // }
                    padStart = result.search(wMatch)
                    str = str.slice(index + padEnd)
                    var resultArr = []
                    resultArr[0] = indexPadding + index - padStart
                    indexPadding += index + padEnd
                    resultArr[1] = result
                    parsedMatches.push(resultArr)
                }
                return parsedMatches
            }
            //pretty self-explanatory, imo
            function merge(...arrs) {
                var bigIndex = arrs.sort((a,b)=>{b[0]-a[0]})[0]
                var longArr = arrs.sort((a,b)=>b[1].length - a[1].length)
                if (!longArr[0]) {
                    return 'BROKEN'
                }
                var mArr = Array(longArr[0][1].length + bigIndex[0])
                for (let i = 0; i < arrs.length; i++) {
                if (arrs[i]) {
                    mArr.splice(arrs[i][0], arrs[i][1].length, ...arrs[i][1])
                }
                }
                return mArr
            }
            //joins array into a string; replaces any number of undefined values between two array elements that aren't undefined with one joining character
            function looseJoin(arr, uJoint) {
                var str = ''
                var undef = false
                for (let i = 0; i < arr.length; i++) {
                if (arr[i]!=undefined) {
                    if (undef) {
                    str += uJoint
                    }
                    str += arr[i]
                    undef = false
                }
                else {
                    undef = true
                }
                }
                return str
            }
            return looseJoin(merge(...mainArr), '...').replaceAll('....', '...').replaceAll('... ', '...')
        }

        compiledHTML += `
    <div class="news-item" id="${i}"><span class="news-infobar">
             (${source} ${', '+pubDate ? pubDate : ''})<br />
             <a href="${link}">${title}</a>
        </span>
        <p class="description">${description.replace(/(0 undefined$)|(undefined$)/, '')}</p>
    </div>`
            // newsItems[i] = { title, pubDate, link, description }
        }
        

    return compiledHTML.replaceAll(' ()', '')

    // return newsItems

}

export default compileNews