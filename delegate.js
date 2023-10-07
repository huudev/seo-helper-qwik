const express = require('express')
const axios = require('axios');
const cors = require('cors')
const { parse } = require('node-html-parser');
const app = express()
const port = 3000

app.use(cors())

const targetDomain = 'http://localhost:5173'
let count = 0;
const textToUrl = new Map()
const urlToText = new Map()
app.get('*', async (req, res) => {
    console.log('[START]' + req.originalUrl)
    if (urlToText.has(req.originalUrl)) {
        res.setHeader('Content-Type', 'text/javascript');
        res.send(urlToText.get(req.originalUrl))
        return
    }
    let path = req.originalUrl;
    path = path.replace(/index.html$/g, '/')
    const url = new URL(path, targetDomain)
    try {
        const targetRes = await axios.get(url, {
            headers: {
                Accept: req.originalUrl.match(/.html$/g) ? 'text/html' : req.headers.accept
            }
        })
        const contentType = targetRes.headers['content-type'];
        if (contentType && contentType.includes('text/html')) {
            const root = parse(targetRes.data, { comment: true });
            const scripts = root.querySelectorAll('script:not([src]):not([type="qwik/json"])')
            for (const script of scripts) {
                if (!textToUrl.has(script.text)) {
                    count++
                    const newUrl = '/' + count + '.js'
                    textToUrl.set(script.text, newUrl)
                    urlToText.set(newUrl, script.text)
                }
                script.setAttribute('src', textToUrl.get(script.text))
                script.textContent = ''
            }
            targetRes.data = root.toString()
        }
        res.set(targetRes.headers)
        if (path == '/@vite/client') {
            targetRes.data = targetRes.data.replace(', socketHost,', ', "localhost:5173/",')
        }
        res.send(targetRes.data)
    } catch (e) {
        // console.error(e)
        console.error('[ERR]', req.originalUrl, e.code)
        res.status(e.response.status);
        res.send(e.response.data)
    }
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})