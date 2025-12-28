export function disclosureHtml(sourcesObj) {

    var viewpoints = {}

    for (let source in sourcesObj) {
        let viewpoint = sourcesObj[source].vp
        if (!viewpoints[viewpoint]) {
            viewpoints[viewpoint] = []
        }
        viewpoints[viewpoint]?.push(source)
    }
    //explain how this works eventually in comments!!!!
    var disclosureHTML = ''
    var VPsKeys = Object.keys(viewpoints)
    console.log(VPsKeys)
    for (let i = 0; i < VPsKeys.length; i++) {
        console.log(viewpoints[VPsKeys[i]])
        disclosureHTML += `<li style="padding-top: 0; padding-bottom: 0;"><details>
    <summary style="padding: var(--size-m) !important">${VPsKeys[i]}</summary>`
        for (let j = 0; j < viewpoints[VPsKeys[i]].length; j++) {
            let sourceName = viewpoints[VPsKeys[i]][j]
            disclosureHTML += `
        <label for="${sourceName}">
            <input type="checkbox" id="${sourceName}" name="${sourceName}" /> ${sourceName}
        </label>`
        }
        disclosureHTML += '\n</li></details>'
    }
    return disclosureHTML
}

export default disclosureHtml