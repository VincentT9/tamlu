import { Box, Typography } from "@mui/material";
import L from "leaflet";
import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";

export interface MapMarker {
  id: string;
  latitude?: number | null;
  longitude?: number | null;
  title: string;
  subtitle?: string;
  type?: "sos" | "warehouse" | "shelter" | "team" | "route" | "area";
}

interface TamLuMapProps {
  markers: MapMarker[];
  center?: [number, number];
  height?: number;
  onLocationSelect?: (location: [number, number]) => void;
}

const colors: Record<NonNullable<MapMarker["type"]>, string> = {
  sos: "#c62828",
  warehouse: "#0b6fb3",
  shelter: "#197f5b",
  team: "#e87624",
  route: "#38aae8",
  area: "#52616f",
};

function markerIcon(type: MapMarker["type"]) {
  const color = colors[type ?? "area"];
  return L.divIcon({
    className: "tamlu-marker",
    html: `<span style="display:block;width:22px;height:22px;border-radius:999px;background:${color};border:4px solid white;box-shadow:0 10px 24px rgba(6,47,79,.28),0 0 0 5px ${color}24"></span>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

function MapViewport({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);

  return null;
}

function MapLocationSelector({ onLocationSelect }: { onLocationSelect: (location: [number, number]) => void }) {
  useMapEvents({
    dblclick(event) {
      onLocationSelect([Number(event.latlng.lat.toFixed(6)), Number(event.latlng.lng.toFixed(6))]);
    },
  });

  return null;
}

export function TamLuMap({ markers, center = [16.4637, 107.5909], height = 440, onLocationSelect }: TamLuMapProps) {
  const visibleMarkers = markers.filter(
    (marker) => Number.isFinite(marker.latitude) && Number.isFinite(marker.longitude),
  );

  return (
    <Box
      sx={{
        height,
        overflow: "hidden",
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,.65)",
      }}
    >
      <MapContainer
        center={center}
        zoom={10}
        scrollWheelZoom
        doubleClickZoom={!onLocationSelect}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='Vietnam Basic Tiles &middot; &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tiles.mattech.vn/styles/basic/{z}/{x}/{y}.png"
        />
        <MapViewport center={center} />
        {onLocationSelect ? <MapLocationSelector onLocationSelect={onLocationSelect} /> : null}
        {visibleMarkers.map((marker) => (
          <Marker
            key={marker.id}
            icon={markerIcon(marker.type)}
            position={[marker.latitude as number, marker.longitude as number]}
          >
            <Popup>
              <Typography fontWeight={800}>{marker.title}</Typography>
              {marker.subtitle ? <Typography variant="body2">{marker.subtitle}</Typography> : null}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </Box>
  );
}
