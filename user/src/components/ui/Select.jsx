import React, { forwardRef } from 'react';

/**
 * MithraShoppy Shared Select (Dropdown) Component
 */
const Select = forwardRef(({
  label,
  id,
  options = [],
  error,
  helperText,
  placeholder = 'Select an option',
  size = 'md',
  className = '',
  wrapperClassName = '',
  ...rest
}, ref) => {
  const selectCls = [
    'ms-select',
    `ms-select--${size}`,
    error ? 'ms-select--error' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={`ms-select-wrapper ${wrapperClassName}`}>
      {label && (
        <label className="ms-select__label" htmlFor={id}>
          {label}
        </label>
      )}
      <div className="ms-select__field-wrap">
        <select
          ref={ref}
          id={id}
          className={selectCls}
          aria-invalid={!!error}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) =>
            typeof opt === 'string' ? (
              <option key={opt} value={opt}>{opt}</option>
            ) : (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            )
          )}
        </select>
        <span className="ms-select__chevron" aria-hidden="true">▾</span>
      </div>
      {error && (
        <span className="ms-input__message ms-input__message--error" role="alert">
          {error}
        </span>
      )}
      {!error && helperText && (
        <span className="ms-input__message ms-input__message--helper">
          {helperText}
        </span>
      )}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
