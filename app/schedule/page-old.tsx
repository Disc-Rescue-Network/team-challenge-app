"use client";

import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Match } from "../interfaces/Match";
import { useGames } from "../hooks/useGames";

export default function Schedule() {
  const matches = useGames("Tranquility Trails Teebirds");
  const wins = matches.filter((match) => match.result === "win").length;
  const losses = matches.filter((match) => match.result === "loss").length;

  return (
    <Card className="w-full max-w-2xl mx-auto border-none mr-auto">
      <CardHeader>
        <CardTitle>Tranquility Trails Teebirds Schedule</CardTitle>
        <CardDescription>
          Overall Record: {wins}-{losses}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-full w-full pr-4">
          <div className="space-y-4">
            {matches.map((match: Match) => (
              <Link
                key={match.id}
                href={`/match/${match.id}`}
                className="block"
              >
                <Card className="hover:bg-accent transition-colors">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Week {match.week}</span>
                      <Badge variant={match.isHome ? "default" : "secondary"}>
                        {match.isHome ? "Home" : "Away"}
                      </Badge>
                    </div>
                    <div className="mt-2 truncate">
                      <span className="text-lg">
                        {match.isHome
                          ? "Tranquility Trails Teebirds"
                          : match.opponent}{" "}
                        vs{" "}
                        {match.isHome
                          ? match.opponent
                          : "Tranquility Trails Teebirds"}
                      </span>
                    </div>
                    {match.score && (
                      <div className="mt-2 text-sm flex flex-row gap-2 items-center">
                        {match.result === "win" ? (
                          <Badge variant="default" className="bg-green-500">
                            W
                          </Badge>
                        ) : (
                          <Badge variant="destructive">L</Badge>
                        )}
                        <span
                          className={
                            match.score.home > match.score.away
                              ? "text-green-600 font-semibold"
                              : "text-red-600 font-semibold"
                          }
                        >
                          {match.score.home} - {match.score.away}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
