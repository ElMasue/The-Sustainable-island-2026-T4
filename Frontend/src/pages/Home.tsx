import { useState } from 'react';
import {
  BottomSheet,
  FountainDetail,
  FountainsList,
  Map,
  ProfileMenu,
  RefillSearchBar,
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
