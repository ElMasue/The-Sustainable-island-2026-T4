// MyMemory Translation API Service
// API Documentation: https://mymemory.translated.net/doc/spec.php

const MYMEMORY_API_URL = 'https://api.mymemory.translated.net/get';

export type SupportedLanguage = 'en' | 'es' | 'da' | 'is';

export interface TranslationCache {
  [key: string]: string;
}

// Cache translations to avoid repeated API calls
const translationCache: TranslationCache = {};

/**
 * Translate text using MyMemory API
 * @param text - Text to translate
 * @param targetLang - Target language code (en, es, da, is)
 * @param sourceLang - Source language code (default: 'en')
 * @returns Translated text
 */
export async function translateText(
  text: string,
  targetLang: SupportedLanguage,
  sourceLang: SupportedLanguage = 'en'
): Promise<string> {
  console.log(`🔄 translateText called: ${sourceLang} -> ${targetLang}`);
  console.log(`📝 Text to translate:`, text);
  
  // If source and target are the same, return original text
  if (sourceLang === targetLang) {
    console.log('⚠️ Source and target are the same, returning original');
    return text;
  }

  // Check cache first
  const cacheKey = `${sourceLang}|${targetLang}|${text}`;
  if (translationCache[cacheKey]) {
    console.log('✅ Found in cache:', translationCache[cacheKey]);
    return translationCache[cacheKey];
  }

  try {
    const encodedText = encodeURIComponent(text);
    const langPair = `${sourceLang}|${targetLang}`;
    const url = `${MYMEMORY_API_URL}?q=${encodedText}&langpair=${langPair}`;
    
    console.log('🌐 Fetching translation from API:', url);

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('📦 API Response:', data);
    
    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      const translated = data.responseData.translatedText;
      console.log('✅ Translation successful:', translated);
      // Cache the result
      translationCache[cacheKey] = translated;
      return translated;
    } else {
      console.error('❌ Translation failed - invalid response:', data);
      return text; // Return original text on error
    }
  } catch (error) {
    console.error('❌ Translation error:', error);
    return text; // Return original text on error
  }
}

/**
 * Translate multiple texts in batch (sequential to respect API limits)
 * @param texts - Array of texts to translate
 * @param targetLang - Target language code
 * @param sourceLang - Source language code (default: 'en')
 * @returns Array of translated texts
 */
export async function translateBatch(
  texts: string[],
  targetLang: SupportedLanguage,
  sourceLang: SupportedLanguage = 'en'
): Promise<string[]> {
  const translations: string[] = [];
  
  for (const text of texts) {
    const translated = await translateText(text, targetLang, sourceLang);
    translations.push(translated);
    // Small delay to avoid rate limiting (MyMemory free tier allows ~100 requests/day)
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return translations;
}

/**
 * Clear translation cache
 */
export function clearTranslationCache(): void {
  Object.keys(translationCache).forEach(key => delete translationCache[key]);
}
