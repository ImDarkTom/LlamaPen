import hljs from 'highlight.js';
import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import markedKatex from 'marked-katex-extension';

import "katex/dist/katex.min.css";
import "highlight.js/styles/atom-one-dark.min.css";

const messageMarked = new Marked();

messageMarked.use(markedKatex());

messageMarked.use(markedHighlight({
    emptyLangClass: 'hljs',
    langPrefix: 'hljs language-',
    highlight(code, lang, _info) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';

        return hljs.highlight(code, { language }).value;
    }
}));

export default messageMarked;