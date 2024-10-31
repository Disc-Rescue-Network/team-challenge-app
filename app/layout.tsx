import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { ModeToggle } from "@/components/ui/modetoggle";
import { Toaster } from "@/components/ui/toaster";
import SideMenu from "./components/sidemenu";
import MenuHeader from "./components/menuheader";
import { DraftProvider } from "./context/DraftContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Team Challenge Scouting App",
  description:
    "Create and manage your team for the NJ Team Challenge Season. Scout your opponents and create ideal matchups.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex row-auto w-full h-full bg-lightgray">
            <SideMenu />
            <div className="w-full">
              <MenuHeader />
              <main className="grid grid-cols-1 min-h-screen p-2 lg:p-2 gap-4">
                <DraftProvider>{children}</DraftProvider>
              </main>
            </div>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
