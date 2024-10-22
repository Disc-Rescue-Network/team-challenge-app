import {FaMars, FaVenus} from "react-icons/fa";
import {Switch} from "@/components/ui/switch";

interface GenderSwitchProps {
  selectedGender: string; 
  onGenderChange: (gender: string) => void;
}

const GenderSwitch = ({selectedGender, onGenderChange}: GenderSwitchProps) => {
  return (
    <div className="flex items-center gap-4">
      <FaMars
        className={`h-6 w-6 ${
          selectedGender === "male" ? "text-blue-500" : "text-gray-400"
        }`}
      />
      <Switch
        checked={selectedGender === "female"}
        onCheckedChange={(checked) =>
          onGenderChange(checked ? "female" : "male")
        }
        className="bg-gray-200"
      />
      <FaVenus
        className={`h-6 w-6 ${
          selectedGender === "female" ? "text-pink-500" : "text-gray-400"
        }`}
      />
    </div>
  );
};

export default GenderSwitch;
