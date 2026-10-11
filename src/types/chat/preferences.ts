export interface ChatPreferences {
  sound: boolean;
  compact: boolean;
  enterToSend: boolean;
}

export type ChatConnectionState = "connecting" | "connected" | "reconnecting" | "offline";
