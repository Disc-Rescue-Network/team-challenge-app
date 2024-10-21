import { NextRequest, NextResponse } from "next/server";
import { list } from "@vercel/blob";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const teamName = searchParams.get("teamName");
  console.log("TEAMANAME🤜", teamName);
  try {
    const { blobs } = await list();

    // const teamBlob = blobs.filter((blob) => {
    //   const teamBlobName = blob.pathname.split(".")[0];
    //   return teamBlobName === teamName;
    // });

    const teamBlob = blobs.find((blob) =>
      blob.pathname.includes(`${teamName}`)
    );

    console.log("teamBlob🤜", teamBlob);
    if (!teamBlob) {
      throw new Error("My team file not found");
    }

    const blobUrl = teamBlob.url;

    // Add a cache-busting query parameter
    const cacheBustingUrl = `${blobUrl}?timestamp=${Date.now()}`;

    // Fetch the actual content of the blob
    const response = await fetch(cacheBustingUrl, { cache: "no-store" });
    const data = await response.json();

    // Return the team data
    console.log("data🤜", data);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error loading data:", error);
    return NextResponse.json(
      { message: "Error loading data", error },
      { status: 500 }
    );
  }
}
