"use client";

import { useState } from "react";
import { put } from "@vercel/blob";
import { Player } from "../interfaces/Player";
import { Team } from "../interfaces/Team";

const RosterPage = () => {
  const [teamName, setTeamName] = useState("");
  const [name, setName] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [roster, setRoster] = useState<any>({});

  const handleSearch = async () => {
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
  };

  const handleAddPlayer = (player: Player) => {
    setRoster([...roster, player]);
  };

  const handleSaveTeam = async () => {
    const teamData: Team = {
      name: teamName,
      players: roster,
    };
    await put(`${teamName}.json`, JSON.stringify(teamData), {
      access: "public",
      contentType: "application/json",
    });
    alert("Team saved successfully!");
  };

  return (
    <div>
      <h1>Create Team</h1>
      <input
        type="text"
        value={teamName}
        onChange={(e) => setTeamName(e.target.value)}
        placeholder="Enter team name"
      />
      <button onClick={handleSaveTeam}>Save Team</button>

      <h2>Player Search</h2>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter player's name"
      />
      <button onClick={handleSearch}>Search</button>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>PDGA Number</th>
            <th>Rating</th>
            <th>Class</th>
            <th>City</th>
            <th>State</th>
            <th>Country</th>
            <th>Membership Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {results.map((player, index) => (
            <tr key={index}>
              <td>{player.name}</td>
              <td>{player.pdgaNumber}</td>
              <td>{player.rating}</td>
              <td>{player.class}</td>
              <td>{player.city}</td>
              <td>{player.state}</td>
              <td>{player.country}</td>
              <td>{player.membershipStatus}</td>
              <td>
                <button onClick={() => handleAddPlayer(player)}>Select</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RosterPage;
