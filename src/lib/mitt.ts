import type { ModelInfo } from "@/composables/useProviderManager";
import type { KeyedCustomProvider } from "@/stores/useCustomProvidersStore";
import mitt from "mitt";

export enum PopupButtons {
    CLOSE,
    OK_CANCEL
}

type Events = {
    scrollToBottom: {
        force: boolean,
    },
    openNotConnectedPopup: void,
    openLightbox: {
        image: File | Blob,
    },
    openSearchbox: void,
    openChat: string,
    stopChatGeneration: void,
    hideSidebar: void,
    focusInputBar: void,
    modelSelectFocusFilter: void,
    shortcutsPopup: void,
    createProviderPopup: void,
    editProviderPopup: KeyedCustomProvider,
    showModelInfo: ModelInfo;
};

export const emitter = mitt<Events>();