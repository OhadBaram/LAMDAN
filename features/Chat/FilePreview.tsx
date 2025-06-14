
import React from 'react';
import { X, ImageIcon, File as FileIconPkg } from "lucide-react";
import { Button } from '../../components/ui/Button';

interface FilePreviewProps {
    file: { id: string; name: string; type: string; dataUrl: string; content: string };
    onRemove: () => void;
}

export const FilePreview: React.FC<FilePreviewProps> = ({ file, onRemove }) => {
    return (
        <div className="bg-[var(--bg-secondary)] p-2 rounded-md flex items-center gap-2 text-sm border border-[var(--border)]">
            {file.type.startsWith('image/') && file.dataUrl ? (
                <img src={file.dataUrl} alt={file.name} className="w-8 h-8 object-cover rounded-sm flex-shrink-0" />
            ) : (
                file.type.startsWith('image/') ? 
                <ImageIcon className="w-5 h-5 text-[var(--accent)] flex-shrink-0" /> : 
                <FileIconPkg className="w-5 h-5 text-[var(--accent)] flex-shrink-0" />
            )}
            <span className="truncate flex-1 min-w-0 text-[var(--text-secondary)]" title={file.name}>{file.name}</span>
            <Button size="icon" variant="ghost" onClick={onRemove} className="p-1 text-[var(--text-secondary)] hover:text-[var(--error)] flex-shrink-0">
                <X className="w-3.5 h-3.5" />
            </Button>
        </div>
    );
}
