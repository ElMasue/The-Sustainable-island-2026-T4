import { useState, useEffect } from 'react';
import {
  BottomSheet,
  FountainDetail,
  FountainsList,
  Map,
  ProfileMenu,
  RefillSearchBar,
  UserButton,
} from '../components';
// remove mock data import – real data will be fetched from backend
import type { Fountain } from '../types/fountain';
import './Home.css';

type SheetContent = 'list' | 'detail' | 'profile';

function Home() {
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

  return (
    <div className="home">
      <RefillSearchBar value={searchQuery} onChange={setSearchQuery} />
      <UserButton onClick={handleUserClick} />
      <Map
        fountains={fountains}
        selectedFountain={selectedFountain}
        onMapClick={handleMapClick}
      />

      <BottomSheet
        snapPoints={[28, 60, 90]}
        defaultSnap={currentSnap}
        onSnapChange={handleSheetSnapChange}
      >
        {sheetContent === 'list' ? (
          <FountainsList fountains={fountains} onFountainClick={handleFountainClick} />
        ) : sheetContent === 'detail' ? (
          selectedFountain && <FountainDetail fountain={selectedFountain} />
        ) : (
          <ProfileMenu onClose={() => setSheetContent('list')} />
        )}
      </BottomSheet>
    </div>
  );
}

export default Home;
