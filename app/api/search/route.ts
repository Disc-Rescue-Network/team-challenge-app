import { Player } from "@/app/interfaces/Player";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { firstName, lastName } = await request.json();

    if (!firstName) {
      return NextResponse.json(
        { error: "First name is required" },
        { status: 400 }
      );
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
    return NextResponse.json({ players });
  } catch (error) {
    console.error(`Error fetching data: ${error}`);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
