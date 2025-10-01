
import React from 'react';
import type { SocialLink } from '../types';

// SVGs for icons
const YouTubeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>;
const InstagramIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.584-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.011-3.584.069-4.85c.149-3.225 1.664-4.771 4.919-4.919 1.266-.057 1.644-.069 4.85-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.358-.2 6.78-2.618 6.98-6.98.059-1.281.073-1.689.073-4.948s-.014-3.667-.072-4.947c-.2-4.358-2.618-6.78-6.98-6.98-1.281-.058-1.689-.072-4.948-.072zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44 1.441-.645 1.441-1.44-.645-1.44-1.441-1.44z"/></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
const MediumIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M13.54 12a6.8 6.8 0 0 1-6.77 6.82A6.8 6.8 0 0 1 0 12a6.8 6.8 0 0 1 6.77-6.82A6.8 6.8 0 0 1 13.54 12zM20.92 12A3.08 3.08 0 0 1 17.85 15.1a3.08 3.08 0 0 1-3.07-3.1 3.08 3.08 0 0 1 3.07-3.1 3.08 3.08 0 0 1 3.07 3.1zM24 12a1.2 1.2 0 0 1-1.19 1.21A1.2 1.2 0 0 1 21.6 12a1.2 1.2 0 0 1 1.2-1.21A1.2 1.2 0 0 1 24 12z"/></svg>;
const LinkedInIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-4.455 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/></svg>;

const SOCIAL_LINKS_DATA: SocialLink[] = [
  { name: 'YouTube', href: 'https://www.youtube.com/@Techiral', icon: <YouTubeIcon /> },
  { name: 'Instagram', href: 'https://www.instagram.com/Techiral', icon: <InstagramIcon /> },
  { name: 'X', href: 'https://x.com/Techiral', icon: <XIcon /> },
  { name: 'Medium', href: 'https://medium.com/@Techiral', icon: <MediumIcon /> },
  { name: 'LinkedIn', href: 'https://www.linkedin.com/in/Techiral', icon: <LinkedInIcon /> },
];

interface SocialLinksProps {
    large?: boolean;
}

const SocialLinks: React.FC<SocialLinksProps> = ({ large = false }) => {
  const sizeClass = large ? 'w-8 h-8' : 'w-6 h-6';
  
  return (
    <div className={`flex justify-center items-center space-x-6 ${large ? 'md:space-x-8' : 'md:space-x-6'}`}>
      {SOCIAL_LINKS_DATA.map((link) => (
        <a
          key={link.name}
          href={link.href}
          aria-label={link.name}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-white transition-colors duration-300"
        >
          <div className={sizeClass}>
            {link.icon}
          </div>
        </a>
      ))}
    </div>
  );
};

export default SocialLinks;