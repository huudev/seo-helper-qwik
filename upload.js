const fs = require('fs')
const path = require('path')
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fns = require('date-fns')
const JSZip = require('jszip')

const zip = new JSZip();

const nameUpload = 'seo-helper-qwik_' + fns.format(new Date(), 'yyyyMMdd_HHmmss')

const dist = zip.folder(nameUpload);
for (const filePath of walkSync(path.join(__dirname, 'dist'))) {
    dist.file(filePath, fs.readFileSync(path.join('dist', filePath)))
}

const uploadFolder = path.join(__dirname, 'upload');

(async () => {
    const buffer = await zip.generateAsync({ type: 'nodebuffer' })
    if (fs.existsSync(uploadFolder)) {
        fs.rmSync(uploadFolder, { recursive: true, force: true });
    }
    fs.mkdirSync(uploadFolder)
    const fileZipPath = path.join(uploadFolder, nameUpload + '.zip')
    fs.writeFileSync(fileZipPath, buffer)
    console.log(`Ghi tập tin ${fileZipPath} thành công`)
    await exec(`powershell -command "scb -Path ${fileZipPath}"`)
    console.log('Sao chép clipboard thành công')
    try {
        await exec('explorer "https://duyettaptin.pages.dev/manager/-NksfXl_2aqpuSDGZzkZ"')
    } catch(e) { }
})();

function* walkSync(dir, base = '') {
    const files = fs.readdirSync(dir, { withFileTypes: true })
    for (const file of files) {
        if (file.isDirectory()) {
            yield* walkSync(path.join(dir, file.name), path.join(base, file.name))
        } else {
            yield path.join(base, file.name)
        }
    }
}