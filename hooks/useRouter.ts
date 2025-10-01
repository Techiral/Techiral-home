import { useState, useEffect } from 'react';

export const useRouter = () => {
    // State to hold the current hash, initialized from window.location
    const [hash, setHash] = useState(window.location.hash);

    useEffect(() => {
        // Function to update state when the hash changes
        const handleHashChange = () => {
            setHash(window.location.hash);
        };

        // Add event listener for hash changes
        window.addEventListener('hashchange', handleHashChange);

        // Cleanup function to remove the event listener
        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, []); // Empty dependency array ensures this effect runs only once

    // Parse the hash to extract path and parameter
    // Example: #/videos/123 -> path: 'videos', param: '123'
    // Example: #/videos -> path: 'videos', param: ''
    // Example: # -> path: '', param: ''
    const path = hash.substring(1).split('/')[1] || '';
    const param = hash.substring(1).split('/')[2] || '';

    return { path, param };
};
