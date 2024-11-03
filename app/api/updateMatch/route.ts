import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

// -- field can be "date" to update the date of the match
// -- field can be "result" to update the result of the match
export async function PUT(request: Request) {
  try {
    console.log("Bati");
    const { matchId, date, field, results } = await request.json();

    // Read the current matches.json
    const matchesPath = path.join(process.cwd(), "app", "matches.json");
    const matchesContent = await fs.readFile(matchesPath, "utf-8");
    const matches = JSON.parse(matchesContent);

    // Update the match date
    let matchFound = false;
    if (field === "date") {
      for (const matchGroup of Object.values(matches.matches)) {
        for (const match of matchGroup as any[]) {
          if (match.id === matchId) {
            match.date = new Date(date).toISOString();
            matchFound = true;
            break;
          }
        }
        if (matchFound) break;
      }
    }

    // Write back to the file
    await fs.writeFile(matchesPath, JSON.stringify(matches, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating match date:", error);
    return NextResponse.json(
      { error: "Failed to update match date" },
      { status: 500 }
    );
  }
}
