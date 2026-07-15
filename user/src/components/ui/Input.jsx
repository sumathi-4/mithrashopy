import React, { forwardRef } from 'react';

/**
 * MithraShoppy Shared Input Component
 * Supports label, helper text, error state, leading/trailing icons
 */
const Input = forwardRef(({
  label,
  id,
  error,
  helperText,
  leadingIcon,
  trailingIcon,
  size = 'md',
  className = '',
  wrapperClassName = '',
  ...rest
}, ref) => {
  const inputCls = [
    'ms-input',
    `ms-input--${size}`,
    error ? 'ms-input--error' : '',
    leadingIcon ? 'ms-input--has-leading' : '',
    trailingIcon ? 'ms-input--has-trailing' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={`ms-input-wrapper ${wrapperClassName}`}>
      {label && (
        <label className="ms-input__label" htmlFor={id}>
          {label}
        </label>
      )}
      <div className="ms-input__field-wrap">
        {leadingIcon && (
          <span className="ms-input__icon ms-input__icon--leading" aria-hidden="true">
            {leadingIcon}
          </span>
        )}
        <input
          ref={ref}
          id={id}
          className={inputCls}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          {...rest}
        />
        {trailingIcon && (
          <span className="ms-input__icon ms-input__icon--trailing" aria-hidden="true">
            {trailingIcon}
          </span>
        )}
      </div>
      {error && (
        <span id={`${id}-error`} className="ms-input__message ms-input__message--error" role="alert">
          {error}
        </span>
      )}
      {!error && helperText && (
        <span id={`${id}-helper`} className="ms-input__message ms-input__message--helper">
          {helperText}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
