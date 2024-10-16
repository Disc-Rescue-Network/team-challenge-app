import { NextResponse } from "next/server";
import { put,list  } from "@vercel/blob";
import { Team } from "@/app/interfaces/Team";

export async function POST(request: Request) {
  try {
    console.log("Saving team");
    const data = await request.json();
    console.log("Data:", data);
    const teamData: Team = data.teamData;
    console.log("Team data:", teamData);
   // const isMyTeam: boolean = data.isMyTeam;
   // console.log("Is my team:", isMyTeam);
   // const prefix = isMyTeam ? "myteam_" : "opponent_";
    const fileName = `${teamData.name}.json`;

    // -- To avoid duplicate teams, we check if the team already exists in the blob storage
    const { blobs } = await list();
    const myTeamBlob = blobs.find((blob) =>
      blob.pathname.startsWith(`${teamData.name}`)
    );

    if (myTeamBlob) {
      return NextResponse.json({ error: "Failed to save team. Team already exists." }, { status: 400 });
    }

    // -- If the team does not exist, we save it to the blob storage
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
