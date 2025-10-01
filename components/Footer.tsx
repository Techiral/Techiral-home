
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white text-black py-8 px-6">
      <div className="container mx-auto text-center font-roboto text-gray-600">
        <p>&copy; {new Date().getFullYear()} Techiral. All Rights Reserved.</p>
        <p className="text-sm mt-2">Made with curiosity and code.</p>
        <div className="mt-6">
          <a href="#/admin" className="text-xs text-gray-400 hover:text-black border border-gray-300 hover:border-black rounded-full px-3 py-1 transition-colors duration-300">
            Admin Panel
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;