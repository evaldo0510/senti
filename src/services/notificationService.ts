/**
 * Serviço de Gerenciamento de Notificações Push
 * Responsável por gerenciar as permissões e integrar com PushManager.
 */

export class NotificationService {
  /**
   * Obtém o estado atual da permissão de notificações de forma segura.
   * Retorna 'default' (pendente), 'denied' (negada) ou 'granted' (concedida).
   */
  public static getPermissionStatus(): NotificationPermission {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "default";
    }
    return Notification.permission;
  }

  /**
   * Retorna verdadeiro se a permissão estiver pendente ('default') ou negada ('denied').
   */
  public static isPendingOrDenied(): boolean {
    const status = this.getPermissionStatus();
    return status === "default" || status === "denied";
  }

  /**
   * Solicita permissão de notificação push ao usuário.
   */
  public static async requestPermission(): Promise<NotificationPermission> {
    if (typeof window === "undefined" || !("Notification" in window)) {
      console.warn("Este navegador não suporta notificações.");
      return "default";
    }

    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (error) {
      console.error("Erro ao solicitar permissão de notificação:", error);
      return "default";
    }
  }

  /**
   * Converte a chave pública VAPID Base64 para Uint8Array.
   */
  public static urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}
