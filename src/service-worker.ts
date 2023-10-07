// <reference no-default-lib="true" />
/// <reference lib="WebWorker" />

import { type ChromeMessageDTO, GET_CLIPBOARD, OFF_SCREEN, SERVICE_WORKER, sendChromeMsg } from "./common/chrome-message.dto";
import { searchDefault } from "./common/search.service";
import { termToSentences } from "./common/util.service";

// export empty type because of tsc --isolatedModules flag
export type { };
declare const self: ServiceWorkerGlobalScope;

// #v-ifdef MODE=development
console.log('Bắt đầu')
self.addEventListener('fetch', function (event: FetchEvent) {
    console.log(event.request);
    const url = new URL(event.request.url)
    if (url.pathname == '/') {
        return
    }
    // if (!url.pathname.endsWith('popup.html')) {

    // }
    url.protocol = 'http'
    url.hostname = 'localhost'
    url.port = '3000'
    let Accept = '*/*';
    switch (event.request.destination) {
        case 'document':
            Accept = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.'
            break
        case 'style':
            Accept = 'text/css,*/*;q=0.1'
            break

    }

    event.respondWith(fetch(url, { headers: { Accept } }).then(res => {
        return new Response(res.body, { status: res.status, statusText: res.statusText, headers: res.headers })
    }))


    // const checkReq = url.pathname.endsWith('popup.html') ? Promise.reject('R') : fetch(event.request.url)
    // event.respondWith(checkReq.catch(() => fetch(url, { headers: { Accept } }).then(res => {
    //     return new Response(res.body, { status: res.status, statusText: res.statusText, headers: res.headers })
    //     // if (url.pathname.endsWith('.js') || url.pathname.endsWith('.mjs')) {
    //     //     return new Response(res.body, {
    //     //         headers: new Headers({ 'Content-Type': 'application/javascript' })
    //     //     })
    //     // } else {
    //     //     return res
    //     // }
    // })))

    // if (!event.request.url.includes(chrome.runtime.id) || event.request.url.includes('.html')) {
    //     event.respondWith(fetch(event.request))
    // } else {
    //     const url = new URL(event.request.url)
    //     url.protocol = 'https'
    //     url.hostname = 'localhost'
    //     url.port = '8088'
    //     event.respondWith(fetch(url.href).then(res => {
    //         if (url.pathname.endsWith('.js')) {
    //             return new Response(res.body, {
    //                 headers: new Headers({ 'Content-Type': 'application/javascript' })
    //             })
    //         } else {
    //             return res
    //         }
    //     }))
    // }
})
// #v-endif

let creating: Promise<void> | undefined | null; // A global promise to avoid concurrency issues
async function setupOffscreenDocument() {
    const path = 'off-screen.html'
    const offscreenUrl = chrome.runtime.getURL(path);
    const matchedClients = await self.clients.matchAll();
    for (const client of matchedClients) {
        if (client.url === offscreenUrl) {
            return;
        }
    }

    // create offscreen document
    if (creating) {
        await creating;
    } else {
        chrome.offscreen.Reason.CLIPBOARD

        creating = chrome.offscreen.createDocument({
            url: path,
            reasons: ['CLIPBOARD' as chrome.offscreen.Reason],
            justification: 'reason for needing the document',
        });
        await creating;
        creating = null;
    }
}

chrome.commands.onCommand.addListener(async (command) => {
    switch (command) {
        case "search":
            await setupOffscreenDocument()
            sendChromeMsg({ type: GET_CLIPBOARD, target: OFF_SCREEN })
            break
    }
});

chrome.runtime.onMessage.addListener(async (msgObj: ChromeMessageDTO) => {
    // #v-ifdef MODE=development
    console.log('Nhận chrome messsage trong service worker')
    console.log(msgObj)
    // #v-endif
    if ((msgObj.target & SERVICE_WORKER) == 0) {
        return
    }
    switch (msgObj.type) {
        case GET_CLIPBOARD:
            searchDefault(termToSentences(msgObj.data))
            break
    }
})