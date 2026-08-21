export type SupportedLanguage = 'en' | 'fr';

export interface Translations {
  [key: string]: string | Translations;
}
