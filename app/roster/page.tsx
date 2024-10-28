"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { twMerge } from "tailwind-merge";
import { motion, AnimatePresence } from "framer-motion";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import {
  Check,
  ChevronDown,
  Edit2,
  Loader2,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import { GiFrisbee } from "react-icons/gi";
// --custom components
import { paginateArray, Pagination } from "../components/pagination";
import TeamBadgeStatus from "../components/team-badge-status";

// --utils
import { getMyCookie, hasMyCookie, setMyCookie } from "../utils/manage-cookies";
import AddPlayerToTeam from "../components/add-player-to-team";

type ShowToolTip = {
  removePlayer: boolean;
  editPlayerRating: boolean;
  recalculatePlayerRating: boolean;
};

type TooltipContent = {
  editPlayerRating: string;
  recalculatePlayerRating: string;
  removePlayer: string;
};
const RosterPage = () => {
  const [team, setTeam] = useState<Team>({ name: "", players: [] });
  const [newTeam, setNewTeam] = useState<Team>({ name: "", players: [] });
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [myTeam, setMyTeam] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("team");
  const [teamNames, setTeamNames] = useState<string[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [actionInProgress, setActionInProgress] = useState<string>("");
  const [paginationConfig, setPaginationConfig] = useState({
    pageIndex: 0,
    perPage: "8",
    totalCount: 0,
  });
  // -- edit player rating
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingRating, setEditingRating] = useState<string>("");
  // -- when the user clicks on the
  const [selectedPlayers, setSelectedPlayers] = useState<
    Record<string, boolean>
  >({});

  const [tooltipContent, setTooltipContent] = useState<TooltipContent>({
    editPlayerRating: "Update Rating",
    recalculatePlayerRating: "Recalculate player rating",
    removePlayer: "Remove player from team",
  });

  const inputRef = useRef<HTMLInputElement>(null);

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
      setActionInProgress("remove");
      setSelectedPlayers((previous) => ({
        ...previous,
        [player.pdgaNumber]: true,
      }));
      setTooltipContent((previous) => ({
        ...previous,
        removePlayer: "Removing player from team...",
      }));

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

      const data = await response.json();

      if (response.status === 200) {
        setActionInProgress("removed");
        // Update tooltip to show removal confirmation
        setTooltipContent((previous) => ({
          ...previous,
          removePlayer: `Player ${player.name} removed from ${data.team.name}`,
        }));

        // Wait 3 seconds before updating the table
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Update team and pagination
        setTeam(data.team);
        setPaginationConfig((previous) => ({
          ...previous,
          totalCount: data.team.players.length,
        }));
      }

      if (response.status === 400) {
        toast({
          title: "Error - Player",
          description: data.message,
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error removing player:", error);
      toast({
        title: "Error",
        description: "Failed to remove player from your team",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setTooltipContent((previous) => ({
        ...previous,
        removePlayer: "Remove Player from team",
      }));
      setActionInProgress("");
      setSelectedPlayers((previous) => ({
        ...previous,
        [player.pdgaNumber]: false,
      }));
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

  const handleCancelEditRating = (selectedPlayer: Player) => {
    setEditingId(null);
    setEditingRating("");

    setSelectedPlayers((previous) => ({
      ...previous,
      [selectedPlayer.pdgaNumber]: false,
    }));
  };
  // -- it's passing the current rating as a parameter so we can populate the input field with the current rating to be eidted
  const handleEditRating = (
    playerRowIndex: number,
    currentRating: number,
    selectedPlayer: Player
  ) => {
    setEditingId(playerRowIndex);
    setEditingRating(currentRating.toString());

    // --set the player's rating to be edited
    setSelectedPlayers((previous) => ({
      ...previous,
      [selectedPlayer.pdgaNumber]: true,
    }));
    // Schedule focus for the next render cycle
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleSaveNewRating = async (selectedPlayer: Player) => {
    // --Check if the rating is a number and is greater or equal than 0
    if (isNaN(parseInt(editingRating)) || parseInt(editingRating) < 0) {
      toast({
        title: "Error",
        description: "Rating must be a number greater than 0",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    try {
      setTooltipContent((previous) => ({
        ...previous,
        editPlayerRating: "Updating player rating...",
      }));
      // setIsTooltipOpen(true);

      const updatedPlayersRating = team.players.map((player) =>
        player.pdgaNumber === selectedPlayer.pdgaNumber &&
        player.name === selectedPlayer.name
          ? { ...player, rating: parseInt(editingRating) }
          : player
      );

      setTeam((previous) => ({ ...previous, players: updatedPlayersRating }));

      setActionInProgress("updating");

      const response = await fetch("/api/updatePlayerRating", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          player: selectedPlayer,
          teamName: selectedTeam,
          newPlayerRating: editingRating,
        }),
      });

      const data = await response.json();

      if (response.status === 200) {
        setSelectedPlayers((previous) => ({
          ...previous,
          [selectedPlayer.pdgaNumber]: false,
        }));
        setTooltipContent((previous) => ({
          ...previous,
          editPlayerRating: `Player ${selectedPlayer.name} rating updated to ${editingRating}`,
        }));

        // setIsTooltipOpen(true);
      }

      if (response.status === 400) {
        toast({
          title: "Error - Player",
          description: data.message,
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: "Error - Player",
        description: "Failed to update player rating",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      // Delay the execution of these setState calls by 3 seconds
      setTimeout(() => {
        setTooltipContent((previous) => ({
          ...previous,
          editPlayerRating: "Update Player Rating",
        }));
        //setIsTooltipOpen(false);
        setEditingId(null);
        setActionInProgress("");
      }, 3000);
    }
  };

  const handleRecalculatePlayerRating = async (selectedPlayer: Player) => {
    try {
      const [firstName, lastName] = selectedPlayer.name.split(" ");

      setActionInProgress("recalculate");
      setSelectedPlayers((previous) => ({
        ...previous,
        [selectedPlayer.pdgaNumber]: true,
      }));
      setTooltipContent((previous) => ({
        ...previous,
        recalculatePlayerRating: "Recalculating player rating...",
      }));

      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          firstName,
          lastName,
          pdgaNumber: selectedPlayer.pdgaNumber,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Error",
          description: "Failed to retrieve player data",
          variant: "destructive",
          duration: 3000,
        });

        return;
      }
      console.log("datadata🚩", data);

      const player = data.players[0];
      console.log("Plyer", player);

      // -- check if the player has the same rating
      if (player.rating === selectedPlayer.rating) {
        setActionInProgress("recalculated");
        // Update tooltip to show removal confirmation
        setTooltipContent((previous) => ({
          ...previous,
          recalculatePlayerRating:
            "Nothing to update. The rating is up to date",
        }));
        // Wait 3 seconds before updating the table
        await new Promise((resolve) => setTimeout(resolve, 3000));

        return;
      }

      const updateRatingResponse = await fetch("/api/updatePlayerRating", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          player: selectedPlayer,
          teamName: selectedTeam,
          newPlayerRating: player.rating,
        }),
      });

      const updateRatingData = await updateRatingResponse.json();

      if (updateRatingResponse.status === 200) {
        setActionInProgress("recalculated");
        // Update tooltip to show removal confirmation
        setTooltipContent((previous) => ({
          ...previous,
          recalculatePlayerRating: `Rating updated to ${player.rating}`,
        }));
        // Wait 3 seconds before updating the table
        await new Promise((resolve) => setTimeout(resolve, 3000));
        console.log("Player rating updated");
        selectedPlayer.rating = player.rating;
        // -- updating the team state
        setTeam((previous) => ({
          ...previous,
          players: team.players.map((player) =>
            player.pdgaNumber === selectedPlayer.pdgaNumber
              ? { ...player, rating: selectedPlayer.rating }
              : player
          ),
        }));
      }

      if (updateRatingResponse.status === 500) {
        toast({
          title: "Error",
          description: updateRatingData.message,
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update player rating",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setTooltipContent((previous) => ({
        ...previous,
        recalculatePlayerRating: "Recalculate player rating",
      }));
      setActionInProgress("");
      setSelectedPlayers((previous) => ({
        ...previous,
        [selectedPlayer.pdgaNumber]: false,
      }));
    }
  };
  return (
    <div className="flex h-full flex-1 flex-col gap-4 p-2 lg:gap-6 lg:p-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-90 m-auto mb-[10px] grid max-w-[400px] grid-cols-3 justify-center">
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
                  <Button variant="outline" className="!mt-0 gap-1 px-2">
                    {selectedTeam || "Select a team"}{" "}
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
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <Label>Please wait</Label>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <TooltipProvider>
                    {paginatedResults.length > 0 && (
                      <Table className="w-full table-fixed">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="whitespace-nowrap">
                              Name
                            </TableHead>
                            <TableHead className="w-[150px] whitespace-nowrap">
                              <div className="flex items-center">
                                Rating
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={() => {}}
                                    >
                                      <RefreshCw className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Recalculate all players ratings</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </TableHead>
                            <TableHead className="whitespace-nowrap">
                              PDGA Number
                            </TableHead>
                            <TableCell className="whitespace-nowrap">
                              Class
                            </TableCell>
                            <TableHead className="whitespace-nowrap">
                              Membership Status
                            </TableHead>
                            <TableHead className="whitespace-nowrapw-[120px]">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedResults.map((player, index) => (
                            <TableRow key={index}>
                              <TableCell className="whitespace-nowrap">
                                {player.name}
                              </TableCell>
                              <TableCell className="w-[150px] whitespace-nowrap">
                                <AnimatePresence mode="wait">
                                  {editingId === index ? (
                                    <motion.div
                                      key="editing"
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      exit={{ opacity: 0 }}
                                      transition={{ exit: { delay: 0.8 } }}
                                      className="flex items-center space-x-2"
                                    >
                                      <Input
                                        ref={inputRef}
                                        type="number"
                                        min="0"
                                        value={editingRating}
                                        onChange={(e) =>
                                          setEditingRating(e.target.value)
                                        }
                                        className={cn("w-16", "no-spinner")}
                                      />
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() =>
                                              handleCancelEditRating(player)
                                            }
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
                                            handleSaveNewRating(player)
                                          }
                                          disabled={
                                            actionInProgress === "edit" &&
                                            selectedPlayers[player.pdgaNumber]
                                          }
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
                                            selectedPlayers[
                                              player.pdgaNumber
                                            ] && (
                                              <Loader2 className="h-4 w-4 animate-spin" />
                                            )}{" "}
                                          {tooltipContent.editPlayerRating}
                                        </div>
                                      </div>
                                    </motion.div>
                                  ) : (
                                    <motion.div
                                      key="display"
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      exit={{ opacity: 0 }}
                                      transition={{ exit: { delay: 0.1 } }}
                                    >
                                      {player.rating}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
                                {player.pdgaNumber}
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
                                {player.class}
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
                                {player.membershipStatus}
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() =>
                                          handleEditRating(
                                            index,
                                            player.rating,
                                            player
                                          )
                                        }
                                        disabled={
                                          player.pdgaNumber > 0 &&
                                          player.membershipStatus === "Current"
                                        }
                                      >
                                        <Edit2 className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Edit player rating</p>
                                    </TooltipContent>
                                  </Tooltip>

                                  <div className="group relative">
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={() => handleRemovePlayer(player)}
                                      disabled={
                                        actionInProgress === "remove" &&
                                        selectedPlayers[player.pdgaNumber]
                                      }
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                    <div
                                      className={twMerge(
                                        "pointer-events-none absolute bottom-full left-1/2 z-10 mb-2",
                                        "-translate-x-1/2 transform whitespace-nowrap rounded border border-gray-300 bg-white p-2",
                                        "flex items-center gap-2 text-gray-800 transition-opacity duration-200 group-hover:opacity-100",
                                        // Add opacity-100 when condition is true, opacity-0 otherwise
                                        `${
                                          (actionInProgress === "remove" ||
                                            actionInProgress === "removed") &&
                                          selectedPlayers[player.pdgaNumber]
                                            ? "opacity-100"
                                            : "opacity-0"
                                        }`
                                      )}
                                    >
                                      {actionInProgress === "remove" &&
                                        selectedPlayers[player.pdgaNumber] && (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        )}{" "}
                                      {tooltipContent.removePlayer}
                                    </div>
                                  </div>
                                  <div className="group relative">
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={() =>
                                        handleRecalculatePlayerRating(player)
                                      }
                                      disabled={
                                        actionInProgress === "remove" &&
                                        selectedPlayers[player.pdgaNumber]
                                      }
                                    >
                                      <RefreshCw className="h-4 w-4" />
                                    </Button>
                                    <div
                                      className={twMerge(
                                        "pointer-events-none absolute bottom-full left-1/2 z-10 mb-2",
                                        "-translate-x-1/2 transform whitespace-nowrap rounded border border-gray-300 bg-white p-2",
                                        "flex items-center gap-2 text-gray-800 transition-opacity duration-200 group-hover:opacity-100",
                                        // Add opacity-100 when condition is true, opacity-0 otherwise
                                        `${
                                          (actionInProgress === "recalculate" ||
                                            actionInProgress ===
                                              "recalculated") &&
                                          selectedPlayers[player.pdgaNumber]
                                            ? "opacity-100"
                                            : "opacity-0"
                                        }`
                                      )}
                                    >
                                      {actionInProgress === "recalculate" &&
                                        selectedPlayers[player.pdgaNumber] && (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        )}{" "}
                                      {tooltipContent.recalculatePlayerRating}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </TooltipProvider>
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
          <Card className="mb-4 w-full">
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
