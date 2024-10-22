import { NextRequest, NextResponse } from "next/server";
import { list } from "@vercel/blob";

export async function GET(request: NextRequest) {
  try {
    // List the blobs to find all opponent team files
    const { blobs } = await list();

    let allTeamsBlobs = blobs;

    if (allTeamsBlobs.length === 0) {
      return NextResponse.json({ message: "No teams found" });
    }

    const allTeams = await Promise.all(
      allTeamsBlobs.map(async (blob) => {
        // Add a cache-busting query parameter
        const cacheBustingUrl = `${blob.url}?timestamp=${Date.now()}`;
        const response = await fetch(cacheBustingUrl, { cache: "no-store" });
        const data = await response.json();
        return data;
      })
    );

    // Return the list of opponent teams
    return NextResponse.json(allTeams);
  } catch (error: any) {
    console.error("Error loading all teams:", error);
    return NextResponse.json(
      { message: "Error loading all teams", error },
      { status: 500 }
    );
  }
}
