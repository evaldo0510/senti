import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from './firebase';
import { Appointment } from '../types';

let cachedAccessToken: string | null = null;

export const googleWorkspaceService = {
  getAccessToken: (): string | null => {
    return cachedAccessToken;
  },

  isAuthorized: (): boolean => {
    return cachedAccessToken !== null;
  },

  authorize: async (): Promise<string | null> => {
    const provider = new GoogleAuthProvider();
    // Add Scopes
    provider.addScope('https://www.googleapis.com/auth/calendar');
    provider.addScope('https://www.googleapis.com/auth/chat.spaces.readonly');
    provider.addScope('https://www.googleapis.com/auth/chat.messages');

    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        cachedAccessToken = credential.accessToken;
        return cachedAccessToken;
      }
      return null;
    } catch (error) {
      console.error("Error authorizing Google Workspace:", error);
      throw error;
    }
  },

  disconnect: () => {
    cachedAccessToken = null;
  },

  createCalendarEvent: async (appointment: Appointment): Promise<any> => {
    if (!cachedAccessToken) {
      throw new Error("Não autorizado. Conecte sua conta do Google primeiro.");
    }

    try {
      const datePart = appointment.date.split('T')[0];
      const timePart = appointment.time || '12:00';
      const startDateTimeStr = `${datePart}T${timePart}:00`;
      
      const startDateTime = new Date(startDateTimeStr);
      // Event duration: 1 hour (60 minutes)
      const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);

      const event = {
        summary: `Consulta de Terapia: ${appointment.patientNome} & ${appointment.therapistNome}`,
        description: `Sessão de terapia agendada pelo Pronto Socorro Emocional.
Tipo de Atendimento: ${appointment.type === 'video' ? 'Vídeo Chamada' : appointment.type === 'chat' ? 'Chat Criptografado' : 'Presencial'}
Paciente: ${appointment.patientNome}
Terapeuta: ${appointment.therapistNome}
Observações: ${appointment.notes || 'Nenhuma observação definida.'}`,
        location: appointment.type === 'video' ? 'Consultório Virtual (Pronto Socorro Emocional)' : appointment.type === 'chat' ? 'Chat Integrado' : 'Atendimento Presencial',
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 30 }
          ]
        }
      };

      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cachedAccessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Erro desconhecido ao criar evento no Google Calendar');
      }

      return await response.json();
    } catch (error) {
      console.error("Erro ao criar evento de calendário:", error);
      throw error;
    }
  },

  listChatSpaces: async (): Promise<any[]> => {
    if (!cachedAccessToken) {
      throw new Error("Não autorizado. Conecte sua conta do Google primeiro.");
    }

    try {
      const response = await fetch('https://chat.googleapis.com/v1/spaces', {
        headers: {
          'Authorization': `Bearer ${cachedAccessToken}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Erro desconhecido ao listar Google Chat Spaces');
      }

      const data = await response.json();
      return data.spaces || [];
    } catch (error) {
      console.error("Erro ao listar salas do Google Chat:", error);
      throw error;
    }
  },

  sendChatMessage: async (spaceName: string, text: string): Promise<any> => {
    if (!cachedAccessToken) {
      throw new Error("Não autorizado. Conecte sua conta do Google primeiro.");
    }

    try {
      // Endpoint syntax: POST https://chat.googleapis.com/v1/spaces/{spaceId}/messages
      // or directly if spaceName is already 'spaces/{spaceId}'
      const url = `https://chat.googleapis.com/v1/${spaceName}/messages`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cachedAccessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Erro desconhecido ao enviar mensagem no Google Chat');
      }

      return await response.json();
    } catch (error) {
      console.error("Erro ao enviar mensagem no Google Chat:", error);
      throw error;
    }
  }
};
