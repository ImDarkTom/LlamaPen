import hljs from 'highlight.js';
import { Marked, type RendererObject } from 'marked';
import markedKatex from 'marked-katex-extension';
import DOMPurify from 'dompurify';

import "katex/dist/katex.min.css";
import "highlight.js/styles/github-dark.min.css";

function escape(html: string, encode = false) {
    const escapeReplacements: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
    };
    if (encode) return html.replace(/[&<>"']/g, (ch) => escapeReplacements[ch]);
    return html;
}

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
    },
    code(token: { lang: string, text: string, raw: string, type: string }) {
        const lang = token.lang || '';
        const language = hljs.getLanguage(lang) ? lang : '';
        const languagePretty = hljs.getLanguage(lang)?.name || language;
        
        const highlighted = language
            ? hljs.highlight(token.text, { language }).value
            : escape(token.text, true);
        
        const classValue = language ? `hljs language-${language}` : 'hljs'; // add language to class if valid

        const codeHtml = highlighted.replace(/\n$/, '');

        return `
            <div class="bg-[#0d1117] rounded-t-lg px-4 py-2 select-none text-xs flex flex-row justify-between border-b border-text-muted items-center">
                <span>${languagePretty}</span>
                <button data-code="${encodeURIComponent(token.text)}" class="copy-code-button hover:text-text border p-1 rounded-sm cursor-pointer">
                    Copy
                </button>
            </div>
                <pre><code class="${classValue} rounded-t-none! pt-1!">${codeHtml}\n</code></pre>`;
    }
} as RendererObject;

const fullMarked = new Marked();

fullMarked.use({ renderer });

fullMarked.use(markedKatex());

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
