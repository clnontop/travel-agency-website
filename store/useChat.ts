import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderType: 'customer' | 'driver';
  content: string;
  timestamp: Date;
  jobId: string;
}

export interface Chat {
  id: string;
  jobId: string;
  customerId: string;
  driverId: string;
  customerName: string;
  driverName: string;
  jobTitle: string;
  messages: Message[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: Date;
}

interface ChatState {
  chats: Chat[];
  activeChatId: string | null;
  isLoading: boolean;
  
  // Actions
  createChat: (jobId: string, customerId: string, driverId: string, customerName: string, driverName: string, jobTitle: string) => string;
  sendMessage: (chatId: string, senderId: string, senderName: string, senderType: 'customer' | 'driver', content: string, jobId: string) => void;
  getChatByJobId: (jobId: string) => Chat | undefined;
  getChatsByUserId: (userId: string) => Chat[];
  setActiveChat: (chatId: string | null) => void;
  markChatAsRead: (chatId: string) => void;
  deleteChat: (chatId: string) => void;
}

export const useChat = create<ChatState>()(
  persist(
    (set, get) => ({
      chats: [],
      activeChatId: null,
      isLoading: false,

      createChat: (jobId, customerId, driverId, customerName, driverName, jobTitle) => {
        const chatId = `chat-${jobId}-${driverId}`;
        
        // Check if chat already exists
        const existingChat = get().chats.find(chat => chat.jobId === jobId && chat.driverId === driverId);
        if (existingChat) {
          return existingChat.id;
        }

        const newChat: Chat = {
          id: chatId,
          jobId,
          customerId,
          driverId,
          customerName,
          driverName,
          jobTitle,
          messages: [],
          unreadCount: 0,
          createdAt: new Date()
        };

        set(state => ({
          chats: [newChat, ...state.chats]
        }));

        return chatId;
      },

      sendMessage: (chatId, senderId, senderName, senderType, content, jobId) => {
        const message: Message = {
          id: `msg-${Date.now()}`,
          senderId,
          senderName,
          senderType,
          content,
          timestamp: new Date(),
          jobId
        };

        set(state => ({
          chats: state.chats.map(chat => 
            chat.id === chatId 
              ? {
                  ...chat,
                  messages: [...chat.messages, message],
                  lastMessage: message,
                  unreadCount: get().activeChatId === chatId ? chat.unreadCount : chat.unreadCount + 1
                }
              : chat
          )
        }));
      },

      getChatByJobId: (jobId) => {
        return get().chats.find(chat => chat.jobId === jobId);
      },

      getChatsByUserId: (userId) => {
        return get().chats.filter(chat => 
          chat.customerId === userId || chat.driverId === userId
        );
      },

      setActiveChat: (chatId) => {
        set({ activeChatId: chatId });
      },

      markChatAsRead: (chatId) => {
        set(state => ({
          chats: state.chats.map(chat => 
            chat.id === chatId 
              ? { ...chat, unreadCount: 0 }
              : chat
          )
        }));
      },

      deleteChat: (chatId) => {
        set(state => ({
          chats: state.chats.filter(chat => chat.id !== chatId),
          activeChatId: state.activeChatId === chatId ? null : state.activeChatId
        }));
      }
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({ 
        chats: state.chats,
        activeChatId: state.activeChatId
      })
    }
  )
); 