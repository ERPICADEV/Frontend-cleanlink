import { useEffect, useState, useMemo } from "react";
import { Upload, MapPin, Loader2, Lightbulb, X } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { createReport, getPreSubmissionSuggestions, type CreateReportPayload } from "@/services/reportService";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

const categories = ["Garbage", "Road", "Water", "Trees", "Electricity", "Other"];

const CreatePost = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [locationLabel, setLocationLabel] = useState("Detecting location…");
  const [geo, setGeo] = useState<{ lat?: number; lng?: number }>({});
  const [areaName, setAreaName] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [visibility, setVisibility] = useState<"public" | "masked">("public");
  const [anonymous, setAnonymous] = useState(false);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<string[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Check if form has enough data for suggestions
  const canGetSuggestions = useMemo(() => {
    return (
      title.trim().length >= 10 &&
      description.trim().length >= 20 &&
      Boolean(category)
    );
  }, [title, description, category]);
  

  // Fetch pre-submission suggestions
  const { data: suggestionsData } = useQuery({
    queryKey: ["pre-submission-suggestions", title, description, category, imageData],
    queryFn: () => getPreSubmissionSuggestions({
      title: title.trim(),
      description: description.trim(),
      category: category.toLowerCase(),
      images: imageData ? [imageData] : [],
    }),
    enabled: canGetSuggestions,
    staleTime: 30000, // Cache for 30 seconds
  });

  const suggestions = suggestionsData?.suggestions?.filter(
    s => !dismissedSuggestions.includes(s)
  ) || [];

  const mutation = useMutation({
    mutationFn: (payload: CreateReportPayload) => createReport(payload),
    onSuccess: (data) => {
      toast({
        title: "Report submitted",
        description: "Thanks for helping your neighbourhood.",
      });
      navigate(`/post/${data.id}`);
    },
    onError: () => {
      toast({
        title: "Submission failed",
        description: "Please try again after some time.",
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      setImageData(base64);
    };
    reader.readAsDataURL(file);
  };

  const detectLocation = () => {
    if (!("geolocation" in navigator)) {
      toast({
        title: "Location unavailable",
        description: "Geolocation is not supported in this browser.",
        variant: "destructive",
      });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setGeo({ lat: latitude, lng: longitude });
        setLocationLabel(`Lat ${latitude.toFixed(4)}, Lng ${longitude.toFixed(4)}`);
        toast({
          title: "Location captured",
          description: "Coordinates added to the report.",
        });
      },
      () => {
        setLocationLabel("Location access denied");
        toast({
          title: "Location error",
          description: "Please enable location access and try again.",
          variant: "destructive",
        });
      },
      { enableHighAccuracy: true, timeout: 10_000 }
    );
  };

  useEffect(() => {
    detectLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please login to submit a civic report.",
        variant: "destructive",
      });
      navigate("/login?redirect=/create-post");
      return;
    }

    if (!title.trim() || !description.trim() || !category) {
      toast({
        title: "Missing information",
        description: "Title, description and category are required.",
        variant: "destructive",
      });
      return;
    }

    if (!geo.lat || !geo.lng) {
      toast({
        title: "Add location",
        description: "Please allow location access or add coordinates manually.",
        variant: "destructive",
      });
      return;
    }

    const payload: CreateReportPayload = {
      title: title.trim(),
      description: description.trim(),
      category: category.toLowerCase(),
      location: {
        lat: geo.lat,
        lng: geo.lng,
        area_name: areaName || undefined,
        address: addressLine || undefined,
        city: city || undefined,
        state: stateName || undefined,
        country: "India",
        visibility,
      },
      images: imageData ? [imageData] : undefined,
      anonymous,
    };

    mutation.mutate(payload);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="mb-6 space-y-2">
          <h1 className="text-2xl font-bold">Create New Report</h1>
          <p className="text-sm text-muted-foreground">
            Got a local problem? Share it with the community!
          </p>
          {!isAuthenticated && (
            <div className="text-xs text-amber-600 bg-amber-100 border border-amber-200 px-3 py-2 rounded">
              You are browsing as a guest. Please login to submit reports.
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              placeholder="Brief title of the issue..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder="Describe the issue briefly..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={600}
            />
            <p className="text-xs text-muted-foreground text-right">
              {description.length}/600
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Upload Image {category === "Garbage" && "(Mandatory for garbage posts)"}
            </label>
            {!imagePreview ? (
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded cursor-pointer hover:bg-accent/50 transition-colors">
                <Upload className="w-10 h-10 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">
                  Add a photo so workers can verify faster
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageUpload}
                />
              </label>
            ) : (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setImagePreview(null);
                    setImageData(null);
                  }}
                >
                  Remove
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select issue category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Area / Landmark</label>
              <Input
                placeholder="e.g. Sector 12 park"
                value={areaName}
                onChange={(e) => setAreaName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Address</label>
              <Input
                placeholder="Street / block"
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">City</label>
              <Input
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">State</label>
              <Input
                placeholder="State"
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">GPS Coordinates</label>
            <Input value={locationLabel} readOnly className="bg-muted" />
            <Button
              type="button"
              variant="outline"
              onClick={detectLocation}
              className="w-full mt-2"
              size="sm"
            >
              <MapPin className="w-4 h-4 mr-2" />
              {locationLabel.includes("Lat") ? "Refresh location" : "Auto-detect Location"}
            </Button>
          </div>

          {/* AI Tips */}
          {suggestions.length > 0 && (
            <Alert className="bg-blue-50 border-blue-200">
              <Lightbulb className="h-4 w-4 text-blue-600" />
              <AlertDescription className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-blue-900 mb-1">AI Tips</p>
                    <ul className="space-y-1 text-sm text-blue-800">
                      {suggestions.map((suggestion, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-blue-600 mt-0.5">•</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
                    onClick={() => {
                      setDismissedSuggestions(suggestions);
                    }}
                    aria-label="Dismiss suggestions"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Location visibility</label>
              <Select value={visibility} onValueChange={(value: "public" | "masked") => setVisibility(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public (recommended)</SelectItem>
                  <SelectItem value="masked">Mask exact coordinates</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between border border-border rounded-lg px-4">
              <div>
                <p className="text-sm font-medium">Report anonymously</p>
                <p className="text-xs text-muted-foreground">
                  Your name will be hidden from the community.
                </p>
              </div>
              <Switch checked={anonymous} onCheckedChange={(checked) => setAnonymous(Boolean(checked))} />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting…
              </>
            ) : (
              "Submit Report"
            )}
          </Button>
        </form>
      </main>
    </div>
  );
};

export default CreatePost;
