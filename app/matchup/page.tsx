"use client";

import { useEffect, useState } from "react";
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
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Player } from "../interfaces/Player";
import { Team } from "../interfaces/Team";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MatchupPage = () => {
  const [hasTeam, setHasTeam] = useState<boolean>(false);
  const [team, setTeam] = useState<Team>({ name: "", players: [] });

  //   const [hasOpponent, setHasOpponent] = useState<boolean>(false);
  //   const [opponent, setOpponent] = useState<Team>({ name: "", players: [] });
  const [opponents, setOpponents] = useState<Team[]>([]);
  const [selectedOpponent, setSelectedOpponent] = useState<Team | null>(null);
  const [createOpponentTeam, setCreateOpponentTeam] = useState<string>("");

  const [results, setResults] = useState<Player[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [isRemoving, setIsRemoving] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const [isMyTeam, setIsMyTeam] = useState<boolean>(true);
  const [name, setName] = useState<string>("");

  useEffect(() => {
    // Fetch the existing team data when the component mounts
    fetchTeamData();
    fetchOpponentTeams();
  }, []);

  const fetchTeamData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/getMyTeam");
      const data = await response.json();
      console.log("Team data:", data);
      if (data.name !== "") {
        setTeam(data);
        setHasTeam(true);
      }
    } catch (error) {
      console.error("Error fetching team data:", error);
    }
    setIsLoading(false);
  };

  const fetchOpponentTeams = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/getOpponentTeams");
      const data = await response.json();
      setOpponents(data);
    } catch (error) {
      console.error("Error fetching opponent teams:", error);
    }
    setIsLoading(false);
  };

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

  const handleAddPlayer = async (player: Player, isOpponent: boolean) => {
    try {
      setIsAdding(true);
      const response = await fetch("/api/addPlayerToTeam", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          player,
          teamName: isOpponent ? selectedOpponent?.name : team.name,
          isOpponent,
        }),
      });

      if (response.status === 400) {
        const data = await response.json();
        toast({
          title: "Player already exists",
          description: data.message,
          variant: "destructive",
          duration: 3000,
        });
        setIsAdding(false);
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to add player");
      }

      const data = await response.json();
      if (isOpponent) {
        setSelectedOpponent(data.team);
      } else {
        setTeam(data.team);
      }
      toast({
        title: "Player added",
        description: `Player added to ${isOpponent ? "opponent" : "your"} team`,
        variant: "default",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error adding player:", error);
      toast({
        title: "Error",
        description: "Failed to add player to the team",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemovePlayer = async (player: Player, isOpponent: boolean) => {
    try {
      setIsRemoving(true);
      const response = await fetch("/api/removePlayer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          player,
          teamName: isOpponent ? selectedOpponent?.name : team.name,
          isOpponent,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove player");
      }

      const data = await response.json();
      if (isOpponent) {
        setSelectedOpponent(data.team);
      } else {
        setTeam(data.team);
      }
      toast({
        title: "Player removed",
        description: `Player removed from ${
          isOpponent ? "opponent" : "your"
        } team`,
        variant: "default",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error removing player:", error);
      toast({
        title: "Error",
        description: "Failed to remove player from the team",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsRemoving(false);
    }
  };

  const handleSaveOpponentTeam = async () => {
    try {
      setIsLoading(true);
      const teamData: Team = {
        name: selectedOpponent?.name || "",
        players: selectedOpponent?.players || [],
      };
      const response = await fetch("/api/saveTeam", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ teamData, isMyTeam: false }), // Save as opponent team
      });

      if (!response.ok) {
        throw new Error("Failed to save opponent team");
      }

      toast({
        title: "Success",
        description: "Opponent team saved successfully",
        variant: "default",
        duration: 3000,
      });
      fetchOpponentTeams();
      setIsLoading(false);
    } catch (error) {
      console.error(`Error saving opponent team: ${error}`);
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Failed to save opponent team",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleCreateOpponentTeam = async () => {
    try {
      setIsCreating(true);
      const teamData: Team = {
        name: createOpponentTeam,
        players: [],
      };
      const response = await fetch("/api/saveTeam", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ teamData, isMyTeam: false }), // Save as opponent team
      });

      if (!response.ok) {
        throw new Error("Failed to save opponent team");
      }

      toast({
        title: "Success",
        description: "Opponent team saved successfully",
        variant: "default",
        duration: 3000,
      });
      fetchOpponentTeams();
      setIsCreating(false);
    } catch (error) {
      console.error(`Error saving opponent team: ${error}`);
      setIsCreating(false);
      toast({
        title: "Error",
        description: "Failed to save opponent team",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleSelectOpponent = (opponent: Team) => {
    setSelectedOpponent(opponent);
  };

  const handleRemoveOpponent = async (opponent: Team) => {
    try {
      setIsDeleting(true);
      const response = await fetch("/api/removeOpponent", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ teamName: opponent.name }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove opponent team");
      }

      toast({
        title: "Success",
        description: "Opponent team removed successfully",
        variant: "default",
        duration: 3000,
      });
      fetchOpponentTeams();
      setIsDeleting(false);
    } catch (error) {
      console.error(`Error removing opponent team: ${error}`);
      setIsDeleting(false);
      toast({
        title: "Error",
        description: "Failed to remove opponent team",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return (
    <div className="flex flex-1 flex-col h-3/5 gap-6 p-4 lg:gap-6 lg:p-6">
      <Tabs defaultValue="teamBuilder" className="w-full">
        <TabsList className="grid grid-cols-2 m-auto justify-center w-80 max-w-[400px] mb-[10px]">
          <TabsTrigger value="teamBuilder">Team Builder</TabsTrigger>
          <TabsTrigger value="matchupViewer">Matchup Viewer</TabsTrigger>
        </TabsList>
        <TabsContent value="teamBuilder" className="grid grid-cols-1 gap-6">
          {hasTeam ? (
            <Card className="mr-4">
              <CardHeader>
                <CardTitle>{team.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>PDGA Number</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  {team.players.length === 0 ? (
                    <TableBody>
                      <TableRow>
                        <TableCell colSpan={4} className="text-center pt-10">
                          {isLoading ? (
                            <Loader2 size="32" />
                          ) : (
                            <Label className="text-sm">
                              No players on team
                            </Label>
                          )}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  ) : (
                    <TableBody>
                      {team.players.map((player: Player, index: number) => (
                        <TableRow key={index}>
                          <TableCell>{player.name}</TableCell>
                          <TableCell>{player.pdgaNumber}</TableCell>
                          <TableCell>{player.rating}</TableCell>
                          <TableCell>
                            <Button
                              onClick={() => handleRemovePlayer(player, false)}
                              disabled={isRemoving}
                            >
                              {isRemoving ? <Loader2 /> : "Remove"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  )}
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card className="mr-4">
              <CardHeader>
                <CardTitle>No Team Found</CardTitle>
              </CardHeader>
              <CardContent>
                <Label className="text-sm">
                  Create a team in &quot;My Roster&quot; to view matchups.
                </Label>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="selectTeam" className="w-full">
            <TabsList className="grid grid-cols-2 m-auto justify-center w-80 max-w-[400px] mb-[10px]">
              <TabsTrigger value="selectTeam">Select Opponent</TabsTrigger>
              <TabsTrigger value="createTeam">Create Opponent</TabsTrigger>
            </TabsList>
            <TabsContent value="selectTeam" className="w-11/12">
              {opponents.length > 0 ? (
                <Card className="mr-4">
                  <CardHeader>
                    <CardTitle>Select Opponent Team</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {opponents.map((opponent, index) => (
                          <TableRow key={index}>
                            <TableCell>{opponent.name}</TableCell>
                            <TableCell className="flex flex-row gap-4 max-w-[200px]">
                              <Button
                                onClick={() => handleSelectOpponent(opponent)}
                                disabled={selectedOpponent === opponent}
                              >
                                Select
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => handleRemoveOpponent(opponent)}
                              >
                                Remove
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ) : (
                <> No teams to select </>
              )}
            </TabsContent>
            <TabsContent value="createTeam" className="w-11/12">
              <Card className="mr-4">
                <CardHeader>
                  <CardTitle>Create Opponent Team</CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    type="text"
                    value={createOpponentTeam}
                    onChange={(e) => setCreateOpponentTeam(e.target.value)}
                    placeholder="Enter opponent team name"
                  />
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                  <Button
                    onClick={handleCreateOpponentTeam}
                    disabled={isCreating}
                  >
                    {isCreating ? <Loader2 /> : "Create Team"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>

          {selectedOpponent && (
            <Card className="mr-4">
              <CardHeader>
                <CardTitle>{selectedOpponent.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>PDGA Number</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  {selectedOpponent.players.length === 0 ? (
                    <TableBody>
                      <TableRow>
                        <TableCell colSpan={4} className="text-center pt-10">
                          {isLoading ? (
                            <Loader2 size="32" />
                          ) : (
                            <Label className="text-sm">
                              No players on opponent team
                            </Label>
                          )}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  ) : (
                    <TableBody>
                      {selectedOpponent.players.map((player, index) => (
                        <TableRow key={index}>
                          <TableCell>{player.name}</TableCell>
                          <TableCell>{player.pdgaNumber}</TableCell>
                          <TableCell>{player.rating}</TableCell>
                          <TableCell>
                            <Button
                              onClick={() => handleRemovePlayer(player, true)}
                              disabled={isRemoving}
                            >
                              {isRemoving ? <Loader2 /> : "Remove"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  )}
                </Table>
              </CardContent>
            </Card>
          )}

          {selectedOpponent && (
            <>
              <Card className="mr-4">
                <CardHeader>
                  <CardTitle>Player Search</CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter player's name"
                  />
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                  <Button onClick={handleSearch}>
                    {isSearching ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <Label>Please wait</Label>
                      </>
                    ) : (
                      "Search"
                    )}
                  </Button>
                </CardFooter>
              </Card>

              <Card className="mr-4">
                <CardHeader>
                  <CardTitle>Search Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>PDGA Number</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>State</TableHead>
                        <TableHead>Country</TableHead>
                        <TableHead>Membership Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    {results.length === 0 ? (
                      <TableBody>
                        <TableRow>
                          <TableCell colSpan={9} className="text-center pt-10">
                            {isSearching ? (
                              <Loader2 size="32" />
                            ) : (
                              <Label className="text-sm">
                                No results found
                              </Label>
                            )}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    ) : (
                      <TableBody>
                        {results.map((player, index) => (
                          <TableRow key={index}>
                            <TableCell>{player.name}</TableCell>
                            <TableCell>{player.pdgaNumber}</TableCell>
                            <TableCell>{player.rating}</TableCell>
                            <TableCell>{player.class}</TableCell>
                            <TableCell>{player.city}</TableCell>
                            <TableCell>{player.state}</TableCell>
                            <TableCell>{player.country}</TableCell>
                            <TableCell>{player.membershipStatus}</TableCell>
                            <TableCell className="grid grid-cols-1 gap-4 min-w-[180px]">
                              <Button
                                onClick={() => handleAddPlayer(player, false)}
                                disabled={isAdding}
                              >
                                {isAdding ? <Loader2 /> : "Add to Team"}
                              </Button>
                              <Button
                                onClick={() => handleAddPlayer(player, true)}
                                disabled={isAdding}
                                variant="destructive"
                              >
                                {isAdding ? <Loader2 /> : "Add to Opponent"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    )}
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
        <TabsContent value="matchupViewer" className="w-11/12">
          matchups
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MatchupPage;
