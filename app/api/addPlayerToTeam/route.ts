import { NextRequest, NextResponse } from "next/server";
import { list, put } from "@vercel/blob";
import { Team } from "@/app/interfaces/Team";

export async function POST(req: NextRequest) {
  try {
    console.log("Adding player to team...");
    const { player, teamName, isOpponent } = await req.json();
    console.log("isOpponent", isOpponent);
    console.log("teamName", teamName);
    console.log("player", player);

    // List the blobs to find the unique URL for the team JSON file
    const { blobs } = await list();
    console.log("blobs", blobs);
    const prefix = isOpponent ? "opponent_" : "myteam_";
    const teamBlob = blobs.find((blob) =>
      blob.pathname.startsWith(`${prefix}${teamName}.json`)
    );
    console.log("teamBlob", teamBlob);

    if (!teamBlob) {
      throw new Error(`Team file for ${teamName} not found`);
    }

    const blobUrl = teamBlob.url;

    // Add a cache-busting query parameter
    const cacheBustingUrl = `${blobUrl}?timestamp=${Date.now()}`;

    // Fetch the existing team data
    const response = await fetch(cacheBustingUrl, { cache: "no-store" });
    const team: Team = await response.json();

    // Check if the player already exists on the team
    const playerExists = team.players.some(
      (p) => p.pdgaNumber === player.pdgaNumber
    );
    if (playerExists) {
      return NextResponse.json(
        { message: "Player already exists on the team", team },
        { status: 400 }
      );
    }

    // Add the new player to the team's players array
    team.players.push(player);

    // Upload the updated team data back to the blob without adding a random suffix
    await put(`${prefix}${teamName}.json`, JSON.stringify(team), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
    });

    return NextResponse.json({ message: "Player added successfully", team });
  } catch (error: any) {
    console.error("Error adding player:", error);
    return NextResponse.json(
      { message: "Error adding player", error },
      { status: 500 }
    );
  }
}
