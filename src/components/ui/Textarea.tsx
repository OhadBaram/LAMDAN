import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    className?: string;
    id?: string;
    onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
    placeholder?: string;
    disabled?: boolean;
    rows?: number;
    name?: string;
    onKeyDown?: React.KeyboardEventHandler<HTMLTextAreaElement>;
}

export const Textarea: React.FC<TextareaProps> = (props) => {
    const { 
        className, 
        value, 
        defaultValue,
        ...rest 
    } = props;

    const baseStandaloneStyles = `rounded-md border bg-[var(--bg-primary)] border-[var(--border)] text-[var(--text-primary)]
                           focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] 
                           outline-none w-full transition-colors duration-150 ease-in-out 
                           placeholder:text-[var(--text-placeholder-new)] disabled:opacity-50 disabled:cursor-not-allowed`;
    
    const standalonePadding = "px-3 py-2"; 

    const finalClassName = className && className.includes('chatbot-ui-input-bar-textarea')
        ? `${baseStandaloneStyles} ${className}`
        : `${baseStandaloneStyles} ${standalonePadding} ${className || ''}`;

    const domProps: Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'defaultValue'> = rest;

    if (value !== undefined) {
        return <textarea {...domProps} className={finalClassName.trim()} value={value === null ? '' : String(value)} />;
    } else {
        return <textarea {...domProps} className={finalClassName.trim()} defaultValue={defaultValue} />;
    }
};
