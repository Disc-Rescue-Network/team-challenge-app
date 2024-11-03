"use client";
import { FaCalendarDays } from "react-icons/fa6";
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
import { Check, ChevronDown, Edit2, Home, Loader2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TeamChallengeBadge from "../components/custom-badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { twMerge } from "tailwind-merge";

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

type TooltipContent = {
  editResult: string;
};
const SchedulePage = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [myTeam, setMyTeam] = useState<string>("");
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [teamNames, setTeamNames] = useState<string[]>([]);
  const [teamMatches, setTeamMatches] = useState<TeamMatch[]>([]);
  const [score, setScore] = useState<Score>({ home: 0, away: 0 });
  const [rowIndex, setRowIndex] = useState<number | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string>("");
  const [tooltipContent, setTooltipContent] = useState<TooltipContent>({
    editResult: "Update results",
  });

  const inputRef = useRef<HTMLInputElement>(null);
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

  const handleUpdateMatchResults = (matchId: number) => {
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

  const handleSetMatchResults = (index: number) => {
    setActionInProgress("edit");
    setRowIndex(index); // -- row that is editing
    // Schedule focus for the next render cycle to the home team input
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleUpdateMatchDate = async (matchId: number, date: Date) => {
    try {
      const response = await fetch("/api/updateMatch", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ matchId, date }),
      });

      if (!response.ok) {
        throw new Error("Failed to update match date");
      }

      // Update local state
      setTeamMatches((previous) =>
        previous.map((match) => {
          if (match.id === matchId) {
            return {
              ...match,
              date: date.toISOString(),
            };
          }
          return match;
        })
      );

      toast({
        title: "Success",
        description: "Match date updated successfully",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update match date",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return (
    <div className="bg-lightgray">
      <h1 className="mb-4 text-2xl font-bold tracking-tight">Schedules</h1>
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg md:text-2xl lg:text-2xl">
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
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="!mt-0 gap-1 px-2">
                {selectedTeam || "Select a team"}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="custom-dropdown-content max-h-[250px] overflow-y-auto"
            >
              {teamNames.map((teamName) => (
                <DropdownMenuCheckboxItem
                  key={teamName}
                  checked={selectedTeam === teamName}
                  onCheckedChange={() => handleTeamSelect(teamName)}
                  className="w-full px-4 py-2 pl-7 hover:bg-gray-100"
                >
                  {teamName}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Match #</TableHead>
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
                  teamMatches.map((match, index) => (
                    <TableRow
                      key={match.id}
                      className={
                        match.opponent === selectedTeam ? "bg-muted" : ""
                      }
                    >
                      <TableCell className="font-medium">
                        {match.matchGroup.slice(5)}
                      </TableCell>
                      <TableCell>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              disabled={match.totalPoints > 0}
                              className={cn(
                                "w-[240px] justify-start text-left font-normal",
                                !match.date && "text-muted-foreground"
                              )}
                            >
                              {match.date ? (
                                format(new Date(match.date), "PPP")
                              ) : (
                                <span className="flex items-center gap-2">
                                  <FaCalendarDays /> Pick a date
                                </span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={
                                match.date ? new Date(match.date) : undefined
                              }
                              onSelect={(date: Date | undefined) =>
                                date && handleUpdateMatchDate(match.id, date)
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </TableCell>
                      <TableCell>
                        <TeamChallengeBadge text={match.position} />
                      </TableCell>
                      <TableCell>{match.opponent}</TableCell>
                      <TableCell>
                        {match.totalPoints ? (
                          <span className="tabular-nums">
                            {match.teamPoints} - {match.opponentPoints}
                          </span>
                        ) : rowIndex && rowIndex === index ? (
                          <div className="flex items-center gap-2">
                            <Input
                              ref={inputRef}
                              type="number"
                              placeholder="Home"
                              min="0"
                              className={cn("w-16", "no-spinner")}
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
                              min="0"
                              placeholder="Away"
                              className={cn("w-16", "no-spinner")}
                              value={score.away}
                              onChange={(e) =>
                                setScore((previous) => ({
                                  ...previous,
                                  away: parseFloat(e.target.value),
                                }))
                              }
                              // }
                            />
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => {
                                    setRowIndex(null);
                                    setScore({ home: 0, away: 0 });
                                    setActionInProgress("");
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Cancel editing</p>
                              </TooltipContent>
                            </Tooltip>
                            <div className="group relative">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() =>
                                  handleUpdateMatchResults(match.id)
                                }
                                disabled={actionInProgress === "edit"}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <div
                                className={twMerge(
                                  "pointer-events-none absolute bottom-full left-1/2 z-10 mb-2",
                                  "-translate-x-1/2 transform whitespace-nowrap rounded border border-gray-300 bg-white p-2 opacity-80",
                                  "flex items-center gap-2 text-gray-800 transition-opacity duration-200 group-hover:opacity-100",
                                  `${actionInProgress === "updating" ? "opacity-100" : "opacity-0"}`
                                )}
                              >
                                {actionInProgress === "updating" &&
                                  rowIndex &&
                                  rowIndex === index && (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  )}{" "}
                                {tooltipContent.editResult}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">
                            Not played
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="tabular-nums">
                          {match.totalPoints}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleSetMatchResults(index)}
                                disabled={match.totalPoints > 0}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Set the results</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TooltipProvider>
        </CardContent>
      </Card>
    </div>
  );
};
function extractTeamNames(
  teams: Array<{ name: string; players: Player[] }>
): string[] {
  return teams.map((team) => team.name);
}

export default SchedulePage;
