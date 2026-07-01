import React, { useState } from 'react';

/**
 * MithraShoppy Shared Accordion Component
 */
const AccordionItem = ({ item, isOpen, onToggle }) => (
  <div className={`ms-accordion__item ${isOpen ? 'ms-accordion__item--open' : ''}`}>
    <button
      className="ms-accordion__trigger"
      aria-expanded={isOpen}
      onClick={onToggle}
      id={`ms-accordion-trigger-${item.id}`}
      aria-controls={`ms-accordion-panel-${item.id}`}
    >
      <span className="ms-accordion__trigger-label">
        {item.icon && <span className="ms-accordion__icon">{item.icon}</span>}
        {item.title}
      </span>
      <span className={`ms-accordion__chevron ${isOpen ? 'ms-accordion__chevron--open' : ''}`} aria-hidden="true">
        ▾
      </span>
    </button>
    <div
      id={`ms-accordion-panel-${item.id}`}
      role="region"
      aria-labelledby={`ms-accordion-trigger-${item.id}`}
      className="ms-accordion__panel"
    >
      <div className="ms-accordion__panel-inner">{item.content}</div>
    </div>
  </div>
);

const Accordion = ({
  items = [],
  allowMultiple = false,
  defaultOpen = [],
  className = '',
}) => {
  const [openItems, setOpenItems] = useState(new Set(defaultOpen));

  const toggle = (id) => {
    setOpenItems((prev) => {
      const next = new Set(allowMultiple ? prev : []);
      if (prev.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className={`ms-accordion ${className}`}>
      {items.map((item) => (
        <AccordionItem
          key={item.id}
          item={item}
          isOpen={openItems.has(item.id)}
          onToggle={() => toggle(item.id)}
        />
      ))}
    </div>
  );
};

export default Accordion;
