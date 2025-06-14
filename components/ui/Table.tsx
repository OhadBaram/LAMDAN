
import React from 'react';

export interface TableProps extends React.HTMLAttributes<HTMLTableElement> { children: React.ReactNode; }
export interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> { children: React.ReactNode; className?: string;}
export interface TableHeadProps extends React.HTMLAttributes<HTMLTableCellElement> { children: React.ReactNode; className?: string;}
export interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> { children: React.ReactNode; }
export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> { children: React.ReactNode; className?: string; }
export interface TableCellProps extends React.HTMLAttributes<HTMLTableCellElement> { children: React.ReactNode; className?: string;}

export const Table: React.FC<TableProps> = ({ children, ...props }) => <div className="overflow-x-auto rounded-lg border border-[var(--border)]"><table className="w-full min-w-[600px] bg-[var(--bg-secondary)]" {...props}>{children}</table></div>;
export const TableHeader: React.FC<TableHeaderProps> = ({ children, className, ...props }) => <thead className={`bg-[var(--bg-primary)] ${className || ''}`} {...props}>{children}</thead>;
export const TableHead: React.FC<TableHeadProps> = ({ children, className, ...props }) => <th className={`text-left px-4 py-3 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider ${className || ''}`} {...props}>{children}</th>; // p-4 (16px), p-3 (12px)
export const TableBody: React.FC<TableBodyProps> = ({ children, ...props }) => <tbody className="divide-y divide-[var(--border)]" {...props}>{children}</tbody>;
export const TableRow: React.FC<TableRowProps> = ({ children, className, ...props }) => <tr className={`hover:bg-[var(--bg-primary)] transition-colors ${className || ''}`} {...props}>{children}</tr>;
export const TableCell: React.FC<TableCellProps> = ({ children, className, ...props }) => <td className={`px-4 py-3 text-sm text-[var(--text-primary)] ${className || ''}`} {...props}>{children}</td>; // p-4 (16px), p-3 (12px)
