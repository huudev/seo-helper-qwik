import { ChromeMessageDTO } from "./common/chrome-message.dto"

function sendMessage(mgs: ChromeMessageDTO) {
    self.postMessage(mgs)
}

self.addEventListener('message', async e => {
    const { url, id } = e.data
    fetch(url)
        .then(res => res.text())
        .then(html => sendMessage({ id, data: html, target: 0 }))
        .catch(e => sendMessage({ id, err: 'ERR', target: 0 }))
})