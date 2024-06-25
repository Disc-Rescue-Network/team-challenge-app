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
import PlayerSearch from "./components/PlayerSearch";

const SearchPage = () => {
  useEffect(() => {
    const keepAlive = async () => {
      try {
        await fetch("https://tags-api.discrescuenetwork.com");
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

  return (
    <div className="flex flex-1 flex-col p-2 lg:p-4 gap-8">
      <PlayerSearch />
    </div>
  );
};

export default SearchPage;
