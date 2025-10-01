import React from 'react';

const LoadingSpinner: React.FC<{ small?: boolean }> = ({ small = false }) => {
    const sizeClass = small ? 'h-5 w-5' : 'h-8 w-8';
    return (
        <div className="flex justify-center items-center py-4">
            <div className={`animate-spin rounded-full border-b-2 border-black ${sizeClass}`} />
        </div>
    );
};

export default LoadingSpinner;
