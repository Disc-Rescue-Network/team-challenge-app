// "use client";

// import { useEffect, useState } from "react";
// import { Player } from "../interfaces/Player";
// import { Team } from "../interfaces/Team";
// import { Button } from "@/components/ui/button";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { useDraft } from "../context/DraftContext";
// import { Label } from "@/components/ui/label";
// import { Skeleton } from "@/components/ui/skeleton";

// const DraftRoom = () => {
//   const {
//     teamDraft: team,
//     selectedOpponentDraft: selectedOpponent,
//     setTeamDraft: setTeam,
//     setSelectedOpponentDraft: setSelectedOpponent,
//   } = useDraft();

//   const [draftOrder, setDraftOrder] = useState<"ourTeam" | "theirTeam">(
//     "ourTeam"
//   );
//   const [draftOrderList, setDraftOrderList] = useState<
//     ("ourTeam" | "theirTeam")[]
//   >([]);
//   const [draftBoard, setDraftBoard] = useState<{
//     ourTeam: Player[];
//     theirTeam: Player[];
//   }>({ ourTeam: [], theirTeam: [] });
//   const [round, setRound] = useState<number>(1);
//   const [currentDraftTeam, setCurrentDraftTeam] = useState<
//     "ourTeam" | "theirTeam"
//   >(draftOrder);

//   const [initialOurTeamLength, setInitialOurTeamLength] = useState(0);
//   const [initialTheirTeamLength, setInitialTheirTeamLength] = useState(0);

//   useEffect(() => {
//     if (team && selectedOpponent) {
//       setInitialOurTeamLength(team.players.length);
//       setInitialTheirTeamLength(selectedOpponent.players.length);
//     }
//   }, [team, selectedOpponent]);

//   const [suggestedPlayer, setSuggestedPlayer] = useState<Player | null>(null);

//   const [ourAvailablePlayers, setOurAvailablePlayers] = useState<Player[]>(
//     team?.players || []
//   );
//   const [theirAvailablePlayers, setTheirAvailablePlayers] = useState<Player[]>(
//     selectedOpponent?.players || []
//   );

//   useEffect(() => {
//     if (currentDraftTeam === "ourTeam") {
//       if (
//         draftOrder === "ourTeam" &&
//         draftBoard.ourTeam.length === draftBoard.theirTeam.length
//       ) {
//         // Our turn and we are going first in the round
//         console.log("Our turn and we are going first in the round");
//         suggestPlayerToPutUp();
//         console.log("Suggested player", suggestedPlayer);
//       } else if (
//         draftOrder === "ourTeam" &&
//         draftBoard.ourTeam.length < draftBoard.theirTeam.length
//       ) {
//         // Our turn and we are going second in the round
//         suggestBestMatchupForTheirTeam();
//       } else if (
//         draftOrder === "theirTeam" &&
//         draftBoard.ourTeam.length < draftBoard.theirTeam.length
//       ) {
//         // Our turn and we are going second in the round
//         suggestBestMatchupForTheirTeam();
//       } else if (
//         draftOrder === "theirTeam" &&
//         draftBoard.ourTeam.length === draftBoard.theirTeam.length
//       ) {
//         // Our turn and we are going first in the round
//         suggestPlayerToPutUp();
//       }
//     } else {
//       setSuggestedPlayer(null);
//     }
//   }, [currentDraftTeam, draftBoard, draftOrder, suggestedPlayer]);

//   const suggestPlayerToPutUp = () => {
//     // Suggest the best player to put up logic...
//     const sortedPlayers = [...ourAvailablePlayers].sort(
//       (a, b) => a.rating - b.rating
//     );
//     setSuggestedPlayer(sortedPlayers[0]);
//   };

//   const suggestBestMatchupForTheirTeam = () => {
//     if (!theirAvailablePlayers.length || !draftBoard.theirTeam.length) return;

//     // Get the last drafted player from their team
//     const lastDraftedTheirPlayer =
//       draftBoard.theirTeam[draftBoard.theirTeam.length - 1];

