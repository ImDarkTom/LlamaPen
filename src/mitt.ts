import mitt, { type EventType } from "mitt";

export enum PopupButtons {
    CLOSE,
    OK_CANCEL
}

interface Events extends Record<EventType, unknown> {
    scrollToBottom: undefined,
    showErrorPopup: string
};

export const emitter = mitt<Events>();