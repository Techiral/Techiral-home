import React, { useState } from 'react';
import type { FAQItem } from '../types';

const AccordionItem: React.FC<{ item: FAQItem }> = ({ item }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-gray-300">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full text-left py-4 flex justify-between items-center focus:outline-none"
            >
                <h3 className="font-montserrat font-black text-black">{item.question}</h3>
                <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </span>
            </button>
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
                <p className="font-roboto text-gray-700 pb-4 pr-4 leading-relaxed">{item.answer}</p>
            </div>
        </div>
    );
};

const FAQ: React.FC<{ faqs: FAQItem[] }> = ({ faqs }) => {
    if (!faqs || faqs.length === 0) {
        return <p className="font-roboto text-gray-600">No FAQs available for this video.</p>;
    }
    return (
        <div className="space-y-2">
            {faqs.map((faq, index) => (
                <AccordionItem key={index} item={faq} />
            ))}
        </div>
    );
};

export default FAQ;
