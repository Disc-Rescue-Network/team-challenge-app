import { Player } from "@/app/interfaces/Player";
import { NextResponse } from "next/server";
import { checkCache, setCache } from "../utils/cache";

export async function POST(request: Request) {
  try {
    const { firstName, lastName, pdgaNumber, city, state, country } =
      await request.json();

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

    // if (cachedData) {
    //   console.log("Returning cached data");
    //   return NextResponse.json({ players: cachedData });
    // }
    console.log(
      `Searching for player: ${firstName} ${lastName}-${pdgaNumber}-${city}-${state}-${country}`
    );
    console.log("Fetching data from external API");
    const response = await fetch(
      "https://tags-api.discrescuenetwork.com/search_pdga",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          pdgaNumber,
          city,
          state,
          country,
        }),
      }
    );

    // const response = await fetch("http://localhost:3001/search_pdga", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({ firstName, lastName }),
    // });

    console.log("Data fetched from external API");

    if (!response.ok) {
      console.log("Failed to fetch data from external API");
      throw new Error("Failed to fetch data from external API");
    }

    const { players }: { players: Player[] } = await response.json();
    console.log("Players✅", players, players.length);
    console.log("Transformed data to Player[] format");

    // Set active to true and isEditing to false for each player
    const modifiedPlayers = players.map((player) => ({
      ...player,
      active: true,
      isEditing: false,
    }));
    console.log("Modified player data");

    setCache(cacheKey, modifiedPlayers);
    console.log("Set the Cache");

    return NextResponse.json({ players: modifiedPlayers });
  } catch (error) {
    console.error(`Error fetching data: ${error}`);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
