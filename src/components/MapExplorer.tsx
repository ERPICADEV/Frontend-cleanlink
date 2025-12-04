import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import type { LatLngBounds } from "leaflet";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import { Button } from "@/components/ui/button";
import { fetchMapReports, type MapFeature } from "@/services/reportService";
import { formatCategoryLabel, formatStatusLabel, formatRelativeTime } from "@/lib/formatters";

const DEFAULT_CENTER: [number, number] = [28.6139, 77.209];

// Fix Leaflet default icon assets for Vite
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const statusLegend = [
  { label: "Pending", color: "#F59E0B" },
  { label: "Community Verified", color: "#3B82F6" },
  { label: "Assigned", color: "#8B5CF6" },
  { label: "Resolved", color: "#10B981" },
  { label: "Flagged", color: "#EF4444" },
];

const formatBounds = (bounds: LatLngBounds) => {
  const southWest = bounds.getSouthWest();
  const northEast = bounds.getNorthEast();
  return `${southWest.lat},${southWest.lng},${northEast.lat},${northEast.lng}`;
};

interface BoundsTrackerProps {
  onBoundsChange: (bounds: LatLngBounds) => void;
}

const BoundsTracker = ({ onBoundsChange }: BoundsTrackerProps) => {
  const map = useMapEvents({
    moveend() {
      onBoundsChange(map.getBounds());
    },
    zoomend() {
      onBoundsChange(map.getBounds());
    },
  });

  useEffect(() => {
    onBoundsChange(map.getBounds());
  }, [map, onBoundsChange]);

  return null;
};

interface MapExplorerProps {
  category?: string;
  onSelectReport?: (id: string) => void;
}

const MapExplorer = ({ category, onSelectReport }: MapExplorerProps) => {
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [boundsString, setBoundsString] = useState<string>();
  const [mapReady, setMapReady] = useState(false);

  // Try to use the viewer's location once
  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setMapCenter([position.coords.latitude, position.coords.longitude]);
      },
      () => {
        /* silently ignore */
      },
      { enableHighAccuracy: false, maximumAge: 60_000 }
    );
  }, []);

  const normalizedCategory =
    category && category !== "All" ? category : undefined;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["mapReports", boundsString, normalizedCategory],
    queryFn: () =>
      fetchMapReports({
        bounds: boundsString,
        category: normalizedCategory,
        limit: 250,
      }),
    enabled: Boolean(boundsString),
    staleTime: 30_000,
  });

  const featureCount = data?.length ?? 0;

  const handleBoundsChange = useCallback((bounds: LatLngBounds) => {
    setBoundsString(formatBounds(bounds));
    setMapReady(true);
  }, []);

  const markers = useMemo(() => {
    if (!data) return [];
    return data.filter(
      (feature): feature is MapFeature & { geometry: { coordinates: [number, number] } } =>
        Boolean(feature.geometry?.coordinates?.length === 2)
    );
  }, [data]);

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden mb-4">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <div>
          <p className="text-sm font-semibold">Live civic issues map</p>
          <p className="text-xs text-muted-foreground">
            Pan / zoom to refresh reports near you
          </p>
        </div>
        {isFetching && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
      </div>

      <div className="relative h-80">
        {(() => {
          const MapContainerAny = MapContainer as any;
          const TileLayerAny = TileLayer as any;
          const CircleMarkerAny = CircleMarker as any;
          return (
            <MapContainerAny
              key={mapCenter.join(",")}
              center={mapCenter}
              zoom={12}
              minZoom={4}
              scrollWheelZoom
              className="h-full w-full"
            >
              <BoundsTracker onBoundsChange={handleBoundsChange} />
              <TileLayerAny
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {markers.map((feature) => {
                const [lng, lat] = feature.geometry.coordinates;
                return (
                  <CircleMarkerAny
                    center={[lat, lng]}
                    key={feature.id}
                    pathOptions={{
                      color: feature.properties.color || "#2563eb",
                      fillColor: feature.properties.color || "#2563eb",
                      fillOpacity: 0.35,
                    }}
                    radius={8}
                  >
                <Popup>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold leading-tight">
                      {feature.properties.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatCategoryLabel(feature.properties.category)} •{" "}
                      {formatStatusLabel(feature.properties.status)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(feature.properties.created_at)}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full"
                      onClick={() => onSelectReport?.(feature.id)}
                    >
                      View report
                    </Button>
                  </div>
                </Popup>
              </CircleMarkerAny>
            );
          })}
            </MapContainerAny>
          );
        })()}

        <div className="absolute left-3 top-3 z-[500] flex flex-wrap gap-2">
          {statusLegend.map((item) => (
            <span
              key={item.label}
              className="bg-background/90 text-[11px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow"
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              {item.label}
            </span>
          ))}
        </div>

        <div className="absolute right-3 bottom-3 z-[500] bg-background/90 border border-border rounded-full px-3 py-1 text-xs font-medium shadow">
          {featureCount} reports in this view
        </div>

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-[600]">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading map data…</p>
            </div>
          </div>
        )}

        {mapReady && !isLoading && featureCount === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-[400]">
            <p className="text-sm text-muted-foreground">
              No reports in this area yet. Try zooming out.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapExplorer;

