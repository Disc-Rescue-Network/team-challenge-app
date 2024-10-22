"use client";

import { useEffect, useState, useCallback } from "react";
// -- types
import { Player } from "../interfaces/Player";
import { Team } from "../interfaces/Team";
// -- shadcn
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { toast } from "@/components/ui/use-toast";
import { DropdownMenu, DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import {
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// -- icons
import { ChevronDown, Loader2 } from "lucide-react";
// --custom components
import { paginateArray, Pagination } from "../components/pagination";
import TeamBadgeStatus from "../components/team-badge-status";

// --utils
import { getMyCookie, hasMyCookie, setMyCookie } from "../utils/manage-cookies";
import AddPlayerToTeam from "../components/add-player-to-team";

const RosterPage = () => {
  const [team, setTeam] = useState<Team>({ name: "", players: [] });
  const [newTeam, setNewTeam] = useState<Team>({ name: "", players: [] });
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [myTeam, setMyTeam] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("team");
  const [teamNames, setTeamNames] = useState<string[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [paginationConfig, setPaginationConfig] = useState({
    pageIndex: 0,
    perPage: "8",
    totalCount: 0,
  });
  const [removingPlayers, setRemovingPlayers] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    const keepAlive = async () => {
      console.log("Pinging API to keep it alive");
      try {
        await fetch("https://tags-api.discrescuenetwork.com");
        console.log("API pinged successfully");
      } catch (error) {
        console.error("Error keeping API alive:", error);
      }
    };

    // Ping the API immediately on load
    keepAlive();

    // Set interval to ping the API every 14 minutes
    const interval = setInterval(keepAlive, 14 * 60 * 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    //-- get myTeam from cookie
    const myTeam = getMyCookie("myTeam");
    if (myTeam) setMyTeam(myTeam);
  }, []);

  const handlePagination = (pageIndex: number) => {
    setPaginationConfig((previous) => ({ ...previous, pageIndex }));
  };

  const paginatedResults = paginateArray(
    team.players.sort((a, b) => a.name.localeCompare(b.name)),
    paginationConfig.pageIndex,
    paginationConfig.perPage
  );

  const fetchAllTeams = useCallback(async () => {
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
        setTeams(data);
      }

      // -- Update the currently selected team if it exists
      //! we need to ensure that the team data is refreshed when you return to the "team" tab, especially after adding or removing players.
      if (selectedTeam) {
        const updatedSelectedTeam = data.find(
          (t: { name: string }) => t.name === selectedTeam
        );
        if (updatedSelectedTeam) {
          setTeam(updatedSelectedTeam);
          setPaginationConfig((previous) => ({
            ...previous,
            totalCount: updatedSelectedTeam.players.length,
          }));
        }
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
      console.error("Error fetching opponent teams:", error);
    }
    setIsLoading(false);
    // --Added selectedTeam as a dependency to the useCallback hook for fetchAllTeams.
    // --This means the function will be recreated if selectedTeam changes, ensuring we're always working with the most up-to-date team data and players.
  }, [selectedTeam]);

  useEffect(() => {
    // --fetch all teams when the team tab is active to get the latest list of teams
    if (activeTab === "team") {
      console.log("fetching all teams");
      fetchAllTeams();
    }
  }, [activeTab, fetchAllTeams]);

  const handleSaveTeam = async () => {
    try {
      setIsLoading(true);
      const teamData: Team = {
        name: newTeam.name,
        players: [],
      };
      console.log("teamData", teamData);
      const response = await fetch("/api/saveTeam", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ teamData }),
      });

      if (response.status === 200) {
        toast({
          title: "Success",
          description: `Team ${teamData.name} saved successfully. Next, click on "Add Player" to add players to your team.🥏`,
          variant: "default",
          duration: 5000,
        });
        setNewTeam({ name: "", players: [] });
        setActiveTab("addPlayer");
      }

      if (response.status === 400) {
        const errorMessage = await response.json();
        toast({
          title: "Error",
          description: errorMessage.error,
          variant: "destructive",
          duration: 3000,
        });
      }

      //fetchTeamData(); // Refresh the team data
      setIsLoading(false);
    } catch (error) {
      console.error(`Error saving team: ${error}`);
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Failed to save team",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleEditTeam = () => {
    alert("not yet built");
  };

  const handleRemovePlayer = async (player: Player) => {
    try {
      // --set the player to be removing
      setRemovingPlayers((prev) => ({ ...prev, [player.pdgaNumber]: true }));
      const response = await fetch("/api/removePlayer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          player,
          teamName: team.name,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove player");
      }

      const data = await response.json();
      setTeam(data.team);
      // --update the total count of players on the team after removing a player
      setPaginationConfig((previous) => ({
        ...previous,
        totalCount: data.team.players.length,
      }));
      toast({
        title: "Player removed",
        description: `Player ${player.name} removed from ${data.team.name}`,
        variant: "default",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error removing player:", error);
      toast({
        title: "Error",
        description: "Failed to remove player from your team",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setRemovingPlayers((prev) => ({ ...prev, [player.pdgaNumber]: false }));
    }
  };

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1080);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // -- to select the team from the dropdown
  const handleTeamSelect = async (teamName: string) => {
    setSelectedTeam(teamName);
    // --fetch the latestteam data
    try {
      const response = await fetch(
        `/api/getTeam/?teamName=${encodeURIComponent(teamName)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      if (response.status === 200) {
        console.log("data", data);
        setTeam(data);
        // Update the totalCount when a team is selected
        setPaginationConfig((previous) => ({
          ...previous,
          totalCount: data.players.length,
        }));
      } else {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to fetch team data",
        variant: "destructive",
        duration: 3000,
      });
    }
  };
  //-- to set the team on cookie
  const handleBadgeClick = () => {
    const hasCookie = hasMyCookie("myTeam");
    if (hasCookie) return;
    // --store the selected team on cookie--
    //* -- 365 days in seconds (1 year)
    setMyCookie("myTeam", selectedTeam, { maxAge: 365 * 24 * 60 * 60 });
    // --get the selected team from cookie--
    const teamSavedOnCookie = getMyCookie("myTeam");
    if (teamSavedOnCookie === selectedTeam) {
      setMyTeam(selectedTeam);

      toast({
        title: "My team 🥏",
        description: `You successfully set ${selectedTeam} as your team.`,
        variant: "default",
        duration: 3000,
      });
    }
  };

  return (
    <div className="flex flex-1 flex-col h-full gap-4 p-2 lg:p-4 lg:gap-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 m-auto justify-center w-90 max-w-[400px] mb-[10px]">
          <TabsTrigger value="team">Manage Team</TabsTrigger>
          <TabsTrigger value="createTeam">Create Team</TabsTrigger>
          <TabsTrigger value="addPlayer">Add Player</TabsTrigger>
        </TabsList>

        <TabsContent value="team" className="mb-4">
          <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg md:text-2xl lg:text-2xl">
                {selectedTeam && (
                  <TeamBadgeStatus
                    myTeam={myTeam}
                    selectedTeam={selectedTeam}
                    handleBadgeClick={handleBadgeClick}
                  />
                )}
              </CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="px-2 gap-1 !mt-0">
                    {selectedTeam || "Select a team"}{" "}
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
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <Label>Please wait</Label>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap">
                          Name
                        </TableHead>
                        <TableHead className="whitespace-nowrap">
                          Rating
                        </TableHead>
                        <TableHead className="whitespace-nowrap">
                          PDGA Number
                        </TableHead>
                        <TableHead className="whitespace-nowrap">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    {team.players.length === 0 ? (
                      <TableBody>
                        <TableRow>
                          <TableCell colSpan={4} className="text-center pt-10">
                            <Label className="text-sm">
                              No players on team
                            </Label>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    ) : (
                      <TableBody>
                        {paginatedResults.map((player, index) => (
                          <TableRow key={index}>
                            <TableCell className="whitespace-nowrap">
                              {player.name}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {player.rating}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {player.pdgaNumber}
                            </TableCell>
                            <TableCell>
                              <Button
                                onClick={() => handleRemovePlayer(player)}
                                disabled={removingPlayers[player.pdgaNumber]}
                                variant="destructive"
                                className="whitespace-nowrap"
                              >
                                {removingPlayers[player.pdgaNumber] ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  "Remove"
                                )}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    )}
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
          <Pagination
            onPageChange={handlePagination}
            perPage={parseInt(paginationConfig.perPage)}
            pageIndex={paginationConfig.pageIndex!}
            totalCount={paginationConfig.totalCount}
            label="Total Players"
          />
        </TabsContent>

        <TabsContent value="createTeam">
          <Card className="w-full mb-4">
            <CardHeader>
              <CardTitle>Create Team</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="text"
                value={newTeam.name}
                onChange={(e) => setNewTeam({ ...team, name: e.target.value })}
                placeholder="Enter team name"
              />
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button onClick={handleSaveTeam}>Save Team</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="addPlayer">
          <AddPlayerToTeam />
        </TabsContent>
      </Tabs>
    </div>
  );
};

function extractTeamNames(
  teams: Array<{ name: string; players: Player[] }>
): string[] {
  return teams.map((team) => team.name);
}
export default RosterPage;
