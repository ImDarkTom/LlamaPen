import mitt from "mitt";

type Events = {
    sendEditedMessage: { newText: string, messageId: string }
}

export const eventBus = mitt<Events>();