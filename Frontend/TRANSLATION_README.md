# Sistema de Traducción Multiidioma

Este proyecto implementa un sistema completo de internacionalización (i18n) con soporte para 4 idiomas utilizando la API de MyMemory.

## Idiomas Soportados

- 🇬🇧 **Inglés** (en)
- 🇪🇸 **Español** (es)
- 🇩🇰 **Danés** (da)
- 🇮🇸 **Islandés** (is)

## Arquitectura

### 1. Servicio de Traducción (`services/translationService.ts`)

Proporciona integración con la API de MyMemory para traducción en tiempo real:

```typescript
import { translateText, translateBatch } from './services/translationService';

// Traducir un texto
const translated = await translateText('Hello', 'es'); // → "Hola"

// Traducir múltiples textos
const translations = await translateBatch(['Hello', 'World'], 'da');
```

**Características:**
- Cache automático de traducciones para reducir llamadas a la API
- Manejo de errores que retorna el texto original si falla
- Delay entre traducciones para evitar rate limiting
- Soporte para traducción por lotes

**API MyMemory:**
- URL: `https://api.mymemory.translated.net/get`
- Formato: `?q={texto}&langpair={origen}|{destino}`
- Límite gratuito: ~100 peticiones/día
- Documentación: https://mymemory.translated.net/doc/spec.php

### 2. Sistema i18n (`i18n/`)

**Traducciones Estáticas** (`i18n/translations.ts`):
```typescript
export const translations = {
  en: { signIn: 'Sign In', ... },
  es: { signIn: 'Iniciar sesión', ... },
  da: { signIn: 'Log ind', ... },
  is: { signIn: 'Skrá inn', ... }
};
```

**Hook Personalizado** (`i18n/useTranslation.ts`):
```typescript
import { useTranslation } from '../i18n';

function MyComponent() {
  const t = useTranslation();
  return <h1>{t.signIn}</h1>; // Traducido según idioma actual
}
```

### 3. Contexto de Configuración (`context/AppSettingsContext.tsx`)

Gestiona el idioma actual y preferencias del usuario:

```typescript
const { language, setLanguage } = useAppSettings();

// Cambiar idioma
setLanguage('es'); // Español
setLanguage('da'); // Danés
setLanguage('is'); // Islandés
setLanguage('en'); // Inglés
```

El idioma se persiste automáticamente en `localStorage`.

## Uso

### En Componentes

```tsx
import { useTranslation } from '../i18n';

function MyComponent() {
  const t = useTranslation();
  
  return (
    <div>
      <h1>{t.signIn}</h1>
      <button>{t.continue}</button>
      <p>{t.emailAddress}</p>
    </div>
  );
}
```

### Selector de Idioma

El componente `ProfileMenu` incluye un selector visual con banderas:

1. Abrir menú de perfil
2. Ir a Settings
3. Seleccionar Language
4. Elegir idioma deseado

### Agregar Nuevas Traducciones

1. Editar `i18n/translations.ts`
2. Agregar la clave en todos los idiomas:

```typescript
export interface Translations {
  // ... existentes
  newKey: string; // 1. Agregar tipo
}

export const translations = {
  en: { newKey: 'English text' },    // 2. Inglés
  es: { newKey: 'Texto en español' }, // 3. Español
  da: { newKey: 'Dansk tekst' },      // 4. Danés
  is: { newKey: 'Íslenskur texti' }   // 5. Islandés
};
```

3. Usar en componente:
```tsx
const t = useTranslation();
<span>{t.newKey}</span>
```

### Traducir Contenido Dinámico

Para contenido que viene de la base de datos o API:

```typescript
import { translateText } from '../services/translationService';

// Traducir descripción de fuente
const description = await translateText(
  fountain.description,
  language,
  'en' // idioma de origen
);
```

**⚠️ Importante:** El servicio tiene límite de 100 peticiones/día en tier gratuito. Usa traducciones estáticas siempre que sea posible.

## Componentes Traducidos

Los siguientes componentes ya incluyen soporte multiidioma:

- ✅ `FountainDetail` - Detalles de fuentes y calificaciones
- ✅ `SignInForm` - Formulario de inicio de sesión
- ✅ `SignUpForm` - Formulario de registro
- ✅ `ProfileMenu` - Menú de perfil y configuración

## Agregar Soporte a Más Idiomas

Para agregar un nuevo idioma (ej: Francés):

1. Actualizar tipo en `translationService.ts`:
```typescript
export type SupportedLanguage = 'en' | 'es' | 'da' | 'is' | 'fr';
```

2. Agregar traducciones en `translations.ts`:
```typescript
fr: {
  signIn: 'Se connecter',
  // ... todas las claves
}
```

3. Actualizar `ProfileMenu.tsx` con bandera y nombre:
```typescript
const languageEmojis = { fr: '🇫🇷', ... };
const languageNames = { fr: 'Français', ... };
```

## Testing

Para probar las traducciones:

1. Ejecutar app: `npm run dev`
2. Abrir menú de perfil → Settings → Language
3. Cambiar entre idiomas y verificar que toda la UI se actualiza
4. Verificar que el idioma se mantiene después de recargar

## Consideraciones

### Performance
- Las traducciones estáticas se cargan instantáneamente (sin delay)
- Las traducciones dinámicas via API tienen ~200-500ms de latencia
- El cache reduce llamadas repetidas a la API

### Límites de API
- MyMemory tier gratuito: ~100 peticiones/día
- Para mayor volumen considerar:
  - MyMemory Premium
  - Google Cloud Translation
  - AWS Translate
  - DeepL API

### Fallback
- Si una traducción falla, se muestra el texto original
- Si falta una clave de traducción, TypeScript alertará en tiempo de compilación

## Recursos

- [MyMemory API Docs](https://mymemory.translated.net/doc/spec.php)
- [Códigos de idioma ISO 639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes)
- [Unicode Emoji Flags](https://emojipedia.org/flags/)
