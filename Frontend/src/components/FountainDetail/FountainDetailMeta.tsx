import type { Fountain } from "../../types/fountain";
import { useTranslation } from "../../i18n";

interface FountainDetailMetaProps {
  fountain: Fountain;
}

export function FountainDetailMeta({ fountain }: FountainDetailMetaProps) {
  const t = useTranslation();
  
  return (
    <div className="fountain-detail-meta">
      {fountain.isFree && <span className="meta-badge">{t.free}</span>}
      <span
        className={`meta-badge status-badge ${fountain.isOperational ? "status-active" : "status-inactive"}`}
      >
        {fountain.isOperational
          ? `✓ ${t.operational}`
          : `✗ ${t.notOperational}`}
      </span>
    </div>
  );
}
