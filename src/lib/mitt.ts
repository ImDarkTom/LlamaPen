import mitt, { type EventType } from "mitt";

export enum PopupButtons {
    CLOSE,
    OK_CANCEL
}

interface Events extends Record<EventType, unknown> {
    scrollToBottom?: {
        force: boolean,
    },
    'popup:ollamanotconnected': void,
    openLightbox: {
        image: File | Blob,
    }
};

export const emitter = mitt<Events>();