import { IndexedEntity, Index } from "./core-utils";
import type { User, Chat, ChatMessage, CloudDocument, DocumentVersion } from "@shared/types";
import { MOCK_CHAT_MESSAGES, MOCK_CHATS, MOCK_USERS } from "@shared/mock-data";
// USER ENTITY: one DO instance per user
export class UserEntity extends IndexedEntity<User> {
  static readonly entityName = "user";
  static readonly indexName = "users";
  static readonly initialState: User = { id: "", name: "" };
  static seedData = MOCK_USERS;
}
// CHAT BOARD ENTITY
export type ChatBoardState = Chat & { messages: ChatMessage[] };
const SEED_CHAT_BOARDS: ChatBoardState[] = MOCK_CHATS.map(c => ({
  ...c,
  messages: MOCK_CHAT_MESSAGES.filter(m => m.chatId === c.id),
}));
export class ChatBoardEntity extends IndexedEntity<ChatBoardState> {
  static readonly entityName = "chat";
  static readonly indexName = "chats";
  static readonly initialState: ChatBoardState = { id: "", title: "", messages: [] };
  static seedData = SEED_CHAT_BOARDS;
  async listMessages(): Promise<ChatMessage[]> {
    const { messages } = await this.getState();
    return messages;
  }
  async sendMessage(userId: string, text: string): Promise<ChatMessage> {
    const msg: ChatMessage = { id: crypto.randomUUID(), chatId: this.id, userId, text, ts: Date.now() };
    await this.mutate(s => ({ ...s, messages: [...s.messages, msg] }));
    return msg;
  }
}
// CLOUD DOCUMENT ENTITY
export class DocumentEntity extends IndexedEntity<CloudDocument> {
  static readonly entityName = "doc";
  static readonly indexName = "docs";
  static readonly initialState: CloudDocument = {
    id: "",
    fileName: "",
    currentVersionId: "",
    createdAt: "",
    updatedAt: "",
    ownerId: "anonymous"
  };
}
// VERSION ENTITY
export class VersionEntity extends IndexedEntity<DocumentVersion> {
  static readonly entityName = "version";
  static readonly indexName = "versions";
  static readonly initialState: DocumentVersion = {
    id: "",
    documentId: "",
    label: "Initial Analysis",
    result: {} as any,
    createdAt: ""
  };
  /**
   * Helper to list versions for a specific document
   * Using a secondary index pattern: index:versions_by_doc:{documentId}
   */
  static async listByDocument(env: any, documentId: string): Promise<DocumentVersion[]> {
    const idx = new Index<string>(env, `versions_by_doc:${documentId}`);
    const ids = await idx.list();
    const rows = await Promise.all(ids.map(id => new VersionEntity(env, id).getState()));
    return rows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  static async createForDocument(env: any, version: DocumentVersion): Promise<DocumentVersion> {
    const created = await VersionEntity.create(env, version);
    // Add to document-specific index
    const idx = new Index<string>(env, `versions_by_doc:${version.documentId}`);
    await idx.add(version.id);
    return created;
  }
}