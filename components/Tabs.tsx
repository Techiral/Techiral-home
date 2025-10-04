
import React, { useState, ReactNode } from 'react';

interface TabProps {
  title: string;
  children: ReactNode;
}

export const Tab: React.FC<TabProps> = ({ children }) => {
  return <div>{children}</div>;
};

interface TabsProps {
  children: React.ReactElement<TabProps>[];
}

const Tabs: React.FC<TabsProps> = ({ children }) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabClick = (index: number) => {
    setActiveTab(index);
  };

  return (
    <div>
      <div style={{ display: 'flex', borderBottom: '2px solid #e5e7eb' }}>
        {children.map((tab, index) => (
          <button
            key={index}
            onClick={() => handleTabClick(index)}
            style={{
              padding: '16px 32px',
              fontSize: '1rem',
              fontWeight: activeTab === index ? 600 : 500,
              color: activeTab === index ? 'black' : '#4b5563',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              borderBottom: activeTab === index ? '2px solid black' : '2px solid transparent',
              outline: 'none',
            }}
          >
            {tab.props.title}
          </button>
        ))}
      </div>
      <div style={{ paddingTop: '24px' }}>{children[activeTab]}</div>
    </div>
  );
};

export default Tabs;
