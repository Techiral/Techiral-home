import type { ReactElement } from 'react';

export interface NavLink {
  name: string;
  href: string;
}

export interface SocialLink {
  name:string;
  href: string;
  // Fix: Use ReactElement instead of JSX.Element to avoid namespace issue in .ts files.
  icon: ReactElement;
}

export interface ContentInsight {
  label: string; // E.g., "(1:40)" for video, "Introduction" for blog
  summary: string;
}

export interface Video {
  id: string; // YouTube video ID
  title: string;
  description: string;
  transcript: string;
  faqs: FAQItem[];
  keyMoments: ContentInsight[];
  metaTitle?: string;
  metaDescription?: string;
}

export interface Blog {
  id: string; // Slug generated from title
  mediumUrl: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  content: string; // The full blog post content
  faqs: FAQItem[];
  keyMoments: ContentInsight[];
  metaTitle?: string;
  metaDescription?: string;
}


export interface FAQItem {
  question: string;
  answer: string;
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}