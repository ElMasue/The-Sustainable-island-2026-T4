import { useNavigate } from 'react-router-dom';
import { MenuItem } from './';
import './ProfileMenu.css';
import { useAuth } from '../context/AuthContext';
import { useAppSettings } from '../context/AppSettingsContext';
import { useTranslation } from '../i18n';
import { useState, useRef, useEffect } from 'react';
import type { SupportedLanguage } from '../services/translationService';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

interface Interaction {
  fountainId: string;
  fountainName: string | null;
  fountainLat: number | null;
  fountainLon: number | null;
  createdAt: string;
}

interface ProfileMenuProps {
  onClose?: () => void;
  onSelectFountain?: (fountain: any) => void;
}

function ProfileMenu({ onClose, onSelectFountain }: ProfileMenuProps) {
  const navigate = useNavigate();
  const { isLoggedIn, logout, fullName, user, updateProfile, avatarUrl, uploadAvatar } = useAuth();
  const { language, darkMode, setLanguage, toggleDarkMode } = useAppSettings();
  const t = useTranslation();
  
  type ViewState = 'main' | 'settings' | 'language' | 'favorites' | 'saved';
  const [view, setView] = useState<ViewState>('main');
  
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [interactionList, setInteractionList] = useState<Interaction[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [refillCount, setRefillCount] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Email users can change their avatar; OAuth users (Google/Apple) keep their provider photo
  const isEmailUser = user?.app_metadata?.provider === 'email';

  const languageNames: Record<SupportedLanguage, string> = {
    en: 'English',
    es: 'Español',
    da: 'Dansk',
    is: 'Íslenska',
  };

  const languageEmojis: Record<SupportedLanguage, string> = {
    en: '🇬🇧',
    es: '🇪🇸',
    da: '🇩🇰',
    is: '🇮🇸',
  };

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

  const handleAvatarClick = () => {
    if (isEmailUser && !uploadingAvatar) fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Max 5 MB guard
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError(t.imageTooBig);
      return;
    }
    setAvatarError(null);
    setUploadingAvatar(true);
    try {
      await uploadAvatar(file);
    } catch (err) {
      console.error('Avatar upload failed', err);
      setAvatarError((err as Error).message || t.uploadFailed);
    } finally {
      setUploadingAvatar(false);
      // Reset so same file can be picked again
      e.target.value = '';
    }
  };

  const openSettings = () => setView('settings');
  const openLanguageMenu = () => setView('language');
  const openFavorites = () => setView('favorites');
  const openSaved = () => setView('saved');

  const backToMenu = () => {
    setView('main');
  };
  
  const selectLanguage = (lang: SupportedLanguage) => {
    setLanguage(lang);
    setView('settings'); // Go back to settings after selecting language
  };

  useEffect(() => {
    const fetchInteractions = async () => {
      if (!user || (view !== 'favorites' && view !== 'saved')) return;
      
      const type = view === 'favorites' ? 'favorite' : 'save';
      setLoadingList(true);
      try {
        const response = await fetch(`${API_BASE}/api/interactions/${type}?userId=${user.id}`);
        if (!response.ok) throw new Error(`Failed to fetch ${type}s`);
        const data = await response.json();
        setInteractionList(data);
      } catch (err) {
        console.error(`Error fetching ${type}s:`, err);
      } finally {
        setLoadingList(false);
      }
    };
    
    fetchInteractions();
  }, [view, user]);

  useEffect(() => {
    if (!user) return;
    
    const fetchRefillCount = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/refills/count/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setRefillCount(data.count);
        }
      } catch (err) {
        console.error('Error fetching refill count:', err);
      }
    };
    
    fetchRefillCount();
  }, [user]);

  
  return (
    <div className="profile-menu">
      <div className="profile-menu-header">
        {view !== 'main' ? (
          <div className="settings-header">
            <span className="settings-title">
              {view === 'language' ? t.language : 
               view === 'settings' ? t.settings : 
               view === 'favorites' ? t.favorites : t.saved}
            </span>
            <button className="profile-back-button" onClick={backToMenu}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              <span>{t.back}</span>
            </button>
          </div>
        ) : (
          <div className="profile-main-header">
            <div className="profile-user-section">
              <div
                className={`user-avatar${isEmailUser ? ' user-avatar--editable' : ''}`}
                onClick={handleAvatarClick}
                title={isEmailUser ? t.clickToChangePhoto : undefined}
              >
              {uploadingAvatar ? (
                <span className="avatar-spinner" />
              ) : avatarUrl ? (
                <img src={avatarUrl} alt="Profile" className="user-avatar__img" referrerPolicy="no-referrer" />
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              )}
              {isEmailUser && !uploadingAvatar && (
                <span className="avatar-camera-overlay" aria-hidden>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 15.2A3.2 3.2 0 1 1 12 8.8a3.2 3.2 0 0 1 0 6.4zm7-11.2h-2.618l-1.256-1.88A1 1 0 0 0 14.268 2H9.732a1 1 0 0 0-.858.485L7.618 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/>
                  </svg>
                </span>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                style={{ display: 'none' }}
                onChange={handleAvatarChange}
              />
            </div>
            {avatarError && <p className="avatar-error">{avatarError}</p>}
            <div className="user-info">
              {editingName ? (
                <div className="user-name-edit">
                  <input
                    className="user-name-input"
                    autoFocus
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false); }}
                    placeholder={t.fullName}
                  />
                  <button className="name-save-btn" onClick={handleSaveName} disabled={savingName}>
                    {savingName ? '…' : '✓'}
                  </button>
                  <button className="name-cancel-btn" onClick={() => setEditingName(false)}>✕</button>
                </div>
              ) : (
                <div className="user-name-row">
                  <h2 className="user-name">{fullName ?? (isLoggedIn ? user?.email : t.guest)}</h2>
                  {isLoggedIn && (
                    <button
                      className="name-edit-btn"
                      title={t.editProfile}
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
                <span>
                  {refillCount === 0 
                    ? t.noRefillsYet 
                    : `${refillCount} ${refillCount === 1 ? t.refillSingle : t.refills}`}
                </span>
              </div>
            </div>
            </div>
            <button className="profile-close-button" onClick={onClose} title={t.close}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        )}
      </div>

      <div className="profile-menu-content">
        {view === 'language' ? (
          <>
            {(['en', 'es', 'da', 'is'] as SupportedLanguage[]).map((lang) => (
              <MenuItem
                key={lang}
                icon={<span style={{ fontSize: 24 }}>{languageEmojis[lang]}</span>}
                title={languageNames[lang]}
                subtitle={lang === language ? t.selected : ''}
                onClick={() => selectLanguage(lang)}
              />
            ))}
          </>
        ) : view === 'favorites' || view === 'saved' ? (
          <div className="interaction-list-container" style={{ padding: '0 1rem' }}>
            {loadingList ? (
              <p style={{ textAlign: 'center', padding: '1rem', color: '#666' }}>{t.loading}...</p>
            ) : interactionList.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                {view === 'favorites' ? 'No favorited fountains yet.' : 'No saved fountains yet.'}
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                {interactionList.map((item) => (
                  <div key={item.fountainId} className="interaction-menu-item" style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '0.875rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }} onClick={() => {
                    const fountain = {
                      id: item.fountainId,
                      name: item.fountainName || 'Unnamed Fountain',
                      latitude: item.fountainLat || 0,
                      longitude: item.fountainLon || 0,
                      isOperational: true // Default for list view
                    };
                    onSelectFountain?.(fountain);
                  }}>
                    <div style={{ overflow: 'hidden' }}>
                      <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#333' }}>
                        {item.fountainName || 'Unnamed Fountain'}
                      </h4>
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#888' }}>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {view === 'favorites' ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="#ff4081" stroke="none">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="#ffd600" stroke="none">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : isLoggedIn && view === 'main' ? (
          <>

            <MenuItem
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#ff4081" stroke="none">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              }
              title={t.favorites}
              subtitle={t.favoriteRefillStations}
              onClick={openFavorites}
            />

            <MenuItem
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffd600" stroke="none">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                </svg>
              }
              title={t.saved}
              subtitle={t.findSavedLocations}
              onClick={openSaved}
            />

            <MenuItem
              icon={
                <svg width="20" height="20" viewBox="0 2 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
              }
              title="My Fountains"
              subtitle="Edit or delete your created fountains"
              onClick={() => {
                navigate('/my-fountains');
                onClose?.();
              }}
            />
          </>
        ) : null}

        {view === 'main' && (
          <MenuItem
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94L14.4 2.81c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.62 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
              </svg>
            }
            title={t.settings}
            onClick={openSettings}
          />
        )}

        {view === 'settings' ? (
          <>
            <MenuItem
              icon={<span style={{ fontSize: 24 }}>{languageEmojis[language]}</span>}
              title={t.language}
              subtitle={languageNames[language]}
              onClick={openLanguageMenu}
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
              title={t.darkMode}
              subtitle={darkMode ? t.dark : t.bright}
              onClick={toggleDarkMode}
            />
          </>
        ) : view === 'main' ? (
          <MenuItem
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            }
            title={isLoggedIn ? t.signOut : t.signUp}
            onClick={handleAuthClick}
          />
        ) : null}
      </div>
    </div>
  );
}

export default ProfileMenu;
