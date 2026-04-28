interface MapPreviewProps {
  lat: number;
  lon: number;
  cityName: string;
}

export default function MapPreview({ lat, lon, cityName }: MapPreviewProps) {
  const delta = 0.3;
  const bbox = `${lon - delta}%2C${lat - delta}%2C${lon + delta}%2C${lat + delta}`;
  const embedSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lon}`;
  const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lon}`;

  return (
    <div className="rounded-[8px] overflow-hidden shadow-sm relative group w-full lg:w-[320px]">
      <iframe
        title={`Map of ${cityName}`}
        src={embedSrc}
        width="100%"
        height={220}
        className="block border-0"
        loading="lazy"
      />
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
