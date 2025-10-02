import React, { useEffect } from 'react';

interface SeoProps {
  title: string;
  description: string;
  jsonLd?: object;
}

const Seo: React.FC<SeoProps> = ({ title, description, jsonLd }) => {
  useEffect(() => {
    document.title = title;

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    } else {
      const newMeta = document.createElement('meta');
      newMeta.name = 'description';
      newMeta.content = description;
      document.head.appendChild(newMeta);
    }

    const jsonLdScript = document.querySelector('script[type="application/ld+json"]');
    if (jsonLdScript) {
      jsonLdScript.innerHTML = jsonLd ? JSON.stringify(jsonLd) : '';
    } else if (jsonLd) {
      const newScript = document.createElement('script');
      newScript.type = 'application/ld+json';
      newScript.innerHTML = JSON.stringify(jsonLd);
      document.head.appendChild(newScript);
    }

  }, [title, description, jsonLd]);

  return null;
};

export default Seo;
