import mitt, { type EventType } from "mitt";

export enum PopupButtons {
    CLOSE,
    OK_CANCEL
}

interface Events extends Record<EventType, unknown> {
    scrollToBottom?: {
        force: boolean,
    },
    showErrorPopup: string
    'popup:ollamanotconnected': void,
    'popup:error': {
        message: string,
        error: string,
    },
    openLightbox: {
        image: File | Blob,
    }
};

export const emitter = mitt<Events>();