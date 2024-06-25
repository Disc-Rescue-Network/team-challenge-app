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
  const { teamDraft: team, selectedOpponentDraft: selectedOpponent } =
    useDraft();

  const [draftOrder, setDraftOrder] = useState<"ourTeam" | "theirTeam">(
    "ourTeam"
  );
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
        suggestPlayerToPutUp();
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
  }, [currentDraftTeam, draftBoard]);

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

    const totalPicks = draftBoard.ourTeam.length + draftBoard.theirTeam.length;

    // Determine the current round and pick within the round
    const currentRound = Math.floor(totalPicks / 2);
    const isOurTurn = totalPicks % 2 === 0;

    // Determine the next team to draft based on the round and current turn
    const nextDraftTeam =
      currentRound % 2 === 0
        ? isOurTurn
          ? "ourTeam"
          : "theirTeam"
        : isOurTurn
        ? "theirTeam"
        : "ourTeam";

    setCurrentDraftTeam(nextDraftTeam);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="grid grid-cols-1 gap-4 justify-between p-4">
        <Label>Starting Pick:</Label>
        <div className="flex flex-row gap-4 ">
          <Button
            variant={draftOrder === "ourTeam" ? "destructive" : "secondary"}
            onClick={() => handleToggleDraftOrder("ourTeam")}
          >
            {team?.name} Draft {draftOrder === "ourTeam" ? "First" : "Second"}
          </Button>
          <Button
            variant={draftOrder === "theirTeam" ? "destructive" : "secondary"}
            onClick={() => handleToggleDraftOrder("theirTeam")}
          >
            {selectedOpponent?.name} Draft{" "}
            {draftOrder === "theirTeam" ? "First" : "Second"}
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
