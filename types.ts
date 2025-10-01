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

export interface Video {
  id: string; // YouTube video ID
  title: string;
  description: string;
  transcript: string;
  faqs?: FAQItem[];
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}