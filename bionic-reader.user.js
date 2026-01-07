// ==UserScript==
// @name         Bionic Reader
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Converts a web page to Bionic Reading format
// @author       vidyasak
// @match        http://*/*
// @match        https://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

     // CSS function to preserve link colors
    const style = document.createElement('style');
    style.textContent = `
        a strong {
            color: inherit !important;
        }
    `;
    document.head.appendChild(style);


    // Function to apply Bionic Reading to text
    function applyBionicReading(text) {
        const words = text.split(' ');
        let bionicText = '';

        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            let bolded = '';
            const middleIndex = Math.floor(word.length / 2);

            for (let j = 0; j < word.length; j++) {
                if (j < middleIndex) {
                    bolded += '<strong>' + word[j] + '</strong>';
                } else {
                    bolded += word[j];
                }
            }

            bionicText += bolded + ' ';
        }

        return bionicText.trim();
    }

    // Find all text nodes on the page
    function processTextNodes() {
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function(node) {
                    // Exclude text within scripts, styles, and code-related element
                    if (node.parentElement) {
                        const tag = node.parentElement.tagName;
                        const isCode = node.parentElement.closest('pre, code, .highlight, .sourceCode');
                        if (['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(tag) || isCode) {
                            return NodeFilter.FILTER_REJECT;
                        }
                    }
                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );

        const nodes = [];
        let node;
        while (node = walker.nextNode()) {
            nodes.push(node);
        }

        // Process collected nodes
        nodes.forEach(textNode => {
            if (textNode.nodeValue.trim()) {
                const span = document.createElement('span');
                span.innerHTML = applyBionicReading(textNode.nodeValue);
                textNode.parentNode.replaceChild(span, textNode);
            }
        });
    }

    // Execute the script
    processTextNodes();
})();