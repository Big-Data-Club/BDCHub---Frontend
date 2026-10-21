// lib/youtubeTokenManager.ts
import { google } from 'googleapis';

interface YouTubeTokens {
  access_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
  expiry_date: number;
}

interface YouTubeConnectionData {
  tokens: YouTubeTokens;
  channel_name?: string;
  channel_id?: string;
  connected_at: string;
}

class YouTubeTokenManager {

  constructor() {
  }

  private client() {
    return new google.auth.OAuth2(process.env.YOUTUBE_CLIENT_ID, process.env.YOUTUBE_CLIENT_SECRET, process.env.YOUTUBE_REDIRECT_URI);
  }

  private async connection(method = "GET", data?: YouTubeConnectionData) {
    const secret = process.env.AI_SERVICE_SECRET;
    if (!secret) throw new Error("AI service secret is not configured");
    const response = await fetch(`${process.env.AI_SERVICE_URL || "http://ai-service:8000"}/ai/studio/youtube/connection`, {
      method, headers: { "X-AI-Secret": secret, "Content-Type": "application/json" },
      body: data ? JSON.stringify(data) : undefined, cache: "no-store", signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error("Shared YouTube connection storage unavailable");
    return response.json();
  }

  /**
   * Persist the shared connection encrypted in the AI-owned database
   */
  async saveTokens(tokens: any, channelInfo?: { name: string; id: string }): Promise<void> {
    const data: YouTubeConnectionData = {
      tokens,
      channel_name: channelInfo?.name,
      channel_id: channelInfo?.id,
      connected_at: new Date().toISOString(),
    };

    await this.connection("PUT", data);
  }

  /**
   * Load the shared connection through the authenticated internal API
   */
  async loadTokens(): Promise<YouTubeConnectionData | null> {
    return this.connection();
  }

  /**
   * Delete tokens
   */
  async deleteTokens(): Promise<void> {
    await this.connection("DELETE");
  }

  /**
   * Check if tokens exist and are valid
   */
  async hasValidTokens(): Promise<boolean> {
    const data = await this.loadTokens();
    if (!data || !data.tokens?.refresh_token) {
      return false;
    }

    // Check if token is expired
    const now = Date.now();
    if (!data.tokens.access_token || !data.tokens.expiry_date || data.tokens.expiry_date < now + 60000) {
      // Try to refresh
      try {
        await this.refreshTokens();
        return true;
      } catch {
        return false;
      }
    }

    return true;
  }

  /**
   * Get authenticated OAuth2 client
   */
  async getAuthenticatedClient() {
    const data = await this.loadTokens();
    if (!data || !data.tokens) {
      throw new Error('No YouTube tokens found. Please connect YouTube first.');
    }

    const auth = this.client();
    auth.setCredentials(data.tokens);

    // Auto-refresh if needed
    const now = Date.now();
    if (!data.tokens.access_token || !data.tokens.expiry_date || data.tokens.expiry_date < now + 60000) {
      const { credentials } = await auth.refreshAccessToken();
      const merged = { ...data.tokens, ...credentials, refresh_token: credentials.refresh_token || data.tokens.refresh_token };
      auth.setCredentials(merged);
      await this.saveTokens(merged, { name: data.channel_name || "Shared channel", id: data.channel_id || "" });
    }

    return auth;
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code: string): Promise<void> {
    const auth = this.client();
    const { tokens } = await auth.getToken(code);
    auth.setCredentials(tokens);
    if (!tokens.refresh_token) throw new Error("Reconnect the shared channel with offline access and consent");

    // Get channel info
    const youtube = google.youtube({ version: 'v3', auth });
    const response = await youtube.channels.list({
      part: ['snippet'],
      mine: true,
    });

    const channel = response.data.items?.[0];
    const channelInfo = channel ? {
      name: channel.snippet?.title || 'Unknown',
      id: channel.id || 'unknown',
    } : undefined;

    if (!channelInfo?.id || channelInfo.id === "unknown") throw new Error("No YouTube channel found");
    await this.saveTokens(tokens, channelInfo);
  }

  /**
   * Refresh access token
   */
  async refreshTokens(): Promise<void> {
    const data = await this.loadTokens();
    if (!data || !data.tokens) {
      throw new Error('No tokens to refresh');
    }

    const auth = this.client();
    auth.setCredentials(data.tokens);
    const { credentials } = await auth.refreshAccessToken();
    
    await this.saveTokens({ ...data.tokens, ...credentials, refresh_token: credentials.refresh_token || data.tokens.refresh_token }, {
      name: data.channel_name || 'Unknown',
      id: data.channel_id || 'unknown',
    });
  }

  /**
   * Get connection status
   */
  async getStatus() {
    const data = await this.loadTokens();
    if (!data) {
      return {
        connected: false,
      };
    }

    return {
      connected: true,
      channel_name: data.channel_name,
      channel_id: data.channel_id,
      connected_at: data.connected_at,
      expires_at: data.tokens.expiry_date ? new Date(data.tokens.expiry_date).toISOString() : null,
    };
  }
}

const youtubeTokenManager = new YouTubeTokenManager()
export default youtubeTokenManager