import mitt, { type EventType } from "mitt";

interface Events extends Record<EventType, unknown> {
    scrollToBottom: undefined,
    showPopup: string,
};

export const emitter = mitt<Events>();