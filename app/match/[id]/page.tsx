"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useGames } from "../../hooks/useGames";
import { Match } from "../../interfaces/Match";
import { usePlayers } from "../../hooks/usePlayers";
import { url } from "inspector";

const MatchView = ({ params }: { params: { id: string } }) => {
  const games = useGames("Tranquility Trails Teebirds");
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  //get matchup ID from URL
  const matchId = parseInt(params.id);

  useEffect(() => {
    const match = games.find((game) => game.id === matchId);
    setCurrentMatch(match || null);
  }, [games, matchId]);

  if (!currentMatch) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent>Match not found</CardContent>
      </Card>
    );
  }

  const homeTeam = {
    name: currentMatch.isHome
      ? "Tranquility Trails Teebirds"
      : currentMatch.opponent,
  };
  const awayTeam = {
    name: currentMatch.isHome
      ? currentMatch.opponent
      : "Tranquility Trails Teebirds",
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Week {currentMatch.week} Matchup</span>
          {currentMatch.score && (
            <Badge
              variant={
                currentMatch.result === "win" ? "default" : "destructive"
              }
              className={currentMatch.result === "win" ? "bg-green-500" : ""}
            >
              {currentMatch.score.home} - {currentMatch.score.away}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <TeamRoster team={awayTeam} isHome={false} />
          <TeamRoster team={homeTeam} isHome={true} />
        </div>
      </CardContent>
    </Card>
  );
};

type Team = {
  name: string;
};

function TeamRoster({ team, isHome }: { team: Team; isHome: boolean }) {
  const players = usePlayers(team.name);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="truncate">
          {team.name} ({isHome ? "Home" : "Away"})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full pr-4">
          <div className="space-y-4">
            {players.map((player, index) => (
              <div key={index}>
                <div className="flex justify-between items-center">
                  <div className="truncate mr-2">
                    <Label className="truncate block">{player.name}</Label>
                    <p className="text-sm text-muted-foreground">
                      Rating: {player.rating}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Bench
                  </Button>
                </div>
                {index < players.length - 1 && <Separator className="my-2" />}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default MatchView;
