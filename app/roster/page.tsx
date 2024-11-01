"use client";

import { useEffect, useState } from "react";
// -- types
import { Team } from "../interfaces/Team";
// -- shadcn
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// --custom components
import AddPlayerToTeam from "../components/add-player-to-team";
import TeamManagementContent from "../components/team-management";

const RosterPage = () => {
  const [team, setTeam] = useState<Team>({ name: "", players: [] });
  const [newTeam, setNewTeam] = useState<Team>({ name: "", players: [] });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("team");

  useEffect(() => {
    const keepAlive = async () => {
      console.log("Pinging API to keep it alive");
      try {
        await fetch("https://tags-api.discrescuenetwork.com");
        console.log("API pinged successfully");
      } catch (error) {
        console.error("Error keeping API alive:", error);
      }
    };

    // Ping the API immediately on load
    keepAlive();

    // Set interval to ping the API every 14 minutes
    const interval = setInterval(keepAlive, 14 * 60 * 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const handleSaveTeam = async () => {
    try {
      setIsLoading(true);
      const teamData: Team = {
        name: newTeam.name,
        players: [],
      };
      console.log("teamData", teamData);
      const response = await fetch("/api/saveTeam", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ teamData }),
      });

      if (response.status === 200) {
        toast({
          title: "Success",
          description: `Team ${teamData.name} saved successfully. Next, click on "Add Player" to add players to your team.🥏`,
          variant: "default",
          duration: 5000,
        });
        setNewTeam({ name: "", players: [] });
        setActiveTab("addPlayer");
      }

      if (response.status === 400) {
        const errorMessage = await response.json();
        toast({
          title: "Error",
          description: errorMessage.error,
          variant: "destructive",
          duration: 3000,
        });
      }

      //fetchTeamData(); // Refresh the team data
      setIsLoading(false);
    } catch (error) {
      console.error(`Error saving team: ${error}`);
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Failed to save team",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleEditTeam = () => {
    alert("not yet built");
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
    <div className="flex h-full flex-1 flex-col gap-4 p-2 lg:gap-6 lg:p-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-90 m-auto mb-[10px] grid max-w-[400px] grid-cols-3 justify-center">
          <TabsTrigger value="team">Manage Team</TabsTrigger>
          <TabsTrigger value="createTeam">Create Team</TabsTrigger>
          <TabsTrigger value="addPlayer">Add Player</TabsTrigger>
        </TabsList>

        <TabsContent value="team" className="mb-4">
          <TeamManagementContent activeTab={activeTab} />
        </TabsContent>

        <TabsContent value="createTeam">
          <Card className="mb-4 w-full">
            <CardHeader>
              <CardTitle>Create Team</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="text"
                value={newTeam.name}
                onChange={(e) => setNewTeam({ ...team, name: e.target.value })}
                placeholder="Enter team name"
              />
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button onClick={handleSaveTeam}>Save Team</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="addPlayer">
          <AddPlayerToTeam />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RosterPage;
