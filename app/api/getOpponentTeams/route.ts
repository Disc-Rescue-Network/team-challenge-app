import { NextRequest, NextResponse } from "next/server";
import { list } from "@vercel/blob";

export async function GET(req: NextRequest) {
  try {
    // List the blobs to find all opponent team files
    const { blobs } = await list();
    const opponentBlobs = blobs.filter((blob) =>
      blob.pathname.startsWith("opponent_")
    );

    if (opponentBlobs.length === 0) {
      return NextResponse.json({ message: "No opponent teams found" });
    }

    const opponentTeams = await Promise.all(
      opponentBlobs.map(async (blob) => {
        // Add a cache-busting query parameter
        const cacheBustingUrl = `${blob.url}?timestamp=${Date.now()}`;
        const response = await fetch(cacheBustingUrl, { cache: "no-store" });
        const data = await response.json();
        return data;
      })
    );

    // Return the list of opponent teams
    return NextResponse.json(opponentTeams);
  } catch (error: any) {
    console.error("Error loading opponent teams:", error);
    return NextResponse.json(
      { message: "Error loading opponent teams", error },
      { status: 500 }
    );
  }
}
