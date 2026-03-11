import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BottomSheet,
  FountainDetail,
  FountainsList,
  Map,
  ProfileMenu,
  RefillSearchBar,
  SidePanel,
  UserButton,
} from '../components';
import type { Fountain } from '../types/fountain';
import { useAuth } from '../context/AuthContext';
import './Home.css';

type SheetContent = 'list' | 'detail' | 'profile';

function Home() {
  const navigate = useNavigate();
  const { avatarUrl } = useAuth();
  const [fountains, setFountains] = useState<Fountain[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFountain, setSelectedFountain] = useState<Fountain | null>(null);

  // fetch list from backend
  // fall back to localhost:3000 if the env var isn't set (avoids hitting Vite's own server)
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';



  useEffect(() => {
    fetch(`${API_BASE}/api/fountains`)
      .then((res) => {
        console.log('api response status', res.status);
        return res.json();
      })
      .then((data: Fountain[]) => {
        console.log('fountains fetched', data);
        setFountains(data);
      })
      .catch((err) => {
        console.error('failed to load fountains', err);
      });
  }, [API_BASE]);
  const [sheetContent, setSheetContent] = useState<SheetContent>('list');
  const [currentSnap, setCurrentSnap] = useState(0);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);

  const handleFountainClick = (fountain: Fountain) => {
    setSelectedFountain(fountain);
    setSheetContent('detail');
    setCurrentSnap(0);
  };

  const handleSheetSnapChange = (snapIndex: number) => {
    setCurrentSnap(snapIndex);
  };

  const handleMapClick = () => {
    setCurrentSnap(0);
    if (sheetContent === 'detail') {
      setSheetContent('list');
      setSelectedFountain(null);
    } else if (sheetContent === 'profile') {
      setSheetContent('list');
    }
  };

  const handleUserClick = () => {
    setSheetContent('profile');
    setCurrentSnap(1);
  };

  const handleBackToList = () => {
    setSheetContent('list');
    setSelectedFountain(null);
    setCurrentSnap(0);
  };

  const panelContent = (
    <>
      {sheetContent === 'list' ? (
        <FountainsList fountains={fountains} onFountainClick={handleFountainClick} />
      ) : sheetContent === 'detail' ? (
        selectedFountain && <FountainDetail fountain={selectedFountain} onBack={handleBackToList} />
      ) : (
        <ProfileMenu onClose={() => setSheetContent('list')} />
      )}
    </>
  );

  return (
    <div className={`home ${isPanelCollapsed ? 'home--panel-collapsed' : ''}`}>
      {/* Mobile: Search bar and user button floating on map */}
      <div className="home__mobile-header">
        <RefillSearchBar value={searchQuery} onChange={setSearchQuery} />
        <UserButton onClick={handleUserClick} avatarUrl={avatarUrl} />
      </div>

      {/* Desktop: Side panel with search, user button, and content */}
      <SidePanel isCollapsed={isPanelCollapsed}>
        <div className="home__desktop-header">
          <div className="home__desktop-header-top">
            <h1 className="home__desktop-title">Nuevo nombre</h1>
            <UserButton onClick={handleUserClick} avatarUrl={avatarUrl} />
          </div>
          <RefillSearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>
        {sheetContent === 'profile' && (
          <button className="home__back-button" onClick={handleBackToList}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to list
          </button>
        )}
        <div className="home__desktop-content">
          {panelContent}
        </div>
      </SidePanel>

      {/* Desktop: Toggle panel button (always visible, outside panel) */}
      <button
        className="panel-toggle-btn"
        onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
        aria-label={isPanelCollapsed ? 'Expand side panel' : 'Collapse side panel'}
        title={isPanelCollapsed ? 'Expand side panel' : 'Collapse side panel'}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          {isPanelCollapsed ? (
            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          ) : (
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          )}
        </svg>
      </button>

      {/* Map */}
      <Map
        fountains={fountains}
        selectedFountain={selectedFountain}
        onMapClick={handleMapClick}
      />

      {/* Mobile: Bottom sheet */}
      <BottomSheet
        snapPoints={[35, 60, 90]}
        defaultSnap={currentSnap}
        onSnapChange={handleSheetSnapChange}
      >
        {panelContent}
      </BottomSheet>

      {/* Floating Action Button for adding new site */}
      <button
        className="add-site-fab"
        onClick={() => navigate('/add-site')}
        aria-label="Add new site"
        title="Add new site"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>
    </div>
  );
}

export default Home;
