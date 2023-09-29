import FetchWorker from "./worker?worker"

const store: Record<number, { resolve: (html: string) => void, reject: () => void }> = {};
let count = 0;

let worker: Worker;

// prevent browser auto load preload resouce when fetch in main thread
export function fetchHtml(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const id = count++
        store[id] = { resolve, reject }
        if (worker == null) {
            worker = new FetchWorker()
            worker.addEventListener('message', e => {
                const { id, data, err } = e.data
                const record = store[id]
                delete store[id]
                if (err) {
                    record.reject()
                } else {
                    record.resolve(data)
                }
            })
        }
        worker.postMessage({ id, url })
    });
}