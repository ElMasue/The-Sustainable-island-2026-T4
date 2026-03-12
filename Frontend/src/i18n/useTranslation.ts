import { useAppSettings } from '../context/AppSettingsContext';
import { getTranslation, type Translations } from './translations';

/**
 * Custom hook to access translations based on current language setting
 * @returns Current translations object
 */
export function useTranslation(): Translations {
  const { language } = useAppSettings();
  return getTranslation(language);
}
