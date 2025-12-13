import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

const FloatingActionButton = () => {
  const navigate = useNavigate();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={() => navigate("/create-post")}
            size="lg"
            className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 rounded-full shadow-2xl hover:shadow-3xl transition-all h-14 w-14 p-0 z-40 touch-manipulation"
            aria-label="Create new report"
          >
            <Plus className="w-6 h-6" strokeWidth={2.5} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Create new report</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default FloatingActionButton;
