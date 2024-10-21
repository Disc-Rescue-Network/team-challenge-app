"use client";

import { useEffect, useState, useCallback } from "react";
import { put } from "@vercel/blob";
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
  CardDescription,
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
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// -- icons
import { ChevronDown, Loader2 } from "lucide-react";
// --custom components
import { paginateArray, Pagination } from "../components/pagination";
import TeamBadgeStatus from "../components/team-badge-status";
import GenderSwitch from "../components/genderSwitch";
// --utils
import { getMyCookie, hasMyCookie, setMyCookie } from "../utils/manage-cookies";
import AddPlayerToTeam from "../components/add-player-to-team";

const RosterPage = () => {
  const [hasTeam, setHasTeam] = useState<boolean>(false);
  const [team, setTeam] = useState<Team>({ name: "", players: [] });
  const [teams, setTeams] = useState<Team[]>([]);
  const [name, setName] = useState<string>("");
  const [results, setResults] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [isRemoving, setIsRemoving] = useState<boolean>(false);
  const [myTeam, setMyTeam] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("team");
  const [teamNames, setTeamNames] = useState<string[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [paginationConfig, setPaginationConfig] = useState({
    pageIndex: 0,
    perPage: "8",
    totalCount: 0,
  });

  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedGender, setSelectedGender] = useState("male");

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

  // const fetchTeamData = async () => {
  //   setIsLoading(true);
  //   try {
  //     const response = await fetch("/api/getMyTeam");
  //     const data = await response.json();
  //     console.log("Team data:", data);
  //     if (data.name !== "") {
  //       setTeam(data);
  //       setHasTeam(true);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching team data:", error);
  //   }
  //   setIsLoading(false);
  // };

  const fetchOpponentTeams = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/getOpponentTeams/?myTeam=${encodeURIComponent(myTeam)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();

      if (response.status === 200) {
        const extractedTeamNames = extractTeamNames(data).sort((a, b) =>
          a.localeCompare(b)
        );
        setTeamNames(extractedTeamNames);
        setTeams(data);
      }

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
  }, [myTeam]);

  useEffect(() => {
    fetchOpponentTeams();
  }, [fetchOpponentTeams]);

  const handleSearch = async () => {
    setIsSearching(true);
    const [firstName, lastName] = name.split(" ");
    const response = await fetch("/api/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ firstName, lastName: lastName || "" }),
    });
    const data = await response.json();
    setResults(data.players);
    setIsSearching(false);
  };

  // const handleAddPlayer = async (player: Player) => {
  //   try {
  //     setIsAdding(true);
  //     const response = await fetch("/api/addPlayerToTeam", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         player,
  //         teamName: team.name,
  //         isOpponent: false,
  //       }),
  //     });

  //     if (response.status === 400) {
  //       const data = await response.json();
  //       toast({
  //         title: "Player already exists",
  //         description: data.message,
  //         variant: "destructive",
  //         duration: 3000,
  //       });
  //       setIsAdding(false);
  //       return;
  //     }

  //     if (!response.ok) {
  //       throw new Error("Failed to add player");
  //     }

  //     const data = await response.json();
  //     setTeam(data.team);
  //     toast({
  //       title: "Player added",
  //       description: "Player added to your team",
  //       variant: "default",
  //       duration: 3000,
  //     });
  //   } catch (error) {
  //     console.error("Error adding player:", error);
  //     toast({
  //       title: "Error",
  //       description: "Failed to add player to your team",
  //       variant: "destructive",
  //       duration: 3000,
  //     });
  //   } finally {
  //     setIsAdding(false);
  //   }
  // };

  const handleSaveTeam = async () => {
    try {
      setIsLoading(true);
      const teamData: Team = {
        name: team.name,
        players: team.players,
      };
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
        setTeam({ name: "", players: [] });
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
      setIsRemoving(true);
      const response = await fetch("/api/removePlayer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          player,
          teamName: team.name,
          isOpponent: false,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove player");
      }

      const data = await response.json();
      setTeam(data.team);
      toast({
        title: "Player removed",
        description: "Player removed from your team",
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
      setIsRemoving(false);
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
  const handleTeamSelect = (teamName: string) => {
    setSelectedTeam(teamName);
    const selectedTeam = teams.find((team) => team.name === teamName);
    if (selectedTeam) {
      setTeam(selectedTeam);
      // Update the totalCount when a team is selected
      setPaginationConfig((previous) => ({
        ...previous,
        totalCount: selectedTeam.players.length,
      }));
    }
  };
  //-- to set the team on cookie
  const handleBadgeClick = () => {
    const hasCookie = hasMyCookie("myTeam");
    if (hasCookie) return;
    // --store the selected team on cookie--
    setMyCookie("myTeam", selectedTeam);
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

  const selectPlayer = async (player: Player) => {
    setSelectedPlayer(player);
    setIsDialogOpen(true);
  };

  return (
    <div className="flex flex-1 flex-col h-full gap-4 p-2 lg:p-4 lg:gap-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 m-auto justify-center w-90 max-w-[400px] mb-[10px]">
          <TabsTrigger value="team">Team</TabsTrigger>
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
                                disabled={isRemoving}
                                variant="destructive"
                                className="whitespace-nowrap"
                              >
                                {isRemoving ? (
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
                value={team.name}
                onChange={(e) => setTeam({ ...team, name: e.target.value })}
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
