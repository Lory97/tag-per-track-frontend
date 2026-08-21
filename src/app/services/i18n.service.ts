import { Injectable, signal, computed } from '@angular/core';
import { SupportedLanguage } from '../i18n/i18n.types';
import { en } from '../i18n/translations/en';
import { fr } from '../i18n/translations/fr';

const STORAGE_KEY = 'tpt_lang';

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  private readonly translationsMap = {
    en,
    fr
  };

  /** Signal for the active language */
  readonly currentLang = signal<SupportedLanguage>(this.getInitialLanguage());

  /** Computed flag indicating whether current language is French */
  readonly isFrench = computed(() => this.currentLang() === 'fr');

  constructor() {}

  private getInitialLanguage(): SupportedLanguage {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as SupportedLanguage;
      if (stored && (stored === 'en' || stored === 'fr')) {
        return stored;
      }
      const browserLang = navigator.language?.toLowerCase() || '';
      if (browserLang.startsWith('fr')) {
        return 'fr';
      }
    } catch {
      // Fallback in case of restricted environment
    }
    return 'en';
  }

  /**
   * Change current language and persist in localStorage
   */
  setLanguage(lang: SupportedLanguage): void {
    this.currentLang.set(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Ignore storage errors
    }
  }

  /**
   * Toggle between EN and FR
   */
  toggleLanguage(): void {
    this.setLanguage(this.currentLang() === 'fr' ? 'en' : 'fr');
  }

  /**
   * Resolve a nested translation key (e.g. 'hero.titleLine1')
   * Supports optional interpolation parameters: { paramName: value }
   */
  translate(key: string, params?: Record<string, string | number>): string {
    const lang = this.currentLang();
    const dictionary = this.translationsMap[lang] || this.translationsMap.en;

    const keys = key.split('.');
    let value: any = dictionary;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to English dictionary if not found in current dictionary
        let fallbackValue: any = this.translationsMap.en;
        for (const fbK of keys) {
          if (fallbackValue && typeof fallbackValue === 'object' && fbK in fallbackValue) {
            fallbackValue = fallbackValue[fbK];
          } else {
            return key; // return key if not found in fallback either
          }
        }
        value = fallbackValue;
        break;
      }
    }

    if (typeof value !== 'string') {
      return key;
    }

    if (params) {
      return Object.entries(params).reduce((acc, [pKey, pVal]) => {
        return acc.replace(new RegExp(`\\{${pKey}\\}`, 'g'), String(pVal));
      }, value);
    }

    return value;
  }

  /** Alias shorthand for translate */
  t(key: string, params?: Record<string, string | number>): string {
    return this.translate(key, params);
  }
}
