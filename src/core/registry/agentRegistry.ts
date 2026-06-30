// src/core/registry/agentRegistry.ts
import { SentiCoreAgent } from "../types";

export interface AgentMetadata {
  id: string;
  name: string;
  description: string;
  status: "online" | "idle" | "error";
  requiredPermissions: string[];
  dataUsed: string[];
  dataWritten: string[];
  eventsProduced: string[];
}

export class AgentRegistry {
  private static instance: AgentRegistry;
  private agents: Map<string, SentiCoreAgent> = new Map();
  private metadataMap: Map<string, AgentMetadata> = new Map();

  private constructor() {
    // Private constructor for Singleton pattern
  }

  public static getInstance(): AgentRegistry {
    if (!AgentRegistry.instance) {
      AgentRegistry.instance = new AgentRegistry();
    }
    return AgentRegistry.instance;
  }

  /**
   * Registers an agent with its security, operational, and auditing metadata.
   */
  public register(agent: SentiCoreAgent, metadata: AgentMetadata): void {
    this.agents.set(agent.agentId, agent);
    this.metadataMap.set(agent.agentId, metadata);
    console.log(`[SentiCore:Registry] Agente registrado com sucesso: ${agent.agentId} (${metadata.name})`);
  }

  /**
   * Retrieves an agent by its unique identifier.
   */
  public getAgent(agentId: string): SentiCoreAgent | undefined {
    return this.agents.get(agentId);
  }

  /**
   * Retrieves metadata for a specific agent.
   */
  public getMetadata(agentId: string): AgentMetadata | undefined {
    return this.metadataMap.get(agentId);
  }

  /**
   * Lists all registered agents in SentiCore OS.
   */
  public listAgents(): SentiCoreAgent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Lists all registered agent metadata profiles for LGPD auditing.
   */
  public listMetadata(): AgentMetadata[] {
    return Array.from(this.metadataMap.values());
  }

  /**
   * Changes the status of an agent (e.g. online, idle, error).
   */
  public setStatus(agentId: string, status: "online" | "idle" | "error"): void {
    const meta = this.metadataMap.get(agentId);
    if (meta) {
      meta.status = status;
    }
  }
}
