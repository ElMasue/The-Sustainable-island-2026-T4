import type { SupportedLanguage } from '../services/translationService';

export interface Translations {
  // FountainDetail
  rateWaterQuality: string;
  rateWaterQualitySubtitle: string;
  ratingBad: string;
  ratingPoor: string;
  ratingOk: string;
  ratingGood: string;
  ratingExcellent: string;
  waterQualityAverage: string;
  basedOnRatings: string;
  yourRating: string;
  signInToRate: string;
  description: string;
  distance: string;
  free: string;
  paid: string;
  
  // Categories
  categoryFountain: string;
  categoryBottleRefillStation: string;
  categoryPublicTap: string;
  categoryEstablishment: string;
  
  // Fountains List
  closestFountains: string;
  findClosestFountains: string;
  
  // Search
  findRefillStation: string;
  
  // Auth
  signIn: string;
  signUp: string;
  emailAddress: string;
  password: string;
  enterEmail: string;
  enterPassword: string;
  continue: string;
  dontHaveAccount: string;
  createAccount: string;
  alreadyHaveAccount: string;
  fullName: string;
  enterFullName: string;
  
  // Profile Menu
  settings: string;
  language: string;
  darkMode: string;
  profile: string;
  logout: string;
  signOut: string;
  editProfile: string;
  changeAvatar: string;
  saveName: string;
  favorites: string;
  favoriteRefillStations: string;
  saved: string;
  findSavedLocations: string;
  dark: string;
  bright: string;
  selected: string;
  guest: string;
  refills: string;
  clickToChangePhoto: string;
  
  // Map
  goToMyLocation: string;
  locating: string;
  located: string;
  notLocated: string;
  enableLocation: string;
  locationDenied: string;
  operational: string;
  notOperational: string;
  
  // User
  openProfile: string;
  
  // Social
  signInWithGoogle: string;
  signInWithApple: string;
  
  // Common
  cancel: string;
  save: string;
  close: string;
  search: string;
  or: string;
  
  // Errors
  imageTooBig: string;
  uploadFailed: string;
  loading: string;
  error: string;
}

