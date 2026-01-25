import { useState } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import CameraCapture from "./CameraCapture";
import { analyzeReport } from "@/services/reportService";
import { useToast } from "@/hooks/use-toast";

const FloatingActionButton = () => {
  const navigate = useNavigate();
  const [showCamera, setShowCamera] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleCapture = async (imageData: string, lat: number, lng: number) => {
    setIsAnalyzing(true);
    try {
      // If coordinates are 0,0, it means location failed - still try analysis but backend should handle it
      const analysis = await analyzeReport({
        image: imageData,
        lat,
        lng,
      });

      // Navigate to create-post with pre-filled data
      navigate("/create-post", {
        state: {
          prefilled: {
            image: imageData,
            title: analysis.title,
            description: analysis.description,
            category: analysis.category,
            location: analysis.location,
            ai_analysis: analysis.ai_analysis,
          },
        },
      });
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis failed",
        description: error.message || "Failed to analyze report. You can still create a report manually.",
        variant: "destructive",
      });
      // Navigate to form with just the image
      navigate("/create-post", {
        state: {
          prefilled: {
            image: imageData,
          },
        },
      });
    } finally {
      setIsAnalyzing(false);
      setShowCamera(false);
    }
  };

  const handleError = (error: string) => {
    // Don't show toast for location errors - they're handled gracefully
    // Only show for critical errors
    if (!error.includes("Location")) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  };

  const handleSkipToForm = (imageData?: string) => {
    setShowCamera(false);
    // Navigate to form, optionally with image if one was captured
    if (imageData) {
      navigate("/create-post", {
        state: {
          prefilled: {
            image: imageData,
          },
        },
      });
    } else {
      navigate("/create-post");
    }
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => setShowCamera(true)}
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

      {showCamera && (
        <CameraCapture
          onCapture={handleCapture}
          onCancel={() => setShowCamera(false)}
          onError={handleError}
          onSkipToForm={handleSkipToForm}
        />
      )}
    </>
  );
};

export default FloatingActionButton;
