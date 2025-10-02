import React from 'react';
import Hero from '../components/Hero';
import Manifesto from '../components/Manifesto';
import BlogFeed from '../components/BlogFeed';
import Portfolio from '../components/Portfolio';
import Community from '../components/Community';
import FAQ from '../components/FAQ';
import Seo from '../components/Seo';

const HomePage: React.FC = () => {
  return (
    <>
      <Seo 
        title="Techiral - Connect & Create"
        description="The official website for the 'Techiral' YouTube channel. Explore articles, videos, and join a community of developers."
      />
      <Hero />
      <Manifesto />
      <BlogFeed />
      <Portfolio />
      <Community />
      <FAQ />
    </>
  );
};

export default HomePage;
