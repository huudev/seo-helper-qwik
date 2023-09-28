export type FetchAnchorForm = {
    cssSelector: string;
    pageUrls: string;
};

export type Item = {
    text: string;
    url: string;
}

export type FetchAnchorResultInfo = {
    pageUrl: string;
    items: Item[];
    status: string;
}

export const STATUS_PROCESSING = 'Đang xử lý'
export const STATUS_SUCESS = 'Thành công'
export const STATUS_FAIL = 'Thất bại'