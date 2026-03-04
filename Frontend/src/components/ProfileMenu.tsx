import { useNavigate } from 'react-router-dom';
import { MenuItem } from './';
import './ProfileMenu.css';
import { useAuth } from '../context/AuthContext';
import { useAppSettings } from '../context/AppSettingsContext';
import { useState } from 'react';

interface ProfileMenuProps {
  onClose?: () => void;
}

function ProfileMenu({ onClose }: ProfileMenuProps) {
  const navigate = useNavigate();
  const { isLoggedIn, logout, fullName, user, updateProfile } = useAuth();
  const { language, darkMode, toggleLanguage, toggleDarkMode } = useAppSettings();
  const [showSettings, setShowSettings] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [savingName, setSavingName] = useState(false);

  const handleAuthClick = () => {
    if (isLoggedIn) {
      logout();
      onClose?.();
    } else {
      navigate('/signup');
      onClose?.();
    }
  };

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    setSavingName(true);
    try {
      await updateProfile(nameInput.trim());
      setEditingName(false);
    } catch (err) {
      console.error('Failed to update profile', err);
    } finally {
      setSavingName(false);
    }
  };

  const openSettings = () => setShowSettings(true);
  const backToMenu = () => setShowSettings(false);
  return (
    <div className="profile-menu">
      <div className="profile-menu-header">
        {showSettings ? (
          <div className="settings-header">
            <button className="back-button" onClick={backToMenu}>&larr;</button>
            <span className="settings-title">Settings</span>
          </div>
        ) : (
          <div className="profile-user-section">
            <div className="user-avatar">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div className="user-info">
              {editingName ? (
                <div className="user-name-edit">
                  <input
                    className="user-name-input"
                    autoFocus
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false); }}
                    placeholder="Full name"
                  />
                  <button className="name-save-btn" onClick={handleSaveName} disabled={savingName}>
                    {savingName ? '…' : '✓'}
                  </button>
                  <button className="name-cancel-btn" onClick={() => setEditingName(false)}>✕</button>
                </div>
              ) : (
                <div className="user-name-row">
                  <h2 className="user-name">{fullName ?? (isLoggedIn ? user?.email : 'Guest')}</h2>
                  {isLoggedIn && (
                    <button
                      className="name-edit-btn"
                      title="Edit name"
                      onClick={() => { setNameInput(fullName ?? ''); setEditingName(true); }}
                    >
                      ✎
                    </button>
                  )}
                </div>
              )}
              {isLoggedIn && user?.email && fullName && (
                <p className="user-email">{user.email}</p>
              )}
              <div className="user-stats">
                <span>★ 100 Refills</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="profile-menu-content">
        {isLoggedIn && (
          <>
            <MenuItem
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5 2h14a1 1 0 0 1 1 1v19.143a.5.5 0 0 1-.766.424L12 18.03l-7.234 4.536A.5.5 0 0 1 4 22.143V3a1 1 0 0 1 1-1z"/>
                </svg>
              }
              title="Favorites"
              subtitle="Favorite Refill stations"
              onClick={() => {}}
            />

            <MenuItem
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                  <line x1="7" y1="7" x2="7.01" y2="7"></line>
                </svg>
              }
              title="Saved"
              subtitle="Find Saved Locations"
              onClick={() => {}}
            />
          </>
        )}

        {!showSettings && (
          <MenuItem
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94L14.4 2.81c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.62 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
              </svg>
            }
            title="Settings"
            onClick={openSettings}
          />
        )}

        {showSettings ? (
          <>
            <MenuItem
              icon={<span style={{ fontSize: 20 }}>{language.toUpperCase()}</span>}
              title="Language"
              subtitle={language === 'en' ? 'English' : 'Español'}
              onClick={toggleLanguage}
            />
            <MenuItem
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  {darkMode ? (
                    <path d="M12 3a9 9 0 0 0 0 18 9 9 0 0 0 0-18z" />
                  ) : (
                    <path d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.364-7.364l-1.414 1.414M6.05 17.95l-1.414 1.414m0-15.364l1.414 1.414M17.95 17.95l1.414 1.414" />
                  )}
                </svg>
              }
              title="Mode"
              subtitle={darkMode ? 'Dark' : 'Bright'}
              onClick={toggleDarkMode}
            />
          </>
        ) : (
          <MenuItem
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            }
            title={isLoggedIn ? 'Sign Out' : 'Sign Up'}
            onClick={handleAuthClick}
          />
        )}
      </div>
    </div>
  );
}

export default ProfileMenu;
