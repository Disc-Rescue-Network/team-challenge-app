import { NextRequest, NextResponse } from "next/server";
import { list, del } from "@vercel/blob";

export async function DELETE(req: NextRequest) {
  try {
    const { teamName } = await req.json();
    console.log("Removing opponent team:", teamName);

    if (!teamName) {
      throw new Error("Team name is required");
    }

    // List the blobs to find the specific opponent team file
    const { blobs } = await list();
    console.log("Blobs:", blobs);
    const opponentBlob = blobs.find((blob) =>
      blob.pathname.startsWith(`opponent_${teamName}.json`)
    );
    console.log("Opponent blob:", opponentBlob);

    if (!opponentBlob) {
      throw new Error("Opponent team not found");
    }

    await del(opponentBlob.url);

    return NextResponse.json({
      message: "Opponent team removed successfully",
    });
  } catch (error: any) {
    console.error("Error removing opponent team:", error);
    return NextResponse.json(
      { message: "Error removing opponent team", error: error.message },
      { status: 500 }
    );
  }
}
