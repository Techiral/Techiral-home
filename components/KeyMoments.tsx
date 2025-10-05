import React from 'react';
import type { KeyMoment } from '../types';

interface KeyMomentsProps {
  moments: KeyMoment[];
}

const KeyMoments: React.FC<KeyMomentsProps> = ({ moments }) => {
  if (!moments || moments.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4 font-montserrat">Key Moments</h2>
      <div className="space-y-3">
        {moments.map((moment, index) => (
          <div key={index} className="flex items-start p-3 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex-shrink-0 text-gray-800 font-semibold w-24 text-right mr-4">
              {moment.label}
            </div>
            <div className="text-gray-800 font-roboto">
              {moment.summary}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KeyMoments;