//     // Find the player in our available players with the closest rating to the last drafted player from their team
//     let bestMatch = ourAvailablePlayers[0];
//     let smallestDifference = Math.abs(
//       lastDraftedTheirPlayer.rating - bestMatch.rating
//     );

//     ourAvailablePlayers.forEach((player) => {
//       const difference = Math.abs(
//         lastDraftedTheirPlayer.rating - player.rating
//       );
//       if (difference < smallestDifference) {
//         bestMatch = player;
//         smallestDifference = difference;
//       }
//     });

//     setSuggestedPlayer(bestMatch);
//   };

//   useEffect(() => {
//     const savedDraftContext = localStorage.getItem("draftContext");
//     if (savedDraftContext) {
//       const {
//         team,
//         selectedOpponent,
//         draftOrder,
//         draftBoard,
//         currentDraftTeam,
//         ourAvailablePlayers,
//         theirAvailablePlayers,
//         round,
//       } = JSON.parse(savedDraftContext);

//       setDraftOrder(draftOrder);
//       setDraftBoard(draftBoard);
//       setCurrentDraftTeam(currentDraftTeam);
//       setOurAvailablePlayers(ourAvailablePlayers);
//       setTheirAvailablePlayers(theirAvailablePlayers);
//       setRound(round);

//       setTeam(team);
//       setSelectedOpponent(selectedOpponent);
//     }
//   }, []);

//   useEffect(() => {
//     if (team && selectedOpponent) {
//       localStorage.setItem(
//         "draftContext",
//         JSON.stringify({
//           team,
//           selectedOpponent,
//           draftOrder,
//           draftBoard,
//           currentDraftTeam,
//           ourAvailablePlayers,
//           theirAvailablePlayers,
//           round,
//         })
//       );
//     }
//   }, [
//     team,
//     selectedOpponent,
//     draftOrder,
//     draftBoard,
//     currentDraftTeam,
//     ourAvailablePlayers,
//     theirAvailablePlayers,
//     round,
//   ]);

//   const handleToggleDraftOrder = (order: "ourTeam" | "theirTeam") => {
//     setDraftOrder(order);
//     setCurrentDraftTeam(order); // Set the initial draft team
//   };

//   const handleDraftPlayer = (player: Player, team: "ourTeam" | "theirTeam") => {
//     console.log("Drafting player", player, "for", team);
//     if (team === "ourTeam") {
//       console.log("Drafting player for our team");
//       setOurAvailablePlayers(
//         ourAvailablePlayers.filter((p) => p.pdgaNumber !== player.pdgaNumber)
//       );
//       console.log("Our available players", ourAvailablePlayers);
//       draftBoard.ourTeam.push(player);
//       console.log("Our team", draftBoard.ourTeam);
//     } else {
//       console.log("Drafting player for their team");
//       setTheirAvailablePlayers(
//         theirAvailablePlayers.filter((p) => p.pdgaNumber !== player.pdgaNumber)
//       );
//       console.log("Their available players", theirAvailablePlayers);
//       draftBoard.theirTeam.push(player);
//       console.log("Their team", draftBoard.theirTeam);
//     }

//     // Remove the player from the suggestedPlayer state if they are drafted
//     if (player === suggestedPlayer) {
//       setSuggestedPlayer(null);
//     }

//     const totalPicks = draftBoard.ourTeam.length + draftBoard.theirTeam.length;

//     const nextDraftTeam: "ourTeam" | "theirTeam" = draftOrderList[totalPicks];
//     setCurrentDraftTeam(nextDraftTeam);
//   };

