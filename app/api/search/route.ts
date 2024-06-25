import { Player } from "@/app/interfaces/Player";
import { NextResponse } from "next/server";
import { checkCache, setCache } from "../utils/cache";

export async function POST(request: Request) {
  try {
    const { firstName, lastName } = await request.json();

    if (!firstName) {
      return NextResponse.json(
        { error: "First name is required" },
        { status: 400 }
      );
    }

    const cacheKey = `${firstName.toLowerCase()}_${(
      lastName || ""
    ).toLowerCase()}`;
    const cachedData = checkCache(cacheKey);

    if (cachedData) {
      return NextResponse.json({ players: cachedData });
    }

    const response = await fetch(
      "https://tags-api.discrescuenetwork.com/search_pdga",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ firstName, lastName }),
      }
    );

    // const response = await fetch("http://localhost:3001/search_pdga", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({ firstName, lastName }),
    // });

    if (!response.ok) {
      throw new Error("Failed to fetch data from external API");
    }

    const { players }: { players: Player[] } = await response.json();

    // Set active to true and isEditing to false for each player
    const modifiedPlayers = players.map((player) => ({
      ...player,
      active: true,
      isEditing: false,
    }));

    setCache(cacheKey, modifiedPlayers);

    return NextResponse.json({ players: modifiedPlayers });
  } catch (error) {
    console.error(`Error fetching data: ${error}`);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
