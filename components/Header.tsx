import React from 'react';
import { NAV_LINKS } from '../constants';
import type { NavLink } from '../types';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <a href="#" className="font-montserrat text-xl font-black text-black">
          Techiral
        </a>
        <nav className="hidden md:flex items-center space-x-8">
          {NAV_LINKS.map((link: NavLink) => (
            <a
              key={link.name}
              href={link.href}
              className="font-roboto text-black hover:text-gray-600 transition-colors duration-300"
            >
              {link.name}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;