//   const generateDraftOrder = (
//     firstPick: "ourTeam" | "theirTeam",
//     totalRounds: number
//   ): ("ourTeam" | "theirTeam")[] => {
//     const draftOrder: ("ourTeam" | "theirTeam")[] = [];
//     for (let round = 0; round < totalRounds; round++) {
//       if (round % 2 === 0) {
//         draftOrder.push(
//           ...((firstPick === "ourTeam"
//             ? ["ourTeam", "theirTeam"]
//             : ["theirTeam", "ourTeam"]) as ("ourTeam" | "theirTeam")[])
//         );
//       } else {
//         draftOrder.push(
//           ...((firstPick === "ourTeam"
//             ? ["theirTeam", "ourTeam"]
//             : ["ourTeam", "theirTeam"]) as ("ourTeam" | "theirTeam")[])
//         );
//       }
//     }
//     return draftOrder;
//   };

//   useEffect(() => {
//     if (team && selectedOpponent) {
//       setInitialOurTeamLength(team.players.length);
//       setInitialTheirTeamLength(selectedOpponent.players.length);
//       const totalRounds = Math.ceil(
//         (team.players.length + selectedOpponent.players.length) / 2
//       );
//       const generatedDraftOrder = generateDraftOrder(draftOrder, totalRounds);
//       console.log("Generated draft order", generatedDraftOrder);
//       setDraftOrderList(generatedDraftOrder);
//     }
//   }, [team, selectedOpponent, draftOrder]);

//   const resetDraft = () => {
//     localStorage.removeItem("draftContext");
//     setDraftOrder("ourTeam");
//     setDraftBoard({ ourTeam: [], theirTeam: [] });
//     setRound(1);
//     setCurrentDraftTeam("ourTeam");
//     setSuggestedPlayer(null);
//     setOurAvailablePlayers(team?.players || []);
//     setTheirAvailablePlayers(selectedOpponent?.players || []);
//   };

//   return (
//     <div className="flex flex-col h-full">
//       <div className="grid grid-cols-1 gap-4 justify-between p-4">
//         <Label>Starting Pick:</Label>
//         <div className="flex flex-col lg:flex-row gap-4 ">
//           <Button
//             variant={draftOrder === "ourTeam" ? "outline" : "secondary"}
//             onClick={() => handleToggleDraftOrder("ourTeam")}
//             disabled={draftBoard.ourTeam.length > 0}
//           >
//             {team?.name} Draft {draftOrder === "ourTeam" ? "First" : "Second"}
//           </Button>
//           <Button
//             variant={draftOrder === "theirTeam" ? "outline" : "secondary"}
//             onClick={() => handleToggleDraftOrder("theirTeam")}
//             disabled={draftBoard.ourTeam.length > 0}
//           >
//             {selectedOpponent?.name} Draft{" "}
//             {draftOrder === "theirTeam" ? "First" : "Second"}
//           </Button>
//           <Button variant="destructive" onClick={resetDraft}>
//             Reset Draft
//           </Button>
//         </div>
//       </div>
//       <div className="flex flex-1 flex-col lg:flex-row">
//         <div className="flex-1 flex flex-col p-4 gap-4">
//           <Label className="text-xl text-center font-bold">Draft Board</Label>
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>
//                   {team?.name}{" "}
//                   {currentDraftTeam === "ourTeam" && (
//                     <span className="blinking-dot ml-2"></span>
//                   )}
//                 </TableHead>
//                 <TableHead>
//                   {selectedOpponent?.name}
//                   {currentDraftTeam === "theirTeam" && (
//                     <span className="blinking-dot ml-2"></span>
//                   )}
//                 </TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {Array.from({
//                 length: Math.max(initialOurTeamLength, initialTheirTeamLength),
//               }).map((_, index) => (
//                 <TableRow key={index}>
//                   <TableCell>
//                     {currentDraftTeam === "ourTeam" &&
//                     index === draftBoard.ourTeam.length ? (
//                       <Skeleton className="w-[100px] h-[20px] rounded-full" />
//                     ) : (
//                       draftBoard.ourTeam[index]?.name || ""
//                     )}
//                   </TableCell>
//                   <TableCell>
//                     {currentDraftTeam === "theirTeam" &&
//                     index === draftBoard.theirTeam.length ? (
//                       <Skeleton className="w-[100px] h-[20px] rounded-full" />
//                     ) : (
//                       draftBoard.theirTeam[index]?.name || ""
//                     )}
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </div>
//       </div>
//       <div className="flex flex-col lg:flex-row justify-between p-4">
//         <div className="flex-1 mb-4 lg:mb-0 lg:mr-4">
//           <h3 className="text-center font-bold">Our Available Players</h3>
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>Name</TableHead>
//                 <TableHead>Rating</TableHead>
//                 <TableHead>Action</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {[
//                 ...(suggestedPlayer ? [suggestedPlayer] : []),
//                 ...ourAvailablePlayers
//                   .filter((player) => player !== suggestedPlayer)
//                   .sort((a, b) => b.rating - a.rating),
//               ].map((player) => (
//                 <TableRow
//                   key={player.pdgaNumber}
//                   className={
//                     player === suggestedPlayer ? "blinking-border" : ""
//                   }
//                 >
//                   <TableCell>{player.name}</TableCell>
//                   <TableCell>{player.rating}</TableCell>
//                   <TableCell>
//                     <Button
//                       onClick={() => handleDraftPlayer(player, "ourTeam")}
//                       disabled={currentDraftTeam !== "ourTeam"}
//                     >
//                       Draft
//                     </Button>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </div>
//         <div className="flex-1">
//           <h3 className="text-center font-bold">Their Available Players</h3>
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>Name</TableHead>
//                 <TableHead>Rating</TableHead>
//                 <TableHead>Action</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {theirAvailablePlayers
//                 .sort((a, b) => b.rating - a.rating)
//                 .map((player) => (
//                   <TableRow key={player.pdgaNumber}>
//                     <TableCell>{player.name}</TableCell>
//                     <TableCell>{player.rating}</TableCell>
//                     <TableCell>
//                       <Button
//                         onClick={() => handleDraftPlayer(player, "theirTeam")}
//                         disabled={currentDraftTeam === "ourTeam"}
//                       >
//                         Draft
//                       </Button>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//             </TableBody>
//           </Table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DraftRoom;

