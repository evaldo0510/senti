import { DirectMessage } from "../types";

const STORAGE_KEY = 'mock_direct_messages';

const getMessages = (): DirectMessage[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveMessages = (messages: DirectMessage[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
};

export const chatService = {
  sendMessage: async (senderId: string, receiverId: string, text: string, appointmentId?: string) => {
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
    
    // Simulate real-time update by triggering a storage event
    window.dispatchEvent(new Event('storage'));
    
    return messageId;
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
    
    // Also poll every second as a fallback for the same-window updates
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
