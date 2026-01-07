export interface PageMetadata {
  title?: string;
  description?: string;
  sections: SectionMetadata[];
}

export interface SectionMetadata {
  type: SectionType;
  content: string; // Original or summarized content/purpose
  rawHtml?: string;
  styling?: string; // Key styling attributes
}

export type SectionType = 
  | 'header'
  | 'hero'
  | 'features'
  | 'about'
  | 'services'
  | 'pricing'
  | 'testimonials'
  | 'cta'
  | 'footer'
  | 'unknown';
