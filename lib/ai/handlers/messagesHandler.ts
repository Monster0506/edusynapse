import { Message } from "../interfaces/interfaces";
import { EventEmitter } from "events";

class MessagesHandler extends EventEmitter {
  private static instance: MessagesHandler;
  private messages: Message[] = [];

  private constructor() {
    super();
  }

  static getInstance(): MessagesHandler {
    if (!MessagesHandler.instance) {
      MessagesHandler.instance = new MessagesHandler();
    }
    return MessagesHandler.instance;
  }

  addMessage(message: Message): void {
    // Don't add duplicate messages
    const isDuplicate = this.messages.some(
      (m) => m.role === message.role && m.content === message.content,
    );
    if (!isDuplicate) {
      this.messages.push(message);
      this.emit("update", [...this.messages]);
    } else {
    }
  }

  addMessages(messages: Message[]): void {
    let hasNewMessages = false;

    for (const message of messages) {
      const isDuplicate = this.messages.some(
        (m) => m.role === message.role && m.content === message.content,
      );
      if (!isDuplicate) {
        this.messages.push(message);
        hasNewMessages = true;
      }
    }

    if (hasNewMessages) {
      this.emit("update", [...this.messages]);
    } else {
    }
  }

  getMessages(): Message[] {
    return [...this.messages];
  }

  clearMessages(): void {
    this.messages = [];
    this.emit("update", []);
  }
}

export default MessagesHandler.getInstance();
