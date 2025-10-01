import React from 'react';
import type { KeyMoment } from '../types';

const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

interface KeyMomentsProps {
    moments: KeyMoment[];
    onTimestampClick: (timestamp: string) => void;
}

const KeyMoments: React.FC<KeyMomentsProps> = ({ moments, onTimestampClick }) => {
    if (!moments || moments.length === 0) {
        return <p className="font-roboto text-gray-600">No key moments were identified in this video.</p>;
    }
    return (
        <div className="space-y-4">
            {moments.map((moment, index) => (
                <button
                    key={index}
                    onClick={() => onTimestampClick(moment.timestamp)}
                    className="flex items-start p-4 bg-white rounded-lg border border-gray-200 w-full text-left hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black transition-colors duration-200"
                    aria-label={`Jump to video time ${moment.timestamp}`}
                >
                    <ClockIcon />
                    <div>
                        <p className="font-roboto font-bold text-black group-hover:underline">{moment.timestamp}</p>
                        <p className="font-roboto text-gray-700 mt-1 leading-relaxed">{moment.summary}</p>
                    </div>
                </button>
            ))}
        </div>
    );
};

export default KeyMoments;