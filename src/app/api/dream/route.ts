import { NextRequest, NextResponse } from "next/server";
import {
  triggerDreamCycle,
  runClustering,
  getClusters,
  getGraphEntities,
} from "@/lib/engram";
import { SIMULATED_DREAM_RESULT } from "@/lib/demo-session";

export async function POST(req: NextRequest) {
  try {
    const { userId, isLive } = await req.json();

    if (!isLive) {
      // Simulate a dream cycle with delays for visual effect
      return NextResponse.json(SIMULATED_DREAM_RESULT);
    }

    // Trigger the real dream cycle
    const [dreamResult, clusterResult] = await Promise.allSettled([
      triggerDreamCycle(userId),
      runClustering(userId),
    ]);

    // Fetch results
    const [clusters, entities] = await Promise.allSettled([
      getClusters(userId),
      getGraphEntities(userId),
    ]);

    const dream =
      dreamResult.status === "fulfilled" ? dreamResult.value : null;
    const clusterData =
      clusters.status === "fulfilled" ? clusters.value : null;
    const entityData =
      entities.status === "fulfilled" ? entities.value : null;

    return NextResponse.json({
      consolidated: dream?.consolidated || 0,
      deduplicated: dream?.deduplicated || 0,
      clustersFormed: clusterData?.clusters?.length || 0,
      entitiesExtracted: entityData?.entities?.length || 0,
      patterns: dream?.patterns || [],
      clusters: clusterData?.clusters || [],
      entities: entityData?.entities || [],
      raw: { dream, clusterResult: clusterResult.status === "fulfilled" ? clusterResult.value : null },
    });
  } catch (error) {
    console.error("Dream cycle error:", error);
    return NextResponse.json(
      { error: "Dream cycle failed" },
      { status: 500 }
    );
  }
}
