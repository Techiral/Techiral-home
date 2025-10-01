import React from 'react';
import SocialLinks from './SocialLinks';

const Hero: React.FC = () => {
  return (
    <section className="min-h-screen bg-black text-white flex flex-col justify-center items-center text-center p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-montserrat text-5xl md:text-7xl lg:text-8xl font-black leading-tight mb-6">
          YOU FOUND ME. <br /> NOW, LET'S CREATE.
        </h1>
        <p className="font-roboto text-lg md:text-xl max-w-2xl mx-auto text-gray-300 mb-10">
          You've journeyed from YouTube, LinkedIn, or maybe a corner of the internet I don't even know about. It doesn't matter how you got here. What matters is what we build next.
        </p>
        <div className="flex justify-center mb-12">
           <a href="#/videos" className="bg-white text-black font-roboto font-bold py-3 px-8 rounded-full hover:bg-gray-200 transition-all duration-300 transform hover:scale-105">
            Explore My Videos
          </a>
        </div>
        <SocialLinks />
      </div>
    </section>
  );
};

export default Hero;