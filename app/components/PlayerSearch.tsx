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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";
import { Loader2, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { IState, State } from "country-state-city";
import { paginateArray, Pagination } from "./pagination";
import { Search } from "./search";

type InputVisibility = {
  lastName: boolean;
  pdgaNumber: boolean;
  city: boolean;
  state: boolean;
  country: boolean;
};

function PlayerSearch() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [pdgaNumber, setPdgaNumber] = useState("");
  const [city, setCity] = useState("");
  const [states, setStates] = useState<IState[]>([]);
  const [selectedState, setSelectedState] = useState("NJ");
  const [country] = useState("US");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputVisibility, setInputVisibility] = useState<InputVisibility>({
    lastName: true,
    pdgaNumber: true,
    city: true,
    state: true,
    country: true,
  });
  const [paginationConfig, setPaginationConfig] = useState({
    pageIndex: 0,
    perPage: "10",
    totalCount: 0,
  });

  useEffect(() => {
    const fetchedStates = State.getStatesOfCountry("US");
    setStates(fetchedStates);
  }, []);

  useEffect(() => {
    const fetchedStates = State.getStatesOfCountry("US");
    setStates(fetchedStates);
  }, []);

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

  const handlePagination = (pageIndex: number) => {
    setPaginationConfig((previous) => ({ ...previous, pageIndex }));
  };

  const paginatedResults = paginateArray(
    results,
    paginationConfig.pageIndex,
    paginationConfig.perPage
  );

  const handleSearch = async () => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          firstName,
          lastName,
          pdgaNumber,
          city,
          state: selectedState,
          country,
        }),
      });
      const data = await response.json();
      if (data.error) {
        toast({
          title: "Error",
          description: `${data.error}`,
          variant: "destructive",
          duration: 3000,
        });
      } else {
        setResults(data.players || []);
        setPaginationConfig((previous) => ({
          ...previous,
          totalCount: data.players.length,
        }));
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
    <div className="flex flex-1 flex-col p-3 lg:p-0 gap-8 max-w-[1300px]">
      <Search
        title="Player Search"
        onSearch={handleSearch}
        isLoading={isLoading}
        results={results}
        inputVisibility={inputVisibility}
        setInputVisibility={setInputVisibility}
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
