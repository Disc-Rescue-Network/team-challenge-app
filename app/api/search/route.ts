import { Player } from "@/app/interfaces/Player";
import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function POST(request: Request) {
  try {
    const { firstName, lastName } = await request.json();

    if (!firstName) {
      return NextResponse.json(
        { error: "First name is required" },
        { status: 400 }
      );
    }

    const searchUrl = `https://www.pdga.com/players?FirstName=${encodeURIComponent(
      firstName
    )}&LastName=${encodeURIComponent(lastName || "")}`;

    const browser = await puppeteer.launch({
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: true,
    });

    const page = await browser.newPage();
    await page.goto(searchUrl, {
      waitUntil: "domcontentloaded",
      timeout: 120000,
    });

    const players: Player[] = await page.evaluate(() => {
      const rows = Array.from(
        document.querySelectorAll("table.views-table tbody tr")
      );
      return rows.map((row) => {
        const cells = row.querySelectorAll("td");
        return {
          name: cells[0]?.innerText?.trim() || "",
          pdgaNumber: parseInt(cells[1]?.innerText?.trim() || "0"),
          rating: parseInt(cells[2]?.innerText?.trim() || "0"),
          class: cells[3]?.innerText?.trim() || "",
          city: cells[4]?.innerText?.trim() || "",
          state: cells[5]?.innerText?.trim() || "",
          country: cells[6]?.innerText?.trim() || "",
          membershipStatus: cells[7]?.innerText?.trim() || "",
        };
      });
    });

    await browser.close();
    return NextResponse.json({ players });
  } catch (error) {
    console.error(`Error fetching data: ${error}`);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
