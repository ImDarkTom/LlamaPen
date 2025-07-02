import hljs from 'highlight.js';
import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import markedKatex from 'marked-katex-extension';
import DOMPurify from 'dompurify';

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

// `fullMarked` is used for messages, where we need to render LaTeX with Katex and HLJS.
// `simpleMarked` is an untouched marked instance for quick rendering such as the models page. 

/**
 * Handles rendering markdown, using DOMPurify to prevent XSS. Note: This may be ran many times 
 * concurrently when text is being generated so keep performance nominal.
 * @param text The markdown to be rendered as HTML
 * @returns Markdown as sanitized rendered HTML
 */
export function renderMarkdown(text: string) {
    const rawHtml = fullMarked.parse(text, { async: false });
    const sanitizedHtml = DOMPurify.sanitize(rawHtml);

    return sanitizedHtml;
}
