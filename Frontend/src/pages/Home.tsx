import { useState } from 'react';
import { Map, BottomSheet, FountainCard, FountainDetail, ProfileMenu } from '../components';
import type { Fountain } from '../types/fountain';
import './Home.css';

// Mock data - will fetch from backend later
const mockFountains: Fountain[] = [
  {
    id: 1,
    name: "Starbucks Water Fountain",
    latitude: 28.1235,
    longitude: -15.4363,
    description: 'High quality filtered water fountain located at the entrance',
    isOperational: true,
    distance: '1.8 km Away',
    rating: 4.8,
    isFree: true,
    category: 'Popular',
    imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
    images: [
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
      'https://images.unsplash.com/photo-1541544181051-e46607bc22e4?w=400'
    ]
  },
  {
    id: 2,
    name: "Joe's Park Water Fountain",
    latitude: 28.1350,
    longitude: -15.4300,
    description: 'Natural spring water fountain in the park',
    isOperational: true,
    distance: '5.2 km Away',
    rating: 4.8,
    isFree: true,
    imageUrl: 'https://images.unsplash.com/photo-1541672052-eebcb6aee4fc?w=400'
  },
  {
    id: 3,
    name: 'Steves backyard stream',
    latitude: 28.1320,
    longitude: -15.4250,
    description: 'Private backyard natural stream water source',
    isOperational: true,
    distance: '2.5 km Away',
    rating: 4.8,
    isFree: true,
    imageUrl: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=400'
  },
  {
    id: 4,
    name: 'No mans land',
    latitude: 28.1380,
    longitude: -15.4280,
    description: 'Remote location water source',
    isOperational: false,
    distance: '8.1 km Away',
    rating: 3.5,
    isFree: false,
    imageUrl: 'https://images.unsplash.com/photo-1516410529446-2c777ec549ce?w=400'
  }
];

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
    // Expand the bottom sheet to show detail
    setCurrentSnap(1);
  };

  const handleSheetSnapChange = (snapIndex: number) => {
    setCurrentSnap(snapIndex);
    // Si el sheet se minimiza, volver a mostrar la lista
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
    // Minimizar el bottom sheet al hacer clic en el mapa
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
    setCurrentSnap(1); // Expandir al tamaño medio
  };

  return (
    <div className="home">
      <div className="search-container-floating">
        <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <input 
          type="text" 
          className="search-input" 
          placeholder="Find a Refill Station"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="user-container-floating" onClick={handleUserClick}>
        <svg className="user-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      </div>
      <Map fountains={fountains} selectedFountain={selectedFountain} onMapClick={handleMapClick} />
      
      <BottomSheet 
        snapPoints={[28, 60, 90]} 
        defaultSnap={currentSnap}
        onSnapChange={handleSheetSnapChange}
      >
        {sheetContent === 'list' ? (
          <div className="fountains-list">
            <div className="list-header">
              <h2 className="list-title">Closest Fountains</h2>
              <p className="list-subtitle">Find the closest water fountains</p>
            </div>
            <div className="list-items">
              {fountains.map((fountain) => (
                <FountainCard
                  key={fountain.id}
                  fountain={fountain}
                  onClick={() => handleFountainClick(fountain)}
                />
              ))}
            </div>
          </div>
        ) : sheetContent === 'detail' ? (
          selectedFountain && (
            <FountainDetail fountain={selectedFountain} />
          )
        ) : (
          <ProfileMenu onClose={() => setSheetContent('list')} />
        )}
      </BottomSheet>
    </div>
  );
}

export default Home;
