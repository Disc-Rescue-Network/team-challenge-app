"use client";

import { useEffect, useState } from "react";
// --shadcn
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// --icons
import { Loader2 } from "lucide-react";
// --custom components
import { paginateArray, Pagination } from "./pagination";
import { SearchCard } from "./search";
// --interfaces
import { Player } from "../interfaces/Player";

export type PlayerSearchResult = Omit<Player, "tempRating" | "rating">;

function PlayerSearch() {
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [paginationConfig, setPaginationConfig] = useState({
    pageIndex: 0,
    perPage: "10",
    totalCount: 0,
  });
  // -- set the player search results and set the pagination config with the total count of results
  const handleResults = (results: PlayerSearchResult[]) => {
    setResults(results);
    setPaginationConfig((previous) => ({
      ...previous,
      totalCount: results.length,
    }));
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
    <div className="flex flex-1 flex-col p-3 lg:p-0 gap-8 max-w-[1300px]">
      <SearchCard
        title="Player Search"
        onResults={handleResults}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />
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
        label="Total Players"
      />
    </div>
  );
}

export default PlayerSearch;
