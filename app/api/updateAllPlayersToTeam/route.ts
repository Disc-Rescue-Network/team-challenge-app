import { NextRequest, NextResponse } from "next/server";
import { list, put } from "@vercel/blob";
import { Team } from "@/app/interfaces/Team";

// -- This end point not only update the player ratings, but when is necessary update a team
// -- with any updated property
export async function PUT(req: NextRequest) {
  try {
    const { players, teamName } = await req.json();

    console.log("teamName", teamName);
    console.log("players", players);

    // List the blobs to find the unique URL for the team JSON file
    const { blobs } = await list();
    console.log("blobs", blobs);

    const teamBlob = blobs.find((blob) => blob.pathname === `${teamName}.json`);
    console.log("teamBlob", teamBlob);

    if (!teamBlob) {
      return NextResponse.json(
        { message: `Team file for ${teamName} not found` },
        { status: 400 }
      );
    }

    const blobUrl = teamBlob.url;

    // Add a cache-busting query parameter
    const cacheBustingUrl = `${blobUrl}?timestamp=${Date.now()}`;

    // Fetch the existing team data
    const response = await fetch(cacheBustingUrl, { cache: "no-store" });
    const team: Team = await response.json();

    team.players = players;

    // Upload the updated team data back to the blob without adding a random suffix
    await put(`${teamName}.json`, JSON.stringify(team), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
    });

    return NextResponse.json(
      { message: "Players updated successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error adding player:", error);
    return NextResponse.json(
      { message: "Error adding player", error },
      { status: 500 }
    );
  }
}
