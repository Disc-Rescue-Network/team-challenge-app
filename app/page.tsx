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
import { useState } from "react";
import PlayerSearch from "./components/PlayerSearch";

const SearchPage = () => {
  return (
    <div className="flex flex-1 flex-col p-4 gap-8">
      <PlayerSearch />
    </div>
  );
};

export default SearchPage;
