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

        if (!response.ok) {
          throw new Error("Failed to add player");
        }

        const data = await response.json();
        const updatedSearchResult = results.filter(
          (player) => player.name !== selectedPlayer
        );
        setResults(updatedSearchResult);
        toast({
          title: "Player added",
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

      <Card className="w-full mt-4 mb-4">
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
              <DialogContent className="w-[90%] md:w-[100%] lg:w-[100%] rounded-lg">
                <DialogHeader className="text-start">
                  <DialogTitle>Add Player to Team</DialogTitle>
                  <DialogDescription className="!mt-1">
                    Select gender and team for {selectedPlayer?.name}
                  </DialogDescription>
                </DialogHeader>

                <div className="flex gap-4 mb-0 md:mb-2 lg:mb-2 pt-2 items-center">
                  <Label>Gender</Label>
                  <GenderSwitch
                    selectedGender={selectedGender}
                    onGenderChange={setSelectedGender}
                  />
                </div>

                <div className="flex flex-row gap-2 items-center mb-2 md:mb-0 lg:mb-0">
                  <Label>Team</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        {selectedTeam ? selectedTeam : "Select a team"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="custom-dropdown-content overflow-y-auto max-h-[250px]">
                      {teamNames.map((team) => (
                        <DropdownMenuItem
                          key={team}
                          onSelect={() => setSelectedTeam(team)}
                          className="w-full py-2 px-4 hover:bg-gray-100 pl-7"
                        >
                          {team}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
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
