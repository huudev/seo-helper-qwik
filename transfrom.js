const { parse } = require('node-html-parser');
const fs = require('fs');
const path = require('path');
const outputDir = path.join(__dirname, 'dist');

const sitemap = fs.readFileSync(path.join(outputDir, '/sitemap.xml'), { encoding: 'utf8', flag: 'r' })
const urlset = parse(sitemap)
const locs = urlset.querySelectorAll('loc')
let count = 0
const contentToOrder = new Map()
for (const loc of locs) {
    const page = loc.textContent.replace('https://yoursite.qwik.dev/', '').replace('/', '')

    const manifestPath = path.join(outputDir, 'manifest.json');
    const manifset = require(manifestPath);
    manifset.action.default_popup = "popup/index.html"
    fs.writeFileSync(manifestPath, JSON.stringify(manifset));

    const htmlPath = path.join(outputDir, page, 'index.html');
    const html = fs.readFileSync(htmlPath, { encoding: 'utf8', flag: 'r' })
    const root = parse(html, { comment: true });
    const scripts = root.querySelectorAll('script:not([src]):not([type="qwik/json"])')
    for (const script of scripts) {
        const textContent = script.textContent;
        if (!textContent) {
            continue;
        }
        if (contentToOrder.has(textContent)) {
            script.setAttribute('src', contentToOrder.get(textContent))
        } else {
            count++
            const jsPathInHtml = '/' + count + '.js';
            contentToOrder.set(textContent, jsPathInHtml)
            fs.writeFileSync(path.join(outputDir, jsPathInHtml), textContent);
            script.setAttribute('src', jsPathInHtml)
        }
        script.textContent = ''
    }
    fs.writeFileSync(htmlPath, root.toString());
}