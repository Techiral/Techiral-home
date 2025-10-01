
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Footer: React.FC = () => {
  const { user } = useAuth();

  return (
    <footer className="bg-white text-black py-8 px-6">
      <div className="container mx-auto text-center font-roboto text-gray-600">
        <p>&copy; {new Date().getFullYear()} Techiral. All Rights Reserved.</p>
        <p className="text-sm mt-2">Made with curiosity and code.</p>
        {user && (
          <div className="mt-6">
            <Link to="/admin" className="text-xs text-gray-400 hover:text-black border border-gray-300 hover:border-black rounded-full px-3 py-1 transition-colors duration-300">
              Admin Panel
            </Link>
          </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;