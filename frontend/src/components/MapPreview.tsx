import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapPreviewProps {
  lat: number;
  lon: number;
  cityName: string;
}

export default function MapPreview({ lat, lon, cityName }: MapPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lon}`;

  useEffect(() => {
    if (!containerRef.current) return;

    const map = L.map(containerRef.current, {
      center: [lat, lon],
      zoom: 9,
      zoomControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map);

    const pin = L.divIcon({
      className: '',
      html: '<div style="width:10px;height:10px;border-radius:50%;background:#01012d;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>',
      iconSize: [10, 10],
      iconAnchor: [5, 5],
    });
    L.marker([lat, lon], { icon: pin }).addTo(map);

    return () => { map.remove(); };
  }, [lat, lon]);

  return (
    <div className="rounded-[8px] overflow-hidden shadow-sm relative group w-full lg:w-[320px]">
      <div ref={containerRef} style={{ width: '100%', height: 220 }} />
      <a
        href={googleMapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Open ${cityName} in Google Maps`}
        className="absolute inset-0 flex items-end justify-end p-2 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <span className="bg-primary text-white text-xs font-semibold px-2 py-1 rounded-[6px]">
          Open in Google Maps
        </span>
      </a>
    </div>
  );
}
