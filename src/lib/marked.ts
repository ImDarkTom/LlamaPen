import hljs from 'highlight.js';
import { Marked, type RendererObject, type Tokens } from 'marked';
import markedKatex from 'marked-katex-extension';
import DOMPurify from 'dompurify';

import "katex/dist/katex.min.css";
import '../assets/style/highlight.css';

function escape(html: string) {
    const escapeReplacements = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
    } as const;

    return html.replace(/[&<>"']/g, (ch) =>
        // Type is guaranteed as we are only regex matching the 5 chars
        escapeReplacements[ch as keyof typeof escapeReplacements]
    );
}

const renderer: RendererObject = {
    link(token: Tokens.Link) {
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
    code(token: Tokens.Code) {
        const lang = token.lang || '';
        const language = hljs.getLanguage(lang) ? lang : '';
        const languagePretty = hljs.getLanguage(lang)?.name || language;

        const highlighted = language
            ? hljs.highlight(token.text, { language }).value
            : escape(token.text);

        const classValue = language ? `hljs language-${language}` : 'hljs'; // add language to class if valid

        const codeHtml = highlighted.replace(/\n$/, '');

        return `
            <code-block-header
                class="block"
                language="${encodeURIComponent(languagePretty)}"
                code="${encodeURIComponent(token.text)}"></code-block-header>
            <pre><code class="${classValue} rounded-t-none! pt-1!">${codeHtml}\n</code></pre>`;
    }
};

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
    const sanitizedHtml = DOMPurify.sanitize(rawHtml, {
        ADD_TAGS: ['code-block-header'],
        ADD_ATTR: ['target', 'language', 'code'],
    });

    return sanitizedHtml;
}
