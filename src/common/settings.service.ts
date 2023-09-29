

export interface SettingEntry<T> {
    key: string;
    defVal: T;
}

export async function getSetting<T>({ key, defVal }: SettingEntry<T>): Promise<T> {
    const items = await chrome.storage.sync.get(key)
    if (items[key]) {
        return items[key]
    } else {
        return defVal
    }
}

export async function setSetting<T>({ key }: SettingEntry<T>, value: T): Promise<void> {
    chrome.storage.sync.set({ [key]: value });
}

export const SEARCH_EXCLUSION_LIST: SettingEntry<string[]> = { key: 'SEARCH_EXCLUSION_LIST', defVal: ['youtube.com', 'facebook.com'] }

export const FETCH_ANCHOR_CSS_SELECTOR: SettingEntry<string> = { key: 'FETCH_ANCHOR_CSS_SELECTOR', defVal: '' }
export const FETCH_ANCHOR_URL_FILTER: SettingEntry<string> = { key: 'FETCH_ANCHOR_URL_FILTER', defVal: '' }

export const EDITOR_HELPER_WARNING_COLOR: SettingEntry<string> = { key: 'EDITOR_HELPER_WARNING_COLOR', defVal: '#ff0000' }
export const EDITOR_HELPER_WARNING_LENGTH: SettingEntry<number> = { key: 'EDITOR_HELPER_WARNING_LENGTH', defVal: 20 }