export async function searchGoogle(term: string, excludeSites = [] as string[]) {
    const exclusiveSites = excludeSites.map(site => '-' + site)
    const items: string[] = term.split(/\r\n|\n|\r/).map(item => item.trim()).filter(item => item !== '')
    for (const item of items) {
        await chrome.tabs.create({ url: `https://www.google.com/search?q=${item.split(/\s+/).concat(exclusiveSites).join('+')}` })
    }
}