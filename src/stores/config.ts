import logger from '@/lib/logger';
import { defineStore } from "pinia";

interface Config {
    ollamaUrl: string,
    selectedModel: string,
    showSidebar: boolean,
    transitionSpeed: number,
    closeSidebarOnNavMobile: boolean,
    ui: {
        modelIcons: {
            monochrome: boolean,
            background: boolean,
            backgroundDark: boolean,
            alternateGemmaIcon: boolean,
        },
        tooltip: {
            waitTimeoutMs: number;
        },
        theme: string;
    },
    api: {
        enabled: boolean,
        apiUrl: string,
        signoutBeforeDisable: boolean,
    },
    chat: {
        thinking: {
            enabled: false;
            infoOpenByDefault: boolean;
        }
    }
    developer: {
        mockRequests: boolean,
        infoLogs: boolean,
    }
};

// Get current location and replace port with 11434
// const { protocol, hostname } = window.location;
// const defaultOllamaUrl = `${protocol}//${hostname}:11434`;

/**
 * Handles user configs. Still uses old way of defining pinia stores, but works for this scenario.
 */
export const useConfigStore = defineStore('config', {
    state: (): Config => ({
        ollamaUrl: 'http://localhost:11434',
        selectedModel: '',
        showSidebar: true,
        transitionSpeed: 0.125,
        closeSidebarOnNavMobile: true,
        ui: {
            modelIcons: {
                monochrome: true,
                background: false,
                backgroundDark: false,
                alternateGemmaIcon: false,
            },
            tooltip: {
                waitTimeoutMs: 500, // Time before showing tooltip
            },
            theme: 'auto',
        },
        api: {
            enabled: false,
            apiUrl: import.meta.env.VITE_API_URL,
            signoutBeforeDisable: false,
        },
        chat: {
            thinking: {
                // Enabled is toggled by the input box icon
                enabled: false,
                infoOpenByDefault: false,
            }
        },
        developer: {
            mockRequests: false,
            infoLogs: false,
        }
    }),
    getters: {
        apiUrl: (state) => (path: string) => `${state.api.enabled ? state.api.apiUrl : state.ollamaUrl}${path}`,
    },
    actions: {
        setTransitionSpeed(speed: number) {
            if (speed > 1 || speed < 0) {
                throw new Error('Transition speed must be between 0 and 1');
            }

            logger.info('Config Store', 'Setting transition speed to', speed);
            this.transitionSpeed = speed;

            this.loadTransitionSpeed();
        },
        loadTransitionSpeed() {
            if (this.transitionSpeed == 0) {
                document.body.setAttribute('data-reduce-motion', '1');
                document.documentElement.style.setProperty('--transition-duration', '0s');
            } else {
                // set root attribute to the speed
                document.documentElement.style.setProperty('--transition-duration', `${this.transitionSpeed}s`);
                document.body.removeAttribute('data-reduce-motion');
            }
        },
        loadTheme() {
            if (this.ui.theme !== 'auto') {
                document.documentElement.setAttribute('theme', this.ui.theme ?? 'dark');
                return;
            }

            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('theme', prefersDark ? 'dark' : 'light');
        }
    },
    persist: {
        storage: localStorage,
    }
})