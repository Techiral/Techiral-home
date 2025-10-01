
import React from 'react';
import SocialLinks from './SocialLinks';

const Community: React.FC = () => {
  return (
    <section id="connect" className="bg-black text-white py-20 md:py-32 px-6">
      <div className="container mx-auto max-w-3xl text-center">
        <h2 className="font-montserrat text-4xl md:text-6xl font-black leading-tight mb-6">
          Your Tribe Awaits.
        </h2>
        <p className="font-roboto text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
          The real magic happens when we connect. Join a growing community of creators, developers, and thinkers. Or find me on your favorite platform. Let's keep the conversation going.
        </p>
        <div className="mb-12">
            <a href="#join-community" className="bg-white text-black font-roboto font-bold py-4 px-10 rounded-full text-lg hover:bg-gray-200 transition-all duration-300 transform hover:scale-105 inline-block">
                Join The Community
            </a>
        </div>
        <SocialLinks large />
      </div>
    </section>
  );
};

export default Community;