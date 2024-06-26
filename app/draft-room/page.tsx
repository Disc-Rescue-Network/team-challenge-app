"use client";

import { useEffect, useState } from "react";
import { Player } from "../interfaces/Player";
import { Team } from "../interfaces/Team";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDraft } from "../context/DraftContext";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

const DraftRoom = () => {
  const {
    teamDraft: team,
    selectedOpponentDraft: selectedOpponent,
    setTeamDraft: setTeam,
    setSelectedOpponentDraft: setSelectedOpponent,
  } = useDraft();

  const [draftOrder, setDraftOrder] = useState<"ourTeam" | "theirTeam">(
    "ourTeam"
  );
  const [draftOrderList, setDraftOrderList] = useState<
    ("ourTeam" | "theirTeam")[]
  >([]);
  const [draftBoard, setDraftBoard] = useState<{
    ourTeam: Player[];
    theirTeam: Player[];
  }>({ ourTeam: [], theirTeam: [] });
  const [round, setRound] = useState<number>(1);
  const [currentDraftTeam, setCurrentDraftTeam] = useState<
    "ourTeam" | "theirTeam"
  >(draftOrder);

  const [initialOurTeamLength, setInitialOurTeamLength] = useState(0);
  const [initialTheirTeamLength, setInitialTheirTeamLength] = useState(0);

  useEffect(() => {
    if (team && selectedOpponent) {
      setInitialOurTeamLength(team.players.length);
      setInitialTheirTeamLength(selectedOpponent.players.length);
    }
  }, [team, selectedOpponent]);

  const [suggestedPlayer, setSuggestedPlayer] = useState<Player | null>(null);

  const [ourAvailablePlayers, setOurAvailablePlayers] = useState<Player[]>(
    team?.players || []
  );
  const [theirAvailablePlayers, setTheirAvailablePlayers] = useState<Player[]>(
    selectedOpponent?.players || []
  );

  useEffect(() => {
    if (currentDraftTeam === "ourTeam") {
      if (
        draftOrder === "ourTeam" &&
        draftBoard.ourTeam.length === draftBoard.theirTeam.length
      ) {
        // Our turn and we are going first in the round
        console.log("Our turn and we are going first in the round");
        suggestPlayerToPutUp();
        console.log("Suggested player", suggestedPlayer);
      } else if (
        draftOrder === "ourTeam" &&
        draftBoard.ourTeam.length < draftBoard.theirTeam.length
      ) {
        // Our turn and we are going second in the round
        suggestBestMatchupForTheirTeam();
      } else if (
        draftOrder === "theirTeam" &&
        draftBoard.ourTeam.length < draftBoard.theirTeam.length
      ) {
        // Our turn and we are going second in the round
        suggestBestMatchupForTheirTeam();
      } else if (
        draftOrder === "theirTeam" &&
        draftBoard.ourTeam.length === draftBoard.theirTeam.length
      ) {
        // Our turn and we are going first in the round
        suggestPlayerToPutUp();
      }
    } else {
      setSuggestedPlayer(null);
    }
  }, [currentDraftTeam, draftBoard, draftOrder, suggestedPlayer]);

  const suggestPlayerToPutUp = () => {
    // Suggest the best player to put up logic...
    const sortedPlayers = [...ourAvailablePlayers].sort(
      (a, b) => a.rating - b.rating
    );
    setSuggestedPlayer(sortedPlayers[0]);
  };

  const suggestBestMatchupForTheirTeam = () => {
    if (!theirAvailablePlayers.length || !draftBoard.theirTeam.length) return;

    // Get the last drafted player from their team
    const lastDraftedTheirPlayer =
      draftBoard.theirTeam[draftBoard.theirTeam.length - 1];

    // Find the player in our available players with the closest rating to the last drafted player from their team
    let bestMatch = ourAvailablePlayers[0];
    let smallestDifference = Math.abs(
      lastDraftedTheirPlayer.rating - bestMatch.rating
    );

    ourAvailablePlayers.forEach((player) => {
      const difference = Math.abs(
        lastDraftedTheirPlayer.rating - player.rating
      );
      if (difference < smallestDifference) {
        bestMatch = player;
        smallestDifference = difference;
      }
    });

    setSuggestedPlayer(bestMatch);
  };

  useEffect(() => {
    const savedDraftContext = localStorage.getItem("draftContext");
    if (savedDraftContext) {
      const {
        team,
        selectedOpponent,
        draftOrder,
        draftBoard,
        currentDraftTeam,
        ourAvailablePlayers,
        theirAvailablePlayers,
        round,
      } = JSON.parse(savedDraftContext);

      setDraftOrder(draftOrder);
      setDraftBoard(draftBoard);
      setCurrentDraftTeam(currentDraftTeam);
      setOurAvailablePlayers(ourAvailablePlayers);
      setTheirAvailablePlayers(theirAvailablePlayers);
      setRound(round);

      setTeam(team);
      setSelectedOpponent(selectedOpponent);
    }
  }, []);

  useEffect(() => {
    if (team && selectedOpponent) {
      localStorage.setItem(
        "draftContext",
        JSON.stringify({
          team,
          selectedOpponent,
          draftOrder,
          draftBoard,
          currentDraftTeam,
          ourAvailablePlayers,
          theirAvailablePlayers,
          round,
        })
      );
    }
  }, [
    team,
    selectedOpponent,
    draftOrder,
    draftBoard,
    currentDraftTeam,
    ourAvailablePlayers,
    theirAvailablePlayers,
    round,
  ]);

  const handleToggleDraftOrder = (order: "ourTeam" | "theirTeam") => {
    setDraftOrder(order);
    setCurrentDraftTeam(order); // Set the initial draft team
  };

  const handleDraftPlayer = (player: Player, team: "ourTeam" | "theirTeam") => {
    console.log("Drafting player", player, "for", team);
    if (team === "ourTeam") {
      console.log("Drafting player for our team");
      setOurAvailablePlayers(
        ourAvailablePlayers.filter((p) => p.pdgaNumber !== player.pdgaNumber)
      );
      console.log("Our available players", ourAvailablePlayers);
      draftBoard.ourTeam.push(player);
      console.log("Our team", draftBoard.ourTeam);
    } else {
      console.log("Drafting player for their team");
      setTheirAvailablePlayers(
        theirAvailablePlayers.filter((p) => p.pdgaNumber !== player.pdgaNumber)
      );
      console.log("Their available players", theirAvailablePlayers);
      draftBoard.theirTeam.push(player);
      console.log("Their team", draftBoard.theirTeam);
    }

    // Remove the player from the suggestedPlayer state if they are drafted
    if (player === suggestedPlayer) {
      setSuggestedPlayer(null);
    }

    const totalPicks = draftBoard.ourTeam.length + draftBoard.theirTeam.length;

    const nextDraftTeam: "ourTeam" | "theirTeam" = draftOrderList[totalPicks];
    setCurrentDraftTeam(nextDraftTeam);
  };

  const generateDraftOrder = (
    firstPick: "ourTeam" | "theirTeam",
    totalRounds: number
  ): ("ourTeam" | "theirTeam")[] => {
    const draftOrder: ("ourTeam" | "theirTeam")[] = [];
    for (let round = 0; round < totalRounds; round++) {
      if (round % 2 === 0) {
        draftOrder.push(
          ...((firstPick === "ourTeam"
            ? ["ourTeam", "theirTeam"]
            : ["theirTeam", "ourTeam"]) as ("ourTeam" | "theirTeam")[])
        );
      } else {
        draftOrder.push(
          ...((firstPick === "ourTeam"
            ? ["theirTeam", "ourTeam"]
            : ["ourTeam", "theirTeam"]) as ("ourTeam" | "theirTeam")[])
        );
      }
    }
    return draftOrder;
  };

  useEffect(() => {
    if (team && selectedOpponent) {
      setInitialOurTeamLength(team.players.length);
      setInitialTheirTeamLength(selectedOpponent.players.length);
      const totalRounds = Math.ceil(
        (team.players.length + selectedOpponent.players.length) / 2
      );
      const generatedDraftOrder = generateDraftOrder(draftOrder, totalRounds);
      console.log("Generated draft order", generatedDraftOrder);
      setDraftOrderList(generatedDraftOrder);
    }
  }, [team, selectedOpponent, draftOrder]);

  const resetDraft = () => {
    localStorage.removeItem("draftContext");
    setDraftOrder("ourTeam");
    setDraftBoard({ ourTeam: [], theirTeam: [] });
    setRound(1);
    setCurrentDraftTeam("ourTeam");
    setSuggestedPlayer(null);
    setOurAvailablePlayers(team?.players || []);
    setTheirAvailablePlayers(selectedOpponent?.players || []);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="grid grid-cols-1 gap-4 justify-between p-4">
        <Label>Starting Pick:</Label>
        <div className="flex flex-row gap-4 ">
          <Button
            variant={draftOrder === "ourTeam" ? "outline" : "secondary"}
            onClick={() => handleToggleDraftOrder("ourTeam")}
            disabled={draftBoard.ourTeam.length > 0}
          >
            {team?.name} Draft {draftOrder === "ourTeam" ? "First" : "Second"}
          </Button>
          <Button
            variant={draftOrder === "theirTeam" ? "outline" : "secondary"}
            onClick={() => handleToggleDraftOrder("theirTeam")}
            disabled={draftBoard.ourTeam.length > 0}
          >
            {selectedOpponent?.name} Draft{" "}
            {draftOrder === "theirTeam" ? "First" : "Second"}
          </Button>
          <Button variant="destructive" onClick={resetDraft}>
            Reset Draft
          </Button>
        </div>
      </div>
      <div className="flex flex-1">
        <div className="flex-1 flex flex-col p-4 gap-4">
          <Label className="text-xl text-center font-bold">Draft Board</Label>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  {team?.name}{" "}
                  {currentDraftTeam === "ourTeam" && (
                    <span className="blinking-dot ml-2"></span>
                  )}
                </TableHead>
                <TableHead>
                  {selectedOpponent?.name}
                  {currentDraftTeam === "theirTeam" && (
                    <span className="blinking-dot ml-2"></span>
                  )}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({
                length: Math.max(initialOurTeamLength, initialTheirTeamLength),
              }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {currentDraftTeam === "ourTeam" &&
                    index === draftBoard.ourTeam.length ? (
                      <Skeleton className="w-[100px] h-[20px] rounded-full" />
                    ) : (
                      draftBoard.ourTeam[index]?.name || ""
                    )}
                  </TableCell>
                  <TableCell>
                    {currentDraftTeam === "theirTeam" &&
                    index === draftBoard.theirTeam.length ? (
                      <Skeleton className="w-[100px] h-[20px] rounded-full" />
                    ) : (
                      draftBoard.theirTeam[index]?.name || ""
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      <div className="flex justify-between p-4">
        <div className="flex-1">
          <h3 className="text-center font-bold">Our Available Players</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                ...(suggestedPlayer ? [suggestedPlayer] : []),
                ...ourAvailablePlayers
                  .filter((player) => player !== suggestedPlayer)
                  .sort((a, b) => b.rating - a.rating),
              ].map((player) => (
                <TableRow
                  key={player.pdgaNumber}
                  className={
                    player === suggestedPlayer ? "blinking-border" : ""
                  }
                >
                  <TableCell>{player.name}</TableCell>
                  <TableCell>{player.rating}</TableCell>
                  <TableCell>
                    <Button
                      onClick={() => handleDraftPlayer(player, "ourTeam")}
                      disabled={currentDraftTeam !== "ourTeam"}
                    >
                      Draft
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex-1">
          <h3 className="text-center font-bold">Their Available Players</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {theirAvailablePlayers
                .sort((a, b) => b.rating - a.rating)
                .map((player) => (
                  <TableRow key={player.pdgaNumber}>
                    <TableCell>{player.name}</TableCell>
                    <TableCell>{player.rating}</TableCell>
                    <TableCell>
                      <Button
                        onClick={() => handleDraftPlayer(player, "theirTeam")}
                        disabled={currentDraftTeam === "ourTeam"}
                      >
                        Draft
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default DraftRoom;
