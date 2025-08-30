import { useRegisterSW } from 'virtual:pwa-register/vue';
import { ref } from 'vue';

export function usePWAState() {
    const { offlineReady, needRefresh, updateServiceWorker } = useRegisterSW({
        onOfflineReady() {
        },
        onNeedRefresh() {
        },
    });

    const isOnline = ref(navigator.onLine);

    window.addEventListener('online', () => (isOnline.value = true));
    window.addEventListener('offline', () => (isOnline.value = false));

    return {
        isOnline,
        offlineReady,
        needRefresh,
        updateServiceWorker,
    };
}