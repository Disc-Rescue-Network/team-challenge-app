import classNames from "classnames";
import { Home, MapPin } from "lucide-react";

type Props = {
  text: string;
};

const TeamChallengeBadge = ({ text }: Props) => {
  return (
    <span
      className={classNames(
        "me-2 truncate rounded-full px-2.5 py-1 text-xs font-medium inline-flex items-center",
        {
          "bg-violet-100  text-violet-800": text === "home_",
          "bg-amber-100  text-amber-800": text === "1º - Capital",
          "bg-green-100  text-green-800": text === "44home",
          "bg-yellow-100  text-yellow-800": text === "2away_00",
          "bg-alternativeBlue  text-white": text === "home",
          "bg-alternativePink  text-white": text === "away",
          "bg-cyan-100  text-cyan-800": text === "2away_",
          "bg-stone-100  text-stone-700": text === "3away",
        }
      )}
    >
      {text === "home" && <Home className="mr-1 h-3 w-3" />}
      {text === "away" && <MapPin className="mr-1 h-3 w-3" />}
      {text}
    </span>
  );
};

export default TeamChallengeBadge;
