import type { Fountain } from '../types/fountain';
import { useTranslation } from '../i18n';
import FountainCard from './FountainCard';
import './FountainsList.css';

export type FountainsListProps = {
  fountains: Fountain[];
  title?: string;
  subtitle?: string;
  onFountainClick: (fountain: Fountain) => void;
};

function FountainsList({
  fountains,
  title,
  subtitle,
  onFountainClick,
}: FountainsListProps) {
  const t = useTranslation();
  
  return (
    <div className="fountains-list">
      <div className="fountains-list__header">
        <h2 className="fountains-list__title">{title || t.closestFountains}</h2>
        <p className="fountains-list__subtitle">{subtitle || t.findClosestFountains}</p>
      </div>
      <div className="fountains-list__items">
        {fountains.map((fountain) => (
          <FountainCard
            key={fountain.id}
            fountain={fountain}
            onClick={() => onFountainClick(fountain)}
          />
        ))}
      </div>
    </div>
  );
}

export default FountainsList;
