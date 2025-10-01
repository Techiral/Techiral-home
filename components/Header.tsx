import React from 'react';
import { NavLink as RouterNavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const NAV_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'Videos', href: '/videos' },
  { name: 'Blogs', href: '/blogs' },
];

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <RouterNavLink to="/" className="font-montserrat text-xl font-black text-black">
          Techiral
        </RouterNavLink>
        <nav className="hidden md:flex items-center space-x-8">
          {NAV_LINKS.map((link) => (
            <RouterNavLink
              key={link.name}
              to={link.href}
              className={({ isActive }) => 
                `font-roboto text-black hover:text-gray-600 transition-colors duration-300 ${isActive ? 'font-bold' : ''}`
              }
            >
              {link.name}
            </RouterNavLink>
          ))}
          {user && (
            <button
              onClick={logout}
              className="font-roboto text-black hover:text-gray-600 transition-colors duration-300"
            >
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;