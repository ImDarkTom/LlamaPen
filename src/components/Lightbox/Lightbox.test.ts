import { mount, type VueWrapper } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Lightbox from "./Lightbox.vue";
import { afterEach } from "node:test";
import { emitter } from "@/lib/mitt";
import { nextTick } from "vue";

describe('Lightbox.vue', () => {
    let wrapper: VueWrapper<InstanceType<typeof Lightbox>>;
    beforeEach(() => {
        global.URL.createObjectURL = vi.fn(() => '/mockurl.png');
        wrapper = mount(Lightbox);
    });

    afterEach(() => {
        wrapper.unmount();
    })

    it('should render an img when event emitted and close when clicked', async () => {
        expect(wrapper.find('img').exists()).toBe(false);

        const blob = new Blob(
            [Uint8Array.from([
                0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A,
                0x00,0x00,0x00,0x0D,0x49,0x48,0x44,0x52,
                0x00,0x00,0x00,0x01,0x00,0x00,0x00,0x01,
                0x08,0x06,0x00,0x00,0x00,0x1F,0x15,0xC4,
                0x89,0x00,0x00,0x00,0x0A,0x49,0x44,0x41,
                0x54,0x78,0x9C,0x63,0x60,0x00,0x00,0x00,
                0x02,0x00,0x01,0xE2,0x21,0xBC,0x33,0x00,
                0x00,0x00,0x00,0x49,0x45,0x4E,0x44,0xAE,
                0x42,0x60,0x82
            ])],
            { type: 'image/png' }
        );

        emitter.emit('openLightbox', { image: blob });
        await nextTick();

        expect(global.URL.createObjectURL).toHaveBeenCalledWith(blob);
        expect(wrapper.find('img').element.getAttribute('src')).toBe('/mockurl.png');

        await wrapper.find('[data-testid="lightbox-overlay"]').trigger('click');
        await nextTick();

        expect(wrapper.find('img').exists()).toBe(false);
        expect(wrapper.find('[data-testid="lightbox-overlay"]').exists()).toBe(false);
    });
});