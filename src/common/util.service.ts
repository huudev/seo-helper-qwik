export function termToSentences(term: string): string[] {
    return term.split(/\r\n|\n|\r/).map(item => item.trim()).filter(item => item !== '');
}

const queryCheck = (s: string) => document.createDocumentFragment().querySelector(s)

export function isSelectorValid(selector: string) {
    try { queryCheck(selector) } catch { return false }
    return true
}
