export async function searchGoogle(items: string[], excludeSites = [] as string[]) {
    const exclusiveSites = excludeSites.map(site => '-' + site)
    for (const item of items) {
        await chrome.tabs.create({ url: `https://www.google.com/search?q=${item.split(/\s+/).concat(exclusiveSites).join('+')}` })
    }
}

export async function searchDefault(items: string[]) {
    for (const text of items) {
        await chrome.search.query({ disposition: "NEW_TAB", text })
    }
}