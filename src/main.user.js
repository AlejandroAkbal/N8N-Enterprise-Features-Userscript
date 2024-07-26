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
// @match           https://n8n.akbal.dev/*
// @grant           none
// @run-at          document-start
// @require         https://cdn.jsdelivr.net/npm/diff@5.2.0/dist/diff.min.js
// ==/UserScript==

(function () {
    'use strict'

    console.log('[N8N Enterprise Features] Userscript started...')

    const scriptPattern = /\/assets\/index-.*\.js$/
    const patchUrl = 'https://raw.githubusercontent.com/AlejandroAkbal/N8N-Enterprise-Features-Userscript/main/src/index.patch'

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

                console.debug('[N8N Enterprise Features] Script tag found:', node.src)

                // Prevent the original script from loading
                node.type = 'javascript/blocked'

                const patch = await fetchPatch(patchUrl)
                const modifiedText = await fetchAndModifyScript(node.src, patch)

                // TODO: Insert at the same position as the original script
                const script = document.createElement('script')
                script.type = 'module'
                script.textContent = modifiedText
                const newChild =document.head.appendChild(script)

                console.debug('[N8N Enterprise Features] Script tag modified')
            }
        }
    })

    // Start observing the document for script tag additions
    observer.observe(document, {childList: true, subtree: true})

    console.debug('[N8N Enterprise Features] Started observer')
})()