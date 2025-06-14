
import React from 'react';

export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean | null; // Allow null/undefined from parent for the primary state
  onCheckedChange: (checked: boolean) => void; // Callback for state changes
  // id, disabled, name, className, etc., are covered by React.InputHTMLAttributes
}

export const Switch: React.FC<SwitchProps> = (props) => {
  const {
    checked: propChecked, // This is the main controlling prop for Switch's visual state
    onCheckedChange,
    className,
    // Explicitly destructure value, defaultValue, and defaultChecked if they are passed
    // to handle them separately from other ...restProps.
    value: valueAttribute, // Potential HTML 'value' attribute, not related to checked state
    defaultValue: defaultValueAttribute, // Potential HTML 'defaultValue' attribute
    defaultChecked: defaultCheckedAttribute, // HTML 'defaultChecked', conflicts with controlled 'checked'
    ...restInputProps // All other InputHTMLAttributes
  } = props;

  // Determine the actual checked state for the DOM input
  const isChecked = (propChecked === null || propChecked === undefined) ? false : Boolean(propChecked);

  // Prepare DOM attributes, filtering out conflicting ones
  const finalDomProps: React.InputHTMLAttributes<HTMLInputElement> = { ...restInputProps };

  // Handle HTML 'value' and 'defaultValue' attributes (not related to checked state)
  // Ensure only one of them is passed if they come from ...restInputProps
  if (valueAttribute !== undefined) {
    finalDomProps.value = valueAttribute;
    // If 'value' attribute is present, 'defaultValue' attribute is ignored by browsers/React.
  } else if (defaultValueAttribute !== undefined) {
    finalDomProps.defaultValue = defaultValueAttribute;
  }
  // 'defaultCheckedAttribute' is explicitly ignored because 'checked' prop makes this a controlled component
  // regarding its checked state. Passing 'defaultChecked' with 'checked' causes React warnings.

  return (
    <input
      type="checkbox"
      role="switch"
      aria-checked={isChecked}
      checked={isChecked} // DOM input's checked state is controlled by isChecked
      onChange={(e) => onCheckedChange(e.target.checked)}
      className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-800
                  ${isChecked ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}
                  ${className || ''}`}
      {...finalDomProps} // Spread the carefully prepared DOM attributes
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
