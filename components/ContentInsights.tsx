import React from 'react';
import type { ContentInsight } from '../types';

const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const BookmarkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    </svg>
);

interface ContentInsightsProps {
    insights: ContentInsight[];
    onLabelClick?: (label: string) => void;
}

const isTimestamp = (label: string): boolean => {
    return /^\(\d{1,2}:\d{2}(:\d{2})?\)$/.test(label);
};

const ContentInsights: React.FC<ContentInsightsProps> = ({ insights, onLabelClick }) => {
    if (!insights || insights.length === 0) {
        return <p className="font-roboto text-gray-600">No key takeaways were identified for this content.</p>;
    }
    return (
        <div className="space-y-4">
            {insights.map((insight, index) => {
                const isClickable = onLabelClick && isTimestamp(insight.label);
                const InsightComponent = isClickable ? 'button' : 'div';
                
                return (
                    <InsightComponent
                        key={index}
                        onClick={isClickable ? () => onLabelClick(insight.label) : undefined}
                        className={`flex items-start p-4 bg-white rounded-lg border border-gray-200 w-full text-left ${isClickable ? 'hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black' : ''} transition-colors duration-200`}
                        aria-label={isClickable ? `Jump to time ${insight.label}` : undefined}
                    >
                        {isClickable ? <ClockIcon /> : <BookmarkIcon />}
                        <div>
                            <p className="font-roboto font-bold text-black">{insight.label}</p>
                            <p className="font-roboto text-gray-700 mt-1 leading-relaxed">{insight.summary}</p>
                        </div>
                    </InsightComponent>
                );
            })}
        </div>
    );
};

export default ContentInsights;
