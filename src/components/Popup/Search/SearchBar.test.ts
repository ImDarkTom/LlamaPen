import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import SearchBar from "./index.vue";
import { createTestingPinia } from "@pinia/testing";
import { emitter } from "@/lib/mitt";
import { nextTick } from "vue";

describe('SearchBar.vue', () => {
    it('should open on openSearchbox emit', async () => {
        const wrapper = mount(SearchBar, {
            global: {
                plugins: [ 
                    createTestingPinia({ createSpy: vi.fn })
                ],
                stubs: {
                    RouterLink: true,
                }
            }
        });

        expect(wrapper.find('div').exists()).toBe(false);

        emitter.emit('openSearchbox');
        await nextTick();

        expect(wrapper.find('div').exists()).toBe(true);
    });
});