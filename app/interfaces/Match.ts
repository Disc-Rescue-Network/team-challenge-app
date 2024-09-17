export type Match = {
  id: number;
  opponent: string;
  isHome: boolean;
  score?: { home: number; away: number };
  result?: "win" | "loss";
  week: number;
};
