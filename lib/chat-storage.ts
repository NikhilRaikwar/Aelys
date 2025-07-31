/**
 * Chat Storage Utilities
 * Manages persistent chat sessions for different agents with localStorage fallback
 */

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  id: string;
}

export interface ChatSession {
  agentType: 'copilot' | 'market-insights';
  messages: ChatMessage[];
  lastUpdated: string;
  sessionId: string;
}

export class ChatStorageManager {
  private static instance: ChatStorageManager;
  private storage: Storage | null = null;
  private memoryStorage: Map<string, ChatSession> = new Map();

  private constructor() {
    // Initialize storage with fallback
    if (typeof window !== 'undefined') {
      try {
        this.storage = window.localStorage;
        // Test storage availability
        const testKey = '__chat_storage_test__';
        this.storage.setItem(testKey, 'test');
        this.storage.removeItem(testKey);
      } catch (error) {
        console.warn('localStorage not available, using memory storage');
        this.storage = null;
      }
    }
  }

  public static getInstance(): ChatStorageManager {
    if (!ChatStorageManager.instance) {
      ChatStorageManager.instance = new ChatStorageManager();
    }
    return ChatStorageManager.instance;
  }

  private getStorageKey(agentType: string): string {
    return `aelys_chat_session_${agentType}`;
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get chat session for a specific agent
   */
  public getChatSession(agentType: 'copilot' | 'market-insights'): ChatSession | null {
    const storageKey = this.getStorageKey(agentType);

    try {
      if (this.storage) {
        const stored = this.storage.getItem(storageKey);
        if (stored) {
          const session = JSON.parse(stored) as ChatSession;
          // Validate session structure
          if (session.agentType && session.messages && Array.isArray(session.messages)) {
            return session;
          }
        }
      } else {
        // Use memory storage
        return this.memoryStorage.get(storageKey) || null;
      }
    } catch (error) {
      console.error('Error reading chat session:', error);
    }

    return null;
  }

  /**
   * Save chat session for a specific agent
   */
  public saveChatSession(session: ChatSession): boolean {
    const storageKey = this.getStorageKey(session.agentType);
    session.lastUpdated = new Date().toISOString();

    try {
      if (this.storage) {
        this.storage.setItem(storageKey, JSON.stringify(session));
      } else {
        // Use memory storage
        this.memoryStorage.set(storageKey, { ...session });
      }
      return true;
    } catch (error) {
      console.error('Error saving chat session:', error);
      return false;
    }
  }

  /**
   * Add a new message to the chat session
   */
  public addMessage(
    agentType: 'copilot' | 'market-insights',
    role: 'user' | 'assistant',
    content: string
  ): ChatMessage {
    let session = this.getChatSession(agentType);
    
    if (!session) {
      session = {
        agentType,
        messages: [],
        lastUpdated: new Date().toISOString(),
        sessionId: this.generateSessionId(),
      };
    }

    const message: ChatMessage = {
      role,
      content,
      timestamp: new Date().toISOString(),
      id: this.generateMessageId(),
    };

    session.messages.push(message);
    this.saveChatSession(session);

    return message;
  }

  /**
   * Get all messages for a specific agent
   */
  public getMessages(agentType: 'copilot' | 'market-insights'): ChatMessage[] {
    const session = this.getChatSession(agentType);
    return session ? session.messages : [];
  }

  /**
   * Clear chat history for a specific agent
   */
  public clearChatHistory(agentType: 'copilot' | 'market-insights'): void {
    const storageKey = this.getStorageKey(agentType);

    try {
      if (this.storage) {
        this.storage.removeItem(storageKey);
      } else {
        this.memoryStorage.delete(storageKey);
      }
    } catch (error) {
      console.error('Error clearing chat history:', error);
    }
  }

  /**
   * Clear all chat histories
   */
  public clearAllChatHistories(): void {
    this.clearChatHistory('copilot');
    this.clearChatHistory('market-insights');
  }

  /**
   * Get chat session statistics
   */
  public getSessionStats(agentType: 'copilot' | 'market-insights'): {
    messageCount: number;
    userMessages: number;
    assistantMessages: number;
    lastActivity: string | null;
  } {
    const session = this.getChatSession(agentType);
    
    if (!session) {
      return {
        messageCount: 0,
        userMessages: 0,
        assistantMessages: 0,
        lastActivity: null,
      };
    }

    const userMessages = session.messages.filter(m => m.role === 'user').length;
    const assistantMessages = session.messages.filter(m => m.role === 'assistant').length;

    return {
      messageCount: session.messages.length,
      userMessages,
      assistantMessages,
      lastActivity: session.lastUpdated,
    };
  }

  /**
   * Export chat session for backup/sharing
   */
  public exportChatSession(agentType: 'copilot' | 'market-insights'): string | null {
    const session = this.getChatSession(agentType);
    if (!session) return null;

    try {
      return JSON.stringify(session, null, 2);
    } catch (error) {
      console.error('Error exporting chat session:', error);
      return null;
    }
  }

  /**
   * Import chat session from backup
   */
  public importChatSession(sessionData: string): boolean {
    try {
      const session = JSON.parse(sessionData) as ChatSession;
      
      // Validate session structure
      if (!session.agentType || !session.messages || !Array.isArray(session.messages)) {
        throw new Error('Invalid session format');
      }

      return this.saveChatSession(session);
    } catch (error) {
      console.error('Error importing chat session:', error);
      return false;
    }
  }

  /**
   * Check if agent has any chat history
   */
  public hasChatHistory(agentType: 'copilot' | 'market-insights'): boolean {
    const session = this.getChatSession(agentType);
    return session ? session.messages.length > 0 : false;
  }
}

// Export singleton instance
export const chatStorage = ChatStorageManager.getInstance();
