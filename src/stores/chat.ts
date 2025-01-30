import { defineStore } from "pinia";
import { v7 as randomUUIDv7 } from "uuid";

export const useChatStore = defineStore("chat", {
    state: () => ({
        conversation: {} as Conversation,
        isGenerating: false,
        scrollingDown: true,
    }),
    actions: {
        setGenerating(newValue: boolean) {
            this.isGenerating = newValue;
        },
        setMessages(newMessageList: AppMessage[]) {
            this.conversation.messages = newMessageList;
        },
        updateMessageText(messageId: string, newText: string) {
            this.conversation.messages.find(
                (message) => message.id === messageId
            )?.content === newText;
        },
        addMessage(parentMessageId: string, newMessage: OllamaMessage) {
            if (parentMessageId === "") {
                this.conversation.firstMessageId = randomUUIDv7();

                this.conversation.messages.push({
                    id: this.conversation.firstMessageId,
                    childrenIds: [],
                    activeChildIndex: -1,
                    ...newMessage,
                });

                return;
            }

            console.log(parentMessageId);

            const parentMessage = this.conversation.messages.find(
                (message) => message.id === parentMessageId
            );

            if (!parentMessage) {
                console.error("Previous message ID does not exist.");
                return;
            }

            const newId = randomUUIDv7();

            this.conversation.messages.push({
                id: newId,
                childrenIds: [],
                activeChildIndex: -1,
                ...newMessage,
            });

            // This should update `this.messages` as parentMessage is a reference to the message in the list not a new object.
            parentMessage.childrenIds.push(newId);
            parentMessage.activeChildIndex =
                parentMessage.childrenIds.length - 1;

            this.conversation.latestMessageId = newId;
        },
        setScrollingDown(newValue: boolean) {
            this.scrollingDown = newValue;
        },
    },
    getters: {
        getOllamaMessageList(): OllamaMessage[] {
            const compiledMessages = [] as OllamaMessage[];

            const initalMessageId = this.conversation.firstMessageId;
            const initalMessage = this.conversation.messages.filter(
                (message) => message.id === initalMessageId
            )[0];

            let indexingMessageActiveChildIndex =
                initalMessage.activeChildIndex;
            compiledMessages.push({
                role: initalMessage.role,
                content: initalMessage.content,
            });

            let currentMessage = initalMessage;
            while (indexingMessageActiveChildIndex !== -1) {
                currentMessage = this.conversation.messages.find(
                    (message) =>
                        message.childrenIds[indexingMessageActiveChildIndex] ===
                        currentMessage.id
                )!;

                let indexingMessageActiveChildIndex =
                    currentMessage.activeChildIndex;
                compiledMessages.push({
                    role: currentMessage.role,
                    content: currentMessage.content,
                });
            }

            return compiledMessages;
        },
    },
});
