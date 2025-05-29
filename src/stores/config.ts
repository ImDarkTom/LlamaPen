import logger from '@/utils/logger';
import { defineStore } from "pinia";

interface Config {
    ollamaUrl: string,
    selectedModel: string,
    showSidebar: boolean,
    transitionSpeed: number,
    closeSidebarOnNavMobile: boolean,
    ui: {
        monochromeModelIcons: boolean,
        modelIconsBg: boolean,
        modelIconsBgDark: boolean,
    },
    api: {
        enabled: boolean,
        apiUrl: string,
        signoutBeforeDisable: boolean,
    },
    chat: {
        reasoning: {
            info_open_by_default: boolean;
        }
    }
    note: {
        focusOnLoad: boolean,
        showHeaderLabels: boolean,
    },
    developer: {
        mockRequests: boolean,
        infoLogs: boolean,
    }
};

export const useConfigStore = defineStore('config', {
    state: (): Config => ({
        ollamaUrl: 'http://localhost:11434',
        selectedModel: '',
        showSidebar: true,
        transitionSpeed: 0.125,
        closeSidebarOnNavMobile: true,
        ui: {
            monochromeModelIcons: true,
            modelIconsBg: false,
            modelIconsBgDark: false
        },
        api: {
            enabled: false,
            apiUrl: import.meta.env.VITE_API_URL,
            signoutBeforeDisable: false,
        },
        chat: {
            reasoning: {
                info_open_by_default: false,
            }
        },
        note: {
            focusOnLoad: false,
            showHeaderLabels: false,
        },
        developer: {
            mockRequests: false,
            infoLogs: false,
        }
    }),
    getters: {
        apiUrl: (state) => (path: string) => `${state.api.enabled ? state.api.apiUrl : state.ollamaUrl}${path}`,
        transitionSpeedSec: (state) => state.transitionSpeed,
    },
    actions: {
        setOllamaUrl(url: string) {
            this.ollamaUrl = url;
        },
        setShowSidebar(state: boolean) {
            this.showSidebar = state;
        },
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
            } else {
                // set root attribute to the speed
                document.documentElement.style.setProperty('--transition-duration', `${this.transitionSpeed}s`);
                document.body.removeAttribute('data-reduce-motion');
            }
        },
    },
    persist: {
        storage: localStorage,
    }
})