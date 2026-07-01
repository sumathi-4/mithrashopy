import React, { useState, useRef, useEffect } from 'react';

/**
 * MithraShoppy Shared Tooltip Component
 */
const Tooltip = ({
  content,
  children,
  position = 'top',
  delay = 0,
  className = '',
}) => {
  const [visible, setVisible] = useState(false);
  const timer = useRef(null);

  const show = () => {
    timer.current = setTimeout(() => setVisible(true), delay);
  };
  const hide = () => {
    clearTimeout(timer.current);
    setVisible(false);
  };

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <span
      className={`ms-tooltip-wrap ${className}`}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && content && (
        <span className={`ms-tooltip ms-tooltip--${position}`} role="tooltip">
          {content}
          <span className={`ms-tooltip__arrow ms-tooltip__arrow--${position}`} aria-hidden="true" />
        </span>
      )}
    </span>
  );
};

export default Tooltip;
