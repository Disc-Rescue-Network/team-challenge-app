import { useState, useEffect } from "react";
import { Match } from "../interfaces/Match";

export function useGames(teamName: string) {
  const [games, setGames] = useState<Match[]>([]);

  useEffect(() => {
    // Simulating an API call
    const fetchedGames: Match[] = [
      {
        id: 1,
        opponent: "Ockie",
        isHome: true,
        score: { home: 21, away: 19.5 },
        result: "win",
        week: 1,
      },
      {
        id: 2,
        opponent: "Wolf",
        isHome: true,
        score: { home: 19.5, away: 21 },
        result: "loss",
        week: 2,
      },
      { id: 3, opponent: "Sovi", isHome: false, week: 3 },
      { id: 4, opponent: "Mercer", isHome: false, week: 4 },
      { id: 5, opponent: "Camp Alex", isHome: true, week: 5 },
      { id: 6, opponent: "Doc", isHome: false, week: 6 },
    ];
    setGames(fetchedGames);
  }, [teamName]);

  return games;
}
