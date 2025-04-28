import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onToggleHelp: () => void;
}

export default function Header({ onToggleHelp }: HeaderProps) {
  return (
    <header className="flex justify-between items-center px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-md rounded-t-lg">
      <div className="flex items-center gap-2">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold">Camera Details</h1>
          <p className="text-sm text-blue-200">Configure stream requirements and gateway setup</p>
        </div>
      </div>
      <Button 
        variant="ghost" 
        size="icon"
        className="text-white hover:bg-blue-700"
        onClick={onToggleHelp}
      >
        <HelpCircle className="h-6 w-6" />
      </Button>
    </header>
  );
}