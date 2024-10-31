"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronDown, Home } from "lucide-react";
import { useEffect, useState } from "react";
import { getMyCookie } from "../utils/manage-cookies";
import TeamBadgeStatus from "../components/team-badge-status";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Player } from "../interfaces/Player";
import { toast } from "@/components/ui/use-toast";
import ALL_MATCHES from "../matches.json";

type Team = {
  team: string;
  points: number;
};

type Match = {
  id: number;
  home: Team;
  away: Team;
  totalPoints: number;
  date: string | null;
};

type MatchGroups = {
  [key: string]: Match[]; // For match1, match2, etc.
};

type Matches = {
  matches: MatchGroups;
};

// Type for the returned team match
type TeamMatch = {
  id: number;
  matchGroup: string;
  position: "home" | "away";
  opponent: string;
  teamPoints: number;
  opponentPoints: number;
  totalPoints: number;
  date: string | null;
};

type Score = {
  home: number;
  away: number;
};

const SchedulePage = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [myTeam, setMyTeam] = useState<string>("");
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [teamNames, setTeamNames] = useState<string[]>([]);
  const [teamMatches, setTeamMatches] = useState<TeamMatch[]>([]);
  const [score, setScore] = useState<Score>({ home: 0, away: 0 });

  useEffect(() => {
    //-- get myTeam from cookie
    const myTeam = getMyCookie("myTeam");
    if (myTeam) setMyTeam(myTeam);
  }, []);

  const fetchAllTeams = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/getAllTeams`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        toast({
          title: "Error",
          description: "Fail to fetch all teams",
          variant: "destructive",
          duration: 3000,
        });
      }

      const data = await response.json();

      if (response.status === 200) {
        const extractedTeamNames = extractTeamNames(data).sort((a, b) =>
          a.localeCompare(b)
        );
        setTeamNames(extractedTeamNames);
      }
      //
      if (response.status === 400) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error fetching  teams:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAllTeams();
  }, []);

  // -- to select the team from the dropdown
  const handleTeamSelect = (teamName: string) => {
    setSelectedTeam(teamName);
    const matches = getTeamMatches(ALL_MATCHES.matches, teamName);
    console.log(matches, teamName);
    setTeamMatches(matches);
  };

  const getTeamMatches = (
    matches: MatchGroups,
    teamName: string
  ): TeamMatch[] => {
    const teamMatches: TeamMatch[] = [];

    // Use Object.entries to get both the key (matchGroup) and value
    Object.entries(matches).forEach(([matchGroup, matches]) => {
      matches.forEach((match) => {
        if (match.home.team === teamName || match.away.team === teamName) {
          const isHome = match.home.team === teamName;
          const teamMatch: TeamMatch = {
            id: match.id,
            matchGroup, // Add the matchGroup (e.g., "match1", "match2")
            position: isHome ? "home" : "away",
            opponent: isHome ? match.away.team : match.home.team,
            teamPoints: isHome ? match.home.points : match.away.points,
            opponentPoints: isHome ? match.away.points : match.home.points,
            totalPoints: match.totalPoints,
            date: match.date,
          };
          teamMatches.push(teamMatch);
        }
      });
    });

    return teamMatches.sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  };

  const handleUpdateMatchPoints = (matchId: number) => {
    setTeamMatches((previous) =>
      previous.map((match) => {
        if (match.id === matchId) {
          return {
            ...match,
            teamPoints: score.home,
            opponentPoints: score.away,
            totalPoints: score.home + score.away,
          };
        }
        return match;
      })
    );
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <p>
          {" "}
          {selectedTeam && (
            <TeamBadgeStatus
              myTeam={myTeam}
              selectedTeam={selectedTeam}
              handleBadgeClick={() => {}}
            />
          )}
        </p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="px-2 gap-1 !mt-0">
              {selectedTeam || "Select a team"}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="custom-dropdown-content overflow-y-auto max-h-[250px]"
          >
            {teamNames.map((teamName) => (
              <DropdownMenuCheckboxItem
                key={teamName}
                checked={selectedTeam === teamName}
                onCheckedChange={() => handleTeamSelect(teamName)}
                className="w-full py-2 px-4 hover:bg-gray-100 pl-7"
              >
                {teamName}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <h1>Match Schedule</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Match</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Home/Away</TableHead>
            <TableHead>Opponent</TableHead>
            <TableHead>Result</TableHead>
            <TableHead>Total points</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teamMatches.length > 0 &&
            teamMatches.map((match) => (
              <TableRow
                key={match.id}
                className={match.opponent === selectedTeam ? "bg-muted" : ""}
              >
                <TableCell className="font-medium">
                  {match.matchGroup.slice(5)}
                </TableCell>
                <TableCell>{match.date || "TBD"}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      match.position === "home" ? "default" : "secondary"
                    }
                  >
                    {match.position === "home" ? (
                      <Home className="mr-1 h-3 w-3" />
                    ) : null}
                    {match.position === "home" ? "Home" : "Away"}
                  </Badge>
                </TableCell>
                <TableCell>{match.opponent}</TableCell>
                <TableCell>
                  {match.totalPoints ? (
                    `${match.teamPoints} - ${match.opponentPoints}`
                  ) : (
                    <span className="text-muted-foreground">Not played</span>
                  )}
                </TableCell>
                <TableCell>{match.totalPoints}</TableCell>
                <TableCell>
                  {!match.totalPoints && (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="Home"
                        className="w-20"
                        value={score.home}
                        onChange={(e) =>
                          setScore((previous) => ({
                            ...previous,
                            home: parseFloat(e.target.value),
                          }))
                        }
                      />
                      <Input
                        type="number"
                        placeholder="Away"
                        className="w-20"
                        value={score.away}
                        onChange={(e) =>
                          setScore((previous) => ({
                            ...previous,
                            home: parseFloat(e.target.value),
                          }))
                        }
                        // }
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateMatchPoints(match.id)}
                      >
                        Save
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </>
  );
};
function extractTeamNames(
  teams: Array<{ name: string; players: Player[] }>
): string[] {
  return teams.map((team) => team.name);
}

export default SchedulePage;
