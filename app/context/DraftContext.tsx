"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Team } from "../interfaces/Team"; // Ensure the path is correct

interface DraftContextType {
  teamDraft: Team | null;
  setTeamDraft: (team: Team | null) => void;
  selectedOpponentDraft: Team | null;
  setSelectedOpponentDraft: (team: Team | null) => void;
}

const DraftContext = createContext<DraftContextType | undefined>(undefined);

export const useDraft = () => {
  const context = useContext(DraftContext);
  if (!context) {
    throw new Error("useDraft must be used within a DraftProvider");
  }
  return context;
};

export const DraftProvider = ({ children }: { children: ReactNode }) => {
  const [teamDraft, setTeamDraft] = useState<Team | null>(null);
  const [selectedOpponentDraft, setSelectedOpponentDraft] =
    useState<Team | null>(null);

  return (
    <DraftContext.Provider
      value={{
        teamDraft,
        setTeamDraft,
        selectedOpponentDraft,
        setSelectedOpponentDraft,
      }}
    >
      {children}
    </DraftContext.Provider>
  );
};