export const translations: Record<SupportedLanguage, Translations> = {
  en: {
    // FountainDetail
    rateWaterQuality: 'Rate the water quality',
    rateWaterQualitySubtitle: 'Your feedback helps us improve the water quality.',
    ratingBad: 'Bad',
    ratingPoor: 'Poor',
    ratingOk: 'OK',
    ratingGood: 'Good',
    ratingExcellent: 'Excellent',
    waterQualityAverage: 'Water Quality',
    basedOnRatings: 'ratings',
    yourRating: 'Your rating',
    signInToRate: 'Sign in to rate',
    description: 'Description',
    distance: 'Distance',
    free: 'Free',
    paid: 'Paid',
    
    // Categories
    categoryFountain: 'Fountain',
    categoryBottleRefillStation: 'Bottle Refill Station',
    categoryPublicTap: 'Public Tap',
    categoryEstablishment: 'Establishment',
    
    // Fountains List
    closestFountains: 'Closest Fountains',
    findClosestFountains: 'Find the closest water fountains',
    
    // Search
    findRefillStation: 'Find refill station',
    
    // Auth
    signIn: 'Sign In',
    signUp: 'Sign Up',
    emailAddress: 'Email Address',
    password: 'Password',
    enterEmail: 'Enter email address',
    enterPassword: 'Enter password',
    continue: 'Continue',
    dontHaveAccount: "Don't have an account?",
    createAccount: 'Create Account',
    alreadyHaveAccount: 'Already have an account?',
    fullName: 'Full Name',
    enterFullName: 'Enter your full name',
    
    // Profile Menu
    settings: 'Settings',
    language: 'Language',
    darkMode: 'Dark Mode',
    profile: 'Profile',
    logout: 'Logout',
    signOut: 'Sign Out',
    editProfile: 'Edit Profile',
    changeAvatar: 'Change Avatar',
    saveName: 'Save Name',
    favorites: 'Favorites',
    favoriteRefillStations: 'Favorite Refill stations',
    saved: 'Saved',
    findSavedLocations: 'Find Saved Locations',
    dark: 'Dark',
    bright: 'Bright',
    selected: '✓ Selected',
    guest: 'Guest',
    refills: 'Refills',
    clickToChangePhoto: 'Click to change photo',
    
    // Map
    goToMyLocation: 'Go to my location',
    locating: 'Locating...',
    located: 'Located',
    notLocated: 'Location unavailable',
    enableLocation: 'Enable location',
    locationDenied: 'Location permission denied',
    operational: 'Operational',
    notOperational: 'Not operational',
    
    // User
    openProfile: 'Open profile',
    
    // Social
    signInWithGoogle: 'Sign in with Google',
    signInWithApple: 'Sign in with Apple',
    
    // Common
    cancel: 'Cancel',
    save: 'Save',
    close: 'Close',
    search: 'Search',
    or: 'Or',
    
    // Errors
    imageTooBig: 'Image must be under 5 MB',
    uploadFailed: 'Upload failed',
    loading: 'Loading...',
    error: 'Error',
  },
  
  es: {
    // FountainDetail
    rateWaterQuality: 'Califica la calidad del agua',
    rateWaterQualitySubtitle: 'Tu opinión nos ayuda a mejorar la calidad del agua.',
    ratingBad: 'Mala',
    waterQualityAverage: 'Calidad del agua',
    basedOnRatings: 'calificaciones',
    yourRating: 'Tu calificación',
    signInToRate: 'Inicia sesión para calificar',
    ratingPoor: 'Regular',
    ratingOk: 'Aceptable',
    ratingGood: 'Buena',
    ratingExcellent: 'Excelente',
    description: 'Descripción',
    distance: 'Distancia',
    free: 'Gratis',
    paid: 'De pago',
    
    // Categories
    categoryFountain: 'Fuente',
    categoryBottleRefillStation: 'Estación de recarga de botellas',
    categoryPublicTap: 'Grifo público',
    categoryEstablishment: 'Establecimiento',
    
    // Fountains List
    closestFountains: 'Fuentes más cercanas',
    findClosestFountains: 'Encuentra las fuentes de agua más cercanas',
    
    // Search
    findRefillStation: 'Buscar estación de recarga',
    
    // Auth
    signIn: 'Iniciar sesión',
    signUp: 'Registrarse',
    emailAddress: 'Correo electrónico',
    password: 'Contraseña',
    enterEmail: 'Ingresa tu correo electrónico',
    enterPassword: 'Ingresa tu contraseña',
    continue: 'Continuar',
    dontHaveAccount: '¿No tienes una cuenta?',
    createAccount: 'Crear cuenta',
    alreadyHaveAccount: '¿Ya tienes una cuenta?',
    fullName: 'Nombre completo',
    enterFullName: 'Ingresa tu nombre completo',
    
    // Profile Menu
    settings: 'Configuración',
    language: 'Idioma',
    darkMode: 'Modo oscuro',
    profile: 'Perfil',
    logout: 'Cerrar sesión',
    signOut: 'Cerrar sesión',
    editProfile: 'Editar perfil',
    changeAvatar: 'Cambiar avatar',
    saveName: 'Guardar nombre',
    favorites: 'Favoritos',
    favoriteRefillStations: 'Estaciones de recarga favoritas',
    saved: 'Guardados',
    findSavedLocations: 'Encuentra ubicaciones guardadas',
    dark: 'Oscuro',
    bright: 'Claro',
    selected: '✓ Seleccionado',
    guest: 'Invitado',
    refills: 'Recargas',
    clickToChangePhoto: 'Click para cambiar foto',
    
    // Map
    goToMyLocation: 'Ir a mi ubicación',
    locating: 'Ubicando...',
    located: 'Ubicado',
    notLocated: 'Ubicación no disponible',
    enableLocation: 'Activar ubicación',
    locationDenied: 'Permiso de ubicación denegado',
    operational: 'Operativo',
    notOperational: 'No operativo',
    
    // User
    openProfile: 'Abrir perfil',
    
    // Social
    signInWithGoogle: 'Iniciar sesión con Google',
    signInWithApple: 'Iniciar sesión con Apple',
    
    // Common
    cancel: 'Cancelar',
    save: 'Guardar',
    close: 'Cerrar',
    search: 'Buscar',
    or: 'O',
    
    // Errors
    imageTooBig: 'La imagen debe ser menor a 5 MB',
    uploadFailed: 'Error al subir',
    loading: 'Cargando...',
    error: 'Error',
  },
  
  da: {
    // FountainDetail (Danish)
    rateWaterQuality: 'Bedøm vandkvaliteten',
    rateWaterQualitySubtitle: 'Din feedback hjælper os med at forbedre vandkvaliteten.',
    ratingBad: 'Dårlig',
    waterQualityAverage: 'Vandkvalitet',
    basedOnRatings: 'bedømmelser',
    yourRating: 'Din bedømmelse',
    signInToRate: 'Log ind for at bedømme',
    ratingPoor: 'Ringe',
    ratingOk: 'OK',
    ratingGood: 'God',
    ratingExcellent: 'Fremragende',
    description: 'Beskrivelse',
    distance: 'Afstand',
    free: 'Gratis',
    paid: 'Betalt',
    
    // Categories
    categoryFountain: 'Fontæne',
    categoryBottleRefillStation: 'Flaskegenopfyldningsstation',
    categoryPublicTap: 'Offentlig vandhane',
    categoryEstablishment: 'Etablissement',
    
    // Fountains List
    closestFountains: 'Nærmeste fontæner',
    findClosestFountains: 'Find de nærmeste vandfontæner',
    
    // Search
    findRefillStation: 'Find genopfyldningsstation',
    
    // Auth
    signIn: 'Log ind',
    signUp: 'Tilmeld',
    emailAddress: 'Email adresse',
    password: 'Adgangskode',
    enterEmail: 'Indtast email adresse',
    enterPassword: 'Indtast adgangskode',
    continue: 'Fortsæt',
    dontHaveAccount: 'Har du ikke en konto?',
    createAccount: 'Opret konto',
    alreadyHaveAccount: 'Har du allerede en konto?',
    fullName: 'Fulde navn',
    enterFullName: 'Indtast dit fulde navn',
    
    // Profile Menu
    settings: 'Indstillinger',
    language: 'Sprog',
    darkMode: 'Mørk tilstand',
    profile: 'Profil',
    logout: 'Log ud',
    signOut: 'Log ud',
    editProfile: 'Rediger profil',
    changeAvatar: 'Skift avatar',
    saveName: 'Gem navn',
    favorites: 'Favoritter',
    favoriteRefillStations: 'Favorit genopfyldningsstationer',
    saved: 'Gemt',
    findSavedLocations: 'Find gemte placeringer',
    dark: 'Mørk',
    bright: 'Lys',
    selected: '✓ Valgt',
    guest: 'Gæst',
    refills: 'Genopfyldninger',
    clickToChangePhoto: 'Klik for at ændre foto',
    
    // Map
    goToMyLocation: 'Gå til min placering',
    locating: 'Lokaliserer...',
    located: 'Lokaliseret',
    notLocated: 'Placering ikke tilgængelig',
    enableLocation: 'Aktiver placering',
    locationDenied: 'Placeringstilladelse nægtet',
    operational: 'Operationel',
    notOperational: 'Ikke operationel',
    
    // User
    openProfile: 'Åbn profil',
    
    // Social
    signInWithGoogle: 'Log ind med Google',
    signInWithApple: 'Log ind med Apple',
    
    // Common
    cancel: 'Annuller',
    save: 'Gem',
    close: 'Luk',
    search: 'Søg',
    or: 'Eller',
    
    // Errors
    imageTooBig: 'Billede skal være under 5 MB',
    uploadFailed: 'Upload mislykkedes',
    loading: 'Indlæser...',
    error: 'Fejl',
  },
  
  is: {
    // FountainDetail (Icelandic)
    rateWaterQuality: 'Metið vatnsgæðin',
    rateWaterQualitySubtitle: 'Álit þitt hjálpar okkur að bæta vatnsgæðin.',
    ratingBad: 'Slæmt',
    ratingPoor: 'Léleg',
    ratingOk: 'Í lagi',
    ratingGood: 'Gott',
    ratingExcellent: 'Frábært',
    description: 'Lýsing',
    distance: 'Fjarlægð',
    free: 'Ókeypis',
    paid: 'Greitt',
    
    // Categories
    categoryFountain: 'Lind',
    categoryBottleRefillStation: 'Áfyllingar stöð',
    categoryPublicTap: 'Opinber vatnstappi',
    categoryEstablishment: 'Staður',
    
    // Fountains List
    closestFountains: 'Næstu laugar',
    findClosestFountains: 'Finndu næstu vatnslaugar',
    
    // Search
    findRefillStation: 'Finna áfyllingarstöð',
    
    // Auth
    signIn: 'Skrá inn',
    signUp: 'Skrá sig',
    emailAddress: 'Netfang',
    password: 'Lykilorð',
    enterEmail: 'Sláðu inn netfang',
    enterPassword: 'Sláðu inn lykilorð',
    continue: 'Halda áfram',
    dontHaveAccount: 'Ertu ekki með reikning?',
    createAccount: 'Búa til reikning',
    alreadyHaveAccount: 'Ertu þegar með reikning?',
    fullName: 'Fullt nafn',
    enterFullName: 'Sláðu inn fullt nafn þitt',
    
    // Profile Menu
    settings: 'Stillingar',
    language: 'Tungumál',
    darkMode: 'Dökkt ham',
    profile: 'Prófíll',
    logout: 'Skrá út',
    signOut: 'Skrá út',
    editProfile: 'Breyta prófíl',
    changeAvatar: 'Breyta avatar',
    saveName: 'Vista nafn',
    favorites: 'Uppáhald',
    favoriteRefillStations: 'Uppáhalds áfyllingarstöðvar',
    saved: 'Vistað',
    findSavedLocations: 'Finna vistaðar staðsetningar',
    dark: 'Dökkt',
    bright: 'Bjart',
    selected: '✓ Valið',
    guest: 'Gestur',
    refills: 'Áfyllingar',
    clickToChangePhoto: 'Smelltu til að breyta mynd',
    
    // Map
    goToMyLocation: 'Fara á mína staðsetningu',
    locating: 'Staðsetja...',
    located: 'Staðsett',
    notLocated: 'Staðsetning ekki tiltæk',
    enableLocation: 'Virkja staðsetningu',
    locationDenied: 'Staðsetningarleyfi hafnað',
    operational: 'Í notkun',
    notOperational: 'Ekki í notkun',
    
    // User
    openProfile: 'Opna prófíl',
    
    // Social
    signInWithGoogle: 'Skrá inn með Google',
    signInWithApple: 'Skrá inn með Apple',
    
    // Common
    cancel: 'Hætta við',
    save: 'Vista',
    close: 'Loka',
    search: 'Leita',
    or: 'Eða',
    
    // Errors
    imageTooBig: 'Mynd verður að vera minni en 5 MB',
    uploadFailed: 'Upphledsla mistokst',
    loading: 'Hleður...',
    error: 'Villa',
  },
};

export function getTranslation(lang: SupportedLanguage): Translations {
  return translations[lang] || translations.en;
}

/**
 * Translate category from English to the selected language
 * @param category - Category name in English (from database)
 * @param lang - Target language
 * @returns Translated category name
 */
export function translateCategory(category: string, lang: SupportedLanguage): string {
  const t = getTranslation(lang);
  
  const categoryMap: Record<string, keyof Translations> = {
    'Fountain': 'categoryFountain',
    'fountain': 'categoryFountain',
    'Bottle Refill Station': 'categoryBottleRefillStation',
    'bottle-refill': 'categoryBottleRefillStation',
    'Public Tap': 'categoryPublicTap',
    'tap': 'categoryPublicTap',
    'Establishment': 'categoryEstablishment',
    'establishment': 'categoryEstablishment',
  };
  
  const key = categoryMap[category];
  if (key) {
    return t[key] as string;
  }
  
  // Return original if not found
  return category;
}
