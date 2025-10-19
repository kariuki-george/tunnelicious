"use client";

import { createContext, useContext, useState } from "react";

export type TeamType = "DASHBOARD" | "AGENCY" | "PROPERTY" | "UNIT";

export interface Team {
  name: string;
  // logo: React.ElementType;
  //plan: string;
  type: TeamType;
  id: string;
}

interface TeamContextType {
  selectedTeam: Team | null;
  setSelectedTeam: (team: Team) => void;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export const TeamProvider = ({
  children,
  initialTeams,
}: {
  children: React.ReactNode;
  initialTeams: Team[];
}) => {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(
    initialTeams[0] || null,
  );

  return (
    <TeamContext.Provider value={{ selectedTeam, setSelectedTeam }}>
      {children}
    </TeamContext.Provider>
  );
};

export const useTeam = () => {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error("useTeam must be used within a TeamProvider");
  }
  return context;
};
