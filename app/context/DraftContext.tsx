"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Team } from "../interfaces/Team";

interface DraftContextType {
  teamDraft: Team | null;
  selectedOpponentDraft: Team | null;
  setTeamDraft: (team: Team) => void;
  setSelectedOpponentDraft: (team: Team) => void;
}

const DraftContext = createContext<DraftContextType | undefined>(undefined);

export const DraftProvider = ({ children }: { children: ReactNode }) => {
  const [teamDraft, setTeamDraftState] = useState<Team | null>(null);
  const [selectedOpponentDraft, setSelectedOpponentDraftState] =
    useState<Team | null>(null);

  useEffect(() => {
    const savedTeamDraft = localStorage.getItem("teamDraft");
    const savedSelectedOpponentDraft = localStorage.getItem(
      "selectedOpponentDraft"
    );

    if (savedTeamDraft) setTeamDraftState(JSON.parse(savedTeamDraft));
    if (savedSelectedOpponentDraft)
      setSelectedOpponentDraftState(JSON.parse(savedSelectedOpponentDraft));
  }, []);

  useEffect(() => {
    if (teamDraft) localStorage.setItem("teamDraft", JSON.stringify(teamDraft));
  }, [teamDraft]);

  useEffect(() => {
    if (selectedOpponentDraft)
      localStorage.setItem(
        "selectedOpponentDraft",
        JSON.stringify(selectedOpponentDraft)
      );
  }, [selectedOpponentDraft]);

  const setTeamDraft = (team: Team) => {
    setTeamDraftState(team);
  };

  const setSelectedOpponentDraft = (team: Team) => {
    setSelectedOpponentDraftState(team);
  };

  return (
    <DraftContext.Provider
      value={{
        teamDraft,
        selectedOpponentDraft,
        setTeamDraft,
        setSelectedOpponentDraft,
      }}
    >
      {children}
    </DraftContext.Provider>
  );
};

export const useDraft = (): DraftContextType => {
  const context = useContext(DraftContext);
  if (!context) {
    throw new Error("useDraft must be used within a DraftProvider");
  }
  return context;
};
