import React from 'react';
import type { FAQ } from '../types';

interface ContentInsightsProps {
  insights: FAQ[];
}

const ContentInsights: React.FC<ContentInsightsProps> = ({ insights }) => {
  if (!insights || insights.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4 font-montserrat">Content Insights</h2>
      <div className="space-y-4">
        {insights.map((insight, index) => (
          <details key={index} className="group bg-gray-50 p-4 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
            <summary className="text-lg font-semibold text-gray-800 list-none flex justify-between items-center">
              {insight.question}
              <span className="text-indigo-600 group-open:rotate-90 transition-transform duration-200 ml-2">▶</span>
            </summary>
            <div className="mt-3 text-gray-700 font-roboto prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: insight.answer }} />
          </details>
        ))}
      </div>
    </div>
  );
};

export default ContentInsights;
