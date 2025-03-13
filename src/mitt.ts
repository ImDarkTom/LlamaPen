import mitt, { type EventType } from "mitt";

export enum PopupButtons {
    CLOSE,
    OK_CANCEL
}

interface Events extends Record<EventType, unknown> {
    scrollToBottom: void,
    showErrorPopup: string
    'popup:ollamanotconnected': void,
    'popup:error': {
        message: string,
        error: string,
    }
};

export const emitter = mitt<Events>();