import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useLinkData } from '../hooks/useLinkData';
import Seo from '../components/Seo';

const LinkCard: React.FC<{ title: string; url: string; description: string }> = ({ title, url, description }) => {
  const cardStyle: React.CSSProperties = {
    background: 'white',
    border: '1px solid #E5E7EB',
    borderRadius: '0.5rem',
    padding: '24px',
    marginBottom: '16px',
    display: 'block',
    textDecoration: 'none',
    transition: 'all 0.3s',
  };

  return (
    <RouterLink to={url} style={cardStyle}>
      <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.25rem', fontWeight: 900, color: 'black', marginBottom: '8px' }}>{title}</h3>
      <p style={{ fontFamily: 'Roboto, sans-serif', color: 'black', fontSize: '1rem' }}>{description}</p>
    </RouterLink>
  );
};

const LinksPage: React.FC = () => {
  const { links } = useLinkData();

  return (
    <>
      <Seo 
        title="Links - Techiral"
        description="A collection of useful links to my content and social media."
      />
      <style>
        {`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@900&family=Roboto&display=swap');
        `}
      </style>
      <section style={{ backgroundColor: 'white', color: 'black', padding: '80px 24px', minHeight: '100vh', fontFamily: 'Roboto, sans-serif' }}>
        <div style={{ maxWidth: '768px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 900, fontSize: '3rem', marginBottom: '16px', color: 'black' }}>Links.</h1>
            <p style={{ fontSize: '1.125rem', color: '#4B5563' }}>A collection of useful links to my content and social media.</p>
          </div>
          <div>
            {links.map(link => (
              <LinkCard key={link.id} title={link.title} url={link.url} description={link.description} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default LinksPage;
