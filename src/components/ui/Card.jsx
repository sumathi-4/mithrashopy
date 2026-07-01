import React from 'react';

/**
 * MithraShoppy Shared Card Component
 * Variants: default | elevated | flat | outlined
 */
const Card = ({
  children,
  variant = 'default',
  padding = 'md',
  hover = false,
  className = '',
  as: Tag = 'div',
  ...rest
}) => {
  const cls = [
    'ms-card',
    `ms-card--${variant}`,
    `ms-card--p-${padding}`,
    hover ? 'ms-card--hover' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <Tag className={cls} {...rest}>
      {children}
    </Tag>
  );
};

const CardHeader = ({ children, className = '' }) => (
  <div className={`ms-card__header ${className}`}>{children}</div>
);

const CardBody = ({ children, className = '' }) => (
  <div className={`ms-card__body ${className}`}>{children}</div>
);

const CardFooter = ({ children, className = '' }) => (
  <div className={`ms-card__footer ${className}`}>{children}</div>
);

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
