import { useState } from 'react';
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
import { mockFountains } from '../data/mockFountains';
import type { Fountain } from '../types/fountain';
import './Home.css';

type SheetContent = 'list' | 'detail' | 'profile';

function Home() {
  const [fountains] = useState<Fountain[]>(mockFountains);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFountain, setSelectedFountain] = useState<Fountain | null>(null);
  const [sheetContent, setSheetContent] = useState<SheetContent>('list');
  const [currentSnap, setCurrentSnap] = useState(0);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);

  const handleFountainClick = (fountain: Fountain) => {
    setSelectedFountain(fountain);
    setSheetContent('detail');
    setCurrentSnap(1);
  };

  const handleSheetSnapChange = (snapIndex: number) => {
    setCurrentSnap(snapIndex);
    if (snapIndex === 0) {
      if (sheetContent === 'detail') {
        setSheetContent('list');
        setSelectedFountain(null);
      } else if (sheetContent === 'profile') {
        setSheetContent('list');
      }
    }
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
        selectedFountain && <FountainDetail fountain={selectedFountain} />
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
        <UserButton onClick={handleUserClick} />
      </div>

      {/* Desktop: Side panel with search, user button, and content */}
      <SidePanel isCollapsed={isPanelCollapsed}>
        <div className="home__desktop-header">
          <div className="home__desktop-header-top">
            <h1 className="home__desktop-title">Refill</h1>
            <UserButton onClick={handleUserClick} />
          </div>
          <RefillSearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>
        {sheetContent === 'detail' && (
          <button className="home__back-button" onClick={handleBackToList}>
            ← Back to list
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
        aria-label={isPanelCollapsed ? 'Show panel' : 'Hide panel'}
        title={isPanelCollapsed ? 'Show panel' : 'Hide panel'}
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
        snapPoints={[28, 60, 90]}
        defaultSnap={currentSnap}
        onSnapChange={handleSheetSnapChange}
      >
        {panelContent}
      </BottomSheet>
    </div>
  );
}

export default Home;
