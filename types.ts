export interface Video {
  id: string;
  title: string;
  description: string[] | string;
  targetAudience?: string;
  transcript: string;
  faqs: FAQ[];
  keyMoments: KeyMoment[];
  metaTitle?: string;
  metaDescription?: string;
  cta?: CallToAction;
  created_at: string;
}

export interface Blog {
  id: string;
  mediumUrl: string;
  title: string;
  content: string;
  thumbnailUrl?: string;
  description: string[] | string;
  targetAudience?: string;
  faqs: FAQ[];
  keyMoments: KeyMoment[];
  metaTitle?: string;
  metaDescription?: string;
  cta?: CallToAction;
  created_at: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface KeyMoment {
  label: string;
  summary: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface CallToAction {
  headline: string;
  description: string;
}
