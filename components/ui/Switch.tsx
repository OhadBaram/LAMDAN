
import React from 'react';

export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean | null; // Allow null/undefined from parent
  onCheckedChange: (checked: boolean) => void;
  id?: string;
  disabled?: boolean;
  name?: string;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({ 
  checked: propChecked, 
  onCheckedChange, 
  className, 
  id,
  disabled,
  name,
  ...restProps 
}) => {
    const isChecked = (propChecked === null || propChecked === undefined) ? false : Boolean(propChecked);

    // Filter out props that could cause conflicts or are handled explicitly.
    // 1. `defaultChecked` conflicts with `checked` for controlled components.
    // 2. Manage `value` and `defaultValue` from `restProps` to prevent React error #137,
    //    even on a checkbox, just in case they are passed and React flags it.
    const {
        value: valueFromRest,
        defaultValue: defaultValueFromRest,
        defaultChecked: _ignoredDefaultChecked, // Always ignore from restProps as 'checked' is used
        ...remainingFilteredRestProps
    } = restProps;

    const finalDomProps: React.InputHTMLAttributes<HTMLInputElement> = { ...remainingFilteredRestProps };

    // Handle value/defaultValue from restProps to prevent them being on the DOM element simultaneously
    if (valueFromRest !== undefined) {
        finalDomProps.value = valueFromRest;
        // `defaultValueFromRest` is already excluded from `finalDomProps` at this point
        // because it was destructured out and not part of `remainingFilteredRestProps`.
    } else if (defaultValueFromRest !== undefined) {
        // Only add `defaultValue` to DOM props if `value` is not present from `restProps`.
        finalDomProps.defaultValue = defaultValueFromRest;
    }
    // Now, `finalDomProps` will have at most one of `value` or `defaultValue` from `restProps`,
    // and will not have `defaultChecked`.

    return (
        <input 
            type="checkbox" 
            role="switch" 
            id={id}
            name={name}
            disabled={disabled}
            aria-checked={isChecked} 
            checked={isChecked} // Controlled by the `checked` prop
            onChange={(e) => onCheckedChange(e.target.checked)} 
            className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-800
                        ${isChecked ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'} 
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
