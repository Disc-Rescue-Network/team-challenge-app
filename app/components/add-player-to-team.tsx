"use client";
import { useState, useEffect, useCallback } from "react";
// --shadcn
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import {
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Player } from "../interfaces/Player";
import GenderSwitch from "./genderSwitch";
import { Team } from "../interfaces/Team";
import { SearchCard } from "./search";
import { PlayerSearchResult } from "./PlayerSearch";
import { paginateArray, Pagination } from "./pagination";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AddPlayerToTeam = () => {
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedGender, setSelectedGender] = useState("male");
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  // const [team, setTeam] = useState<Team>({ name: "", players: [] });
  const [teamNames, setTeamNames] = useState<string[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);

  const [paginationConfig, setPaginationConfig] = useState({
    pageIndex: 0,
    perPage: "5",
    totalCount: 0,
  });

  const fetchAllTeams = useCallback(async () => {
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

      if (response.status === 400) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error all teams:", error);
    }
    //setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchAllTeams();
  }, [fetchAllTeams]);

  const handleConfirmAddPlayer = async () => {
    if (selectedPlayer && selectedTeam) {
      setIsAdding(true);
      console.log("Results", results);
      try {
        const response = await fetch("/api/addPlayerToTeam", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            player: selectedPlayer,
            teamName: selectedTeam,
            gender: selectedGender,
          }),
        });
        const data = await response.json();
        if (data.status === 400) {
          toast({
            title: "Error - Player",
            description: data.message,
            variant: "destructive",
            duration: 3000,
          });
        }

        const updatedSearchResult = results.filter(
          (player) => player.name !== selectedPlayer.name
        );
        console.log("Updated search result", updatedSearchResult);
        setResults(updatedSearchResult);
        setPaginationConfig((previous) => ({
          ...previous,
          totalCount: updatedSearchResult.length,
        }));

        toast({
          title: "Player added 🚩",
          description: `Player ${selectedPlayer.name} added to team ${selectedTeam}`,
          variant: "default",
          duration: 3000,
        });
      } catch (error) {
        console.error("Error adding player:", error);
        toast({
          title: "Error",
          description: "Failed to add player to team",
          variant: "destructive",
          duration: 3000,
        });
      } finally {
        setIsAdding(false);
        setIsDialogOpen(false);
      }
    } else {
      toast({
        title: "Selection required",
        description: "Please select a player and a team before adding.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // -- set the player search results and set the pagination config with the total count of results
  const handleResults = (results: PlayerSearchResult[]) => {
    setResults(results);
    setPaginationConfig((previous) => ({
      ...previous,
      totalCount: results.length,
    }));
  };
  // -- Pagination -- set the page index
  const handlePagination = (pageIndex: number) => {
    setPaginationConfig((previous) => ({ ...previous, pageIndex }));
  };

  // -- Pagination -- set paginated results
  const paginatedResults = paginateArray(
    results,
    paginationConfig.pageIndex,
    paginationConfig.perPage
  );
  return (
    <>
      <SearchCard
        title="Player Search"
        onResults={handleResults}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />

      <Card className="mb-4 mt-4 w-full">
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
                    <TableCell colSpan={9} className="pt-10 text-center">
                      {isLoading ? (
                        <Loader2 size="32" className="mx-auto animate-spin" />
                      ) : (
                        <Label className="text-sm">No results found</Label>
                      )}
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
                          onClick={() => {
                            setSelectedPlayer(player);
                            setIsDialogOpen(true);
                          }}
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
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="w-[90%] rounded-lg md:w-[100%] lg:w-[100%]">
                <DialogHeader className="text-start">
                  <DialogTitle>Add Player to Team</DialogTitle>
                  <DialogDescription className="!mt-1">
                    Select gender and team for {selectedPlayer?.name}
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="mb-0 flex items-center gap-4 pt-2 md:mb-2 lg:mb-2">
                    <Label>Gender</Label>
                    <GenderSwitch
                      selectedGender={selectedGender}
                      onGenderChange={setSelectedGender}
                    />
                  </div>

                  <div className="mb-2 flex flex-row items-center gap-4 md:mb-0 lg:mb-0">
                    <Label>Team</Label>
                    <Select
                      value={selectedTeam}
                      onValueChange={setSelectedTeam}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select a team" />
                      </SelectTrigger>
                      <SelectContent>
                        {teamNames.map((team) => (
                          <SelectItem value={team}>{team}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter>
                  <Button onClick={handleConfirmAddPlayer}>
                    {isAdding ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Confirm"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
      <Pagination
        onPageChange={handlePagination}
        perPage={parseInt(paginationConfig.perPage)}
        pageIndex={paginationConfig.pageIndex!}
        totalCount={paginationConfig.totalCount}
        label="Total Players"
      />
    </>
  );
};
function extractTeamNames(
  teams: Array<{ name: string; players: Player[] }>
): string[] {
  return teams.map((team) => team.name);
}
export default AddPlayerToTeam;
