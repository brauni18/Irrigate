import { useEffect, useState } from 'react';
import L, { type LeafletMouseEvent } from 'leaflet';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

type MapLocation = {
  label: string;
  latitude: number;
  longitude: number;
  country?: string;
};

const DEFAULT_LOCATION = {
  latitude: 31.7683,
  longitude: 35.2137,
};

const mapPinIcon = L.divIcon({
  className: '',
  html:
    '<span style="display:block;width:18px;height:18px;border-radius:50%;background:#16a34a;border:3px solid #fff;box-shadow:0 0 0 2px rgba(22,163,74,0.25)"></span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function MapMarker({
  point,
  onPick,
}: {
  point: MapLocation;
  onPick: (latitude: number, longitude: number) => void;
}) {
  const map = useMap();

  useEffect(() => {
    map.flyTo([point.latitude, point.longitude], 13, { animate: false });
  }, [map, point]);

  useMapEvents({
    click(event: LeafletMouseEvent) {
      onPick(event.latlng.lat, event.latlng.lng);
    },
  });

  return <Marker position={[point.latitude, point.longitude]} icon={mapPinIcon} />;
}

export function MapPicker({
  value,
  currentAddress,
  onChange,
}: {
  value?: MapLocation | null;
  currentAddress?: string;
  onChange: (location: MapLocation) => void;
}) {
  const [point, setPoint] = useState<MapLocation>(
    value ?? {
      label: currentAddress?.trim() || 'Selected location',
      ...DEFAULT_LOCATION,
    },
  );

  useEffect(() => {
    if (value) {
      setPoint(value);
    }
  }, [value]);

  function handlePick(latitude: number, longitude: number) {
    const nextLocation = {
      label: currentAddress?.trim() || 'Selected location',
      latitude,
      longitude,
    };

    setPoint(nextLocation);
    onChange(nextLocation);
  }

  function handleUseCurrentLocation() {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        handlePick(position.coords.latitude, position.coords.longitude);
      },
      () => undefined,
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  return (
    <div className="space-y-2.5 rounded-md border border-border bg-muted/10 p-2">
      <div className="flex items-center justify-between gap-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <span>Choose on map</span>
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          className="rounded-md border border-border bg-background px-2 py-1 text-[10px] font-medium tracking-wider text-foreground hover:bg-muted/70"
        >
          Use my location
        </button>
      </div>

      <MapContainer
        center={[point.latitude, point.longitude]}
        zoom={13}
        scrollWheelZoom
        className="h-52 w-full overflow-hidden rounded-md border border-border"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <MapMarker point={point} onPick={handlePick} />
      </MapContainer>
    </div>
  );
}
