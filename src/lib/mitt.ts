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
};

export const emitter = mitt<Events>();