import React from 'react';
import Hero from '../components/Hero';
import Manifesto from '../components/Manifesto';
import Community from '../components/Community';

const HomePage: React.FC = () => {
  return (
    <>
      <Hero />
      <Manifesto />
      <Community />
    </>
  );
};

export default HomePage;
