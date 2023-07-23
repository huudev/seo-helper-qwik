
export type ChromeMessageDTO = {
    id?: string;
    target: number;
    type?: number;
    data?: any;
    err?: string;
}

export function sendChromeMsg(msg: ChromeMessageDTO) {
    chrome.runtime.sendMessage(msg)
}

export const SERVICE_WORKER = 1
export const OFF_SCREEN = 2

export const GET_CLIPBOARD = 16