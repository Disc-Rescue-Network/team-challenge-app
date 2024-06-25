"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { useEffect, useState } from "react";

function PlayerSearch() {
  const [name, setName] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
    <div className="flex flex-1 flex-col p-3 lg:p-4 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Player Search</CardTitle>
          {/* <CardDescription>blah blah</CardDescription> */}
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
            {isLoading ? (
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
      <Card>
        <CardHeader>
          <CardTitle>Search Results</CardTitle>
        </CardHeader>
        <CardContent>
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
            {results.length === 0 ? (
              <TableBody>
                <TableRow>
                  <TableCell
                    colSpan={isMobile ? 4 : 8}
                    className="text-center pt-10"
                  >
                    {isLoading ? (
                      <Loader2 size="32" />
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
            )}
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default PlayerSearch;
