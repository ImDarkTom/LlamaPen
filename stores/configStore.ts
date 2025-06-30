import { defineStore } from 'pinia';

interface Config {
    api: {
        url: string;
    };
}

export const useConfigStore = defineStore('test', {
    state: (): Config => ({
        api: {
            url: 'http://localhost:11434',
        },
    }),
    persist: true,
});
