export function termToSentences(term: string): string[] {
    return term.split(/\r\n|\n|\r/).map(item => item.trim()).filter(item => item !== '');
}