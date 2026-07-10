export interface ChatUser {
  id: number;
  email: string;
  fullName: string;
  profilePicture?: string;
}

export interface ChatChannel {
  id: number;
  slug: string;
  name: string;
  description: string;
  isPrivate: boolean;
  isDm?: boolean;
  dmUser?: ChatUser;
  createdAt: string;
  unreadCount?: number;
}

export interface ChatMessage {
  id: number;
  channelId: number;
  senderId: number;
  senderName: string;
  senderEmail: string;
  senderAvatar: string;
  body: string;
  isDeleted: boolean;
  isEdited: boolean;
  parentId?: number | null;
  parentSenderName?: string;
  parentBody?: string;
  createdAt: string;
}

export interface MessageListResponse {
  messages: ChatMessage[];
  nextCursor: number;
  hasMore: boolean;
}

export interface ChannelRoleEntry {
  roleName: string;
  canRead: boolean;
  canWrite: boolean;
}

export interface WSEvent {
  type: "message" | "delete" | "edit" | "typing" | "join" | "leave" | "ping" | "ack";
  channel_id: number;
  payload: WSMessagePayload | WSTypingPayload | WSDeletePayload | WSEditPayload | null;
  ts: string;
}

export interface WSMessagePayload {
  id: number;
  sender_id: number;
  sender_name: string;
  sender_avatar?: string;
  body: string;
  is_edited?: boolean;
  parent_id?: number | null;
  parent_sender_name?: string;
  parent_body?: string;
}

export interface WSEditPayload {
  id: number;
  body: string;
  is_edited: true;
  parent_id?: number | null;
  parent_sender_name?: string;
  parent_body?: string;
}

export interface WSDeletePayload {
  id: number;
  is_deleted: boolean;
}

export interface WSTypingPayload {
  user_id: number;
  user_name: string;
}
