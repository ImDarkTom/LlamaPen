import mitt, { type EventType } from "mitt";

export enum PopupButtons {
    CLOSE,
    OK_CANCEL
}

interface Events extends Record<EventType, unknown> {
    scrollToBottom: undefined,
    showErrorPopup: string,
    showPopup: {
        title: string,
        messageHtml: string,
        buttons: PopupButtons
    }
};

export const emitter = mitt<Events>();