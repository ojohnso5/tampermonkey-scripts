/**
 * Font embedding. Fonts are inlined as base64 WOFF2 so every generated SVG
 * is fully self-contained and renders identically anywhere.
 */
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'fonts');

const cache = {};
function b64(file) {
  if (!cache[file]) {
    cache[file] = fs.readFileSync(path.join(DIR, file)).toString('base64');
  }
  return cache[file];
}

/** @font-face block for the brand typefaces. */
function faces() {
  return `
  <style type="text/css"><![CDATA[
    @font-face{font-family:'Bebas Neue';src:url(data:font/woff2;base64,${b64('bebas-neue-latin-400-normal.woff2')}) format('woff2');font-weight:400;font-style:normal;font-display:block;}
    @font-face{font-family:'Montserrat';src:url(data:font/woff2;base64,${b64('montserrat-latin-700-normal.woff2')}) format('woff2');font-weight:700;font-style:normal;font-display:block;}
    @font-face{font-family:'Montserrat';src:url(data:font/woff2;base64,${b64('montserrat-latin-800-normal.woff2')}) format('woff2');font-weight:800;font-style:normal;font-display:block;}
  ]]></style>`;
}

module.exports = { faces };
