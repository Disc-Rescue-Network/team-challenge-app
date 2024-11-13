import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { Team } from "@/app/interfaces/Team";

export async function POST(request: Request) {
  try {
    console.log("Saving team");
    const data = await request.json();
    console.log("Data:", data);
    const teamData: Team = data.teamData;
    console.log("Team data:", teamData);
    const fileName = `${teamData.name}.json`;

    // -- Save the team data to the blob storage, overwriting if it already exists
    await put(fileName, JSON.stringify(teamData), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
    });

    return NextResponse.json({
      message: "Team saved successfully",
    });
  } catch (error) {
    console.error("Error saving team:", error);
    return NextResponse.json({ error: "Failed to save team" }, { status: 500 });
  }
}
