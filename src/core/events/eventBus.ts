// src/core/events/eventBus.ts

export type SentiEventName =
  | "OnboardingCompleted"
  | "DiaryCompleted"
  | "MoodLogged"
  | "AppointmentBooked"
  | "CrisisTriggered"
  | "ExerciseFinished";

export interface SentiEvent<T = any> {
  id: string;
  name: SentiEventName;
  timestamp: string;
  userId: string;
  payload: T;
}

export type EventCallback<T = any> = (event: SentiEvent<T>) => void | Promise<void>;

export class EventBus {
  private static instance: EventBus;
  private listeners: Map<SentiEventName, EventCallback[]> = new Map();
  private eventHistory: SentiEvent[] = [];

  private constructor() {
    // Private constructor for Singleton
  }

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  /**
   * Subscribes a listener to a specific SentiCore event.
   */
  public subscribe<T = any>(eventName: SentiEventName, callback: EventCallback<T>): () => void {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    this.listeners.get(eventName)!.push(callback);

    // Return an unsubscribe function
    return () => {
      const list = this.listeners.get(eventName);
      if (list) {
        this.listeners.set(
          eventName,
          list.filter((cb) => cb !== callback)
        );
      }
    };
  }

  /**
   * Publishes an event to all subscribed listeners asynchronously.
   */
  public async publish<T = any>(
    eventName: SentiEventName,
    userId: string,
    payload: T
  ): Promise<SentiEvent<T>> {
    const event: SentiEvent<T> = {
      id: `EV-${eventName.substring(0, 3).toUpperCase()}-${Date.now()}-${Math.floor(
        Math.random() * 1000
      )}`,
      name: eventName,
      timestamp: new Date().toISOString(),
      userId,
      payload,
    };

    // Store in internal memory history for analytics/auditing
    this.eventHistory.push(event);
    if (this.eventHistory.length > 500) {
      this.eventHistory.shift(); // Keep history size balanced
    }

    console.log(`[SentiCore:EventBus] Evento publicado: ${eventName} (ID: ${event.id}) para Usuário ${userId}`);

    const list = this.listeners.get(eventName) || [];
    
    // Execute callbacks in parallel asynchronously to avoid blocking the main flow
    Promise.all(
      list.map(async (callback) => {
        try {
          await callback(event);
        } catch (err) {
          console.error(`[SentiCore:EventBus] Erro ao processar listener para evento ${eventName}:`, err);
        }
      })
    ).catch((err) => {
      console.error(`[SentiCore:EventBus] Erro na execução assíncrona de callbacks:`, err);
    });

    return event;
  }

  /**
   * Retrieves full event stream logs for analysis and debugging.
   */
  public getHistory(): SentiEvent[] {
    return [...this.eventHistory];
  }

  /**
   * Clear event log history.
   */
  public clearHistory(): void {
    this.eventHistory = [];
  }
}
