import React, { useState } from 'react';

/**
 * MithraShoppy Shared Tabs Component
 */
const Tabs = ({
  tabs = [],
  defaultTab = 0,
  onChange,
  className = '',
}) => {
  const [active, setActive] = useState(defaultTab);

  const handleChange = (index) => {
    setActive(index);
    if (onChange) onChange(index, tabs[index]);
  };

  return (
    <div className={`ms-tabs ${className}`}>
      <div className="ms-tabs__list" role="tablist">
        {tabs.map((tab, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={active === i}
            aria-controls={`ms-tab-panel-${i}`}
            id={`ms-tab-${i}`}
            className={`ms-tabs__tab ${active === i ? 'ms-tabs__tab--active' : ''}`}
            onClick={() => handleChange(i)}
            disabled={tab.disabled}
          >
            {tab.icon && <span className="ms-tabs__tab-icon">{tab.icon}</span>}
            {tab.label}
            {tab.badge != null && (
              <span className="ms-tabs__tab-badge">{tab.badge}</span>
            )}
          </button>
        ))}
      </div>
      <div className="ms-tabs__panels">
        {tabs.map((tab, i) => (
          <div
            key={i}
            id={`ms-tab-panel-${i}`}
            role="tabpanel"
            aria-labelledby={`ms-tab-${i}`}
            className={`ms-tabs__panel ${active === i ? 'ms-tabs__panel--active' : ''}`}
            hidden={active !== i}
          >
            {active === i && tab.content}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tabs;
