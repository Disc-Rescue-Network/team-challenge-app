"use client";

import {Button} from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
<<<<<<< HEAD
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";
import { Loader2,ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import {IState, State} from "country-state-city";
import { Pagination } from "./pagination";

type InputVisibility = {
  //firstName: boolean;
=======
import {toast} from "@/components/ui/use-toast";
import {ChevronDown, Loader2} from "lucide-react";
import {useEffect, useState} from "react";
import {IState, State} from "country-state-city";
import React from "react";

type InputVisibility = {
  firstName: boolean;
>>>>>>> origin/DRN-1241
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
<<<<<<< HEAD

  const [isMobile, setIsMobile] = useState(false);
  const [inputVisibility, setInputVisibility] = useState<InputVisibility>(
    {
      //firstName: true, -- at least first name is required
=======
  const [inputVisibility, setInputVisibility] = React.useState<InputVisibility>(
    {
      firstName: true,
>>>>>>> origin/DRN-1241
      lastName: true,
      pdgaNumber: true,
      city: true,
      state: true,
      country: true,
    }
  );
<<<<<<< HEAD
  const [paginationConfig, setPaginationConfig] = useState({
    pageIndex: 0,
    perPage: "10",
    totalCount: 0,
  });

  useEffect(() => {
    const fetchedStates = State.getStatesOfCountry("US");
    setStates(fetchedStates);
  }, []);
=======
>>>>>>> origin/DRN-1241

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
 

  const  handlePagination = (pageIndex: number)=> {
    setPaginationConfig((previous) => ({ ...previous, pageIndex }));
  }

  const paginatedResults = paginateArray(results, paginationConfig.pageIndex, paginationConfig.perPage);

  const handleSearch = async () => {
    //TODO: remove this on production
    // const firstName = "Chris", lastName = "Johnson", pdgaNumber = "123456", city = "Chicago", state = "IL", country = "United States"
    // setResults(generateMockData());
    // setPaginationConfig(previous => ({ ...previous, totalCount: 30 }));
    // return;
    //---
    console.log("--->",firstName, lastName, pdgaNumber, city, selectedState, country);
    try {
      setIsLoading(true);
<<<<<<< HEAD
      
=======
>>>>>>> origin/DRN-1241
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
<<<<<<< HEAD
        body: JSON.stringify({ firstName, lastName,pdgaNumber, city, state:selectedState, country}),
=======
        body: JSON.stringify({
          firstName,
          lastName,
          pdgaNumber,
          city,
          state: selectedState,
          country,
        }),
>>>>>>> origin/DRN-1241
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
    <div className="flex flex-1 flex-col p-3 lg:p-0 gap-8 max-w-[1300px]">
<<<<<<< HEAD
       <Card>
=======
      <Card>
>>>>>>> origin/DRN-1241
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Player Search</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {isMobile ? (
                <Button variant="outline" className="pt-0">
                  ...
                </Button>
              ) : (
                <Button variant="outline" className="ml-auto">
                  Fields <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {Object.keys(inputVisibility).map((key) => {
                const typedKey = key as keyof InputVisibility;
                return (
                  <DropdownMenuCheckboxItem
                    key={key}
                    className="capitalize"
                    checked={inputVisibility[typedKey]}
                    onCheckedChange={(value) =>
                      setInputVisibility((prev) => ({
                        ...prev,
                        [typedKey]: value,
                      }))
                    }
                  >
                    {key}
                  </DropdownMenuCheckboxItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
<<<<<<< HEAD
            {/* {inputVisibility.firstName && ( */}
=======
            {inputVisibility.firstName && (
>>>>>>> origin/DRN-1241
              <div className="w-full">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter first name"
                />
              </div>
<<<<<<< HEAD
            {/* )} */}
=======
            )}
>>>>>>> origin/DRN-1241
            {inputVisibility.lastName && (
              <div className="w-full">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter last name"
                />
              </div>
            )}
            {inputVisibility.pdgaNumber && (
              <div className="w-full">
                <Label htmlFor="pdgaNumber">PDGA Number</Label>
                <Input
                  id="pdgaNumber"
                  type="text"
                  value={pdgaNumber}
                  onChange={(e) => setPdgaNumber(e.target.value)}
                  placeholder="Enter PDGA number"
                />
              </div>
            )}
            {inputVisibility.city && (
              <div className="w-full">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Enter city"
                />
              </div>
            )}
            {inputVisibility.state && (
              <div className="w-full">
                <Label htmlFor="state">State</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Input
                      id="state"
                      type="text"
                      value={selectedState}
                      placeholder="Select or type state"
                      onChange={(e) => setSelectedState(e.target.value)}
                    />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[190px] min-h-[150px] max-h-[300px] overflow-y-auto">
                    {states.map((s: IState) => (
                      <DropdownMenuItem
                        key={s.isoCode}
                        onClick={() => setSelectedState(s.isoCode)}
                      >
                        {s.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
            {inputVisibility.country && (
              <div className="w-full">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  type="text"
                  value={country}
                  readOnly
                  placeholder="US"
                />
              </div>
            )}
          </div>
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
