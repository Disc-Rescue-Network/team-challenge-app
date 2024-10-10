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
import { Pagination } from "./pagination";

function PlayerSearch() {
  const [name, setName] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [isMobile, setIsMobile] = useState(false);
  const [paginationConfig, setPaginationConfig] = useState({
    pageIndex: 0,
    perPage: "10",
    totalCount: 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1080);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
 

  const  handlePagination = (pageIndex: number)=> {
    setPaginationConfig((previous) => ({ ...previous, pageIndex }));
  }

  const paginatedResults = paginateArray(results, paginationConfig.pageIndex, paginationConfig.perPage);

  const handleSearch = async () => {
    //TODO: remove this on production
    const firstName = "Chris", lastName = "Johnson", pdgaNumber = "123456", city = "Chicago", state = "IL", country = "United States"
    setResults(generateMockData());
    setPaginationConfig(previous => ({ ...previous, totalCount: 30 }));
    return;
    //---
    try {
      setIsLoading(true);
      
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ firstName, lastName,pdgaNumber, city, state, country}),
      });
      const data = await response.json();
      if (data.error) {
        toast({
          title: "Error",
          description: `${data.error}`,
          variant: "destructive",
          duration: 3000,
        });

      }else{
        setResults(data.players || []);
        setPaginationConfig(previous => ({ ...previous, totalCount: data.players.length }));
      }

    } catch (error) {
      console.error(`Error fetching data: ${error}`);
      setResults([]);
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
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
          {isLoading ? (
            <div className="flex justify-center items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <Label>Please wait</Label>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Name</TableHead>
                    <TableHead className="whitespace-nowrap">
                      PDGA Number
                    </TableHead>
                    <TableHead className="whitespace-nowrap">Rating</TableHead>
                    <TableHead className="whitespace-nowrap">Class</TableHead>
                    <TableHead className="whitespace-nowrap">City</TableHead>
                    <TableHead className="whitespace-nowrap">State</TableHead>
                    <TableHead className="whitespace-nowrap">Country</TableHead>
                    <TableHead className="whitespace-nowrap">
                      Membership Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                {results && results.length === 0 ? (
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={8} className="text-center pt-10">
                        <Label className="text-sm">No results found</Label>
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
                          {player.pdgaNumber}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {player.rating}
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
                      </TableRow>
                    ))}
                  </TableBody>
                )}
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      <Pagination
                onPageChange={handlePagination}
                perPage={parseInt(paginationConfig.perPage)}
                pageIndex={paginationConfig.pageIndex!}
                totalCount={paginationConfig.totalCount}
              />
    </div>
  );
}
// -- to paginate the results array with the players
function paginateArray<T>(
  array: T[],
  pageIndex: number,
  perPage: string | number
): T[] {
  const itemsPerPage =
    typeof perPage === "string" ? parseInt(perPage) : perPage;
  const startIndex = pageIndex * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return array.slice(startIndex, endIndex);
}

//TODO: remove this on production
function generateMockData() {
  const mockData = [];
  for (let i = 0; i < 30; i++) {
    mockData.push({
      name: "Chris Deck",
      pdgaNumber: 188489 + i,
      rating: Math.floor(Math.random() * (1000 - 800) + 800),
      class: Math.random() > 0.5 ? "Am" : "Pro",
      city: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"][Math.floor(Math.random() * 5)],
      state: ["New York", "California", "Illinois", "Texas", "Arizona"][Math.floor(Math.random() * 5)],
      country: "United States",
      membershipStatus: Math.random() > 0.3 ? "Current (through 31-Dec-2024)" : "Expired"
    });
  }
  return mockData;
}
export default PlayerSearch;
