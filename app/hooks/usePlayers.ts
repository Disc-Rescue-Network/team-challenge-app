"use client";

import { useEffect, useState } from "react";
import { PlayerNew } from "../interfaces/Player-new";

export function usePlayers(teamName: string) {
  const [players, setPlayers] = useState<PlayerNew[]>([]);

  useEffect(() => {
    // Simulating an API call
    const fetchedPlayers: PlayerNew[] =
      teamName === "Tranquility Trails Teebirds"
        ? [
            { name: "Brandon Whitaker", rating: 970 },
            { name: "Brian O'Neill", rating: 970 },
            { name: "Brian Struck", rating: 939 },
            { name: "Ben Riesenbach", rating: 932 },
            { name: "Christian Ertl", rating: 930 },
            { name: "Brandon Hasko", rating: 927 },
            { name: "Dennis Burnett", rating: 926 },
            { name: "Justin Case", rating: 924 },
          ]
        : [
            { name: "Hunter Bostwick", rating: 965 },
            { name: "Jack Staples", rating: 925 },
            { name: "Austen Hartzell", rating: 921 },
            { name: "Jay Eppenbach", rating: 920 },
            { name: "Will Beck", rating: 895 },
            { name: "Rich Bostwick", rating: 895 },
            { name: "Aaron Day", rating: 885 },
            { name: "Emir Santos", rating: 871 },
          ];
    setPlayers(fetchedPlayers);
  }, [teamName]);

  return players;
}
