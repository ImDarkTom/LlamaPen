import hljs from 'highlight.js';
import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import markedKatex from 'marked-katex-extension';
import DOMPurify from 'dompurify';

import "katex/dist/katex.min.css";
import "highlight.js/styles/atom-one-dark.min.css";

const renderer = {
    link(token: any) {
        const href = token.href;
        const title = token.title;
        const text = token.text || href;

        const isInternal = 
            href.startsWith('/') || 
            href.startsWith('#') || 
            href.startsWith(window.location.origin);

        const titleAttr = title ? `title="${title}"` : '';
        const targetAttrs = isInternal ? '' : 'target="_blank" rel="noopener noreferrer"';
        const externalIndicator = isInternal ? '' : ' ↗';

        return `<a href="${href}" ${titleAttr} ${targetAttrs}>${text}${externalIndicator}</a>`;
    }
};

const fullMarked = new Marked();

fullMarked.use({ renderer });

fullMarked.use(markedKatex());

fullMarked.use(markedHighlight({
    emptyLangClass: 'hljs',
    langPrefix: 'hljs language-',
    highlight(code, lang, _info) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        
        return hljs.highlight(code, { language }).value;
    }
}));


/**
 * Handles rendering markdown, using DOMPurify to prevent XSS. Note: This may be ran many times 
 * concurrently when text is being generated so keep performance nominal.
 * @param text The markdown to be rendered as HTML
 * @returns Markdown as sanitized rendered HTML
 */
export function renderMarkdown(text: string) {
    const rawHtml = fullMarked.parse(text, { async: false });
    const sanitizedHtml = DOMPurify.sanitize(rawHtml, { ADD_ATTR: ['target'] });

    return sanitizedHtml;
}
