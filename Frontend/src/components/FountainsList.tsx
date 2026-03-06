import type { Fountain } from '../types/fountain';
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
  title = 'Closest Fountains',
  subtitle = 'Find the closest water fountains',
  onFountainClick,
}: FountainsListProps) {
  return (
    <div className="fountains-list">
      <div className="fountains-list__header">
        <h2 className="fountains-list__title">{title}</h2>
        <p className="fountains-list__subtitle">{subtitle}</p>
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
