import { sendMsg } from "../woker.dto"


self.addEventListener('message', async e => {
    const { url, id } = e.data
    fetch(url)
        .then(res => res.text())
        .then(html => sendMsg({ id, data: html, type: 0 }))
        .catch(() => sendMsg({ id, err: 'ERR', type: 0 }))
})