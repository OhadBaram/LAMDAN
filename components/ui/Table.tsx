
import React from 'react';

export interface TableProps extends React.HTMLAttributes<HTMLTableElement> { children: React.ReactNode; }
export interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> { children: React.ReactNode; className?: string;}
export interface TableHeadProps extends React.HTMLAttributes<HTMLTableCellElement> { children: React.ReactNode; className?: string;}
export interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> { children: React.ReactNode; }
export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> { children: React.ReactNode; className?: string; }
export interface TableCellProps extends React.HTMLAttributes<HTMLTableCellElement> { children: React.ReactNode; className?: string;}

export const Table: React.FC<TableProps> = ({ children, ...props }) => <div className="overflow-x-auto"><table className="w-full min-w-[600px]" {...props}>{children}</table></div>;
export const TableHeader: React.FC<TableHeaderProps> = ({ children, className, ...props }) => <thead className={`bg-gray-50 dark:bg-gray-700/50 ${className || ''}`} {...props}>{children}</thead>;
export const TableHead: React.FC<TableHeadProps> = ({ children, className, ...props }) => <th className={`text-start p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${className || ''}`} {...props}>{children}</th>;
export const TableBody: React.FC<TableBodyProps> = ({ children, ...props }) => <tbody className="divide-y divide-gray-200 dark:divide-gray-700" {...props}>{children}</tbody>;
export const TableRow: React.FC<TableRowProps> = ({ children, className, ...props }) => <tr className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${className || ''}`} {...props}>{children}</tr>;
export const TableCell: React.FC<TableCellProps> = ({ children, className, ...props }) => <td className={`p-3 text-sm ${className || ''}`} {...props}>{children}</td>;
