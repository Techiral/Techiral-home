import React from 'react';
import type { Blog, Video } from '../types';

interface SeoProps {
    data: Partial<Blog> | Partial<Video>;
    pageType: 'website' | 'article' | 'video';
}

// A helper function to create a clean JSON-LD script
const createJsonLd = (data: Partial<Blog> | Partial<Video>, pageType: 'website' | 'article' | 'video') => {
    const siteUrl = 'https://techiral.com'; // Replace with your actual domain

    const baseSchema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'url': siteUrl,
        'name': 'Techiral',
        'author': {
            '@type': 'Organization',
            'name': 'Techiral',
            'url': siteUrl,
        },
    };

    if (pageType === 'article' && 'title' in data && 'id' in data) {
        const articleData = data as Blog;
        return {
            '@context': 'https://schema.org',
            '@type': 'Article',
            'mainEntityOfPage': {
                '@type': 'WebPage',
                '@id': `${siteUrl}/blog/${articleData.id}`,
            },
            'headline': articleData.metaTitle || articleData.title,
            'description': articleData.metaDescription,
            'image': articleData.thumbnailUrl || '',
            'author': {
                '@type': 'Organization',
                'name': 'Techiral',
                 'url': siteUrl,
            },
            'publisher': {
                 '@type': 'Organization',
                 'name': 'Techiral',
                 'logo': {
                    '@type': 'ImageObject',
                    'url': `${siteUrl}/logo.png` // Replace with your logo path
                 }
            },
            'datePublished': articleData.created_at ? new Date(articleData.created_at).toISOString() : '',
            'dateModified': articleData.created_at ? new Date(articleData.created_at).toISOString() : '', // You can update this if you have an updated_at field
        };
    }

    if (pageType === 'video' && 'title' in data && 'id' in data) {
        const videoData = data as Video;
        return {
            '@context': 'https://schema.org',
            '@type': 'VideoObject',
            'name': videoData.metaTitle || videoData.title,
            'description': videoData.metaDescription,
            'thumbnailUrl': `${siteUrl}/thumbnails/${videoData.id}.jpg`, // Assuming a naming convention
            'uploadDate': videoData.created_at ? new Date(videoData.created_at).toISOString() : '',
            'publisher': {
                 '@type': 'Organization',
                 'name': 'Techiral',
                 'logo': {
                    '@type': 'ImageObject',
                    'url': `${siteUrl}/logo.png`
                 }
            },
        };
    }
    
    // FAQPage Schema can be added to both articles and videos if FAQs exist
    if ((pageType === 'article' || pageType === 'video') && data.faqs && data.faqs.length > 0) {
        const faqSchema = {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            'mainEntity': data.faqs.map(faq => ({
                '@type': 'Question',
                'name': faq.question,
                'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': faq.answer
                }
            }))
        };
        // You can return an array of schemas
        return [baseSchema, createJsonLd(data, pageType), faqSchema];
    }

    return baseSchema;
};

const Seo: React.FC<SeoProps> = ({ data, pageType }) => {
    const metaTitle = data.metaTitle || data.title || 'Techiral';
    const metaDescription = data.metaDescription || 'Techiral: Connect, Create, and Conquer the Digital World.';
    const jsonLdData = createJsonLd(data, pageType);

    return (
        <>
            <title>{metaTitle}</title>
            <meta name="description" content={metaDescription} />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
            />
        </>
    );
};

export default Seo;
