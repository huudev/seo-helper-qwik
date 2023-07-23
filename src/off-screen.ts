import { type ChromeMessageDTO, GET_CLIPBOARD, OFF_SCREEN, SERVICE_WORKER, sendChromeMsg } from "~/common/chrome-message.dto"

function getClipboard() {
    // @ts-ignore
    const t = window['text'] as HTMLTextAreaElement
    t.value = ''
    t.select()
    document.execCommand("paste")
    return t.value
}

chrome.runtime.onMessage.addListener((msgObj: ChromeMessageDTO) => {
    // #v-ifdef MODE=development
    console.log('Nhận chrome messsage trong off screen')
    console.log(msgObj)
    // #v-endif
    if ((msgObj.target & OFF_SCREEN) == 0) {
        return
    }
    switch (msgObj.type) {
        case GET_CLIPBOARD:
            const text = getClipboard()
            sendChromeMsg({ type: GET_CLIPBOARD, data: text, target: SERVICE_WORKER })
            break
    }
})