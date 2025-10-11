import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import ChatMessage from "./ChatMessage.vue";
import { createTestingPinia } from "@pinia/testing";

describe("ChatMessage.vue with user message", () => {
    let wrapper: VueWrapper<InstanceType<typeof ChatMessage>>;

    beforeEach(() => {
        wrapper = mount(ChatMessage, {
            props: {
                message: {
                    type: 'user',
                    id: 999999,
                    chatId: 999999,
                    content: 'This is user text.',
                    created: new Date(),
                }
            },
            global: {
                plugins: [ createTestingPinia({ createSpy: vi.fn }) ]
            }
        });
    });

    afterEach(() => {
        wrapper.unmount();
    })

    it('should render user\'s message text', () => {
        expect(wrapper.find('article').text()).toContain('This is user text.');
    });

    it('opens editor with the message content when the edit button is clicked', async () => {
        await wrapper.find('[data-testid="edit-btn"]').trigger('click');

        const textarea = wrapper.find<HTMLTextAreaElement>('[data-testid="message-editor-textarea"]');
        expect(textarea.element.value).toContain('This is user text.');
    });

    it('saves edited user message', async () => {
        await wrapper.find('[data-testid="edit-btn"]').trigger('click');

        const textarea = wrapper.find<HTMLTextAreaElement>('[data-testid="message-editor-textarea"]');
        
        textarea.setValue('Updated message.');
        await wrapper.find('button[type="submit"]').trigger('click');
        
        expect(textarea.element.value).toContain('Updated message.');
    });

    it('copies message to clipboard', async () => {
        const messageText = wrapper.find('article').text();

        vi.stubGlobal('navigator', {
            clipboard: {
                writeText: vi.fn().mockResolvedValue(undefined),
            },
        });

        await wrapper.find('[data-testid="copy-btn"]').trigger('click');

        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(messageText);
    });
});