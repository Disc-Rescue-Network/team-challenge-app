import { NextRequest, NextResponse } from "next/server";
import { list, put } from "@vercel/blob";
import { Team } from "@/app/interfaces/Team";
export async function PATCH(request: NextRequest) {
  try {
    const { teamName, player, newPlayerRating } = await request.json();
    const { blobs } = await list();

    const teamBlob = blobs.find((blob) =>
      blob.pathname.includes(`${teamName}`)
    );

    if (!teamBlob) {
      throw new Error("Team file not found");
    }

    const blobUrl = teamBlob.url;

    // Add a cache-busting query parameter
    const cacheBustingUrl = `${blobUrl}?timestamp=${Date.now()}`;

    // Fetch the actual content of the blob
    const response = await fetch(cacheBustingUrl, { cache: "no-store" });
    const team: Team = await response.json();

    // Check if the player already exists on the team
    const playerExists = team.players.some(
      (p) => p.pdgaNumber === player.pdgaNumber && p.name === player.name
    );

    if (!playerExists) {
      return NextResponse.json(
        { message: `Player ${player.name} not found on the team ${teamName}` },
        { status: 400 }
      );
    }

    // Update the player's rating
    const updatedPlayers = team.players.map((blobPlayer) =>
      blobPlayer.pdgaNumber === player.pdgaNumber &&
      blobPlayer.name === player.name
        ? { ...blobPlayer, rating: newPlayerRating }
        : blobPlayer
    );

    const updatedTeam = { ...team, players: updatedPlayers };

    await put(`${teamName}.json`, JSON.stringify(updatedTeam), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
    });

    return NextResponse.json(
      { message: "Player rating updated successfully", updatedTeam },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating rating:", error);
    return NextResponse.json(
      { message: "Error updating rating", error },
      { status: 500 }
    );
  }
}
