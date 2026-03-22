import { io, Socket } from "socket.io-client";
import { DirectMessage } from "../types";

const STORAGE_KEY = 'mock_direct_messages';
let socket: Socket | null = null;

const getMessages = (): DirectMessage[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveMessages = (messages: DirectMessage[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
};

export const chatService = {
  init: (userId: string) => {
    if (socket) return;
    
    // In development, the socket server is on the same host/port
    socket = io();
    
    socket.on("connect", () => {
      console.log("Connected to chat server");
      socket?.emit("join", userId);
    });

    socket.on("new_message", (message: DirectMessage) => {
      const messages = getMessages();
      // Avoid duplicates
      if (!messages.find(m => m.id === message.id)) {
        messages.push(message);
        saveMessages(messages);
        window.dispatchEvent(new Event('storage'));
      }
    });

    return () => {
      socket?.disconnect();
      socket = null;
    };
  },

  sendMessage: async (senderId: string, receiverId: string, text: string, appointmentId?: string) => {
    if (socket) {
      socket.emit("send_message", { senderId, receiverId, text, appointmentId });
    } else {
      // Fallback to local storage if socket is not connected
      const messageId = Date.now().toString();
      const messageData: DirectMessage = {
        id: messageId,
        senderId,
        receiverId,
        text,
        timestamp: new Date().toISOString(),
        appointmentId: appointmentId || null
      };

      const messages = getMessages();
      messages.push(messageData);
      saveMessages(messages);
      window.dispatchEvent(new Event('storage'));
      return messageId;
    }
  },

  listenMessages: (userId: string, otherId: string, callback: (messages: DirectMessage[]) => void) => {
    const updateMessages = () => {
      const allMessages = getMessages();
      const filtered = allMessages.filter(m => 
        (m.senderId === userId && m.receiverId === otherId) ||
        (m.senderId === otherId && m.receiverId === userId)
      ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      
      callback(filtered);
    };

    updateMessages();
    window.addEventListener('storage', updateMessages);
    
    // Also poll every second as a fallback
    const intervalId = setInterval(updateMessages, 1000);

    return () => {
      window.removeEventListener('storage', updateMessages);
      clearInterval(intervalId);
    };
  },

  listenMessagesByAppointment: (appointmentId: string, callback: (messages: DirectMessage[]) => void) => {
    const updateMessages = () => {
      const allMessages = getMessages();
      const filtered = allMessages.filter(m => m.appointmentId === appointmentId)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      
      callback(filtered);
    };

    updateMessages();
    window.addEventListener('storage', updateMessages);
    const intervalId = setInterval(updateMessages, 1000);

    return () => {
      window.removeEventListener('storage', updateMessages);
      clearInterval(intervalId);
    };
  }
};
