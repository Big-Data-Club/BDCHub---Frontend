import chatApiClient from "./chatApiClient";
import {
  ChatChannel,
  ChatMessage,
  MessageListResponse,
  ChannelRoleEntry,
  ChatUser,
} from "@/types/chat";

// ─── Channels ─────────────────────────────────────────────────────────────────

export async function listChannels(): Promise<ChatChannel[]> {
  const res = await chatApiClient.get("/chat/channels");
  return (res.data.data ?? []).map(mapChannel);
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export async function listMessages(
  channelId: number,
  beforeId?: number,
  limit = 50
): Promise<MessageListResponse> {
  const params: Record<string, string | number> = { limit };
  if (beforeId) params.before_id = beforeId;

  const res = await chatApiClient.get(`/chat/channels/${channelId}/messages`, { params });
  const data = res.data.data;
  return {
    messages: (data.messages ?? []).map(mapMessage),
    nextCursor: data.next_cursor ?? 0,
    hasMore: data.has_more ?? false,
  };
}

export async function sendMessageRest(
  channelId: number,
  body: string,
  parentId?: number | null
): Promise<ChatMessage> {
  const res = await chatApiClient.post(`/chat/channels/${channelId}/messages`, {
    body,
    parent_id: parentId ?? null,
  });
  return mapMessage(res.data.data);
}

export async function deleteMessage(channelId: number, msgId: number): Promise<void> {
  await chatApiClient.delete(`/chat/channels/${channelId}/messages/${msgId}`);
}

export async function editMessage(
  channelId: number,
  msgId: number,
  body: string
): Promise<ChatMessage> {
  const res = await chatApiClient.put(`/chat/channels/${channelId}/messages/${msgId}`, { body });
  return mapMessage(res.data.data);
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export async function adminListChannels(): Promise<ChatChannel[]> {
  const res = await chatApiClient.get("/admin/channels");
  return (res.data.data ?? []).map(mapChannel);
}

export async function adminCreateChannel(data: {
  slug: string;
  name: string;
  description?: string;
  isPrivate?: boolean;
}): Promise<ChatChannel> {
  const res = await chatApiClient.post("/admin/channels", {
    slug: data.slug,
    name: data.name,
    description: data.description ?? "",
    is_private: data.isPrivate ?? false,
  });
  return mapChannel(res.data.data);
}

export async function adminUpdateChannel(
  id: number,
  data: { name: string; description?: string; isPrivate?: boolean }
): Promise<ChatChannel> {
  const res = await chatApiClient.put(`/admin/channels/${id}`, {
    name: data.name,
    description: data.description ?? "",
    is_private: data.isPrivate ?? false,
  });
  return mapChannel(res.data.data);
}

export async function adminDeleteChannel(id: number): Promise<void> {
  await chatApiClient.delete(`/admin/channels/${id}`);
}

export async function getChannelRoles(channelId: number): Promise<ChannelRoleEntry[]> {
  const res = await chatApiClient.get(`/admin/channels/${channelId}/roles`);
  return res.data.data ?? [];
}

export async function setChannelRoles(
  channelId: number,
  roles: ChannelRoleEntry[]
): Promise<void> {
  await chatApiClient.put(`/admin/channels/${channelId}/roles`, { roles });
}

// getChannelUsers returns the full user objects for a channel's whitelist.
// The backend JOINs in a single query - no N+1.
export async function getChannelUsers(channelId: number): Promise<ChatUser[]> {
  const res = await chatApiClient.get(`/admin/channels/${channelId}/users`);
  return (res.data.data?.users ?? []).map(mapUser);
}

// setChannelUsers atomically replaces the whitelist and returns the updated full list.
// The backend returns the new state in the same response - no follow-up GET needed.
export async function setChannelUsers(channelId: number, userIds: number[]): Promise<ChatUser[]> {
  const res = await chatApiClient.put(`/admin/channels/${channelId}/users`, { user_ids: userIds });
  return (res.data.data?.users ?? []).map(mapUser);
}

// ─── Direct Messages (DMs) ───────────────────────────────────────────────────

export async function searchUsers(query: string): Promise<ChatUser[]> {
  const res = await chatApiClient.get("/chat/users/search", { params: { q: query } });
  return (res.data.data ?? []).map(mapUser);
}

export async function getOrCreateDM(targetUserId: number): Promise<ChatChannel> {
  const res = await chatApiClient.post("/chat/dm", { user_id: targetUserId });
  return mapChannel(res.data.data);
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapChannel(raw: any): ChatChannel {
  return {
    id: raw.id,
    slug: raw.slug,
    name: raw.name,
    description: raw.description ?? "",
    isPrivate: raw.is_private ?? false,
    isDm: raw.is_dm ?? false,
    dmUser: raw.dm_user
      ? {
          id: raw.dm_user.id,
          email: raw.dm_user.email,
          fullName: raw.dm_user.full_name,
          profilePicture: raw.dm_user.profile_picture ?? "",
        }
      : undefined,
    createdAt: raw.created_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapUser(raw: any): ChatUser {
  return {
    id: raw.id,
    email: raw.email,
    fullName: raw.full_name,
    profilePicture: raw.profile_picture ?? "",
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapMessage(raw: any): ChatMessage {
  return {
    id: raw.id,
    channelId: raw.channel_id,
    senderId: raw.sender_id,
    senderName: raw.sender_name,
    senderEmail: raw.sender_email,
    senderAvatar: raw.sender_avatar ?? "",
    body: raw.body,
    isDeleted: raw.is_deleted ?? false,
    isEdited: raw.is_edited ?? false,
    parentId: raw.parent_id ?? null,
    parentSenderName: raw.parent_sender_name ?? "",
    parentBody: raw.parent_body ?? "",
    createdAt: raw.created_at,
  };
}
