const { parse } = require('node-html-parser');
const fs = require('fs');
const path = require('path');

const manifestPath = './dist/manifest.json';
const manifset = require(manifestPath);
manifset.action.default_popup = "popup/index.html"
fs.writeFileSync(manifestPath, JSON.stringify(manifset));

const popup = fs.readFileSync(path.join(__dirname, 'dist/popup/index.html'), { encoding: 'utf8', flag: 'r' })
const root = parse(popup, { comment: true });
const scripts = root.querySelectorAll('script:not([src]):not([type="qwik/json"])')
let count = 0
for (const script of scripts) {
    count++
    fs.writeFileSync(path.join(__dirname,  'dist/' + count + '.js'), script.textContent);
    script.setAttribute('src', '/'+ count + '.js' )
    script.textContent = ''
}
fs.writeFileSync(path.join(__dirname, 'dist/popup/index.html'), root.toString());