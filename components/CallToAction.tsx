import React from 'react';

interface CallToActionProps {
  headline: string;
  description: string;
  buttonText?: string;
}

const CallToAction: React.FC<CallToActionProps> = ({ headline, description, buttonText = "Get Resources" }) => {
  if (!headline) {
    return null;
  }

  return (
    <div className="bg-indigo-600 text-white rounded-lg p-6 my-8 text-center">
      <h3 className="text-2xl font-bold font-montserrat mb-2">{headline}</h3>
      <p className="font-roboto mb-4">{description}</p>
      <button className="bg-white text-indigo-600 font-bold py-2 px-6 rounded-lg hover:bg-gray-200 transition-colors">
        {buttonText}
      </button>
    </div>
  );
};

export default CallToAction;
