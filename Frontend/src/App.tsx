import AppRoutes from './components/AppRoutes';
import './App.css';
import { useAppSettings } from './context/AppSettingsContext';
import { useEffect } from 'react';

function App() {
  const { darkMode } = useAppSettings();

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  return <AppRoutes />;
}

export default App;
