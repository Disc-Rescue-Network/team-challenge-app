"use client";

import {useState, useEffect} from "react";
import {Button} from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {toast} from "@/components/ui/use-toast";
import {Loader2, ChevronDown} from "lucide-react";
import {IState, State} from "country-state-city";

type InputVisibility = {
  lastName: boolean;
  pdgaNumber: boolean;
  city: boolean;
  state: boolean;
  country: boolean;
};

interface SearchProps {
  title: string;
  onSearch: (searchParams: any) => Promise<void>;
  isLoading: boolean;
  results: any[];
  inputVisibility: InputVisibility;
  setInputVisibility: React.Dispatch<React.SetStateAction<InputVisibility>>;
}

export const Search = ({
  title,
  onSearch,
  isLoading,
  results,
  inputVisibility,
  setInputVisibility,
}: SearchProps) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [pdgaNumber, setPdgaNumber] = useState("");
  const [city, setCity] = useState("");
  const [states, setStates] = useState<IState[]>([]);
  const [selectedState, setSelectedState] = useState("NJ");
  const [country] = useState("US");

  useEffect(() => {
    const fetchedStates = State.getStatesOfCountry("US");
    setStates(fetchedStates);
  }, []);

  const handleSearch = async () => {
    const searchParams = {
      firstName,
      lastName,
      pdgaNumber,
      city,
      state: selectedState,
      country,
    };
    await onSearch(searchParams);
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
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
  );
};
