import type { Fountain } from "../../types/fountain";

interface FountainDetailMapProps {
  fountain: Fountain;
}

export function FountainDetailMap({ fountain }: FountainDetailMapProps) {
  return (
    <div className="fountain-detail-header">
      <div className="fountain-detail-map">
        <iframe
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${fountain.longitude - 0.005},${fountain.latitude - 0.005},${fountain.longitude + 0.005},${fountain.latitude + 0.005}&layer=mapnik&marker=${fountain.latitude},${fountain.longitude}`}
          style={{ width: "100%", height: "100%", border: "none" }}
          title={`${fountain.name} location`}
        />
      </div>
    </div>
  );
}
