import React from 'react';

export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean | null;
  onCheckedChange: (checked: boolean) => void;
}

export const Switch: React.FC<SwitchProps> = (props) => {
  const {
    checked: propChecked,
    onCheckedChange,
    className,
    value: valueAttribute,
    defaultValue: defaultValueAttribute,
    defaultChecked: defaultCheckedAttribute,
    ...restInputProps
  } = props;

  const isChecked = (propChecked === null || propChecked === undefined) ? false : Boolean(propChecked);
  const finalDomProps: React.InputHTMLAttributes<HTMLInputElement> = { ...restInputProps };

  if (valueAttribute !== undefined) {
    finalDomProps.value = valueAttribute;
  } else if (defaultValueAttribute !== undefined) {
    finalDomProps.defaultValue = defaultValueAttribute;
  }

  return (
    <input
      type="checkbox"
      role="switch"
      aria-checked={isChecked}
      checked={isChecked}
      onChange={(e) => onCheckedChange(e.target.checked)}
      className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent)] dark:focus:ring-offset-[var(--bg-primary)]
                  ${isChecked ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}
                  ${className || ''}`}
      {...finalDomProps}
    >
      <span className="sr-only">Use Material Design switch</span>
      <span
        aria-hidden="true"
        className={`${isChecked ? 'translate-x-5' : 'translate-x-0'}
                    pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg transform ring-0 transition ease-in-out duration-200`}
      />
    </input>
  );
};
