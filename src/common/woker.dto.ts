export type WorkerMessageDTO = {
    id?: string;
    type: number;
    data?: any;
    err?: string;
}

export function sendMsg(msg: WorkerMessageDTO) {
    self.postMessage(msg)
}