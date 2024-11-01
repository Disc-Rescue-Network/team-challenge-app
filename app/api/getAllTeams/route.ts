import { NextRequest, NextResponse } from "next/server";
import { list } from "@vercel/blob";

// Revalidate every 60 seconds
export const revalidate = 60;

export async function GET(request: NextRequest) {
  try {
    // List the blobs to find all opponent team files
    const { blobs } = await list();

    if (blobs.length === 0) {
      return NextResponse.json({ message: "No teams found" });
    }

    // Fetch team data from each blob URL with default caching
    const allTeams = await Promise.all(
      blobs.map(async (blob) => {
        const response = await fetch(blob.url, { cache: "force-cache" });
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
