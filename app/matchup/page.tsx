"use client";

import { useMediaQuery } from "react-responsive";
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
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronDown, Loader2, Pencil, Save } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Team } from "../interfaces/Team";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { useDraft } from "../context/DraftContext";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Player } from "../interfaces/Player";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getMyCookie } from "../utils/manage-cookies";

const MatchupPage = () => {
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const router = useRouter();
  const { setTeamDraft, setSelectedOpponentDraft } = useDraft();

  const [hasTeam, setHasTeam] = useState<boolean>(false);
  const [team, setTeam] = useState<Team>({ name: "", players: [] });

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
    // fetchTeamData();
    fetchOpponentTeams();
  }, []);

  useEffect(() => {
    //-- get myTeam from cookie
    const myTeam = getMyCookie("myTeam");
    if (myTeam) {
      fetchTeamData(myTeam);
    }
  }, []);

  const fetchTeamData = async (teamName: string) => {
    setIsLoading(true);
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
      console.log("Team data:", data);
      if (data.name !== "") {
        setTeam(data);
        setHasTeam(true);
      }
    } catch (error) {
      console.error("Error fetching team data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch team data",
        variant: "destructive",
        duration: 3000,
      });
    }
    setIsLoading(false);
  };

  const fetchOpponentTeams = async () => {
    //TODO- get team from cookie
    const myTeam = "Team one";
    //---
    console.log("passed myTeam", myTeam);
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

      if (response.status === 200) setOpponents(data);

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
    if (!response.ok) {
      toast({
        title: "Error",
        description: "No results found. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
      setIsSearching(false);
      return;
    }
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
      setManualPlayer({
        name: "",
        pdgaNumber: 0,
        rating: 0,
        class: "",
        city: "",
        state: "",
        country: "",
        membershipStatus: "",
        active: true,
        isEditing: false,
        tempRating: 0,
        gender: "male",
      });
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

  const saveTeam = async (teamData: Team, isMyTeam: boolean) => {
    try {
      const response = await fetch("/api/saveTeam", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ teamData, isMyTeam }),
      });

      if (!response.ok) {
        throw new Error("Failed to save team");
      }

      // toast({
      //   title: "Success",
      //   description: "Team saved successfully",
      //   variant: "default",
      //   duration: 3000,
      // });
    } catch (error) {
      console.error("Error saving team:", error);
      toast({
        title: "Error",
        description: "Failed to save team",
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

  // const handleSelectOpponent = (opponent: Team) => {
  //   setSelectedOpponent(opponent);
  // };

  const handleSelectOpponent = (opponent: string) => {
    setSelectedOpponent(
      opponents.find((team) => team.name === opponent) || null
    );
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

  const handleEditRating = (player: Player, isMyTeam: boolean) => {
    if (isMyTeam) {
      const newTeam = { ...team };
      newTeam.players = newTeam.players.map((p) =>
        p.pdgaNumber === player.pdgaNumber
          ? { ...p, isEditing: true, tempRating: p.rating }
          : p
      );
      setTeam(newTeam);
    } else {
      if (!selectedOpponent) return;

      const newOpponent = { ...selectedOpponent };
      newOpponent.players = newOpponent.players.map((p) =>
        p.pdgaNumber === player.pdgaNumber
          ? { ...p, isEditing: true, tempRating: p.rating }
          : p
      );
      setSelectedOpponent(newOpponent);
    }
  };

  const handleRatingChange = (
    player: Player,
    newRating: string,
    isMyTeam: boolean
  ) => {
    if (isMyTeam) {
      const updatedTeam = { ...team };
      updatedTeam.players = updatedTeam.players.map((p) =>
        p.pdgaNumber === player.pdgaNumber
          ? { ...p, tempRating: parseInt(newRating, 10) }
          : p
      );
      setTeam(updatedTeam);
    } else {
      if (!selectedOpponent) return;

      const updatedOpponent = { ...selectedOpponent };
      updatedOpponent.players = updatedOpponent.players.map((p) =>
        p.pdgaNumber === player.pdgaNumber
          ? { ...p, tempRating: parseInt(newRating, 10) }
          : p
      );
      setSelectedOpponent(updatedOpponent);
    }
  };

  const handleSaveRating = async (player: Player, isMyTeam: boolean) => {
    setIsLoading(true);

    try {
      if (isMyTeam) {
        const updatedTeam = { ...team };
        updatedTeam.players = updatedTeam.players.map((p) =>
          p.pdgaNumber === player.pdgaNumber
            ? { ...p, rating: p.tempRating, isEditing: false }
            : p
        );
        setTeam(updatedTeam);

        const response = await fetch("/api/saveTeam", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ teamData: updatedTeam, isMyTeam: true }),
        });

        if (!response.ok) {
          throw new Error("Failed to save player rating");
        }

        toast({
          title: "Success",
          description: "Player rating saved successfully",
          variant: "default",
          duration: 3000,
        });
      } else {
        if (!selectedOpponent) return;

        const updatedOpponent = { ...selectedOpponent };
        updatedOpponent.players = updatedOpponent.players.map((p) =>
          p.pdgaNumber === player.pdgaNumber
            ? { ...p, rating: p.tempRating, isEditing: false }
            : p
        );
        setSelectedOpponent(updatedOpponent);

        const response = await fetch("/api/saveTeam", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ teamData: updatedOpponent, isMyTeam: false }),
        });

        if (!response.ok) {
          throw new Error("Failed to save opponent player rating");
        }

        toast({
          title: "Success",
          description: "Opponent player rating saved successfully",
          variant: "default",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error saving player rating:", error);
      toast({
        title: "Error",
        description: "Failed to save player rating",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const [sortedTeamPlayers, setSortedTeamPlayers] = useState<Player[]>([]);
  const [sortedOpponentPlayers, setSortedOpponentPlayers] = useState<Player[]>(
    []
  );

  // Initial sorting by rating DESC on first load
  useEffect(() => {
    console.log("Team:", team);
    if (team?.players) {
      const sortedTeam = [...team.players].sort((a, b) => b.rating - a.rating);
      setSortedTeamPlayers(sortedTeam);
    }

    if (selectedOpponent?.players) {
      const sortedOpponent = [...selectedOpponent.players].sort(
        (a, b) => b.rating - a.rating
      );
      setSortedOpponentPlayers(sortedOpponent);
    }
  }, [team, selectedOpponent]);

  // Handle player selection to swap their positions
  const handlePlayerSelect = (
    selectedPdgaNumber: number,
    isOpponent: boolean,
    currentIndex: number
  ) => {
    if (isOpponent) {
      const selectedPlayerIndex = sortedOpponentPlayers.findIndex(
        (p) => p.pdgaNumber === selectedPdgaNumber
      );
      if (selectedPlayerIndex === -1) return;

      const updatedOpponentPlayers = [...sortedOpponentPlayers];

      // Swap positions of the selected player and the current player
      [
        updatedOpponentPlayers[currentIndex],
        updatedOpponentPlayers[selectedPlayerIndex],
      ] = [
        updatedOpponentPlayers[selectedPlayerIndex],
        updatedOpponentPlayers[currentIndex],
      ];

      setSortedOpponentPlayers(updatedOpponentPlayers);
    } else {
      const selectedPlayerIndex = sortedTeamPlayers.findIndex(
        (p) => p.pdgaNumber === selectedPdgaNumber
      );
      if (selectedPlayerIndex === -1) return;

      const updatedTeamPlayers = [...sortedTeamPlayers];

      // Swap positions of the selected player and the current player
      [
        updatedTeamPlayers[currentIndex],
        updatedTeamPlayers[selectedPlayerIndex],
      ] = [
        updatedTeamPlayers[selectedPlayerIndex],
        updatedTeamPlayers[currentIndex],
      ];

      setSortedTeamPlayers(updatedTeamPlayers);
    }
  };

  // Render matchups table rows
  const renderMatchups = () => {
    // Filter out inactive players before rendering
    const activeTeamPlayers = sortedTeamPlayers.filter(
      (player) => player.active
    );
    const activeOpponentPlayers = sortedOpponentPlayers.filter(
      (player) => player.active
    );

    const maxRows = Math.max(
      activeTeamPlayers.length,
      activeOpponentPlayers.length
    );

    return Array.from({ length: maxRows }).map((_, index) => {
      const player = activeTeamPlayers[index] || {};
      const opponentPlayer = activeOpponentPlayers[index] || {};

      return (
        <TableRow key={index}>
          <TableCell>
            {" "}
            <Button onClick={() => handleTogglePlayer(player, "myTeam")}>
              Bench
            </Button>
          </TableCell>

          <TableCell>
            <Select
              value={player.pdgaNumber?.toString() || ""}
              onValueChange={(value) =>
                handlePlayerSelect(Number(value), false, index)
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={player.name || "Select Player"} />
              </SelectTrigger>
              <SelectContent>
                {activeTeamPlayers.map((teamPlayer) => (
                  <SelectItem
                    key={teamPlayer.pdgaNumber}
                    value={teamPlayer.pdgaNumber.toString()}
                  >
                    {teamPlayer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </TableCell>
          {/* <TableCell className="min-w-[100px]">
            <Input
              type="number"
              value={player.rating || ""}
              onChange={(e) =>
                handleRatingChange(player, e.target.value, false)
              }
            />
          </TableCell> */}
          <TableCell className="min-w-[100px]">
            {player.isEditing ? (
              <div className="flex flex-row gap-2">
                <Input
                  type="number"
                  value={player.tempRating ?? player.rating ?? ""}
                  onChange={(e) =>
                    handleRatingChange(player, e.target.value, true)
                  }
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="max-w-[200px]"
                  onClick={() => handleSaveRating(player, true)}
                >
                  <Save size={16} />
                </Button>
              </div>
            ) : (
              <>
                <span>{player.rating || 0}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="max-w-[200px]"
                  onClick={() => handleEditRating(player, true)}
                >
                  <Pencil size={16} />
                </Button>
              </>
            )}
          </TableCell>
          <TableCell>vs.</TableCell>
          {/* <TableCell className="min-w-[100px]">
            <Input
              type="number"
              value={opponentPlayer.rating || ""}
              onChange={(e) =>
                handleRatingChange(opponentPlayer, e.target.value, true)
              }
            />
          </TableCell> */}
          <TableCell className="min-w-[100px]">
            {opponentPlayer.isEditing ? (
              <div className="flex flex-row gap-2">
                <Input
                  type="number"
                  value={
                    opponentPlayer.tempRating ?? opponentPlayer.rating ?? ""
                  }
                  onChange={(e) =>
                    handleRatingChange(opponentPlayer, e.target.value, false)
                  }
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="max-w-[200px]"
                  onClick={() => handleSaveRating(opponentPlayer, false)}
                >
                  <Save size={16} />
                </Button>
              </div>
            ) : (
              <>
                <span>{opponentPlayer.rating || 0}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="max-w-[200px]"
                  onClick={() => handleEditRating(opponentPlayer, false)}
                >
                  <Pencil size={16} />
                </Button>
              </>
            )}
          </TableCell>
          <TableCell>
            <Select
              value={opponentPlayer.pdgaNumber?.toString() || ""}
              onValueChange={(value) =>
                handlePlayerSelect(Number(value), true, index)
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue
                  placeholder={opponentPlayer.name || "Select Opponent"}
                />
              </SelectTrigger>
              <SelectContent>
                {activeOpponentPlayers.map((opponentPlayer) => (
                  <SelectItem
                    key={opponentPlayer.pdgaNumber}
                    value={opponentPlayer.pdgaNumber.toString()}
                  >
                    {opponentPlayer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </TableCell>
          <TableCell className="flex flex-col gap-4">
            {opponentPlayer && (
              <Button
                onClick={() =>
                  handleTogglePlayer(opponentPlayer, "opponentTeam")
                }
                variant="destructive"
              >
                Bench
              </Button>
            )}
          </TableCell>
        </TableRow>
      );
    });
  };

  const renderInactivePlayers = () => {
    const inactivePlayers = sortedTeamPlayers.filter(
      (player) => !player.active
    );
    const inactiveOpponentPlayers = sortedOpponentPlayers.filter(
      (player) => !player.active
    );

    const maxRows = Math.max(
      inactivePlayers.length,
      inactiveOpponentPlayers.length
    );

    if (inactivePlayers.length === 0 && inactiveOpponentPlayers.length === 0) {
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Player</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={2} className="pt-10 text-center">
                <Label className="text-sm">No inactive players</Label>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
    }

    if (isMobile) {
      return (
        <div className="flex flex-col">
          {/* My Team Inactive Players */}
          <div className="flex flex-col">
            <h3 className="text-center font-bold">My Team</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Player</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inactivePlayers.map((player, index) => (
                  <TableRow key={index}>
                    <TableCell>{player.name || "N/A"}</TableCell>
                    <TableCell>
                      {player.name && (
                        <Button
                          className="max-w-[200px]"
                          onClick={() => handleTogglePlayerStatus(player, true)}
                        >
                          Activate {player.name}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Opponent Team Inactive Players */}
          <div className="mt-4 flex flex-col">
            <h3 className="text-center font-bold">Opponent Team</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Player</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inactiveOpponentPlayers.map((player, index) => (
                  <TableRow key={index}>
                    <TableCell>{player.name || "N/A"}</TableCell>
                    <TableCell>
                      {player.name && (
                        <Button
                          className="max-w-[200px]"
                          onClick={() =>
                            handleTogglePlayerStatus(player, false)
                          }
                        >
                          Activate {player.name}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      );
    }

    // Non-mobile view for inactive players
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>My Team</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Opponent Team</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: maxRows }).map((_, index) => {
            const player = inactivePlayers[index] || {};
            const opponentPlayer = inactiveOpponentPlayers[index] || {};
            return (
              <TableRow key={index}>
                <TableCell>{player.name || "N/A"}</TableCell>
                <TableCell>
                  {player.name && (
                    <Button
                      className="max-w-[200px]"
                      onClick={() => handleTogglePlayerStatus(player, true)}
                    >
                      Activate {player.name}
                    </Button>
                  )}
                </TableCell>
                <TableCell>{opponentPlayer.name || "N/A"}</TableCell>
                <TableCell>
                  {opponentPlayer.name && (
                    <Button
                      className="max-w-[200px]"
                      onClick={() =>
                        handleTogglePlayerStatus(opponentPlayer, false)
                      }
                    >
                      Activate {opponentPlayer.name}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  };

  const handleTogglePlayerStatus = async (
    player: Player,
    isMyTeam: boolean
  ) => {
    if (isMyTeam) {
      const updatedTeam = {
        ...team,
        players: team.players.map((p) =>
          p.pdgaNumber === player.pdgaNumber ? { ...p, active: true } : p
        ),
      };
      setTeam(updatedTeam);
      await saveTeam(updatedTeam, true);
    } else {
      if (!selectedOpponent) return;
      const updatedOpponent = {
        ...selectedOpponent,
        players: selectedOpponent.players.map((p) =>
          p.pdgaNumber === player.pdgaNumber ? { ...p, active: true } : p
        ),
      };
      setSelectedOpponent(updatedOpponent);
      await saveTeam(updatedOpponent, false);
    }
  };

  // Toggle player status between active and inactive
  const handleTogglePlayer = (
    player: Player,
    teamType: "myTeam" | "opponentTeam"
  ) => {
    if (teamType === "myTeam") {
      const updatedTeamPlayers = sortedTeamPlayers.map((p) =>
        p.pdgaNumber === player.pdgaNumber ? { ...p, active: !p.active } : p
      );
      setSortedTeamPlayers(updatedTeamPlayers);
      saveTeam({ ...team, players: updatedTeamPlayers }, true);
    } else {
      const updatedOpponentPlayers = sortedOpponentPlayers.map((p) =>
        p.pdgaNumber === player.pdgaNumber ? { ...p, active: !p.active } : p
      );
      setSortedOpponentPlayers(updatedOpponentPlayers);
      saveTeam(
        {
          ...selectedOpponent,
          players: updatedOpponentPlayers,
          name: selectedOpponent?.name || "",
        },
        false
      );
    }
  };

  const goToDraftRoom = () => {
    if (team && selectedOpponent) {
      setTeamDraft({
        ...team,
        players: team.players.filter((player) => player.active),
      });
      // only active players
      if (selectedOpponent) {
        setSelectedOpponentDraft({
          ...selectedOpponent,
          players: selectedOpponent.players.filter((player) => player.active),
          name: selectedOpponent.name || "",
        });
      }
      router.push("/draft-room");
    } else {
      console.error(
        "Both team and selectedOpponent must be set before going to the draft room."
      );
      toast({
        title: "Error",
        description: "Please select a team and opponent to proceed",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

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

  const [manual, setManual] = useState(false);
  const [manualPlayer, setManualPlayer] = useState<Player>({
    name: "",
    pdgaNumber: 0,
    rating: 0,
    class: "",
    city: "",
    state: "",
    country: "",
    membershipStatus: "",
    active: true,
    isEditing: false,
    tempRating: 0,
    gender: "male",
  });

  // Function to calculate the average rating of a team
  const calculateTeamAvg = (team: Team) => {
    if (!team || !team.players || team.players.length === 0) {
      console.log("No players in team");
      return 0;
    }

    const validPlayers = team.players.filter((player) => player.rating > 0);

    if (validPlayers.length === 0) {
      console.log("No valid players in team");
      return 0;
    }

    const totalRating = validPlayers.reduce(
      (sum, player) => sum + player.rating,
      0
    );

    return Math.round(totalRating / validPlayers.length);
  };

  // Function to calculate the average rating difference (Teebird perspective)
  const calculateDifference = (team: Team, opponentTeam: Team) => {
    const teamAvg = calculateTeamAvg(team);
    const opponentAvg = calculateTeamAvg(opponentTeam);
    return teamAvg - opponentAvg;
  };

  return (
    <div className="flex h-3/5 flex-1 flex-col gap-6 p-2 lg:gap-6 lg:p-4">
      <Card className="">
        <CardHeader className="grid grid-cols-1 gap-4">
          <CardTitle>
            <div className="flex flex-row items-center justify-start gap-4">
              <Label className="text-lg font-bold">Matchup vs. </Label>
              <Select
                value={selectedOpponent?.name || ""}
                onValueChange={handleSelectOpponent}
              >
                <SelectTrigger className="w-[280px]">
                  <SelectValue placeholder="Select an opponent" />
                </SelectTrigger>
                <SelectContent>
                  {opponents.map((opponent, index) => (
                    <SelectItem key={index} value={opponent.name}>
                      {opponent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardTitle>

          {team && selectedOpponent && (
            <div className="grid grid-cols-3 gap-4 rounded-lg bg-muted p-4">
              <div className="text-center">
                <div className="mb-1 text-sm font-medium text-muted-foreground">
                  Teebird Average
                </div>
                <div className="text-2xl font-bold">
                  {calculateTeamAvg(team)}
                </div>
              </div>
              <div className="text-center">
                <div className="mb-1 text-sm font-medium text-muted-foreground">
                  Opponent Average
                </div>
                <div className="text-2xl font-bold">
                  {calculateTeamAvg(selectedOpponent)}
                </div>
              </div>
              <div className="text-center">
                <div className="mb-1 text-sm font-medium text-muted-foreground">
                  Difference
                </div>
                <div
                  className={`text-2xl font-bold ${
                    calculateDifference(team, selectedOpponent) >= 0
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {calculateDifference(team, selectedOpponent) > 0 ? "+" : ""}
                  {calculateDifference(team, selectedOpponent)}
                </div>
              </div>
            </div>
          )}

          {selectedOpponent && (
            <CardDescription>
              <Button variant="secondary" onClick={goToDraftRoom}>
                Enter Draft Room
              </Button>
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-8">
          {!team && (
            <Label>
              Please create your team in &quot;roster builder&quot;, set it as
              your team and then come back to this page.
            </Label>
          )}
          {team && selectedOpponent && (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Actions</TableHead>
                    <TableHead>Teebird</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>-</TableHead>
                    <TableHead>Opp. Rating</TableHead>
                    <TableHead>Opp. Player</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>{renderMatchups()}</TableBody>
              </Table>

              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Inactive Players</CardTitle>
                </CardHeader>
                <CardContent>{renderInactivePlayers()}</CardContent>
              </Card>
            </>
          )}
          {/* {!selectedOpponent && opponents.length > 0 && (
            <Card className="ml-0 border-none pl-0">
              <CardHeader className="ml-0 border-none pl-0">
                <CardTitle>Select Opponent Team</CardTitle>
              </CardHeader>
              <CardContent className="ml-0 border-none pl-0">
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
                        <TableCell className="min-w-fit">
                          {opponent.name}
                        </TableCell>
                        <TableCell className="flex max-w-[200px] flex-row gap-4">
                          <Button
                            onClick={() => handleSelectOpponent(opponent.name)}
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
          )} */}
        </CardContent>
      </Card>
    </div>
  );
};

export default MatchupPage;
