"use client";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  LogOut,
  Settings,
  MessageCircleQuestion,
  Home,
  Menu,
  Medal,
  NotebookText,
  CalendarSearch,
  CalendarPlus,
  LayoutDashboard,
  CalendarCheck2,
  Swords,
  ShieldCheck,
  Search,
  ClipboardPenLine,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { DialogTrigger } from "@/components/ui/dialog";
import { useTheme } from "next-themes";
import logo from "@/public/logo.png";
import { Label } from "@/components/ui/label";
import { ModeToggle } from "@/components/ui/modetoggle";

interface KindeUser {
  family_name: string;
  given_name: string;
  picture: string;
  email: string;
  id: string;
}

function MenuHeader() {
  const { theme } = useTheme();
  const pathname = usePathname();

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col overflow-auto">
          <div className="flex h-14 items-center border-b px-1 mr-2 lg:h-[60px] lg:px-6 pb-2 gap-2">
            <div className="flex items-center gap-2 font-semibold tracking-tight">
              {/* <Image
              src={logo}
              width={0}
              height={0}
              alt="Disc Rescue Network"
              style={{ width: "auto", height: "auto", maxHeight: "50px" }}
            /> */}
              <Label className="text-lg font-semibold">
                Team Challenge App
              </Label>
            </div>
          </div>
          <nav className="grid gap-2 text-lg font-medium">
            {/* <h2 className="my-4 px-4 text-lg font-semibold tracking-tight">
              Analyze
            </h2> */}
            <DialogTrigger asChild>
              <Button
                asChild
                variant={pathname === "/" ? "secondary" : "ghost"}
                className="w-full justify-start flex gap-2 my-1"
              >
                <Link
                  href="/"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <Search className="h-4 w-4" />
                  Player Search
                </Link>
              </Button>
            </DialogTrigger>
            <DialogTrigger asChild>
              <Button
                asChild
                variant={pathname === "/check-in" ? "secondary" : "ghost"}
                className="w-full justify-start flex gap-2 my-1"
              >
                <Link
                  href="/roster"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <ClipboardPenLine className="h-4 w-4" />
                  My Roster
                </Link>
              </Button>
            </DialogTrigger>
            <DialogTrigger asChild>
              <Button
                asChild
                variant={pathname === "/my-rounds" ? "secondary" : "ghost"}
                className="w-full justify-start flex gap-2 my-1"
              >
                <Link
                  href="/matchup"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <Swords className="h-4 w-4" />
                  Matchup Viewer
                </Link>
              </Button>
            </DialogTrigger>
          </nav>
        </SheetContent>
      </Sheet>
      <ModeToggle />
    </header>
  );
}
export default MenuHeader;
