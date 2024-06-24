"use client";

import { useState } from "react";
import { put } from "@vercel/blob";
import { Player } from "../interfaces/Player";
import { Team } from "../interfaces/Team";
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

const MatchupPage = () => {
  const [teamName, setTeamName] = useState("");
  const [opponentName, setOpponentName] = useState("");
  const [name, setName] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [team, setTeam] = useState<any>({});
  const [opponent, setOpponent] = useState<any>({});

  const handleSearch = async () => {
    const [firstName, lastName] = name.split(" ");
    const response = await fetch("/api/search/route", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ firstName, lastName: lastName || "" }),
    });
    const data = await response.json();
    setResults(data.players);
  };

  const handleAddPlayer = (player: Player, isOpponent: boolean) => {
    if (isOpponent) {
      setOpponent({ ...opponent, [player.pdgaNumber]: player });
    } else {
      setTeam({ ...team, [player.pdgaNumber]: player });
    }
  };

  const handleSaveTeams = async () => {
    const teamData: Team = { name: teamName, players: team };
    const opponentData: Team = { name: opponentName, players: opponent };

    await put(`${teamName}.json`, JSON.stringify(teamData), {
      access: "public",
      contentType: "application/json",
    });

    await put(`${opponentName}.json`, JSON.stringify(opponentData), {
      access: "public",
      contentType: "application/json",
    });

    alert("Teams saved successfully!");
  };

  const sortedTeamPlayers: Player[] = team.sort(
    (a: { rating: number }, b: { rating: number }) => b.rating - a.rating
  );
  const sortedOpponentPlayers: Player[] = opponent.sort(
    (a: { rating: number }, b: { rating: number }) => b.rating - a.rating
  );

  return (
    <div>
      <h1>Matchup</h1>
      <div>
        <Input
          type="text"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          placeholder="Enter your team name"
        />
        <Input
          type="text"
          value={opponentName}
          onChange={(e) => setOpponentName(e.target.value)}
          placeholder="Enter opponent team name"
        />
        <Button onClick={handleSaveTeams}>Save Teams</Button>
      </div>

      <h2>Player Search</h2>
      <Input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter player's name"
      />
      <Button onClick={handleSearch}>Search</Button>
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
              <TableCell>
                <Button onClick={() => handleAddPlayer(player, false)}>
                  Add to Team
                </Button>
                <Button onClick={() => handleAddPlayer(player, true)}>
                  Add to Opponent
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <h2>Matchup View</h2>
      <div>
        <h3>{teamName}</h3>
        <ul>
          {sortedTeamPlayers.map((player) => (
            <li key={player.pdgaNumber}>
              {player.name} - {player.rating}
            </li>
          ))}
        </ul>
        <h3>{opponentName}</h3>
        <ul>
          {sortedOpponentPlayers.map((player) => (
            <li key={player.pdgaNumber}>
              {player.name} - {player.rating}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MatchupPage;
