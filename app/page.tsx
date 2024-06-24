"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { useState } from "react";

const SearchPage = () => {
  const [name, setName] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    try {
      setIsLoading(true);
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
      setIsLoading(false);
    } catch (error) {
      console.error(`Error fetching data: ${error}`);
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 p-4">
      <div className="flex flex-col gap-4 w-fit min-w-[300px] lg:min-w-[500px]">
        <Label className="text-lg">Player Search</Label>
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter player's name"
        />
        <Button onClick={handleSearch}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <Label>Please wait</Label>
            </>
          ) : (
            "Search"
          )}
        </Button>
      </div>
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SearchPage;
