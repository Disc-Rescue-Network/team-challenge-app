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

const SchedulePage = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [myTeam, setMyTeam] = useState<string>("");
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [teamNames, setTeamNames] = useState<string[]>([]);

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
  const handleTeamSelect = async (teamName: string) => {
    setSelectedTeam(teamName);
  };
  const schedule = [
    {
      team: "Tranquility Trails",
      matches: [
        {
          home: true,
          opponent: "Ockie",
          result: { score: 29, opponentScore: 5 },
          date: "10/15/2024",
        },
        {
          home: true,
          opponent: "Wolf",
          result: { score: 22.5, opponentScore: 7.5 },
          date: "10/22/2024",
        },
        { home: false, opponent: "Sovi", date: "11/17/2024" },
        { home: false, opponent: "Mercer" },
        { home: true, opponent: "Camp Alex" },
        { home: false, opponent: "Doc" },
      ],
    },
  ];

  const [scores, setScores] = useState({});

  const handleScoreUpdate = (
    matchId: string,
    homeScore: number,
    awayScore: number
  ) => {
    setScores((prev) => ({
      ...prev,
      [matchId]: { homeScore, awayScore },
    }));
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
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schedule[0].matches.map((match, index) => (
            <TableRow
              key={index}
              className={match.opponent === selectedTeam ? "bg-muted" : ""}
            >
              <TableCell className="font-medium">{index + 1}</TableCell>
              <TableCell>{match.date || "TBD"}</TableCell>
              <TableCell>
                <Badge variant={match.home ? "default" : "secondary"}>
                  {match.home ? <Home className="mr-1 h-3 w-3" /> : null}
                  {match.home ? "Home" : "Away"}
                </Badge>
              </TableCell>
              <TableCell>{match.opponent}</TableCell>
              <TableCell>
                {match.result ? (
                  `${match.result.score} - ${match.result.opponentScore}`
                ) : (
                  <span className="text-muted-foreground">Not played</span>
                )}
              </TableCell>
              <TableCell>
                {!match.result && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Home"
                      className="w-20"
                      onChange={(e) =>
                        handleScoreUpdate(
                          `${index}-home`,
                          parseFloat(e.target.value),
                          0
                        )
                      }
                    />
                    <Input
                      type="number"
                      placeholder="Away"
                      className="w-20"
                      onChange={(e) =>
                        handleScoreUpdate(
                          `${index}-away`,
                          0,
                          parseFloat(e.target.value)
                        )
                      }
                    />
                    <Button variant="outline" size="sm">
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
