export function disclosureHtml(sourceNames, sourcesObj) {

    var viewpoints = {}

    for (let source in sourcesObj) {
        let viewpoint = sourcesObj[source].vp
        if (!viewpoints[viewpoint]) {
            viewpoints[viewpoint] = []
        }
        viewpoints[viewpoint]?.push(source)
    }
    //explain how this works eventually thru comments!!!!
    var disclosureHTML = ''
    var VPsKeys = Object.keys(viewpoints)
    for (let i = 0; i < VPsKeys.length; i++) {
        disclosureHTML += `<li style="padding-top: 0; padding-bottom: 0;"><details>
    <summary style="padding: var(--size-m) !important">${VPsKeys[i]}</summary>
    <kelp-select-all id="ss-${VPsKeys[i]}-c" target="#${VPsKeys[i]}-div [type='checkbox']">
		<label for="select-all-${VPsKeys[i]}">
			<input type="checkbox" id="select-all-${VPsKeys[i]}" am-i-checked-${VPsKeys[i]}>
			select all
		</label>
	</kelp-select-all>
    <div id="${VPsKeys[i]}-div">
    `
        let checkedNum = 0
        for (let j = 0; j < viewpoints[VPsKeys[i]].length; j++) {
            let sourceName = viewpoints[VPsKeys[i]][j]
            let checked
            if (sourceNames) {
                if (sourceNames.includes(sourceName)) {
                    checked = ' checked'
                    checkedNum++
                }
                else {
                    checked = ''
                }
            }
            disclosureHTML += `
        <label for="${sourceName}">
            <input type="checkbox" id="${sourceName}" name="${sourceName}"${checked} /> ${sourceName}
        </label>`
        }
        disclosureHTML += '\n</div></li></details>'
        if (checkedNum === viewpoints[VPsKeys[i]].length) {
            disclosureHTML = disclosureHTML.replace(`am-i-checked-${VPsKeys[i]}`, 'checked')
        }
        else {
            disclosureHTML = disclosureHTML.replace(` am-i-checked-${VPsKeys[i]}`, '')
        }
    }
    return disclosureHTML
}

export default disclosureHtml