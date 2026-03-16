const API_URL = process.env.ENGRAM_API_URL || "https://api.openengram.ai";
const API_KEY = process.env.ENGRAM_API_KEY || "";

interface EngramRequestOptions {
  method?: string;
  body?: Record<string, unknown>;
  userId: string;
  agentId?: string;
}

async function engramFetch(path: string, opts: EngramRequestOptions) {
  const { method = "GET", body, userId, agentId = "playground" } = opts;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-AM-API-Key": API_KEY,
    "X-AM-User-ID": userId,
    "X-AM-Agent-ID": agentId,
  };

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Engram API error ${res.status}: ${text}`);
  }

  return res.json();
}

// Valid layers: IDENTITY, PROJECT, SESSION, TASK, INSIGHT
// Valid sources: DREAM_CYCLE, EXPLICIT_STATEMENT, AGENT_OBSERVATION, AGENT_REFLECTION, CORRECTION, PATTERN_DETECTED, SYSTEM, GIT_HISTORY
export async function storeMemory(
  userId: string,
  content: string,
  layer: string = "IDENTITY",
  source: string = "EXPLICIT_STATEMENT"
) {
  return engramFetch("/v1/memories", {
    method: "POST",
    userId,
    body: {
      raw: content,
      layer,
      source,
    },
  });
}

// Query memories
export async function queryMemories(
  userId: string,
  query: string,
  limit: number = 5
) {
  return engramFetch("/v1/memories/query", {
    method: "POST",
    userId,
    body: { query, limit },
  });
}

// Trigger dream cycle
export async function triggerDreamCycle(userId: string) {
  return engramFetch("/v1/consolidation/dream-cycle", {
    method: "POST",
    userId,
    body: { userId },
  });
}

// Get dream cycle reports
export async function getDreamReports(userId: string) {
  return engramFetch("/v1/consolidation/dream-cycle/reports", {
    method: "GET",
    userId,
  });
}

// Get consolidation stats
export async function getConsolidateStats(userId: string) {
  return engramFetch("/v1/consolidate/stats", {
    method: "GET",
    userId,
  });
}

// Run clustering
export async function runClustering(userId: string) {
  return engramFetch("/v1/clustering/run", {
    method: "POST",
    userId,
    body: {},
  });
}

// Get clusters
export async function getClusters(userId: string) {
  return engramFetch("/v1/clustering/clusters", {
    method: "GET",
    userId,
  });
}

// Get graph entities
export async function getGraphEntities(userId: string) {
  return engramFetch("/v1/graph/entities", {
    method: "GET",
    userId,
  });
}

// Get user memories (list)
export async function listMemories(userId: string, limit: number = 20) {
  return engramFetch(`/v1/memories?limit=${limit}&sort=createdAt:desc`, {
    method: "GET",
    userId,
  });
}

// Flush/cleanup demo user memories
export async function flushMemories(userId: string) {
  return engramFetch("/v1/memories/flush", {
    method: "POST",
    userId,
    body: { confirm: true },
  });
}
