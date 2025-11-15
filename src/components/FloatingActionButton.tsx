import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";

const FloatingActionButton = () => {
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => navigate("/report")}
      size="lg"
      className="fixed bottom-6 right-6 rounded-full shadow-lg hover:shadow-xl transition-all h-14 w-14 p-0"
    >
      <Plus className="w-6 h-6" />
    </Button>
  );
};

export default FloatingActionButton;
