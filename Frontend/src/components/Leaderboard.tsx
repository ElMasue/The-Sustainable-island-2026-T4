import { useState, useEffect } from 'react';
import { useTranslation } from '../i18n';
import './Leaderboard.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

interface LeaderboardEntry {
  userId: string;
  refillCount: number;
  displayName: string | null;
  avatarUrl: string | null;
}

export function Leaderboard() {
  const t = useTranslation();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE}/api/refills/leaderboard?limit=15`);
        if (!response.ok) throw new Error('Failed to fetch leaderboard');
        const data = await response.json();
        setLeaderboard(data);
      } catch (err) {
        console.error('Leaderboard error:', err);
        setError(t.error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [t.error]);

  if (loading) {
    return (
      <div className="leaderboard-loader">
        <div className="spinner" />
      </div>
    );
  }

  if (error) {
    return <div className="leaderboard-error">{error}</div>;
  }

  const displayedEntries = expanded ? leaderboard : leaderboard.slice(0, 5);

  return (
    <div className="leaderboard">
      <div className="leaderboard-header">
        <h3 className="leaderboard-title">{t.topRefills}</h3>
      </div>
      
      <div className="leaderboard-list">
        {displayedEntries.map((user, index) => (
          <div key={user.userId} className={`leaderboard-item rank-${index + 1}`}>
            <div className="leaderboard-rank">
              {index < 3 ? (
                <span className="rank-medal">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                </span>
              ) : (
                `#${index + 1}`
              )}
            </div>
            
            <div className="leaderboard-user">
              <div className="leaderboard-avatar">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" referrerPolicy="no-referrer" />
                ) : (
                  <div className="avatar-placeholder">
                    {user.displayName?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
              <span className="leaderboard-name">{user.displayName || t.guest}</span>
            </div>
            
            <div className="leaderboard-count">
              <span className="count-value">{user.refillCount}</span>
              <span className="count-label">{user.refillCount === 1 ? t.refillSingle : t.refills}</span>
            </div>
          </div>
        ))}
      </div>

      {leaderboard.length > 5 && (
        <button 
          className="leaderboard-toggle"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? t.showLess : t.showMore}
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            className={expanded ? 'rotate-180' : ''}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      )}
    </div>
  );
}
