import React from 'react';

export interface TableProps extends React.HTMLAttributes<HTMLTableElement> { children: React.ReactNode; }
export interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> { children: React.ReactNode; className?: string;}
export interface TableHeadProps extends React.HTMLAttributes<HTMLTableCellElement> { children: React.ReactNode; className?: string;}
export interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> { children: React.ReactNode; }
export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> { children: React.ReactNode; className?: string; }
export interface TableCellProps extends React.HTMLAttributes<HTMLTableCellElement> { children: React.ReactNode; className?: string;}

export const Table: React.FC<TableProps> = ({ children, ...props }) => <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700"><table className="w-full min-w-[600px]" {...props}>{children}</table></div>;
export const TableHeader: React.FC<TableHeaderProps> = ({ children, className, ...props }) => <thead className={`bg-slate-50 dark:bg-slate-800 ${className || ''}`} {...props}>{children}</thead>;
export const TableHead: React.FC<TableHeadProps> = ({ children, className, ...props }) => <th className={`text-start p-3 sm:p-4 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider ${className || ''}`} {...props}>{children}</th>;
export const TableBody: React.FC<TableBodyProps> = ({ children, ...props }) => <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800/50" {...props}>{children}</tbody>;
export const TableRow: React.FC<TableRowProps> = ({ children, className, ...props }) => <tr className={`hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors ${className || ''}`} {...props}>{children}</tr>;
export const TableCell: React.FC<TableCellProps> = ({ children, className, ...props }) => <td className={`p-3 sm:p-4 text-sm text-slate-700 dark:text-slate-300 ${className || ''}`} {...props}>{children}</td>;