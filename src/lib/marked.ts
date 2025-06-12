import hljs from 'highlight.js';
import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import markedKatex from 'marked-katex-extension';

import "katex/dist/katex.min.css";
import "highlight.js/styles/atom-one-dark.min.css";

const fullMarked = new Marked();

fullMarked.use(markedKatex());

fullMarked.use(markedHighlight({
    emptyLangClass: 'hljs',
    langPrefix: 'hljs language-',
    highlight(code, lang, _info) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';

        return hljs.highlight(code, { language }).value;
    }
}));


const simpleMarked = new Marked();

// `fullMarked` is used for messages, where we need to render LaTeX with Katex and HLJS.
// `simpleMarked` is an untouched marked instance for quick rendering such as the models page. 
export { fullMarked, simpleMarked };