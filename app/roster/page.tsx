"use client";

import { useEffect, useState } from "react";
import { put } from "@vercel/blob";
import { Player } from "../interfaces/Player";
import { Team } from "../interfaces/Team";
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
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const RosterPage = () => {
  const [hasTeam, setHasTeam] = useState<boolean>(false);
  const [team, setTeam] = useState<Team>({ name: "", players: [] });
  const [name, setName] = useState<string>("");
  const [results, setResults] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [isRemoving, setIsRemoving] = useState<boolean>(false);
  const [isMyTeam, setIsMyTeam] = useState<boolean>(true);

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
    // Fetch the existing team data when the component mounts
    fetchTeamData();
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

  const handleAddPlayer = async (player: Player) => {
    try {
      setIsAdding(true);
      const response = await fetch("/api/addPlayerToTeam", {
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
      setTeam(data.team);
      toast({
        title: "Player added",
        description: "Player added to your team",
        variant: "default",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error adding player:", error);
      toast({
        title: "Error",
        description: "Failed to add player to your team",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsAdding(false);
    }
  };

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
        body: JSON.stringify({ teamData, isMyTeam }), // Include isMyTeam in the request body
      });

      if (!response.ok) {
        throw new Error("Failed to save team");
      }

      toast({
        title: "Success",
        description: "Team saved successfully",
        variant: "default",
        duration: 3000,
      });
      fetchTeamData(); // Refresh the team data
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

  return (
    <div className="flex flex-1 flex-col h-full gap-4 p-2 lg:p-4 lg:gap-6">
      {hasTeam ? (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>{team.name}</CardTitle>
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
                      <TableHead className="whitespace-nowrap">Name</TableHead>
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
                          <Label className="text-sm">No players on team</Label>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  ) : (
                    <TableBody>
                      {team.players.map((player, index) => (
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
      ) : (
        <Card className="w-full">
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
      )}

      <Card className="w-full">
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

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Search Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Name</TableHead>
                  <TableHead className="whitespace-nowrap">Rating</TableHead>
                  <TableHead className="whitespace-nowrap">
                    PDGA Number
                  </TableHead>
                  <TableHead className="whitespace-nowrap">Class</TableHead>
                  <TableHead className="whitespace-nowrap">City</TableHead>
                  <TableHead className="whitespace-nowrap">State</TableHead>
                  <TableHead className="whitespace-nowrap">Country</TableHead>
                  <TableHead className="whitespace-nowrap">
                    Membership Status
                  </TableHead>
                  <TableHead className="whitespace-nowrap">Action</TableHead>
                </TableRow>
              </TableHeader>
              {results.length === 0 ? (
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={9} className="text-center pt-10">
                      {isSearching ? (
                        <Loader2 size="32" className="mx-auto animate-spin" />
                      ) : (
                        <Label className="text-sm">No results found</Label>
                      )}
                    </TableCell>
                  </TableRow>
                </TableBody>
              ) : (
                <TableBody>
                  {results.map((player, index) => (
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
                      <TableCell className="whitespace-nowrap">
                        {player.class}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {player.city}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {player.state}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {player.country}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {player.membershipStatus}
                      </TableCell>
                      <TableCell>
                        <Button
                          onClick={() => handleAddPlayer(player)}
                          disabled={isAdding}
                          className="whitespace-nowrap"
                        >
                          {isAdding ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Select"
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              )}
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RosterPage;
