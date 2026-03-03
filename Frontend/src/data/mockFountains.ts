import type { Fountain } from '../types/fountain';

export const mockFountains: Fountain[] = [
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
