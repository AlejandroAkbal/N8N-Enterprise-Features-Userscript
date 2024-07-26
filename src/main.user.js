// ==UserScript==
// @name            N8N Enterprise features
// @namespace       AlejandroAkbal
// @version         0.2.0
// @description     Enables N8N Enterprise features
// @author          Alejandro Akbal
// @icon            https://www.google.com/s2/favicons?sz=64&domain=n8n.io
// @license         AGPL-3.0
// @homepage        https://github.com/AlejandroAkbal/N8N-Enterprise-Features-Userscript
// @downloadURL     https://raw.githubusercontent.com/AlejandroAkbal/N8N-Enterprise-Features-Userscript/main/src/main.user.js
// @updateURL       https://raw.githubusercontent.com/AlejandroAkbal/N8N-Enterprise-Features-Userscript/main/src/main.user.js
// @match           https://n8n.*.*/
// @grant           none
// @run-at          document-idle
// @require         https://cdn.jsdelivr.net/npm/diff@5.2.0/dist/diff.min.js
// ==/UserScript==

(function () {
    'use strict'

    const scriptPattern = /\/assets\/index-.*\.js$/
    const patchUrl = 'https://example.com/path/to/diff.patch'

    // Fetch the patch content
    async function fetchPatch(url) {
        const response = await fetch(url)

        if (!response.ok) {
            throw new Error(`Failed to fetch patch: ${response.statusText}`)
        }

        return await response.text()
    }

    function applyPatch(source, patch) {
        const patchedCode = Diff.applyPatch(source, patch)

        return patchedCode || source
    }

    // Fetch and modify the script content
    async function fetchAndModifyScript(url, patch) {
        const response = await fetch(url)

        if (!response.ok) {
            throw new Error(`Failed to fetch script: ${response.statusText}`)
        }

        const text = await response.text()

        return applyPatch(text, patch)
    }

    // MutationObserver to detect script tags
    const observer = new MutationObserver(async (mutations) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.tagName !== 'SCRIPT') continue

                if (!scriptPattern.test(node.src)) continue

                // Prevent the original script from loading
                node.type = 'javascript/blocked'

                const patch = await fetchPatch(patchUrl)
                const modifiedText = await fetchAndModifyScript(node.src, patch)

                const script = document.createElement('script')
                script.textContent = modifiedText
                document.head.appendChild(script)
            }
        }
    })

    // Start observing the document for script tag additions
    observer.observe(document, {childList: true, subtree: true})
})()