import { defineStore } from "pinia";

interface Config {
    ollamaUrl: string,
    showSidebar: boolean,
    transitionSpeed: number,
};

export const useConfigStore = defineStore('config', {
    state: (): Config => ({
        ollamaUrl: localStorage.getItem('customUrl') || 'http://localhost:11434',
        showSidebar: localStorage.getItem('showSidebar') === 'true' || true,
        transitionSpeed: Number.parseFloat(localStorage.getItem('transitionSpeed') ?? "0.125"),
    }),
    getters: {
        apiUrl: (state) => (path: string) => `${state.ollamaUrl}${path}`,
        transitionSpeedSec: (state) => state.transitionSpeed,
    },
    actions: {
        setOllamaUrl(url: string) {
            this.ollamaUrl = url;
            localStorage.setItem('customUrl', url);
        },
        setShowSidebar(state: boolean) {
            this.showSidebar = state;
            localStorage.setItem('showSidebar', state.toString());
        },
        setTransitionSpeed(speed: number) {
            if (speed > 1 || speed < 0) {
                throw new Error('Transition speed must be between 0 and 1');
            }

            console.log('Setting transition speed to', speed);

            this.transitionSpeed = speed;
            localStorage.setItem('transitionSpeed', speed.toString());

            this.loadTransitionSpeed();
        },
        loadTransitionSpeed() {
            if (this.transitionSpeed == 0) {
                document.body.setAttribute('data-reduce-motion', '1');
            } else {
                // set root attribute to the speed
                document.documentElement.style.setProperty('--transition-duration', `${this.transitionSpeed}s`);
            }
        }
    }
})