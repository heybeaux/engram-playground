import { v4 as uuid } from "uuid";

export interface DemoSession {
  id: string;
  userId: string;
  isLive: boolean; // true = real API, false = simulated
  createdAt: number;
  messageCount: number;
}

const LIVE_PERCENTAGE = parseInt(process.env.LIVE_PERCENTAGE || "50", 10);

export function createDemoSession(): DemoSession {
  const id = uuid();
  const isLive = Math.random() * 100 < LIVE_PERCENTAGE;

  return {
    id,
    userId: `demo_${id.slice(0, 8)}`,
    isLive,
    createdAt: Date.now(),
    messageCount: 0,
  };
}

// Pre-recorded simulation data for Group B
export const SIMULATED_MEMORIES = [
  {
    id: "sim-1",
    raw: "User mentioned they work in AI research focusing on language models.",
    layer: "EPISODIC",
    importanceScore: 0.72,
    createdAt: new Date().toISOString(),
  },
  {
    id: "sim-2",
    raw: "User prefers dark mode interfaces and minimalist design.",
    layer: "PREFERENCE",
    importanceScore: 0.45,
    createdAt: new Date().toISOString(),
  },
  {
    id: "sim-3",
    raw: "User is evaluating memory solutions for their agent framework.",
    layer: "EPISODIC",
    importanceScore: 0.81,
    createdAt: new Date().toISOString(),
  },
  {
    id: "sim-4",
    raw: "User expressed frustration with agents losing context between sessions.",
    layer: "EMOTIONAL",
    importanceScore: 0.88,
    createdAt: new Date().toISOString(),
  },
  {
    id: "sim-5",
    raw: "User's name is Alex and they're based in San Francisco.",
    layer: "IDENTITY",
    importanceScore: 0.65,
    createdAt: new Date().toISOString(),
  },
];

export const SIMULATED_DREAM_RESULT = {
  consolidated: 3,
  deduplicated: 1,
  clustersFormed: 2,
  entitiesExtracted: 4,
  patterns: [
    "User is technically sophisticated — works in AI/ML",
    "Strong preference for good UX and developer experience",
    "Active pain point: agent memory continuity",
  ],
  clusters: [
    { name: "Professional Context", memories: ["sim-1", "sim-3"] },
    { name: "Preferences & Identity", memories: ["sim-2", "sim-5"] },
  ],
  entities: [
    { name: "Alex", type: "PERSON", mentions: 1 },
    { name: "San Francisco", type: "LOCATION", mentions: 1 },
    { name: "AI Research", type: "TOPIC", mentions: 2 },
    { name: "Agent Framework", type: "TECHNOLOGY", mentions: 1 },
  ],
};
