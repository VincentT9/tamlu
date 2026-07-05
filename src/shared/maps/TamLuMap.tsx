import { Box, Typography } from "@mui/material";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

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
}

const colors: Record<NonNullable<MapMarker["type"]>, string> = {
  sos: "#d32f2f",
  warehouse: "#0b6fb3",
  shelter: "#197f5b",
  team: "#e87624",
  route: "#6b4eff",
  area: "#52616f",
};

function markerIcon(type: MapMarker["type"]) {
  const color = colors[type ?? "area"];
  return L.divIcon({
    className: "tamlu-marker",
    html: `<span style="display:block;width:18px;height:18px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.25)"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

export function TamLuMap({ markers, center = [16.4637, 107.5909], height = 440 }: TamLuMapProps) {
  const visibleMarkers = markers.filter(
    (marker) => Number.isFinite(marker.latitude) && Number.isFinite(marker.longitude),
  );

  return (
    <Box sx={{ height, overflow: "hidden", borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
      <MapContainer center={center} zoom={10} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
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
