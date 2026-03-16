export interface Memory {
  id: string;
  raw: string;
  layer: string;
  importanceScore: number;
  createdAt: string;
  source?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface DreamResult {
  consolidated: number;
  deduplicated: number;
  clustersFormed: number;
  entitiesExtracted: number;
  patterns: string[];
  clusters: { name: string; memories: string[] }[];
  entities: { name: string; type: string; mentions: number }[];
}

export interface BenchmarkData {
  label: string;
  value: number;
  unit: string;
  description: string;
}

export const BENCHMARKS: BenchmarkData[] = [
  {
    label: "Memory Recall",
    value: 97.5,
    unit: "%",
    description: "Precision in retrieving relevant memories from semantic queries",
  },
  {
    label: "Consolidation Rate",
    value: 84.5,
    unit: "%",
    description: "Average token savings after dream cycle consolidation",
  },
  {
    label: "Total Memories",
    value: 13147,
    unit: "",
    description: "Memories stored and indexed in production",
  },
  {
    label: "Dream Cycle",
    value: 3,
    unit: "min",
    description: "Average time for full consolidation cycle",
  },
  {
    label: "Query Latency",
    value: 50,
    unit: "ms",
    description: "P50 semantic search response time",
  },
  {
    label: "Dedup Accuracy",
    value: 100,
    unit: "%",
    description: "Precision in identifying duplicate memories",
  },
];
