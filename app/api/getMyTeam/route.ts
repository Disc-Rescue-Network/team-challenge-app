import { NextRequest, NextResponse } from "next/server";
import { list } from "@vercel/blob";

export async function GET(req: NextRequest) {
  try {
    // List the blobs to find the unique URL for the 'myteam_' prefixed files
    const { blobs } = await list();
    const myTeamBlob = blobs.find((blob) =>
      blob.pathname.startsWith("myteam_")
    );

    if (!myTeamBlob) {
      return NextResponse.json({ message: "Team not found" }, { status: 404 });
    }

    const blobUrl = myTeamBlob.url;

    // Add a cache-busting query parameter
    const cacheBustingUrl = `${blobUrl}?timestamp=${Date.now()}`;

    // Fetch the actual content of the blob
    const response = await fetch(cacheBustingUrl, { cache: "no-store" });
    const data = await response.json();

    // Return the team data
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error loading data:", error);
    return NextResponse.json(
      { message: "Error loading data", error },
      { status: 500 }
    );
  }
}