"use client";

import { useEffect, useState } from "react";
import { Player } from "../interfaces/Player";
import { Team } from "../interfaces/Team";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDraft } from "../context/DraftContext";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DraftRoom() {
  const {
    teamDraft: team,
    selectedOpponentDraft: selectedOpponent,
    setTeamDraft: setTeam,
    setSelectedOpponentDraft: setSelectedOpponent,
  } = useDraft();

  const [draftOrder, setDraftOrder] = useState<"teamA" | "teamB">("teamA");
  const [draftOrderList, setDraftOrderList] = useState<("teamA" | "teamB")[]>(
    []
  );
  const [draftBoard, setDraftBoard] = useState<{
    teamA: Player[];
    teamB: Player[];
  }>({ teamA: [], teamB: [] });
  const [currentDraftTeam, setCurrentDraftTeam] = useState<"teamA" | "teamB">(
    draftOrder
  );
  const [suggestedPlayer, setSuggestedPlayer] = useState<Player | null>(null);
  const [ourAvailablePlayers, setOurAvailablePlayers] = useState<Player[]>([]);
  const [theirAvailablePlayers, setTheirAvailablePlayers] = useState<Player[]>(
    []
  );
  const [selectedTab, setSelectedTab] = useState("our-team"); // New state for the selected tab

  useEffect(() => {
    if (team && selectedOpponent) {
      // console.log("Setting team and selected opponent...");
      setOurAvailablePlayers(team.players);
      // console.log("Our available players", team.players);
      setTheirAvailablePlayers(selectedOpponent.players);
      // console.log("Their available players", selectedOpponent.players);
      const totalRounds = Math.ceil(
        (team.players.length + selectedOpponent.players.length) / 2
      );
      const generatedDraftOrder = generateDraftOrder(draftOrder, totalRounds);
      setDraftOrderList(generatedDraftOrder);
    }
  }, [team, selectedOpponent, draftOrder]);

  useEffect(() => {
    if (
      !team ||
      !selectedOpponent ||
      !ourAvailablePlayers ||
      !theirAvailablePlayers
    )
      return;

    // console.log("checking if we should suggest a player...");
    // console.log("Current draft team", currentDraftTeam);
    // console.log("Draft board", draftBoard);
    // console.log("Our available players", ourAvailablePlayers);

    if (currentDraftTeam === "teamA") {
      suggestPlayer();
    } else {
      setSuggestedPlayer(null);
    }
  }, [
    currentDraftTeam,
    draftBoard,
    team,
    selectedOpponent,
    ourAvailablePlayers,
    theirAvailablePlayers,
  ]);

  const suggestPlayer = () => {
    if (draftBoard.teamB.length === 0) {
      console.log("Suggesting player to put up");
      console.log("Our available players", ourAvailablePlayers);
      // Suggest the best player to put up
      const sortedPlayers = [...ourAvailablePlayers].sort(
        (a, b) => b.rating - a.rating
      );
      setSuggestedPlayer(sortedPlayers[0]);
      console.log("Suggested player", sortedPlayers[0]);
    } else {
      // Suggest the best matchup for their team
      console.log("Suggesting best matchup for their team");
      const lastDraftedOpponentPlayer =
        draftBoard.teamB[draftBoard.teamB.length - 1];
      let bestMatch = ourAvailablePlayers[0];
      let smallestDifference = Math.abs(
        lastDraftedOpponentPlayer.rating - bestMatch.rating
      );

      ourAvailablePlayers.forEach((player) => {
        const difference = Math.abs(
          lastDraftedOpponentPlayer.rating - player.rating
        );
        if (difference < smallestDifference) {
          bestMatch = player;
          smallestDifference = difference;
        }
      });

      setSuggestedPlayer(bestMatch);
      console.log("Suggested player", bestMatch);
    }
  };

  const handleDraftPlayer = (player: Player, team: "teamA" | "teamB") => {
    const updatedDraftBoard = { ...draftBoard };
    updatedDraftBoard[team].push(player);
    setDraftBoard(updatedDraftBoard);

    if (team === "teamA") {
      setOurAvailablePlayers(
        ourAvailablePlayers.filter((p) => p.pdgaNumber !== player.pdgaNumber)
      );
    } else {
      setTheirAvailablePlayers(
        theirAvailablePlayers.filter((p) => p.pdgaNumber !== player.pdgaNumber)
      );
    }

    const totalPicks = draftBoard.teamA.length + draftBoard.teamB.length;
    const nextDraftTeam = draftOrderList[totalPicks];
    setCurrentDraftTeam(nextDraftTeam);
    if (nextDraftTeam === "teamA") {
      setSelectedTab("our-team"); // Switch to "our-team" if it is our turn
    } else {
      setSelectedTab("their-team"); // Switch to "their-team" if it is their turn
    }
  };

  const generateDraftOrder = (
    firstPick: "teamA" | "teamB",
    totalRounds: number
  ): ("teamA" | "teamB")[] => {
    const order: ("teamA" | "teamB")[] = [];
    for (let round = 0; round < totalRounds; round++) {
      if (round % 2 === 0) {
        order.push(
          ...(firstPick === "teamA"
            ? (["teamA", "teamB"] as ("teamA" | "teamB")[])
            : (["teamB", "teamA"] as ("teamA" | "teamB")[]))
        );
      } else {
        order.push(
          ...(firstPick === "teamA"
            ? (["teamB", "teamA"] as ("teamA" | "teamB")[])
            : (["teamA", "teamB"] as ("teamA" | "teamB")[]))
        );
      }
    }
    return order;
  };

  const resetDraft = () => {
    setDraftOrder("teamA");
    setDraftBoard({ teamA: [], teamB: [] });
    setCurrentDraftTeam("teamA");
    setSuggestedPlayer(null);
    setOurAvailablePlayers(team?.players || []);
    setTheirAvailablePlayers(selectedOpponent?.players || []);
  };

  const changeDraftOrder = (order: "teamA" | "teamB") => {
    setDraftOrder(order);
    setCurrentDraftTeam(order);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between p-4 border-b">
        <h1 className="text-2xl font-bold">TC Draft Room</h1>
        <div className="flex items-center gap-4">
          <Select
            value={draftOrder}
            onValueChange={(value: "teamA" | "teamB") => {
              console.log("Draft order changed to", value);
              changeDraftOrder(value);
            }}
            disabled={
              draftBoard.teamA.length > 0 || draftBoard.teamB.length > 0
            }
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select first pick" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="teamA">{team?.name} First Pick</SelectItem>
              <SelectItem value="teamB">
                {selectedOpponent?.name} First Pick
              </SelectItem>
            </SelectContent>
          </Select>
          <Button variant="destructive" onClick={resetDraft}>
            Reset Draft
          </Button>
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-3/4 p-4 overflow-auto">
          <h2 className="text-xl font-semibold mb-4">Draft Board</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Round</TableHead>
                <TableHead>
                  {team?.name}
                  {currentDraftTeam === "teamA" && (
                    <span className="ml-2 inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  )}
                </TableHead>
                <TableHead>
                  {selectedOpponent?.name}
                  {currentDraftTeam === "teamB" && (
                    <span className="ml-2 inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  )}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({
                length: Math.max(
                  draftBoard.teamA.length,
                  draftBoard.teamB.length
                ),
              }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    {draftBoard.teamA[index] ? (
                      draftBoard.teamA[index].name
                    ) : currentDraftTeam === "teamA" &&
                      index === draftBoard.teamA.length ? (
                      <Skeleton className="w-[100px] h-[20px] rounded-full" />
                    ) : null}
                  </TableCell>
                  <TableCell>
                    {draftBoard.teamB[index] ? (
                      draftBoard.teamB[index].name
                    ) : currentDraftTeam === "teamB" &&
                      index === draftBoard.teamB.length ? (
                      <Skeleton className="w-[100px] h-[20px] rounded-full" />
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="w-1/4 border-l p-4">
          <h2 className="text-xl font-semibold mb-4">Available Players</h2>
          <Tabs
            value={selectedTab}
            onValueChange={setSelectedTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="our-team">Our Team</TabsTrigger>
              <TabsTrigger value="their-team">Their Team</TabsTrigger>
            </TabsList>
            <TabsContent value="our-team">
              <ScrollArea className="h-[calc(100vh-300px)]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      ...(suggestedPlayer ? [suggestedPlayer] : []),
                      ...ourAvailablePlayers.filter(
                        (player) => player !== suggestedPlayer
                      ),
                    ]
                      .sort((a, b) => b.rating - a.rating)
                      .map((player) => (
                        <TableRow
                          key={player.pdgaNumber}
                          className={
                            player === suggestedPlayer ? "bg-muted" : ""
                          }
                        >
                          <TableCell>{player.name}</TableCell>
                          <TableCell>{player.rating}</TableCell>
                          <TableCell>
                            <Button
                              onClick={() => handleDraftPlayer(player, "teamA")}
                              disabled={currentDraftTeam !== "teamA"}
                            >
                              Draft
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="their-team">
              <ScrollArea className="h-[calc(100vh-300px)]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {theirAvailablePlayers
                      .sort((a, b) => b.rating - a.rating)
                      .map((player) => (
                        <TableRow key={player.pdgaNumber}>
                          <TableCell>{player.name}</TableCell>
                          <TableCell>{player.rating}</TableCell>
                          <TableCell>
                            <Button
                              onClick={() => handleDraftPlayer(player, "teamB")}
                              disabled={currentDraftTeam !== "teamB"}
                            >
                              Draft
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
