import { useState, useRef, useEffect } from "react";
import { Camera, X, Loader2, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";

interface CameraCaptureProps {
  onCapture: (imageData: string, lat: number, lng: number) => void;
  onCancel: () => void;
  onError: (error: string) => void;
  onSkipToForm?: (imageData?: string) => void; // New prop to skip AI and go to form, optionally with image
}

const CameraCapture = ({ onCapture, onCancel, onError, onSkipToForm }: CameraCaptureProps) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  useEffect(() => {
    // Try to open camera on mobile, fallback to file input on desktop
    if (isMobile) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isMobile]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Use back camera on mobile
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err: any) {
      const errorMessage =
        err.name === "NotAllowedError" || err.name === "PermissionDeniedError"
          ? "Camera permission denied. Please enable camera access in your browser settings."
          : err.name === "NotFoundError" || err.name === "DevicesNotFoundError"
          ? "No camera found. Please use file upload instead."
          : "Failed to access camera. Please try again or use file upload.";
      setError(errorMessage);
      onError(errorMessage);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const imageData = canvas.toDataURL("image/jpeg", 0.8);
        setImagePreview(imageData);
        stopCamera();
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const imageData = reader.result as string;
      setImagePreview(imageData);
    };
    reader.readAsDataURL(file);
  };

  const handleConfirm = async () => {
    if (!imagePreview) return;

    setIsCapturing(true);
    setIsGettingLocation(true);
    setError(null);

    try {
      // Get GPS coordinates - make it more lenient
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!("geolocation" in navigator)) {
          reject(new Error("Geolocation is not supported"));
          return;
        }

        navigator.geolocation.getCurrentPosition(
          resolve,
          (err) => {
            // More lenient error handling - don't reject immediately
            if (err.code === 1) {
              reject(new Error("Location access denied"));
            } else if (err.code === 2) {
              reject(new Error("Location unavailable"));
            } else {
              reject(new Error("Location timeout"));
            }
          },
          { 
            enableHighAccuracy: false, // Use less accurate but faster location
            timeout: 15000, // Increased timeout
            maximumAge: 60000 // Accept cached location up to 1 minute old
          }
        );
      });

      const { latitude, longitude } = position.coords;
      setIsGettingLocation(false);
      onCapture(imagePreview, latitude, longitude);
    } catch (err: any) {
      setIsGettingLocation(false);
      // Location failed - proceed anyway without location
      // Backend will handle it gracefully, and form page will detect location automatically
      // Don't show this as an error - location will be detected on the form page
      console.log('Location unavailable, proceeding without it:', err.message);
      
      // Proceed with analysis using 0,0 - backend will skip reverse geocoding
      // The form page will automatically detect location when user gets there
      onCapture(imagePreview, 0, 0);
    }
  };

  const handleRetake = () => {
    setImagePreview(null);
    if (isMobile) {
      startCamera();
    } else {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Capture Report Photo</h2>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 space-y-4">
        {error && (
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!imagePreview ? (
          <>
            {isMobile && stream ? (
              <div className="relative w-full max-w-md aspect-[4/3] bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                  <Button
                    onClick={capturePhoto}
                    size="lg"
                    className="rounded-full w-16 h-16 p-0 bg-white hover:bg-gray-200"
                  >
                    <Camera className="w-8 h-8 text-black" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-md space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
                  <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload a photo of the issue
                  </p>
                  <Button onClick={() => fileInputRef.current?.click()} variant="outline">
                    Choose File
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </div>
                {!isMobile && (
                  <Button onClick={startCamera} variant="outline" className="w-full">
                    <Camera className="w-4 h-4 mr-2" />
                    Use Camera Instead
                  </Button>
                )}
              </div>
            )}
            {onSkipToForm && (
              <div className="w-full max-w-md">
                <Button
                  onClick={() => onSkipToForm()}
                  variant="ghost"
                  className="w-full"
                >
                  Fill form manually instead
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="w-full max-w-md space-y-4">
            <div className="relative w-full aspect-[4/3] bg-black rounded-lg overflow-hidden">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Button onClick={handleRetake} variant="outline" className="flex-1">
                  Retake
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={isCapturing}
                  className="flex-1"
                >
                  {isCapturing ? (
                    <>
                      {isGettingLocation ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Getting location...
                        </>
                      ) : (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      )}
                    </>
                  ) : (
                    "Confirm & Analyze"
                  )}
                </Button>
              </div>
              {onSkipToForm && (
                <Button
                  onClick={() => onSkipToForm(imagePreview || undefined)}
                  variant="ghost"
                  className="w-full"
                  disabled={isCapturing}
                >
                  Fill manually instead
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraCapture;

