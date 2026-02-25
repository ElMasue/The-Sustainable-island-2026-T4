import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import './BottomSheet.css';

interface BottomSheetProps {
  children: ReactNode;
  snapPoints?: number[]; // Porcentajes de altura: [minimizado, medio, completo]
  defaultSnap?: number; // Índice del snap point inicial
  onSnapChange?: (snapIndex: number) => void;
}

function BottomSheet({ 
  children, 
  snapPoints = [15, 50, 90], 
  defaultSnap = 0,
  onSnapChange 
}: BottomSheetProps) {
  const [currentSnap, setCurrentSnap] = useState(defaultSnap);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Update snap when defaultSnap prop changes
  useEffect(() => {
    setCurrentSnap(defaultSnap);
  }, [defaultSnap]);

  const height = isDragging 
    ? Math.max(10, Math.min(95, snapPoints[currentSnap] + ((startY - currentY) / window.innerHeight) * 100))
    : snapPoints[currentSnap];

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    setCurrentY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setCurrentY(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const dragDistance = startY - currentY;
    const dragPercentage = (dragDistance / window.innerHeight) * 100;
    const newHeight = snapPoints[currentSnap] + dragPercentage;

    // Encuentra el snap point más cercano
    let closestSnapIndex = 0;
    let minDistance = Math.abs(newHeight - snapPoints[0]);

    snapPoints.forEach((snap, index) => {
      const distance = Math.abs(newHeight - snap);
      if (distance < minDistance) {
        minDistance = distance;
        closestSnapIndex = index;
      }
    });

    setCurrentSnap(closestSnapIndex);
    onSnapChange?.(closestSnapIndex);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartY(e.clientY);
    setCurrentY(e.clientY);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    setCurrentY(e.clientY);
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    const dragDistance = startY - currentY;
    const dragPercentage = (dragDistance / window.innerHeight) * 100;
    const newHeight = snapPoints[currentSnap] + dragPercentage;

    let closestSnapIndex = 0;
    let minDistance = Math.abs(newHeight - snapPoints[0]);

    snapPoints.forEach((snap, index) => {
      const distance = Math.abs(newHeight - snap);
      if (distance < minDistance) {
        minDistance = distance;
        closestSnapIndex = index;
      }
    });

    setCurrentSnap(closestSnapIndex);
    onSnapChange?.(closestSnapIndex);
  }, [isDragging, startY, currentY, snapPoints, currentSnap, onSnapChange]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div 
      ref={sheetRef}
      className={`bottom-sheet ${isDragging ? 'dragging' : ''}`}
      style={{ height: `${height}vh` }}
    >
      <div 
        className="bottom-sheet-handle"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
      >
        <div className="handle-bar"></div>
      </div>
      <div className="bottom-sheet-content">
        {children}
      </div>
    </div>
  );
}

export default BottomSheet;
