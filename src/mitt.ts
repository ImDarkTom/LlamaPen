import mitt, { type EventType } from "mitt";

interface Events extends Record<EventType, unknown> {
    scrollToBottom: undefined,
    showErrorPopup: string,
    showPopup: {
        title: string,
        messageHtml: string,
    }
};

export const emitter = mitt<Events>();