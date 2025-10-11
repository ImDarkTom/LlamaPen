import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import Tooltip from "./Tooltip.vue";
import { nextTick } from "vue";

vi.mock('@/stores/config', () => {
    return {
        useConfigStore: () => ({
            ui: {
                tooltip: {
                    waitTimeoutMs: 100,
                },
            },
        }),
    };
});

describe("ToolTip.vue", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        document.body.innerHTML = "";
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.clearAllTimers();
        vi.clearAllMocks();

        document.body.innerHTML = "";
    })

    it('should show text on hover for 100ms', async () => {
        const wrapper = mount(Tooltip, {
            props: {
                text: 'Tooltip text.'
            },
            slots: {
                default: '<button>Hover me</button>'
            },
        });

        // Should be empty
        expect(document.body.textContent).toContain('')

        await wrapper.trigger('mouseenter');

        vi.advanceTimersByTime(101); //ms
        await nextTick();

        expect(document.body.querySelector('[data-testid="tooltip-text"]')?.textContent).toContain('Tooltip text.');

        await wrapper.trigger('mouseleave');

        vi.advanceTimersByTime(101);
        await nextTick();

        // Empty after unhovering
        expect(document.body.innerHTML).toBe('');
    });

    it('does not show if disabled is true', async () => {
        const wrapper = mount(Tooltip, {
            props: {
                text: 'Tooltip text.',
                disabled: true
            },
            slots: {
                default: '<button>Hover me</button>'
            },
        });

        // Should be empty
        expect(document.body.textContent).toContain('')

        await wrapper.trigger('mouseenter');

        vi.advanceTimersByTime(101); //ms
        await nextTick();

        expect(document.body.innerHTML).toBe('');
    })
});