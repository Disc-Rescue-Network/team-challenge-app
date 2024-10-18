import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BadgeStatus = "myTeamNotSet" | "myTeam" | "opponentTeam";

const badgeStatusMap: Record<
  BadgeStatus,
  {
    text: string;
    variant:
      | "default"
      | "destructive"
      | "outline"
      | "secondary"
      | null
      | undefined;
  }
> = {
  myTeamNotSet: { text: "Set as my team", variant: "secondary" },
  myTeam: { text: "My team", variant: "default" },
  opponentTeam: { text: "Opponent team", variant: "destructive" },
};

type TeamBadgeStatusProps = {
  myTeam: string;
  selectedTeam: string;
  handleBadgeClick: () => void;
};

const TeamBadgeStatus = ({
  myTeam,
  selectedTeam,
  handleBadgeClick,
}: TeamBadgeStatusProps) => {
  const [badgeStatus, setBadgeStatus] = useState<BadgeStatus>("myTeamNotSet");

  useEffect(() => {
    // --edge case--
    if (myTeam === "" && selectedTeam === "") return;

    if (myTeam === selectedTeam) setBadgeStatus("myTeam");
    if (myTeam && myTeam !== selectedTeam) setBadgeStatus("opponentTeam");
  }, [myTeam, selectedTeam]);

  return (
    <span className="capitalize p-1 flex items-center gap-2">
      {selectedTeam}
      <Button
        onClick={handleBadgeClick}
        className={cn(
          "p-0 h-auto min-w-0 bg-transparent hover:bg-transparent",
          (badgeStatus === "myTeam" || badgeStatus === "opponentTeam") &&
            "cursor-not-allowed"
        )}
      >
        <Badge
          className="text-xs"
          variant={badgeStatusMap[badgeStatus].variant}
        >
          {badgeStatusMap[badgeStatus].text}
        </Badge>
      </Button>
    </span>
  );
};

export default TeamBadgeStatus;
