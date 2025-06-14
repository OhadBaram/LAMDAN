
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
    value: valueAttribute, // Potential HTML 'value' attribute for the input element
    defaultValue: defaultValueAttribute, // Potential HTML 'defaultValue' attribute
    defaultChecked: defaultCheckedAttribute, // HTML 'defaultChecked', conflicts with controlled 'checked' state
    ...restInputProps // All other InputHTMLAttributes
  } = props;

  // Determine the actual checked state for the DOM input (controlled by propChecked)
  const isChecked = (propChecked === null || propChecked === undefined) ? false : Boolean(propChecked);

  // Prepare DOM attributes, filtering out conflicting ones related to checked state
  const finalDomProps: React.InputHTMLAttributes<HTMLInputElement> = { ...restInputProps };

  // Handle HTML 'value' and 'defaultValue' attributes (these are standard input attributes,
  // separate from the 'checked' state of a checkbox).
  // Ensure only one of them is passed if they come from ...restInputProps.
  if (valueAttribute !== undefined) {
    finalDomProps.value = valueAttribute;
    // If 'value' attribute is present, 'defaultValue' attribute is ignored by browsers/React.
    // No need to explicitly delete defaultValueAttribute from finalDomProps if valueAttribute is set.
  } else if (defaultValueAttribute !== undefined) {
    finalDomProps.defaultValue = defaultValueAttribute;
  }
  // 'defaultCheckedAttribute' is explicitly ignored from spread props because 'checked={isChecked}'
  // makes this a controlled component regarding its checked state.
  // Passing 'defaultChecked' along with 'checked' causes React warnings.
  // The 'defaultChecked' prop is destructured above and not spread via finalDomProps.

  return (
    <input
      type="checkbox"
      role="switch"
      aria-checked={isChecked}
      checked={isChecked} // DOM input's checked state is controlled by isChecked
      onChange={(e) => onCheckedChange(e.target.checked)}
      className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent)] dark:focus:ring-offset-[var(--bg-primary)]
                  ${isChecked ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}
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
