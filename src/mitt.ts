import mitt, { type EventType } from "mitt";

interface Events extends Record<EventType, unknown> {
    scrollToBottom: undefined,
};

export const emitter = mitt<Events>();