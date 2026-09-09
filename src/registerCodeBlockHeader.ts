import { defineCustomElement } from 'vue';
import CodeBlockHeader from './components/Chat/Message/CodeBlockHeader.vue';

const tagName = 'code-block-header';

if (!customElements.get(tagName)) {
    customElements.define(tagName, defineCustomElement(CodeBlockHeader, { shadowRoot: false }));
}
